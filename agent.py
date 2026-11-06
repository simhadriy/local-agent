#!/usr/bin/env python3
"""Minimal tool-calling agent against LM Studio's local OpenAI-compatible server."""
import json
import os
import sys
import urllib.request
from datetime import datetime

BASE_URL = "http://localhost:1234/v1"
MODEL = "google/gemma-4-e4b"
MAX_STEPS = 8
MAX_FILE_CHARS = 4000


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


def get_time():
    return datetime.now().isoformat(timespec="seconds")


TOOLS = {"list_files": list_files, "read_file": read_file, "get_time": get_time}

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


def run(task):
    messages = [
        {"role": "system", "content": "You are a helpful assistant with read-only "
         "access to the user's files. Use tools when needed, then answer concisely."},
        {"role": "user", "content": task},
    ]
    for step in range(1, MAX_STEPS + 1):
        msg = chat(messages)
        calls = msg.get("tool_calls") or []
        if not calls:
            return msg.get("content", "")
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


if __name__ == "__main__":
    task = " ".join(sys.argv[1:]) or "What time is it, and what is in my home folder?"
    print(run(task))
