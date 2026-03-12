/**
 * Edge-safe JWT payload decoder.
 * JWTs use base64url encoding (- and _ instead of + and /, no padding).
 * The Edge Runtime has no Buffer, so we use atob() with base64url → base64 conversion.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64Url = token.split(".")[1]
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  )
  return JSON.parse(atob(padded))
}
