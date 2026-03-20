## 1. Database and types

- [ ] 1.1 Add Supabase migration: nullable `jsonb` column on `public.spots` (e.g. `kite_zones`) with comment describing GeoJSON FeatureCollection + `schemaVersion`
- [ ] 1.2 Regenerate `src/types/database.ts` (or update Row/Insert/Update manually) for `spots.kite_zones`

## 2. Validation and server actions

- [ ] 2.1 Add Zod schema for `kite_zones` payload: `schemaVersion`, features array, polygon rings, color enum, tag length, closed ring, minimum vertex count
- [ ] 2.2 Extend `createSpotSchema` / `updateSpotSchema` and `createSpot` / `updateSpot` in `src/lib/actions/spots.ts` to read optional JSON (form field or structured field) and persist `kite_zones`
- [ ] 2.3 Map validation failures to clear user-facing errors for incomplete polygons (&lt;3 vertices) and invalid tag/color/JSON

## 3. Admin UI — form integration

- [ ] 3.1 Add **Skraver områder** button to spot form **before** Bilde section; wire open/close state for modal
- [ ] 3.2 Pass initial `kite_zones` when editing a spot; on spot submit, attach serialized JSON (hidden input or append in `handleSubmit`) so it saves with the rest of the form

## 4. Admin UI — kite zones modal

- [ ] 4.1 Create modal shell (reuse `Dialog` patterns from `MapCoordinatesModal`): title/description, **Avbryt** / **Lagre**, map area between header and footer as specified
- [ ] 4.2 Implement collapsible panel **above** map: color dropdown, tag input, create button; default expanded
- [ ] 4.3 Implement polygon list: select control, delete-entire-polygon control; auto-select new polygon; reflect selection in list and on map
- [ ] 4.4 Integrate Google Map (reuse loader pattern): center/fit bounds per design; render polygons with selected vs unselected opacity/stroke; global z-order by creation
- [ ] 4.5 Vertex UX: add vertex on map click (selected polygon only); remove on vertex click; drag-from-vertex moves vertex, else pan; touch-friendly hit targets
- [ ] 4.6 Modal state: working copy vs last **Lagre** snapshot; **Avbryt** discards working copy since open

## 5. Public spot page

- [ ] 5.1 Add server helper to build Maps Static API URL from spot coords + `kite_zones` (fit bounds when polygons exist, else zoom 11 at spot)
- [ ] 5.2 Render static `<img>` (or Next `Image` if compatible) on `src/app/spots/[id]/page.tsx`; no link/`onClick`; handle missing API key gracefully
- [ ] 5.3 Optional: short accessibility text or caption when zones exist (e.g. summary that zones are club guidance)

## 6. Google Cloud and configuration

- [ ] 6.1 Document enabling **Maps Static API** and any key restriction updates in README or `.env.example`
- [ ] 6.2 Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (and/or server key) works for both JS map and Static Maps in dev/staging

## 7. Verification

- [ ] 7.1 Manual QA: create/edit spot with multiple polygons, save, reload admin and public pages
- [ ] 7.2 Manual QA: mobile viewport — vertex drag vs pan, panel collapse, modal scroll
- [ ] 7.3 Manual QA: submit with incomplete polygon (0–2 vertices) shows error; empty zones save OK
