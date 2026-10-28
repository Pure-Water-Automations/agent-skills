# quick-record (`/rec`)

A Claude Code mod for macOS. It adds a **● Record screen** button above the prompt and a `/rec`
command. Press it, talk through what you see, press **■ Stop**. The mod transcribes your voice,
grabs a frame every 5 seconds, and puts the path of one `README.md` (transcript + frames) into
your prompt, so Claude sees and hears your feedback.

## Install

```bash
brew install ffmpeg whisper-cpp
mkdir -p ~/.cache/whisper && curl -L -o ~/.cache/whisper/ggml-small.en.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.en.bin
cp -R ~/agent-skills/mods/quick-record ~/.claude/mods/quick-record
```

Restart Claude Code. The first recording asks macOS for Screen Recording and Microphone
permission for your terminal; allow both, then restart it once more.

## Settings (environment variables, all optional)

| Variable | Default | What it does |
|---|---|---|
| `REC_DIR` | `~/Recordings` | where recordings are saved |
| `REC_MIC` | `0` (first mic) | mic name or index (`ffmpeg -f avfoundation -list_devices true -i ""`) |
| `REC_SCREEN` | `Capture screen 0` | which screen |
| `REC_MAX_MIN` | `30` | stops itself after this many minutes |
| `REC_FRAME_EVERY` | `5` | seconds between frames |

You can also bind `rec` to a keyboard shortcut; the button notices recordings started that way.
