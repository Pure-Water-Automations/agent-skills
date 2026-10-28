import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Phase } from '../types'

// rec (macOS) / rec.ps1 (Windows) live next to this mod; REC_DIR moves the recordings (default ~/Recordings).
const WIN = (globalThis as { process?: { platform?: string } }).process?.platform === 'win32'
const PS = ['powershell', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command']
const SCRIPT = WIN
  ? [...PS, '& "$env:USERPROFILE\\.claude\\mods\\quick-record\\rec.ps1"']
  : ['sh', '-c', '"$HOME/.claude/mods/quick-record/rec"']
const IS_RECORDING = WIN
  ? [...PS, '$d = if ($env:REC_DIR) { $env:REC_DIR } else { "$env:USERPROFILE\\Recordings" }; if (Test-Path "$d\\.recording") { exit 0 } else { exit 1 }']
  : ['sh', '-c', 'test -f "${REC_DIR:-$HOME/Recordings}/.recording"']
const phase = atom({ plugin: 'quick-record', key: 'phase' } as const, 'idle' as Phase)

// One toggle for the button and /rec. Returns a line for the transcript.
async function toggle($: EngineInterface): Promise<string> {
  const { exitCode } = await $.process.run(IS_RECORDING)

  if (exitCode !== 0) {
    const started = await $.process.run(SCRIPT)
    if (started.exitCode !== 0) return `Could not start: ${started.stderr.trim()}`
    await update($, phase, () => 'recording')

    return 'Recording. Press ■ Stop (or /rec, or the hotkey) to finish.'
  }

  await update($, phase, () => 'transcribing')
  const done = await $.process.run(SCRIPT, { timeoutMs: 600_000 })
  await update($, phase, () => 'idle')
  const readme = done.stdout.trim().split('\n').pop() ?? ''
  if (done.exitCode !== 0 || !readme.endsWith('README.md')) {
    return `Recording failed: ${(done.stderr || done.stdout).trim()}`
  }

  await $.prompt.fill({
    text: `Screen recording with my feedback: ${readme} (read it, then look at the frames it points to)`,
    mode: 'append',
  })

  return `Saved ${readme} — path added to your prompt.`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'rec', description: 'Start or stop a screen+mic recording' })
    // A recording started from the hotkey (or before a reload) shows as recording.
    const { exitCode } = await $.process.run(IS_RECORDING)
    await update($, phase, () => (exitCode === 0 ? 'recording' : 'idle'))

    return next(e)
  })

  on('command.run', { command: 'rec' }, async $ => ({ text: await toggle($) }))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const now = await read($, phase)
    const press = () => void toggle($).then(line => $.ui.toast(line))

    return (
      <Box flexDirection="row" gap={1}>
        {now === 'idle' && <Button onPress={press}>● Record screen</Button>}
        {now === 'recording' && <Button variant="primary" onPress={press}>■ Stop recording</Button>}
        {now === 'recording' && <Text color="red">REC</Text>}
        {now === 'transcribing' && <Text dimColor>⏳ Transcribing…</Text>}
      </Box>
    )
  })
}
