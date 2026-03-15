"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseClickToPlaceMarkerProps {
  mapInstance: google.maps.Map | null
  initialLat?: number
  initialLng?: number
  onCoordinatesChange?: (lat: number, lng: number) => void
}

export function useClickToPlaceMarker({
  mapInstance,
  initialLat,
  initialLng,
  onCoordinatesChange,
}: UseClickToPlaceMarkerProps) {
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const onCoordinatesChangeRef = useRef(onCoordinatesChange)

  useEffect(() => {
    onCoordinatesChangeRef.current = onCoordinatesChange
  }, [onCoordinatesChange])

  const addMarker = useCallback(
    (lat: number, lng: number) => {
      if (!mapInstance) return

      setMarker((prev) => {
        if (prev) prev.setMap(null)
        return null
      })

      const newMarker = new google.maps.Marker({
        map: mapInstance,
        position: { lat, lng },
        title: "Valgt lokasjon",
        draggable: true,
      })

      newMarker.addListener("dragend", (e: google.maps.MapMouseEvent) => {
        if (e.latLng)
          onCoordinatesChangeRef.current?.(e.latLng.lat(), e.latLng.lng())
      })

      setMarker(newMarker)
      onCoordinatesChangeRef.current?.(lat, lng)
    },
    [mapInstance]
  )

  useEffect(() => {
    if (!mapInstance) return
    if (initialLat != null && initialLng != null) {
      addMarker(initialLat, initialLng)
    }
  }, [mapInstance, initialLat, initialLng]) // eslint-disable-line react-hooks/exhaustive-deps

  return { addMarker, marker }
}
