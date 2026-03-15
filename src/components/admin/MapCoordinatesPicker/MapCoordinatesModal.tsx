"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMapInstance } from "./hooks/useMapInstance"
import { useClickToPlaceMarker } from "./hooks/useClickToPlaceMarker"

const DEFAULT_LAT = 62.4722
const DEFAULT_LNG = 6.1549

type MapCoordinatesModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialLat?: number | null
  initialLng?: number | null
  onConfirm: (lat: number, lng: number) => void
}

function MapContent({
  centerLat,
  centerLng,
  initialLat,
  initialLng,
  onCoordsChange,
  onMapReady,
}: {
  centerLat: number
  centerLng: number
  initialLat?: number | null
  initialLng?: number | null
  onCoordsChange: (lat: number, lng: number) => void
  onMapReady: (coords: { lat: number; lng: number } | null) => void
}) {
  const { mapRef, mapInstance, isLoading, error } = useMapInstance({
    latitude: centerLat,
    longitude: centerLng,
  })

  const handleCoordsChange = useCallback(
    (lat: number, lng: number) => {
      onCoordsChange(lat, lng)
      onMapReady({ lat, lng })
    },
    [onCoordsChange, onMapReady]
  )

  const { addMarker } = useClickToPlaceMarker({
    mapInstance,
    initialLat: initialLat ?? undefined,
    initialLng: initialLng ?? undefined,
    onCoordinatesChange: handleCoordsChange,
  })

  useEffect(() => {
    if (!mapInstance || !addMarker) return
    const listener = mapInstance.addListener(
      "click",
      (e: google.maps.MapMouseEvent) => {
        if (e.latLng) addMarker(e.latLng.lat(), e.latLng.lng())
      }
    )
    return () => google.maps.event.removeListener(listener)
  }, [mapInstance, addMarker])

  useEffect(() => {
    if (initialLat != null && initialLng != null) {
      onMapReady({ lat: initialLat, lng: initialLng })
    }
  }, [initialLat, initialLng, onMapReady])

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <span className="text-sm text-muted-foreground">Laster kart...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 z-10 p-4">
          <span className="text-sm text-destructive text-center">{error}</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[320px]" />
    </>
  )
}

export function MapCoordinatesModal({
  open,
  onOpenChange,
  initialLat,
  initialLng,
  onConfirm,
}: MapCoordinatesModalProps) {
  const [pendingCoords, setPendingCoords] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const centerLat =
    initialLat != null && !isNaN(initialLat) ? initialLat : DEFAULT_LAT
  const centerLng =
    initialLng != null && !isNaN(initialLng) ? initialLng : DEFAULT_LNG

  useEffect(() => {
    if (!open) setPendingCoords(null)
  }, [open])

  function handleConfirm() {
    if (pendingCoords) {
      onConfirm(pendingCoords.lat, pendingCoords.lng)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Velg posisjon på kartet</DialogTitle>
          <DialogDescription>
            Klikk på kartet for å plassere en markør. Du kan dra markøren for å
            justere. Bekreft for å bruke koordinatene.
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex-1 min-h-[320px] rounded-lg overflow-hidden border border-border bg-muted/30">
          {open && (
            <MapContent
              centerLat={centerLat}
              centerLng={centerLng}
              initialLat={initialLat}
              initialLng={initialLng}
              onCoordsChange={(lat, lng) => setPendingCoords({ lat, lng })}
              onMapReady={(coords) =>
                coords && setPendingCoords({ lat: coords.lat, lng: coords.lng })
              }
            />
          )}
        </div>

        {pendingCoords && (
          <p className="text-xs text-muted-foreground">
            Valgt: {pendingCoords.lat.toFixed(6)}, {pendingCoords.lng.toFixed(6)}
          </p>
        )}

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <DialogClose render={<Button variant="outline" />}>
            Avbryt
          </DialogClose>
          <Button
            onClick={handleConfirm}
            disabled={!pendingCoords}
            className="bg-primary hover:bg-primary/90"
          >
            Bekreft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
