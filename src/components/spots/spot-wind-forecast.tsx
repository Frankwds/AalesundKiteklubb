"use client"

import { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import {
  fetchYrDataClient,
  mapYrToMinimalForecast,
  getWeatherIconPath,
  type MinimalForecast,
} from "@/lib/yr-forecast"
import { useForecastByDay } from "@/lib/hooks/use-forecast-by-day"
import { isKitePromising } from "@/lib/promising-filter"

const TIMEZONE = "Europe/Oslo"

export function SpotWindForecast({
  latitude,
  longitude,
  windDirections,
}: {
  latitude: number
  longitude: number
  windDirections?: string[] | null
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

  const filteredForecast = useMemo(() => {
    const cutoff = Date.now() - 60 * 60 * 1000
    return forecast.filter((f) => new Date(f.time).getTime() >= cutoff)
  }, [forecast])

  const { groupedByDay, activeDay, setActiveDay, scrollContainerRef } =
    useForecastByDay(filteredForecast, TIMEZONE)

  const getPromisingHoursVisual = (day: string) => {
    const hours = groupedByDay[day] ?? []
    const daytimeHours = hours.filter((h) => h.is_day === 1)
    if (daytimeHours.length <= 2) return []

    return daytimeHours.map((hour) => {
      const isPromising = isKitePromising(
        hour,
        windDirections ?? null,
        [],
        5,
        14,
        18
      )
      const isSunny = [
        "clearsky_day",
        "fair_day",
        "partlycloudy_day",
      ].includes(hour.weather_code)
      const hasStrongWind = hour.wind_speed >= 8
      return (
        <div
          key={hour.time}
          className={`h-1.5 flex-1 ${
            isSunny && isPromising && hasStrongWind
              ? "bg-green-600"
              : isPromising
                ? "bg-green-400"
                : "bg-destructive/60"
          }`}
        />
      )
    })
  }

  const dataRows = [
    {
      getValue: (hour: MinimalForecast) => (
        <Image
          src={getWeatherIconPath(hour.weather_code)}
          alt=""
          width={28}
          height={28}
          className="mx-auto h-7 w-7"
          unoptimized
        />
      ),
    },
    {
      getValue: (hour: MinimalForecast) => `${Math.round(hour.temperature)}°`,
    },
    {
      getValue: (hour: MinimalForecast) =>
        hour.wind_gusts != null
          ? `${Math.round(hour.wind_speed)} (${Math.round(hour.wind_gusts)})`
          : `${Math.round(hour.wind_speed)}`,
    },
    {
      getValue: (hour: MinimalForecast) => (
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          className="mx-auto text-foreground"
          style={{ transform: `rotate(${hour.wind_direction}deg)` }}
          aria-label={`Vind ${hour.wind_direction}°`}
        >
          <path d="M12 22L8 12L12 14L16 12L12 22Z" fill="currentColor" />
          <line
            x1="12"
            y1="14"
            x2="12"
            y2="2"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
    },
  ]

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

  if (filteredForecast.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        Ingen tilgjengelig varsel for øyeblikket.
      </p>
    )
  }

  const dayKeys = Object.keys(groupedByDay).filter(
    (day) => (groupedByDay[day] ?? []).length > 2
  )

  return (
    <div className="rounded-lg bg-card">
      <div className="flex w-full rounded-lg border border-border bg-muted p-1">
        {dayKeys.map((day, index) => (
          <button
            key={day}
            type="button"
            onClick={() => setActiveDay(day)}
            className={`flex flex-1 flex-col items-center py-1.5 px-3 capitalize transition-colors ${
              index > 0 ? "border-l border-border" : ""
            } ${
              activeDay === day
                ? "rounded-md bg-background font-medium shadow-sm"
                : "rounded-md hover:bg-background/50"
            }`}
          >
            <div className="mb-1">{day}</div>
            {windDirections && windDirections.length > 0 && (
              <div className="flex w-full">
                {getPromisingHoursVisual(day)}
              </div>
            )}
          </button>
        ))}
      </div>

      {activeDay && groupedByDay[activeDay] && (
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden"
        >
          <table className="min-w-full text-center text-sm">
            <thead>
              <tr className="border-b border-border">
                {groupedByDay[activeDay].map((hour) => (
                  <th
                    key={hour.time}
                    className="whitespace-nowrap bg-background px-1 py-2 text-muted-foreground"
                  >
                    {new Date(hour.time).toLocaleTimeString(["nb-NO"], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: TIMEZONE,
                    })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-border last:border-b-0"
                >
                  {groupedByDay[activeDay].map((hour) => (
                    <td
                      key={hour.time}
                      className="whitespace-nowrap bg-background px-1 py-2"
                    >
                      <div className="mx-auto flex w-12 items-center justify-center">
                        {row.getValue(hour)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
