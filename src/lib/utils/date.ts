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
