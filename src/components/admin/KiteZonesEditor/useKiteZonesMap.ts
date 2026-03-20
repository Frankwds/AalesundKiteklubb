"use client"

import { useEffect, useRef, useState } from "react"
import { setOptions, importLibrary } from "@googlemaps/js-api-loader"

export function useKiteZonesMap(
  centerLat: number,
  centerLng: number,
  enabled: boolean
) {
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
      try {
        setIsLoading(true)
        setError(null)
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
        if (!g || !mapRef.current || cancelled) return

        const map = new g.maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 14,
          mapTypeId: g.maps.MapTypeId.SATELLITE,
          streetViewControl: false,
          zoomControl: true,
          mapTypeControl: false,
          fullscreenControl: true,
          disableDefaultUI: false,
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
  }, [enabled, centerLat, centerLng])

  return { mapRef, mapInstance, isLoading, error }
}
