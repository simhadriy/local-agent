# local-agent

A minimal tool-calling agent that runs against a local model served by
[LM Studio](https://lmstudio.ai). Standard library only, no dependencies.

The model is given a few read-only tools. It decides which to call, the script
runs them and feeds the results back, and the loop repeats until the model
gives a final answer (max 8 steps).

## Requirements

- Python 3
- LM Studio with a tool-calling model loaded (tested with `google/gemma-4-e4b`)
- LM Studio's local server running: Developer tab, status set to Running
  (default `http://localhost:1234`)

## Usage

```
python3 agent.py                      # start a chat
python3 agent.py "your first question"  # answer it, then keep chatting
python3 agent.py --once "question"    # answer once and exit
```

The conversation history is kept between turns, so follow-up questions work.
Type `exit` or press Ctrl-D to quit. Tool calls are logged to stderr as
`[step N] tool(args)`; answers go to stdout.

## Tools

| Tool | Description |
| --- | --- |
| `list_files(path)` | List up to 100 entries in a directory |
| `read_file(path)` | Read the first 4000 characters of a text file |
| `search_files(path, query)` | Case-insensitive text search under a directory (max 50 matches, skips hidden folders, binary and >1 MB files) |
| `run_command(command)` | Run one allowlisted read-only command: `ls pwd date uname whoami wc head tail cat file du df`, plus `git status/log/diff/branch/show`. No shell, 10 s timeout, output capped at 4000 chars |
| `get_time()` | Current local date and time |

All tools are read-only. `run_command` uses `subprocess` without a shell, so pipes,
redirects and `;` do nothing, and anything off the allowlist is refused. To add one, write a function, register it in `TOOLS`,
and describe it in `TOOL_SPECS`.

## Configuration

Edit the constants at the top of `agent.py`: `BASE_URL`, `MODEL`, `MAX_STEPS`,
`MAX_FILE_CHARS`. Model ids are listed by `curl http://localhost:1234/v1/models`.

## Caveat

Small local models can plan tool calls well but may add details the tool output
didn't contain. Keep tasks narrow and verify answers against the tool results.
