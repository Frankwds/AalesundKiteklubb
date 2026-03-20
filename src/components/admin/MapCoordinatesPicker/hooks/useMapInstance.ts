"use client"

import { useEffect, useRef, useState } from "react"
import { setOptions, importLibrary } from "@googlemaps/js-api-loader"

const DEFAULT_CENTER = { lat: 62.4722, lng: 6.1549 } // Ålesund

export function useMapInstance({
  latitude,
  longitude,
  /** When false, skip init (e.g. dialog closed). Ref must exist when this becomes true. */
  enabled = true,
}: {
  latitude: number
  longitude: number
  enabled?: boolean
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setMapInstance(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    const initMap = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey || apiKey === "GOOGLE_MAPS_API_KEY") {
          throw new Error(
            "Google Maps API key is not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local."
          )
        }

        setOptions({
          key: apiKey,
          v: "weekly",
          libraries: ["places"],
        })
        await importLibrary("maps")

        const g = (window as Window & { google: typeof globalThis.google }).google
        // Ref may lag one frame (portal / conditional mount); never leave loading stuck.
        let el = mapRef.current
        if (!el) {
          await new Promise<void>((r) =>
            requestAnimationFrame(() => requestAnimationFrame(r))
          )
          el = mapRef.current
        }

        if (!g || !el || cancelled) {
          if (!cancelled) {
            setError(
              !g
                ? "Google Maps lastet ikke. Prøv å lukke og åpne vinduet på nytt."
                : "Kart-container manglet. Prøv å lukke og åpne vinduet på nytt."
            )
            setIsLoading(false)
          }
          return
        }

        const map = new g.maps.Map(el, {
          center: { lat: latitude, lng: longitude },
          zoom: 12,
          mapTypeId: g.maps.MapTypeId.SATELLITE,
          streetViewControl: false,
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        })

        if (!cancelled) {
          setMapInstance(map)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load map"
          )
          setIsLoading(false)
        }
      }
    }

    void initMap()
    return () => {
      cancelled = true
    }
  }, [latitude, longitude, enabled])

  return { mapRef, mapInstance, isLoading, error }
}
