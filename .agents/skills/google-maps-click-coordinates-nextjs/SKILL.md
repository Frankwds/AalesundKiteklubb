---
name: google-maps-click-coordinates-nextjs
description: Integrate Google Maps in Next.js to create an interactive click-to-place map with pointers and coordinate capture. Use when adding map selection, location pickers, click-to-get-coordinates, or when the user mentions Google Maps, map markers, or coordinate selection in a Next.js project.
---

# Google Maps Click-to-Coordinates in Next.js

Build an interactive map where users click to place a pointer and retrieve coordinates, following the Contribute-style pattern (map instance → click listener → marker placement → callback with lat/lng).

## Quick Start

### 1. Dependencies

```bash
npm install @googlemaps/js-api-loader @types/google.maps
```

### 2. Environment Variable

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
```

Enable **Maps JavaScript API** and **Places API** in Google Cloud Console. For `AdvancedMarkerElement`, create a Map ID in Google Cloud Console (e.g. default or custom map type).

### 3. Map Component Structure

Use a layered hook architecture: **useMapInstance** → **useMarkers** → **useClickToPlace** (or combined in one hook).

## Core Pattern

### Map Initialization (`useMapInstance`)

```typescript
import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

export const useMapInstance = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) throw new Error('Google Maps API key is not configured');

        setOptions({ key: apiKey, v: 'weekly', libraries: ['places', 'marker'] });
        await importLibrary('maps');
        await importLibrary('marker');

        const google = (window as Window & { google: typeof globalThis.google }).google;
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapId: 'YOUR_MAP_ID', // Required for AdvancedMarkerElement
          streetViewControl: false,
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: 'greedy',
        });

        setMapInstance(map);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setIsLoading(false);
      }
    };
    initMap();
  }, [latitude, longitude]);

  return { mapRef, mapInstance, isLoading, error };
};
```

### Click-to-Place and Coordinate Callback

```typescript
useEffect(() => {
  if (!mapInstance || !onCoordinatesChange) return;

  const listener = mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      onCoordinatesChange(lat, lng);
    }
  });

  return () => google.maps.event.removeListener(listener);
}, [mapInstance, onCoordinatesChange]);
```

### Placing a Draggable Marker

Use `AdvancedMarkerElement` with a custom pin. Pass the marker-placement function to the click handler:

```typescript
const addMarker = useCallback((lat: number, lng: number) => {
  if (!mapInstance) return;

  const marker = new google.maps.marker.AdvancedMarkerElement({
    map: mapInstance,
    position: { lat, lng },
    title: 'Selected location',
    gmpDraggable: true,
  });

  marker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
    if (e.latLng) onCoordinatesChange(e.latLng.lat(), e.latLng.lng());
  });

  onCoordinatesChange(lat, lng);
}, [mapInstance, onCoordinatesChange]);
```

Wire map click to `addMarker`:

```typescript
mapInstance.addListener('click', (event) => {
  if (event.latLng) addMarker(event.latLng.lat(), event.latLng.lng());
});
```

## Component Example

`useClickToPlaceMarker` is fully implemented in [reference.md](reference.md).

```tsx
'use client';

export const ClickToPlaceMap = ({
  centerLat,
  centerLng,
  initialLat,
  initialLng,
  onCoordinatesChange,
}: {
  centerLat: number;
  centerLng: number;
  initialLat?: number;
  initialLng?: number;
  onCoordinatesChange: (lat: number, lng: number) => void;
}) => {
  const { mapRef, mapInstance, isLoading, error } = useMapInstance({
    latitude: centerLat,
    longitude: centerLng,
  });

  const { addMarker } = useClickToPlaceMarker({
    mapInstance,
    initialLat,
    initialLng,
    onCoordinatesChange,
  });

  useEffect(() => {
    if (!mapInstance || !addMarker) return;
    const listener = mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) addMarker(e.latLng.lat(), e.latLng.lng());
    });
    return () => google.maps.event.removeListener(listener);
  }, [mapInstance, addMarker]);

  if (error) return <div>Failed to load map: {error}</div>;
  return (
    <div className="relative w-full h-80">
      {isLoading && <div>Loading map...</div>}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};
```

## Key Points

| Topic | Guideline |
|-------|-----------|
| **Client component** | Use `'use client'`; map must run in browser |
| **API key** | `NEXT_PUBLIC_` prefix for client-side use |
| **Map ID** | Required for `AdvancedMarkerElement`; create in Cloud Console |
| **Listeners** | Always remove in `useEffect` cleanup |
| **Callback refs** | Use `useRef` for `onCoordinatesChange` to avoid listener re-attachment |

## File Structure (Contribute-style)

```
src/app/components/
├── ClickToPlaceMap/
│   ├── ClickToPlaceMap.tsx
│   └── hooks/
│       ├── useMapInstance.ts
│       ├── useClickToPlaceMarker.ts
│       └── index.ts
```

## Additional Resources

- Map ID setup, marker styling, and error handling: [reference.md](reference.md)
- Google Maps JS API: https://developers.google.com/maps/documentation/javascript
