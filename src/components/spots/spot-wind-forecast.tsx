"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  fetchYrDataClient,
  mapYrToMinimalForecast,
  getWeatherIconPath,
  type MinimalForecast,
} from "@/lib/yr-forecast"

const TIMEZONE = "Europe/Oslo"
const HOURS_TO_SHOW = 12

export function SpotWindForecast({
  latitude,
  longitude,
}: {
  latitude: number
  longitude: number
}) {
  const [forecast, setForecast] = useState<MinimalForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchYrDataClient(latitude, longitude)
      .then((data) => setForecast(mapYrToMinimalForecast(data)))
      .catch((e) => setError(e instanceof Error ? e.message : "Feil ved lasting"))
      .finally(() => setLoading(false))
  }, [latitude, longitude])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Henter vindvarsel…
      </div>
    )
  }

  if (error) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        Kunne ikke hente vindvarsel: {error}
      </p>
    )
  }

  const cutoff = Date.now() - 60 * 60 * 1000
  const filtered = forecast
    .filter((f) => new Date(f.time).getTime() >= cutoff)
    .slice(0, HOURS_TO_SHOW)

  if (filtered.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        Ingen tilgjengelig varsel for øyeblikket.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        {filtered.map((hour) => {
          const date = new Date(hour.time)
          const timeStr = date.toLocaleTimeString("nb-NO", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: TIMEZONE,
          })
          const windText =
            hour.wind_gusts != null
              ? `${Math.round(hour.wind_speed)} (${Math.round(hour.wind_gusts)}) m/s`
              : `${Math.round(hour.wind_speed)} m/s`

          return (
            <div
              key={hour.time}
              className="flex min-w-[72px] flex-col items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-3"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {timeStr}
              </span>
              <Image
                src={getWeatherIconPath(hour.weather_code)}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7"
                unoptimized
              />
              <span className="text-sm font-medium">
                {Math.round(hour.temperature)}°
              </span>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs text-foreground">{windText}</span>
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  className="text-muted-foreground"
                  style={{ transform: `rotate(${hour.wind_direction}deg)` }}
                  aria-label={`Vind ${hour.wind_direction}°`}
                >
                  <path
                    d="M12 22L8 12L12 14L16 12L12 22Z"
                    fill="currentColor"
                  />
                  <line
                    x1="12"
                    y1="14"
                    x2="12"
                    y2="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
