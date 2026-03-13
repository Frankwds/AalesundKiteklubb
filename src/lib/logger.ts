type LogLevel = "info" | "warn" | "error"

function format(level: LogLevel, action: string, detail?: string) {
  const ts = new Date().toISOString()
  const msg = detail ? `${action} — ${detail}` : action
  return `[${ts}] [${level.toUpperCase()}] ${msg}`
}

export function log(action: string, detail?: string) {
  console.log(format("info", action, detail))
}

export function logError(action: string, error: unknown) {
  const message =
    error instanceof Error ? error.message : String(error)
  console.error(format("error", action, message))
}
