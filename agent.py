#!/usr/bin/env python3
"""Minimal tool-calling agent against LM Studio's local OpenAI-compatible server."""
import json
import os
import shlex
import subprocess
import sys
import urllib.request
from datetime import datetime

BASE_URL = "http://localhost:1234/v1"
MODEL = "google/gemma-4-e4b"
MAX_STEPS = 8
MAX_FILE_CHARS = 4000
MAX_SEARCH_RESULTS = 50
MAX_SEARCH_FILE_BYTES = 1_000_000
COMMAND_TIMEOUT = 10
MAX_COMMAND_OUTPUT = 4000
ALLOWED_COMMANDS = {"ls", "pwd", "date", "uname", "whoami", "wc", "head", "tail",
                    "cat", "file", "du", "df", "git"}
ALLOWED_GIT_SUBCOMMANDS = {"status", "log", "diff", "branch", "show"}


def list_files(path):
    path = os.path.expanduser(path)
    entries = []
    for name in sorted(os.listdir(path))[:100]:
        full = os.path.join(path, name)
        kind = "dir" if os.path.isdir(full) else "file"
        size = os.path.getsize(full) if kind == "file" else 0
        entries.append(f"{kind}\t{size}\t{name}")
    return "\n".join(entries) or "(empty)"


def read_file(path):
    with open(os.path.expanduser(path), "r", errors="replace") as f:
        return f.read(MAX_FILE_CHARS)


def search_files(path, query):
    root = os.path.expanduser(path)
    needle = query.lower()
    hits = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if not d.startswith(".")]
        for name in filenames:
            full = os.path.join(dirpath, name)
            try:
                if os.path.getsize(full) > MAX_SEARCH_FILE_BYTES:
                    continue
                with open(full, "r", errors="strict") as f:
                    for lineno, line in enumerate(f, 1):
                        if needle in line.lower():
                            hits.append(f"{full}:{lineno}: {line.strip()[:200]}")
                            if len(hits) >= MAX_SEARCH_RESULTS:
                                return "\n".join(hits)
            except (OSError, UnicodeDecodeError):
                continue  # skip unreadable and binary files
    return "\n".join(hits) or "(no matches)"


def run_command(command):
    # No shell: the string is split into argv, so pipes, redirects and
    # substitutions are inert text rather than operators.
    argv = shlex.split(command)
    if not argv:
        return "error: empty command"
    if argv[0] not in ALLOWED_COMMANDS:
        return f"error: '{argv[0]}' is not allowed. Allowed: {sorted(ALLOWED_COMMANDS)}"
    if argv[0] == "git":
        if len(argv) < 2 or argv[1] not in ALLOWED_GIT_SUBCOMMANDS:
            return f"error: only git {sorted(ALLOWED_GIT_SUBCOMMANDS)} are allowed"
        if any(a.startswith("--output") for a in argv[2:]):
            return "error: --output is not allowed"
    argv = [os.path.expanduser(a) for a in argv]
    try:
        proc = subprocess.run(argv, capture_output=True, text=True,
                              timeout=COMMAND_TIMEOUT)
    except subprocess.TimeoutExpired:
        return f"error: timed out after {COMMAND_TIMEOUT}s"
    out = (proc.stdout + proc.stderr).strip() or "(no output)"
    return out[:MAX_COMMAND_OUTPUT]


def get_time():
    return datetime.now().isoformat(timespec="seconds")


TOOLS = {"list_files": list_files, "read_file": read_file,
         "search_files": search_files, "run_command": run_command,
         "get_time": get_time}

TOOL_SPECS = [
    {"type": "function", "function": {
        "name": "list_files",
        "description": "List files and folders in a directory (kind, size in bytes, name).",
        "parameters": {"type": "object",
                       "properties": {"path": {"type": "string"}},
                       "required": ["path"]}}},
    {"type": "function", "function": {
        "name": "read_file",
        "description": "Read the first 4000 characters of a text file.",
        "parameters": {"type": "object",
                       "properties": {"path": {"type": "string"}},
                       "required": ["path"]}}},
    {"type": "function", "function": {
        "name": "search_files",
        "description": "Case-insensitive text search through files under a directory "
                       "(recursive, skips hidden folders). Returns path:line: text.",
        "parameters": {"type": "object",
                       "properties": {"path": {"type": "string"},
                                      "query": {"type": "string"}},
                       "required": ["path", "query"]}}},
    {"type": "function", "function": {
        "name": "run_command",
        "description": "Run one read-only command (no pipes or redirects). Allowed: "
                       + ", ".join(sorted(ALLOWED_COMMANDS))
                       + ". git is limited to: "
                       + ", ".join(sorted(ALLOWED_GIT_SUBCOMMANDS)) + ".",
        "parameters": {"type": "object",
                       "properties": {"command": {"type": "string"}},
                       "required": ["command"]}}},
    {"type": "function", "function": {
        "name": "get_time",
        "description": "Get the current local date and time.",
        "parameters": {"type": "object", "properties": {}}}},
]


def chat(messages):
    body = json.dumps({"model": MODEL, "messages": messages,
                       "tools": TOOL_SPECS}).encode()
    req = urllib.request.Request(f"{BASE_URL}/chat/completions", data=body,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as resp:
        return json.load(resp)["choices"][0]["message"]


SYSTEM_PROMPT = (
    "You are a helpful assistant running on the user's Mac with read-only access "
    "to their files. Answer general questions (programming, explanations, "
    "tutorials) directly from your own knowledge. Use tools only when the "
    "question is about the user's files or machine, then answer from the tool "
    "results. Be concise, and ask a short follow-up question when it would help."
)


def run(task, messages):
    """Run one user turn against the shared history; returns the final answer."""
    messages.append({"role": "user", "content": task})
    for step in range(1, MAX_STEPS + 1):
        msg = chat(messages)
        calls = msg.get("tool_calls") or []
        if not calls:
            answer = msg.get("content", "")
            messages.append({"role": "assistant", "content": answer})
            return answer
        messages.append({"role": "assistant", "content": msg.get("content") or "",
                         "tool_calls": calls})
        for call in calls:
            name = call["function"]["name"]
            args = json.loads(call["function"]["arguments"] or "{}")
            print(f"[step {step}] {name}({args})", file=sys.stderr)
            try:
                result = TOOLS[name](**args)
            except Exception as e:  # report errors to the model so it can recover
                result = f"error: {e}"
            messages.append({"role": "tool", "tool_call_id": call["id"],
                             "content": str(result)})
    return "(stopped: reached max steps)"


def main():
    args = sys.argv[1:]
    once = "--once" in args
    task = " ".join(a for a in args if a != "--once")
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if task:
        print(run(task, messages))
        if once:
            return
    else:
        print("Chat with the local agent. Type 'exit' or press Ctrl-D to quit.")

    while True:
        try:
            task = input("\n> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return
        if task.lower() in {"exit", "quit"}:
            return
        if task:
            print(run(task, messages))


if __name__ == "__main__":
    main()
