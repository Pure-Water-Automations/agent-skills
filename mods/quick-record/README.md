# quick-record (`/rec`)

A Claude Code mod for macOS. It adds a **● Record screen** button above the prompt and a `/rec`
command. Press it, talk through what you see, press **■ Stop**. The mod transcribes your voice,
grabs a frame every 5 seconds, and puts the path of one `README.md` (transcript + frames) into
your prompt, so Claude sees and hears your feedback.

## Install

**Easiest: paste this into Claude Code** and let it do the steps:

```text
Install the /rec screen-recording mod for Claude Code on my Mac:
1. If Homebrew is missing, tell me how to install it and stop. Otherwise run: brew install ffmpeg whisper-cpp
2. Download the speech model: mkdir -p ~/.cache/whisper && curl -L -o ~/.cache/whisper/ggml-small.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.en.bin
3. Get the mod: clone https://github.com/Pure-Water-Automations/agent-skills to ~/agent-skills (if it is already there, git pull instead).
4. Copy ~/agent-skills/mods/quick-record to ~/.claude/mods/quick-record and make ~/.claude/mods/quick-record/rec executable.
5. Check that ffmpeg, whisper-cli and the model file all exist, then tell me to restart Claude Code. Remind me that the first recording asks macOS for Screen Recording and Microphone permission: allow both, then restart Claude Code once more.
```

**By hand** (Terminal):

```bash
brew install ffmpeg whisper-cpp
mkdir -p ~/.cache/whisper && curl -L -o ~/.cache/whisper/ggml-small.en.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.en.bin
git clone https://github.com/Pure-Water-Automations/agent-skills ~/agent-skills
cp -R ~/agent-skills/mods/quick-record ~/.claude/mods/quick-record
```

Restart Claude Code. The first recording asks macOS for Screen Recording and Microphone
permission; allow both, then restart Claude Code once more.

**Use it:** click **● Record screen** above the prompt (or type `/rec`), talk while you show the
screen, click **■ Stop**, then press Enter when the path appears in your prompt.

## Settings (environment variables, all optional)

| Variable | Default | What it does |
|---|---|---|
| `REC_DIR` | `~/Recordings` | where recordings are saved |
| `REC_MIC` | `0` (first mic) | mic name or index (`ffmpeg -f avfoundation -list_devices true -i ""`) |
| `REC_SCREEN` | `Capture screen 0` | which screen |
| `REC_MAX_MIN` | `30` | stops itself after this many minutes |
| `REC_FRAME_EVERY` | `5` | seconds between frames |

You can also bind `rec` to a keyboard shortcut; the button notices recordings started that way.
