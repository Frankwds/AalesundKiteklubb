## Context

- Stack: Next.js 16, React 19, Supabase, existing admin map via `@googlemaps/js-api-loader` in `MapCoordinatesPicker` (`useMapInstance`, satellite, `gestureHandling: "greedy"`).
- Spots are edited in `src/components/admin/tabs/spots-tab.tsx`; coordinates use `MapCoordinatesModal`; no embedded public map today—spot page links to Google Maps and may show `map_image_url`.
- **No** existing `openspec/specs/` baselines; this change introduces a new capability spec only.

## Goals / Non-Goals

**Goals:**

- Multi-polygon editor (red/yellow/green + per-polygon tag) with selection, vertex add/remove/drag, whole-polygon delete, mobile-first gesture model.
- Persist zones as versioned JSON on `spots`, saved with the same server action as the rest of the spot form.
- Public **read-only** visualization via **Google Static Maps API** (polygons + adaptive bounds or zoom 11); image **not** clickable.

**Non-goals:**

- Interactive public map, KML export, or showing polygons inside the external Google Maps app from this static image.
- Real-time collaboration, version history of zone edits, or anonymous public editing.
- Automatic simplification of geometry for Static URLs at 20–30 total points (not required for stated scale).

## Decisions

### 1. JSON document shape

**Decision:** Store a single JSON object on the spot row, e.g. `{ schemaVersion: 1, features: GeoJSON Feature[] }` wrapped as a valid GeoJSON **FeatureCollection** in column `kite_zones` (nullable).

- Each `Feature`: `geometry.type === "Polygon"`, single ring, first/last coordinate equal; `properties`: `id` (string UUID v4), `color` ∈ `{ "red", "yellow", "green" }`, `tag` (string), optional `order` (integer) for explicit z-index if creation order must survive re-fetches.

**Alternatives:** Separate `spot_kite_zones` table (more normalized, heavier for this use case); WKT strings (worse for frontend).

### 2. Admin map implementation

**Decision:** New client component/modal (e.g. `KiteZonesMapModal`) reusing `useMapInstance` or shared loader init to avoid double-loading the API when both coordinate picker and zones modal are used in one session. Render `google.maps.Polygon` per feature plus **draggable** `Marker` or custom overlay for vertices; update `Polygon` path on marker drag/end.

**Alternatives:** `@react-google-maps/api` (adds dependency; current codebase uses loader + imperative API). Drawing library (heavier; less control for per-vertex delete).

### 3. Vertex hit testing for “drag starts on vertex”

**Decision:** Use **visible markers** at vertices (scaled for touch). On `pointerdown`, if target is a vertex handle, set mode to drag-vertex; else allow map pan. May require temporarily setting `draggable: false` on markers during map pan or using `stopPropagation` on marker events so the map does not steal the gesture.

**Alternatives:** Edit-mode toggle (rejected by product).

### 4. Selected vs unselected styling

**Decision:** Example defaults: unselected `fillOpacity ~0.22`, `strokeWeight 2`; selected `fillOpacity ~0.45`, `strokeWeight 3`. Colors: e.g. green `#22c55e`, yellow `#eab308`, red `#ef4444` with alpha via `fillOpacity`.

### 5. Static map generation

**Decision:** Server-only helper (e.g. `getSpotStaticMapUrl` in `src/lib/...`) builds a Maps Static API URL: `size`, `maptype=satellite` (or `hybrid` if readability needs labels—confirm with design), `key`, multiple `path=` parameters (fill + stroke color per polygon). Use `visible=` lat,lng pairs or compute **center + zoom** from bounding box of all rings + spot point; when no polygons, `center=spot&zoom=11`.

**Security:** Prefer env `GOOGLE_MAPS_API_KEY` or dedicated server key for Static Maps if splitting keys; if a single `NEXT_PUBLIC_*` key is used, document referrer restrictions. URL construction runs **server-side** to avoid exposing optional signing secret in client bundles if signed URLs are added later.

**Alternatives:** `<Image src={url}>` with `unoptimized` if Next image optimization breaks query strings—validate during implementation.

### 6. Validation layer

**Decision:** Zod schema in `src/lib/validations/spots.ts` (or sibling) validating `schemaVersion`, feature array, each ring ≥4 coordinate pairs (closed), ≥3 distinct vertices, color enum, tag length. Return field errors consumable by admin form toast or inline message.

### 7. Collapsible panel UX

**Decision:** `details`/`Collapsible` from existing UI primitives if available; default **open**. Optional `sessionStorage` key `kite-zones-panel-open` to remember preference—product said expanded first open; persistence is a nice-to-have, not in spec.

## Risks / Trade-offs

- **[Risk]** Vertex markers clutter dense polygons → **Mitigation:** small circles, selected polygon only shows larger handles if needed.
- **[Risk]** Google Maps licensing/cost for Static + JS → **Mitigation:** monitor quotas; cache-Control headers on static image responses if using route handler.
- **[Risk]** Cancel semantics on modal—must not lose last “Lagre” snapshot → **Mitigation:** clone state on open; working copy vs committed copy pattern.
- **[Trade-off]** Static map does not show a legend for tags → **Mitigation:** optional follow-up: legend list under the image keyed by color + tag text.

## Migration Plan

1. Add nullable `kite_zones` (jsonb) to `public.spots` via Supabase migration.
2. Deploy app code reading/writing column; old rows remain null.
3. Regenerate TypeScript DB types (`pnpm db:types` when available).
4. Enable Maps Static API on the Google Cloud project; verify key restrictions.

**Rollback:** migrate column drop only if no production data depends on it; safer rollback is feature-flag hiding UI while column remains.

## Open Questions

- **Map type** on Static API: satellite vs hybrid for shoreline readability (default to match admin satellite unless UX asks for labels).
- Whether to show a **text legend** under the static map listing tags (improves accessibility; not strictly required by current spec).
