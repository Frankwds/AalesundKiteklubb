type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  action: string
  detail?: string
  durationMs?: number
}

function format(entry: LogEntry): string {
  const ts = new Date().toISOString()
  const parts = [`[${ts}]`, `[${entry.level.toUpperCase()}]`, entry.action]
  if (entry.detail) parts.push(`— ${entry.detail}`)
  if (entry.durationMs !== undefined) parts.push(`(${entry.durationMs}ms)`)
  return parts.join(' ')
}

export function log(action: string, detail?: string, durationMs?: number) {
  console.log(format({ level: 'info', action, detail, durationMs }))
}

export function logError(action: string, detail?: string, durationMs?: number) {
  console.error(format({ level: 'error', action, detail, durationMs }))
}
