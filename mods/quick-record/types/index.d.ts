export type Phase = 'idle' | 'recording' | 'transcribing'

declare module 'claude-code' {
  interface PluginState {
    'quick-record': { phase: Phase }
  }
}
