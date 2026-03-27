/** Relative in-app path only; blocks open redirects */
export function safeReturnPath(raw: string | null | undefined): string {
  if (!raw) return "/"
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return "/"
  }
  return raw
}

/** Cookie set before OAuth so `redirectTo` can stay an exact allow-list URL (no query string). */
export const AUTH_RETURN_PATH_COOKIE = "ak_auth_next" as const
