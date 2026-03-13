Task: Implement Phase 9 — Spots Pages & Components

Read these files first:

plan/checklist.md — progress tracker. Phases 1–8 and Phase 6 Server Actions are complete. The Front Page (`src/app/page.tsx`) is already built — check it off under Phase 9 → Front Page. Then build the Spots section items and check them off as you complete them.
plan/instructions.md — general workflow instructions.
plan/kite-club-full-plan.md — Section 5b (lines ~1036–1045) for the spots listing page spec, Section 5b-ii (lines ~1047–1059) for the spot detail page spec, Section 8 (lines ~1391–1403) for the UI component list (SpotCard, SpotList, SpotFilters, WindCompass), Section 9 (lines ~1434–1494) for the design system (mobile-first, off-white card, blue accents, Inter font).

Files you must read before writing any code:

src/app/layout.tsx — root layout with panorama background, off-white content card, Navbar, Footer, Sonner toast provider. Content is rendered inside a `max-w-6xl` container with `bg-[#FAFAF8]` card.
src/app/page.tsx — existing front page (hero, about, quick links). Use as a reference for the visual style and how pages render inside the content card.
src/components/ui/skeletons.tsx — exports `SkeletonCard`, `SkeletonTable`, `SkeletonDetail`, `SkeletonSpinner`. Use these in `loading.tsx` files.
src/components/ui/card.tsx — shadcn Card component.
src/components/ui/badge.tsx — shadcn Badge component.
src/components/ui/button.tsx — shadcn Button component.
src/components/ui/separator.tsx — shadcn Separator component.
src/lib/queries/spots.ts — `getSpots()` returns all spots (filtering is done client-side); `getSpot(id)` returns a single spot or null.
src/lib/utils/date.ts — date formatting helpers (not heavily used for spots, but available).
src/lib/utils.ts — `cn()` utility for merging Tailwind classes.
src/types/database.ts — the `spots` table type: `id`, `name`, `description`, `area`, `season` (enum: 'summer'|'winter'|null), `skill_level` (enum: 'beginner'|'experienced'|null), `skill_notes`, `latitude`, `longitude`, `wind_directions` (string[]|null), `water_type` (string[]|null), `map_image_url`, `created_at`.

What to build (8 files):

1. src/app/spots/loading.tsx
   - Import and render a grid of `SkeletonCard` components (e.g. 6 cards in a responsive grid).

2. src/app/spots/page.tsx
   - Server component that calls `getSpots()` and passes the data to a client component (`SpotList`).
   - The page itself is simple — heading, description text, then `<SpotList spots={spots} />`.

3. src/app/spots/[id]/loading.tsx
   - Import and render `SkeletonDetail`.

4. src/app/spots/[id]/page.tsx
   - Server component that calls `getSpot(params.id)`. If null, call `notFound()` from 'next/navigation'.
   - Renders all spot sections (see detail spec below).
   - Sections: WindCompass, Om spotten (description), Kart (map image), Værmelding (Yr link), Veibeskrivelse (Google Maps link), Nødvendige kiteskills (skill level + notes), Type (water type badges).

5. src/components/spots/spot-card.tsx — `SpotCard`
   - Card showing: spot name, area, season badge, skill level badge, wind direction indicators.
   - Wrapped in a Link to `/spots/[id]`.
   - Use shadcn Card or a styled div with border, hover effect.

6. src/components/spots/spot-list.tsx — `SpotList` (client component, `"use client"`)
   - Receives `spots` array as prop.
   - Contains `SpotFilters` inline (or as a child component).
   - Reads URL search params on mount to initialize filter state.
   - Filters spots client-side based on selected filters (season, area, wind directions).
   - Renders a responsive grid of `SpotCard` components.
   - Empty state: "Ingen spotter matcher filtrene" with a "Nullstill filtre" button.

