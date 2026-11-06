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
python3 agent.py "What time is it, and what is in my home folder?"
```

Tool calls are logged to stderr as `[step N] tool(args)`; the final answer goes
to stdout.

## Tools

| Tool | Description |
| --- | --- |
| `list_files(path)` | List up to 100 entries in a directory |
| `read_file(path)` | Read the first 4000 characters of a text file |
| `search_files(path, query)` | Case-insensitive text search under a directory (max 50 matches, skips hidden folders, binary and >1 MB files) |
| `get_time()` | Current local date and time |

All tools are read-only. To add one, write a function, register it in `TOOLS`,
and describe it in `TOOL_SPECS`.

## Configuration

Edit the constants at the top of `agent.py`: `BASE_URL`, `MODEL`, `MAX_STEPS`,
`MAX_FILE_CHARS`. Model ids are listed by `curl http://localhost:1234/v1/models`.

## Caveat

Small local models can plan tool calls well but may add details the tool output
didn't contain. Keep tasks narrow and verify answers against the tool results.
