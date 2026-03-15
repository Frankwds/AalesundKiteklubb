"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { MinimalForecast } from "@/lib/yr-forecast"

interface UseForecastByDayReturn {
  groupedByDay: Record<string, MinimalForecast[]>
  activeDay: string | null
  setActiveDay: (day: string) => void
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  firstDay: string | null
}

export function useForecastByDay(
  data: MinimalForecast[],
  timezone: string
): UseForecastByDayReturn {
  const [sortedData, setSortedData] = useState<MinimalForecast[]>(data)
  const [activeDay, setActiveDay] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const getDayKey = useCallback(
    (timeValue: string) =>
      new Date(timeValue).toLocaleDateString(["nb-NO"], {
        weekday: "short",
        timeZone: timezone,
      }),
    [timezone]
  )

  const getFirstDay = useCallback(
    (items: MinimalForecast[]) =>
      items.length > 0 ? getDayKey(items[0].time) : null,
    [getDayKey]
  )

  useEffect(() => {
    const sorted = [...data].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    )
    setSortedData(sorted)
    setActiveDay(getFirstDay(sorted))
  }, [data, getFirstDay])

  useEffect(() => {
    if (!activeDay || !scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const table = container.querySelector("table")
    if (table) {
      if (activeDay === getFirstDay(sortedData)) {
        container.scrollLeft = 0
      } else {
        container.scrollLeft = (table.scrollWidth - container.clientWidth) / 2
      }
    }
  }, [activeDay, sortedData, getFirstDay])

  const groupedByDay = sortedData.reduce(
    (acc, item) => {
      const day = getDayKey(item.time)
      if (!acc[day]) acc[day] = []
      acc[day].push(item)
      return acc
    },
    {} as Record<string, MinimalForecast[]>
  )

  return {
    groupedByDay,
    activeDay,
    setActiveDay,
    scrollContainerRef,
    firstDay: getFirstDay(sortedData),
  }
}