7. src/components/spots/spot-filters.tsx — `SpotFilters` (client component)
   - Filter controls in a collapsible drawer/section at the top.
   - Three filter groups:
     - Season: toggle buttons for "Sommer" / "Vinter" (maps to 'summer' / 'winter').
     - Area: buttons derived from the unique `area` values in the spots data.
     - Wind direction: multi-select buttons for N, NE, E, SE, S, SW, W, NW. When multiple are selected, show spots whose `wind_directions` array contains ANY of the selected directions (OR semantics).
   - Filters sync to URL params (e.g. `?season=summer&area=Giske&wind=N,SW`). Use `useRouter` + `useSearchParams` + `usePathname` to update the URL without a full page reload (`router.replace`).
   - The drawer can be collapsed/expanded (use a toggle button like "Filtre ▼" / "Filtre ▲").

8. src/components/spots/wind-compass.tsx — `WindCompass`
   - Visual compass rose component.
   - Props: `directions: string[]` (e.g. `['N', 'SW', 'W']`).
   - Renders a circular compass with 8 direction labels (N, NE, E, SE, S, SW, W, NW).
   - Favorable directions are highlighted (e.g. sky-600 blue fill/color), others are muted/gray.
   - Should be visually clear at both small (card) and large (detail page) sizes. Accept an optional `size` prop (`'sm' | 'lg'`, default `'sm'`).

Spot detail page sections (src/app/spots/[id]/page.tsx):

- **Back link** — "← Tilbake til spotter" link to `/spots`.
- **Title** — spot name as `<h1>`.
- **Badges row** — season badge (if set), skill level badge (if set), area badge.
- **WindCompass** — render with `size="lg"` and the spot's `wind_directions`. If `wind_directions` is null/empty, hide the compass or show "Ingen vindretninger spesifisert".
- **Om spotten** — `description` text. If null, omit section.
- **Kart** — `map_image_url` rendered as an `<Image>` (next/image). If null, omit section.
- **Værmelding** — Link to Yr.no: `https://www.yr.no/nb/v%C3%A6rvarsel/daglig-tabell/{latitude},{longitude}`. Opens in new tab. If latitude or longitude is null, hide this section.
- **Veibeskrivelse** — "Vis i Google Maps" button: `https://www.google.com/maps?q={latitude},{longitude}`. Opens in new tab. If latitude or longitude is null, hide this section.
- **Nødvendige kiteskills** — Render `skill_level` as a badge: 'beginner' → "Nybegynner", 'experienced' → "Erfaren". Show `skill_notes` text below. If both are null, omit section.
- **Type** — `water_type` array rendered as badges with mapping: 'flat' → "Flatt vann", 'chop' → "Chop", 'waves' → "Bølger". If null/empty, omit section.

Design guidelines:

- Mobile-first: single-column card stack on mobile, grid on larger screens.
- Use the existing design system: off-white content card (`bg-[#FAFAF8]`), sky-600/sky-800 blue accents, Inter font.
- Cards: white background, border, subtle hover shadow. Rounded corners.
- Badges: use shadcn Badge component. Season badges: "Sommer" (sky-100/sky-800), "Vinter" (blue-100/blue-800). Skill badges: "Nybegynner" (green-100/green-800), "Erfaren" (amber-100/amber-800). Water type badges: neutral style.
- Page padding: `px-6 py-8` or similar, matching the front page style.
- External links (Yr, Google Maps) open in new tabs with `target="_blank" rel="noopener noreferrer"`.
- Use lucide-react icons where appropriate (e.g. MapPin, Wind, ExternalLink, ArrowLeft, ChevronDown).

Important conventions:

- `getSpots()` returns `Database['public']['Tables']['spots']['Row'][]`. Use this type or infer from the query return.
- `wind_directions` and `water_type` are `string[] | null` in the DB type.
- `season` and `skill_level` are enum types or null.
- All filtering is client-side (the query fetches all spots). This is appropriate at the expected scale (~10–30 spots).
- URL param sync uses `useSearchParams` (read-only) + `router.replace(pathname + '?' + params.toString())` for updates.
- The `[id]` route uses `params` — in Next.js 15 App Router, `params` is a Promise that must be awaited: `const { id } = await params`.

Run `pnpm build` when done to verify no TypeScript errors.
After completing each item, check it off in plan/checklist.md (Phase 9, Front Page + Spots sections).
