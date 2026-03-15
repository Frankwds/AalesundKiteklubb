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
  minWindSpeed: number
  maxWindSpeed: number
  maxGust: number
  selectedWeatherConditions: WeatherCondition[]
}

export const DEFAULT_MIN_WIND = 5
export const DEFAULT_MAX_WIND = 14
export const DEFAULT_MAX_GUST = 18

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
  weatherFilter: WeatherCondition[] = [],
  minWindSpeed = DEFAULT_MIN_WIND,
  maxWindSpeed = DEFAULT_MAX_WIND,
  maxGust = DEFAULT_MAX_GUST
): boolean {
  const symbol = degreesToSymbol(forecast.wind_direction)
  const allowed = new Set(
    (spotWindDirections ?? []).map((d) => d.toLowerCase().trim())
  )

  const failReasons: string[] = []
  const hourOslo = parseInt(
    new Date(forecast.time).toLocaleString("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Europe/Oslo",
    }),
    10
  )
  if (hourOslo >= 0 && hourOslo <= 6) failReasons.push("early_hours")
  if (forecast.is_day !== 1) failReasons.push("is_day")
  if (forecast.weather_code.includes("_night")) failReasons.push("night_symbol")
  if (forecast.wind_speed < minWindSpeed) failReasons.push("wind_min")
  if (forecast.wind_speed > maxWindSpeed) failReasons.push("wind_max")
  if (forecast.wind_gusts != null && forecast.wind_gusts > maxGust)
    failReasons.push("gust")
  if (!spotWindDirections || spotWindDirections.length === 0) failReasons.push("no_dirs")
  else if (!allowed.has(symbol)) failReasons.push("dir")
  if (weatherFilter.length > 0) {
    if (!weatherFilter.includes(forecast.weather_code as WeatherCondition)) failReasons.push("weather_filter")
  }
  // No weather check when filter empty: any weather is kitable. Weather only matters for dark green (sunny) in the UI.

  if (failReasons.length > 0) return false
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

  const relevant = forecast
    .filter((f) => {
      const t = new Date(f.time).getTime()
      return t >= startMs && t < endMs
    })
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  return relevant
}

/** Compute max consecutive promising hours. */
function maxConsecutivePromising(
  entries: MinimalForecast[],
  spotWindDirections: string[] | null,
  weatherFilter: WeatherCondition[],
  minWindSpeed: number,
  maxWindSpeed: number,
  maxGust: number
): number {
  let max = 0
  let current = 0
  for (const entry of entries) {
    if (isKitePromising(entry, spotWindDirections, weatherFilter, minWindSpeed, maxWindSpeed, maxGust)) {
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
    filter.selectedWeatherConditions,
    filter.minWindSpeed,
    filter.maxWindSpeed,
    filter.maxGust
  )
  return consecutive >= filter.minPromisingHours
}
