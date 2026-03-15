"use client"

import { useEffect, useRef, useState } from "react"
import { setOptions, importLibrary } from "@googlemaps/js-api-loader"

const DEFAULT_CENTER = { lat: 62.4722, lng: 6.1549 } // Ålesund

export function useMapInstance({
  latitude,
  longitude,
}: {
  latitude: number
  longitude: number
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const initMap = async () => {
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
        if (!g || !mapRef.current || cancelled) return

        const map = new g.maps.Map(mapRef.current, {
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

    initMap()
    return () => {
      cancelled = true
    }
  }, [latitude, longitude])

  return { mapRef, mapInstance, isLoading, error }
}
