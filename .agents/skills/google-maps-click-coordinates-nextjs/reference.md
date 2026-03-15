# Google Maps Click-to-Coordinates — Reference

## Map ID Setup (Required for AdvancedMarkerElement)

`AdvancedMarkerElement` requires a map with a Map ID. Create one in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Maps → Map Management
2. Create map or use "Default" map (Map ID: `DEMO_MAP_ID` for testing)
3. For production: create a custom map, choose base map type (e.g. Satellite), copy the Map ID
4. Ensure **Maps JavaScript API** is enabled for your project
5. Use the Map ID in the map options: `mapId: 'YOUR_MAP_ID'`

For quick prototyping without Map ID, use `Marker` (legacy) instead of `AdvancedMarkerElement`, but prefer Advanced for new projects.

---

## useClickToPlaceMarker Hook (Full Implementation)

Implements the marker logic referenced in SKILL.md: place one marker, replace on new click, support initial coords and drag.

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseClickToPlaceMarkerProps {
  mapInstance: google.maps.Map | null;
  initialLat?: number;
  initialLng?: number;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  createMarkerElement?: () => HTMLElement; // optional custom pin
}

export const useClickToPlaceMarker = ({
  mapInstance,
  initialLat,
  initialLng,
  onCoordinatesChange,
  createMarkerElement,
}: UseClickToPlaceMarkerProps) => {
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const onCoordinatesChangeRef = useRef(onCoordinatesChange);

  useEffect(() => {
    onCoordinatesChangeRef.current = onCoordinatesChange;
  }, [onCoordinatesChange]);

  const addMarker = useCallback(
    (lat: number, lng: number) => {
      if (!mapInstance) return;

      setMarker(prev => {
        if (prev) prev.map = null;
        return null;
      });

      const newMarker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstance,
        position: { lat, lng },
        title: 'Selected location',
        gmpDraggable: true,
        content: createMarkerElement?.(),
      });

      newMarker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) onCoordinatesChangeRef.current?.(e.latLng.lat(), e.latLng.lng());
      });

      setMarker(newMarker);
      onCoordinatesChangeRef.current?.(lat, lng);
    },
    [mapInstance, createMarkerElement]
  );

  useEffect(() => {
    if (!mapInstance) return;

    if (initialLat != null && initialLng != null) {
      addMarker(initialLat, initialLng);
    }
  }, [mapInstance, initialLat, initialLng]); // addMarker omitted to avoid re-run on every callback change

  return { addMarker, marker };
};
```

---

## Custom Marker Element (SVG Pin)

For a styled pin instead of the default, create an HTMLElement and pass it as `content`:

```typescript
export const createPinMarkerElement = (color = 'green'): HTMLElement => {
  const container = document.createElement('div');
  container.style.cssText = 'position:relative;width:24px;height:32px;transform:translate(0%,50%);cursor:pointer;';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 32');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '32');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', color);
  path.setAttribute('stroke', 'white');
  path.setAttribute('stroke-width', '2');
  path.setAttribute(
    'd',
    'M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z'
  );
  svg.appendChild(path);
  container.appendChild(svg);
  return container;
};
```

Usage:

```typescript
const { addMarker } = useClickToPlaceMarker({
  mapInstance,
  initialLat,
  initialLng,
  onCoordinatesChange,
  createMarkerElement: () => createPinMarkerElement('darkgreen'),
});
```

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Missing API key | Check `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`; throw clear error in init |
| Map ID invalid | Use a Map ID from Cloud Console; legacy `Marker` works without Map ID |
| Container unmounted before init | Guard `if (!mapRef.current) return` and avoid setState after unmount |
| Listener leaks | Always return cleanup: `return () => google.maps.event.removeListener(listener)` |

Example init with validation:

```typescript
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!apiKey || apiKey === 'GOOGLE_MAPS_API_KEY') {
  throw new Error('Google Maps API key is not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.');
}
```

---

## Optional: Map Controls (Contribute-style)

Add zoom controls and layer toggle for a richer UX:

```tsx
// MapLayerToggle: satellite / roadmap / OSM
// ZoomControls: +/- buttons

{mapInstance && (
  <>
    <MapLayerToggle map={mapInstance} initialMapType="satellite" />
    <ZoomControls map={mapInstance} />
  </>
)}
```

Register OSM in `useMapInstance`:

```typescript
const osmMapType = new google.maps.ImageMapType({
  getTileUrl: (coord, zoom) =>
    `https://tile.openstreetmap.org/${zoom}/${coord.x}/${coord.y}.png`,
  tileSize: new google.maps.Size(256, 256),
  maxZoom: 19,
  minZoom: 1,
  name: 'OpenStreetMap',
  alt: 'OpenStreetMap',
});
map.mapTypes.set('osm', osmMapType);
```

---

## Libraries to Import

| Library | When to load |
|---------|---------------|
| `maps` | Always |
| `marker` | Required for `AdvancedMarkerElement` |
| `places` | Only if using Autocomplete or Places |
| `elevation` | Only if fetching elevation at coords |

```typescript
setOptions({
  key: apiKey,
  v: 'weekly',
  libraries: ['places', 'marker'], // add 'elevation' if needed
});
await importLibrary('maps');
await importLibrary('marker');
```

---

## Contribute System Reference (WindAlert)

The WindAlert Contribute flow uses:

- **useMapInstance**: init map, OSM layer, loading/error state
- **useMarkers**: takeoff (fixed) + landing (click-to-place, draggable)
- **useContributeMap**: wires map click → `addLandingMarker(lat, lng)` → `onLandingChange(lat, lng)`
- **ContributeMap**: renders map + controls; **ContributeLanding**: form + save flow

See: `src/app/components/LocationPage/Contribute/` for the full implementation.
