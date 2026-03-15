/**
 * Promising filter for kite spots.
 * Filters spots by consecutive promising hours (wind, direction, weather).
 * @see .agents/skills/promising-filter-spots
 */

import type { MinimalForecast } from "./yr-forecast"

export type WeatherCondition =
  | "clearsky_day"
  | "fair_day"
  | "partlycloudy_day"
  | "cloudy"

export interface PromisingFilterState {
  selectedDay: 0 | 1 | 2
  selectedTimeRange: [number, number]
  minPromisingHours: number
  selectedWeatherConditions: WeatherCondition[]
}

const KITE_RULE = {
  MIN_WIND_SPEED: 5,
  MAX_WIND_SPEED: 14,
  MAX_GUST: 18,
} as const

const GOOD_WEATHER_CODES: Set<string> = new Set([
  "clearsky_day",
  "fair_day",
  "partlycloudy_day",
  "cloudy",
])

/** Wind direction degrees (0–360) → compass symbol (n, ne, e, se, s, sw, w, nw). */
function degreesToSymbol(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360
  if (normalized >= 337.5 || normalized < 22.5) return "n"
  if (normalized >= 22.5 && normalized < 67.5) return "ne"
  if (normalized >= 67.5 && normalized < 112.5) return "e"
  if (normalized >= 112.5 && normalized < 157.5) return "se"
  if (normalized >= 157.5 && normalized < 202.5) return "s"
  if (normalized >= 202.5 && normalized < 247.5) return "sw"
  if (normalized >= 247.5 && normalized < 292.5) return "w"
  if (normalized >= 292.5 && normalized < 337.5) return "nw"
  return "n"
}

/** Check if an hour is promising for kiting. */
export function isKitePromising(
  forecast: MinimalForecast,
  spotWindDirections: string[] | null,
  weatherFilter: WeatherCondition[] = []
): boolean {
  if (forecast.is_day !== 1) return false
  if (forecast.wind_speed < KITE_RULE.MIN_WIND_SPEED) return false
  if (forecast.wind_speed > KITE_RULE.MAX_WIND_SPEED) return false
  if (
    forecast.wind_gusts != null &&
    forecast.wind_gusts > KITE_RULE.MAX_GUST
  )
    return false
  if (!spotWindDirections || spotWindDirections.length === 0) return false

  const symbol = degreesToSymbol(forecast.wind_direction)
  const allowed = new Set(
    spotWindDirections.map((d) => d.toLowerCase().trim())
  )
  if (!allowed.has(symbol)) return false

  if (weatherFilter.length > 0) {
    if (!weatherFilter.includes(forecast.weather_code as WeatherCondition))
      return false
  } else {
    if (!GOOD_WEATHER_CODES.has(forecast.weather_code)) return false
  }

  return true
}

/** Get default time range for a day (0=today, 1=tomorrow, 2=day after). */
export function getDefaultTimeRange(
  day: 0 | 1 | 2,
  now: Date
): [number, number] {
  if (day === 0) {
    const hour = now.getHours()
    const start = Math.min(hour + 1, 23)
    const end = Math.min(start + 6, 24)
    return [start, end]
  }
  return [12, 18]
}

/** Get day label for tabs (I dag, I morgen, Weekday). */
export function getDayLabel(day: 0 | 1 | 2, now: Date): string {
  if (day === 0) return "I dag"
  if (day === 1) return "I morgen"
  const d = new Date(now)
  d.setDate(d.getDate() + 2)
  return d.toLocaleDateString("nb-NO", { weekday: "short" })
}

export const PROMISING_WEATHER_OPTIONS: {
  code: WeatherCondition
  label: string
}[] = [
  { code: "clearsky_day", label: "Klart" },
  { code: "fair_day", label: "Lettskyet" },
  { code: "partlycloudy_day", label: "Delvis skyet" },
  { code: "cloudy", label: "Skyet" },
]

/** Compute start and end timestamps for the target window (Europe/Oslo). */
function getTargetWindow(
  filter: PromisingFilterState,
  timezone = "Europe/Oslo"
): { start: Date; end: Date } {
  const now = new Date()
  const targetDate = new Date(now)
  targetDate.setDate(now.getDate() + filter.selectedDay)
  targetDate.setHours(0, 0, 0, 0)

  const start = new Date(targetDate)
  start.setHours(filter.selectedTimeRange[0], 0, 0, 0)
  const end = new Date(targetDate)
  end.setHours(filter.selectedTimeRange[1], 0, 0, 0)

  return { start, end }
}

/** Filter forecast entries to those within the target time window. */
function filterForecastToWindow(
  forecast: MinimalForecast[],
  filter: PromisingFilterState,
  timezone = "Europe/Oslo"
): MinimalForecast[] {
  const { start, end } = getTargetWindow(filter, timezone)
  const startMs = start.getTime()
  const endMs = end.getTime()

  return forecast
    .filter((f) => {
      const t = new Date(f.time).getTime()
      return t >= startMs && t < endMs
    })
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
}

/** Compute max consecutive promising hours. */
function maxConsecutivePromising(
  entries: MinimalForecast[],
  spotWindDirections: string[] | null,
  weatherFilter: WeatherCondition[]
): number {
  let max = 0
  let current = 0
  for (const entry of entries) {
    if (isKitePromising(entry, spotWindDirections, weatherFilter)) {
      current++
      max = Math.max(max, current)
    } else {
      current = 0
    }
  }
  return max
}

/** Check if a spot passes the promising filter given its forecast. */
export function spotPassesPromisingFilter(
  forecast: MinimalForecast[],
  spotWindDirections: string[] | null,
  filter: PromisingFilterState
): boolean {
  const relevant = filterForecastToWindow(forecast, filter)
  const consecutive = maxConsecutivePromising(
    relevant,
    spotWindDirections,
    filter.selectedWeatherConditions
  )
  return consecutive >= filter.minPromisingHours
}
