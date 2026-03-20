## Why

Members need clear, club-maintained guidance on where kite flying is encouraged, cautious, or discouraged at each spot. Today there is no structured way to capture that spatial information. Admins should be able to draw multiple labeled zones on a map and persist them with the spot; visitors should see those zones on the public spot page without an interactive map.

## What Changes

- Add a **“Skraver områder”** control in the admin spot form (placed **before** the Bilde section), opening a modal with an **interactive Google Map** for drawing zones.
- Support **multiple polygons** per spot: each has a **color** (red / yellow / green), a **per-polygon tag** (admin-defined text, single line), and an ordered list of vertices. **Stack order** is global (later-created polygons draw on top).
- **Selection**: one polygon is selected at a time (auto-select on create). Only the selected polygon receives new vertices from map clicks. **Selected** polygon is visually emphasized (higher fill opacity and thicker stroke than others).
- **Editing**: tap/click map to add a vertex to the selected polygon; tap/click a vertex to remove it; **drag** starting on a vertex moves that vertex; drag **not** starting on a vertex pans the map (mobile-first).
- **Delete polygon**: list entry includes a control to remove the entire polygon (tag + vertices).
- **Collapsible panel** above the map: row to create polygons (color dropdown, tag input, create button); below that, list with select + delete per polygon. Panel **expanded** by default on first open.
- Persist zone data as **JSON** (GeoJSON-style `FeatureCollection` with `schemaVersion`) on the spot row in **Supabase**, saved only when the **whole spot form** is submitted.
- **Validation** on save: any polygon that is still “committed” in the payload with fewer than **three** vertices SHALL fail with a clear, user-visible error (no silent discard).
- **Public spot page**: render a **Google Static Map** showing spot location and all polygons when data exists; **fit bounds** to polygons when present, else **zoom 11** centered on spot coordinates (or app default center if coords missing). The static image is **not** a link (tap does nothing). If there are no zones, still show a static map at zoom 11 for location context (no polygons).
- Enable **Maps Static API** in Google Cloud alongside existing Maps JavaScript usage.

## Capabilities

### New Capabilities

- `spot-kite-zones`: Admin authoring, persistence, validation, and public read-only visualization of per-spot kite zone polygons (JSON + Static Maps).

### Modified Capabilities

- *(none — no existing baseline specs under `openspec/specs/`)*

## Impact

- **Database**: new nullable JSON column on `public.spots` (e.g. `kite_zones` or `kite_zones_geojson`).
- **Backend**: `createSpot` / `updateSpot` actions and Zod schemas; optional sanitization/size limits for JSON.
- **Admin UI**: `spots-tab.tsx` (or extracted components), new modal + hooks building on `@googlemaps/js-api-loader` patterns used in `MapCoordinatesPicker`.
- **Public UI**: `src/app/spots/[id]/page.tsx` (or server component helper) to build Static Map URLs server-side.
- **Google Cloud**: Maps Static API enabled; API key restrictions updated if needed.
- **Types**: regenerate or extend `src/types/database.ts` after migration.
