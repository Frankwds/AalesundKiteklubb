const TZ = "Europe/Oslo"
const LOCALE = "nb-NO"

/** "12. mars 2026" */
export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString(LOCALE, {
    timeZone: TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  })

/** "12. mar. 14:30" */
export const formatDateTime = (d: string) =>
  new Date(d).toLocaleString(LOCALE, {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })

/** "14:30" */
export const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString(LOCALE, {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  })

/** "12. mars 2026, 10:00–14:00" */
export const formatCourseTime = (start: string, end: string) => {
  const date = formatDate(start)
  const startT = formatTime(start)
  const endT = formatTime(end)
  return `${date}, ${startT}–${endT}`
}

/** Today's date in Oslo as YYYY-MM-DD */
export const todayOsloISO = () =>
  new Date().toLocaleDateString("sv-SE", { timeZone: TZ })

/**
 * Build ISO string for date (YYYY-MM-DD) + time (HH:MM) in Europe/Oslo.
 * Returns e.g. "2026-03-12T10:00:00+01:00" (winter) or "2026-06-15T10:00:00+02:00" (summer).
 * Uses EU DST rules: last Sunday of March to last Sunday of October = CEST (+02:00).
 */
export function buildOsloISO(dateStr: string, timeStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  const lastSunday = (year: number, month: number) => {
    const last = new Date(year, month, 0)
    return last.getDate() - last.getDay()
  }
  const marchLastSun = lastSunday(y, 3)
  const octLastSun = lastSunday(y, 10)
  const dayOfMonth = d
  const isDST =
    (m > 3 && m < 10) ||
    (m === 3 && dayOfMonth >= marchLastSun) ||
    (m === 10 && dayOfMonth > octLastSun)
  const offset = isDST ? "+02:00" : "+01:00"
  return `${dateStr}T${timeStr}:00${offset}`
}
