"use client"

import { useEffect, useRef, useState } from "react"
import { setOptions, importLibrary } from "@googlemaps/js-api-loader"
import { createRoot, Root } from "react-dom/client"
import { Loader2 } from "lucide-react"

import { WindCompass } from "@/components/spots/wind-compass"
import { Badge } from "@/components/ui/badge"
import { seasonLabels, skillLabels } from "@/lib/spot-labels"
import type { Database } from "@/types/database"

type Spot = Database["public"]["Tables"]["spots"]["Row"]

function InfoWindowContent({ spot }: { spot: Spot }) {
  const season = spot.season ? seasonLabels[spot.season] : null
  const skill = spot.skill_level ? skillLabels[spot.skill_level] : null
  const d = spot.wind_directions || []

  return (
    <div className="flex flex-col gap-2 p-1 min-w-[200px] max-w-[260px]">
      <a 
        href={`/spots/${spot.id}`}
        className="text-base font-semibold text-primary hover:underline transition-colors block"
      >
        {spot.name}
      </a>
      {(season || skill) && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {season && (
            <Badge variant={season.variant} className="text-[10px] px-1.5 py-0 h-4 leading-4 flex-shrink-0">
              {season.text}
            </Badge>
          )}
          {skill && (
            <Badge variant={skill.variant} className="text-[10px] px-1.5 py-0 h-4 leading-4 flex-shrink-0">
              {skill.text}
            </Badge>
          )}
        </div>
      )}
      {d.length > 0 && (
        <div className="mt-3 flex flex-col items-center">
          <WindCompass directions={d} size="sm" />
        </div>
      )}
    </div>
  )
}

export function SpotMap({ spots }: { spots: Spot[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const infoWindowContainerRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<Root | null>(null)

  useEffect(() => {
    let cancelled = false
    const initMap = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey || apiKey === "GOOGLE_MAPS_API_KEY") {
          throw new Error("Google Maps API key is not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local.")
        }

        setOptions({ key: apiKey, v: "weekly" })
        await importLibrary("maps")

        const g = (window as Window & { google: typeof globalThis.google }).google
        if (!g || !mapRef.current || cancelled) return

        // Setup React render target for InfoWindow
        const container = document.createElement("div")
        infoWindowContainerRef.current = container
        rootRef.current = createRoot(container)
        const infoWindow = new g.maps.InfoWindow()
        infoWindowRef.current = infoWindow

        // Initialize map
        const map = new g.maps.Map(mapRef.current, {
          center: { lat: 62.4722, lng: 6.1549 }, // Default Ålesund area
          zoom: 9,
          mapTypeId: g.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          gestureHandling: "greedy",
        })

        map.addListener("click", () => {
          infoWindow.close()
        })

        if (!cancelled) {
          setMapInstance(map)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load map")
          setIsLoading(false)
        }
      }
    }

    initMap()

    return () => {
      cancelled = true
      if (rootRef.current) setTimeout(() => rootRef.current?.unmount(), 0)
    }
  }, [])

  useEffect(() => {
    if (!mapInstance) return
    const g = (window as Window & { google: typeof globalThis.google }).google
    if (!g) return

    // Clear old markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    if (spots.length === 0) return

    const bounds = new g.maps.LatLngBounds()
    let validSpots = 0

    spots.forEach((spot) => {
      if (!spot.latitude || !spot.longitude) return
      
      const position = { lat: spot.latitude, lng: spot.longitude }
      const marker = new g.maps.Marker({
        position,
        map: mapInstance,
        title: spot.name,
      })

      marker.addListener("click", () => {
        if (rootRef.current && infoWindowRef.current && infoWindowContainerRef.current) {
          rootRef.current.render(<InfoWindowContent spot={spot} />)
          infoWindowRef.current.setContent(infoWindowContainerRef.current)
          infoWindowRef.current.open({
            anchor: marker,
            map: mapInstance,
            shouldFocus: false,
          })
        }
      })

      markersRef.current.push(marker)
      bounds.extend(position)
      validSpots++
    })

    if (validSpots > 0) {
      if (validSpots === 1) {
        mapInstance.setCenter(bounds.getCenter())
        mapInstance.setZoom(12)
      } else {
        mapInstance.fitBounds(bounds, {
          top: 40, right: 40, bottom: 40, left: 40
        })
      }
    }
  }, [mapInstance, spots])

  if (error) {
    return (
      <div className="p-4 mt-6 border border-destructive/50 text-destructive bg-destructive/10 rounded-md text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="relative w-full h-[600px] mt-6 rounded-lg overflow-hidden border border-border bg-muted shadow-md">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full outline-none focus:outline-none" />
    </div>
  )
}
