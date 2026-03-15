/**
 * Yr Locationforecast API client-side utilities.
 * @see .agents/skills/yr-minimal-forecast-client
 */

export interface MinimalForecast {
  time: string
  is_day: 0 | 1
  weather_code: string
  temperature: number
  wind_speed: number
  wind_gusts?: number
  wind_direction: number
}

const YR_API =
  "https://api.met.no/weatherapi/locationforecast/2.0/complete"

export async function fetchYrDataClient(
  latitude: number,
  longitude: number
): Promise<unknown> {
  const url = `${YR_API}?lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Kunne ikke hente værdata")
  return res.json()
}

interface YrTimeseriesItem {
  time: string
  data?: {
    instant?: { details?: Record<string, number> }
    next_1_hours?: { summary?: { symbol_code?: string } }
  }
}

export function mapYrToMinimalForecast(rawData: unknown): MinimalForecast[] {
  const data = rawData as { properties?: { timeseries?: YrTimeseriesItem[] } }
  const timeseries = data?.properties?.timeseries ?? []
  const result: MinimalForecast[] = []

  for (const item of timeseries) {
    if (!item?.data?.next_1_hours) break

    const instant = item.data.instant?.details ?? {}
    const next1h = item.data.next_1_hours
    const symbolCode = next1h.summary?.symbol_code ?? "cloudy"

    result.push({
      time: item.time,
      is_day:
        symbolCode.includes("_day") || symbolCode.includes("_polartwilight")
          ? 1
          : 0,
      weather_code: symbolCode,
      temperature: instant.air_temperature ?? 0,
      wind_speed: instant.wind_speed ?? 0,
      wind_gusts: instant.wind_speed_of_gust,
      wind_direction: instant.wind_from_direction ?? 0,
    })
  }
  return result
}

/** Resolve weather icon path with polartwilight→day fallback. */
export function getWeatherIconPath(weatherCode: string): string {
  const fallback = "/weather-icons/cloudy.svg"
  if (!weatherCode) return fallback
  const code = weatherCode.replace("_polartwilight", "_day")
  return `/weather-icons/${code}.svg`
}
