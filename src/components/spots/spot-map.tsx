"use client"

import { useEffect, useRef, useState } from "react"
import { setOptions, importLibrary } from "@googlemaps/js-api-loader"
import { createRoot, Root } from "react-dom/client"
import { BookOpen, Cloud, Loader2, MapPin } from "lucide-react"

import { GOOGLE_MAPS_SPOTS_MAP_ID } from "@/lib/maps/map-config"
import {
  attachSpotMarkerHoverHandlers,
  createSpotMarkerElement,
} from "@/lib/maps/spot-marker-element"
import type { Database } from "@/types/database"

type Spot = Database["public"]["Tables"]["spots"]["Row"]

function InfoWindowContent({ spot }: { spot: Spot }) {
  const lat = spot.latitude
  const lon = spot.longitude
  const hasCoords = lat != null && lon != null

  const buttonClass =
    "inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary-muted transition-all"

  return (
    <div className="flex w-full min-w-0 max-w-[min(280px,calc(100vw-2.5rem))] flex-col gap-2 px-1 pb-1 pt-0">
      <a href={`/spots/${spot.id}`} className={buttonClass}>
        <BookOpen className="h-4 w-4 shrink-0 text-primary" />
        Guide
      </a>
      <p className="text-base font-semibold text-foreground leading-snug">
        {spot.name}
      </p>
      {hasCoords && (
        <div className="flex w-full min-w-0 flex-col gap-1.5">
          <a
            href={`https://www.google.com/maps?q=${lat},${lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            Maps
          </a>
          <a
            href={`https://www.yr.no/nb/v%C3%A6rvarsel/daglig-tabell/${lat},${lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            <Cloud className="h-4 w-4 shrink-0 text-primary" />
            Yr.no
          </a>
        </div>
      )}
    </div>
  )
}

function disposeMarkers(markers: google.maps.marker.AdvancedMarkerElement[]) {
  for (const m of markers) {
    m.map = null
  }
}

export function SpotMap({ spots }: { spots: Spot[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const infoWindowContainerRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<Root | null>(null)

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

        setOptions({ key: apiKey, v: "weekly" })
        await importLibrary("maps")
        await importLibrary("marker")

        const g = (window as Window & { google: typeof globalThis.google }).google
        if (!g || !mapRef.current || cancelled) return

        const container = document.createElement("div")
        infoWindowContainerRef.current = container
        rootRef.current = createRoot(container)
        const infoWindow = new g.maps.InfoWindow({
          maxWidth: 320,
          headerDisabled: true,
        })
        infoWindowRef.current = infoWindow

        const map = new g.maps.Map(mapRef.current, {
          center: { lat: 62.4722, lng: 6.1549 },
          zoom: 9,
          mapId: GOOGLE_MAPS_SPOTS_MAP_ID,
          mapTypeId: g.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          gestureHandling: "greedy",
          clickableIcons: false,
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

    disposeMarkers(markersRef.current)
    markersRef.current = []

    if (spots.length === 0) return

    const bounds = new g.maps.LatLngBounds()
    let validSpots = 0

    const openInfo = (
      spot: Spot,
      anchor: google.maps.marker.AdvancedMarkerElement
    ) => {
      if (rootRef.current && infoWindowRef.current && infoWindowContainerRef.current) {
        rootRef.current.render(<InfoWindowContent spot={spot} />)
        infoWindowRef.current.setContent(infoWindowContainerRef.current)
        infoWindowRef.current.open({
          anchor,
          map: mapInstance,
          shouldFocus: false,
        })
      }
    }

    for (const spot of spots) {
      if (spot.latitude == null || spot.longitude == null) continue

      const position = { lat: spot.latitude, lng: spot.longitude }

      const markerElement = createSpotMarkerElement(spot.wind_directions)
      attachSpotMarkerHoverHandlers(markerElement)

      const marker = new g.maps.marker.AdvancedMarkerElement({
        map: mapInstance,
        position,
        title: spot.name,
        content: markerElement,
      })
      marker.zIndex = 1000
      markerElement.addEventListener("click", (e: Event) => {
        e.stopPropagation()
        openInfo(spot, marker)
      })
      markersRef.current.push(marker)

      bounds.extend(position)
      validSpots++
    }

    if (validSpots > 0) {
      if (validSpots === 1) {
        mapInstance.setCenter(bounds.getCenter())
        mapInstance.setZoom(12)
      } else {
        mapInstance.fitBounds(bounds, {
          top: 40,
          right: 40,
          bottom: 40,
          left: 40,
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
