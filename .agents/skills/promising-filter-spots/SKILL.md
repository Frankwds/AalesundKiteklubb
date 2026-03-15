---
name: promising-filter-spots
description: Build a promising-hours filter UI for wind sports spots (kite, paragliding, windsurf). Filters spots by consecutive promising weather hours within a time window. Use when adding spot filtering by forecast quality, promising hours UI, or when integrating Yr forecast with spot lists/maps for wind sports.
---

# Promising Filter for Wind Sports Spots

Filter spots by whether they have a minimum number of **consecutive promising hours** within a chosen day and time range. Reusable across kite spots, paragliding spots, windsurf spots, or any domain using Yr forecast data and wind-direction constraints.

## Filter Variables (Same Across Domains)

| Variable | Type | Description |
|----------|------|-------------|
| `selectedDay` | 0 \| 1 \| 2 | Today, Tomorrow, Day after tomorrow |
| `selectedTimeRange` | [number, number] | Hour window [start, end] (0–24) |
| `minPromisingHours` | 1–6 | Minimum consecutive promising hours required |
| `selectedWeatherConditions` | string[] | Allowed weather codes; empty = any |

## UI Layout (Collapsible Panel)

**Trigger button** (top-right, floating):
- Icon: weather icon (e.g. `clearsky_day`)
- Active badge when filter applied (e.g. checkbox overlay)
- Toggle to expand/collapse panel

**Expanded panel** (card below button):
1. **Day tabs** – Segmented control: Today | Tomorrow | [Weekday]
2. **Time range** – Range slider with marks (00, 06, 12, 18, 24); on "today" restrict start to current hour
3. **Min hours** – "Minst X timer i strekk" with −/+ and slider (1–6)
4. **Weather conditions** – Toggle buttons with weather icons; empty = no filter
5. **Actions** – Reset | Apply

## UI Behavior

- **Default time range (today):** `[currentHour + 1, min(24, currentHour + 7)]`
- **Default time range (other days):** `[12, 18]`
- **Apply** closes panel and activates filter
- **Reset** clears filter, resets values, closes panel
- Use CSS variables for theming (`--background`, `--border`, `--shadow-md`)

## Filter Algorithm

For each spot:

1. **Forecast source:** Use hourly forecast from Yr (direct Locationforecast API or mapped `MinimalForecast[]`).
2. **Target window:** From `selectedDay` and `selectedTimeRange`, compute `[startTime, endTime)`.
3. **Relevant hours:** Filter forecast entries with `time >= startTime && time < endTime`, sorted by time.
4. **Per-hour check:** For each hour, run domain-specific `isPromising(forecast, spotWindDirections)`.
5. **Weather filter:** If `selectedWeatherConditions.length > 0`, require `weather_code` in that list.
6. **Consecutive count:** Track max consecutive hours where both checks pass.
7. **Include spot:** `maxConsecutive >= minPromisingHours`.

## What Is "Promising"?

An hour is **promising** when all four checks pass:

| Check | Parameter | Description |
|-------|-----------|-------------|
| 1. Wind speed | `MIN_WIND_SPEED`, `MAX_WIND_SPEED` | `MIN ≤ wind_speed ≤ MAX` |
| 2. Gusts | `MAX_GUST` | `wind_gusts ≤ MAX_GUST` |
| 3. Wind direction | `spotWindDirections` | Forecast `wind_direction` (0–360°) falls within an allowed direction for the spot |
| 4. Weather | `is_day`, `weather_code` | Daytime only (`is_day === 1`); if daytime, `weather_code` in allowed list (or skip if filter not used) |

**Wind direction:** Map degrees to symbols (N, NE, E, SE, S, SW, W, NW) and require the symbol to be in the spot's allowed directions. See [reference.md](reference.md) for degree ranges.

**Domain-specific:** Only the threshold values differ. Paragliding uses low MIN (near 0) and strict MAX; kiting uses higher MIN (4–6 m/s) and higher MAX. Same validation structure.

## Spot Data Requirements

Each spot needs:

- Coordinates (for fetching forecast)
- **Allowed wind directions:** `string[]` in `['n','ne','e','se','s','sw','w','nw']`

## Forecast Data (MinimalForecast from Yr)

```
time, is_day, weather_code, wind_speed, wind_gusts?, wind_direction
```

Map from `properties.timeseries` as in [yr-minimal-forecast-client](.cursor/skills/yr-minimal-forecast-client/SKILL.md).

## Domain-Specific "Promising" Logic

Implement `isPromising(forecast, spotWindDirections): boolean` per sport:

- **Kiting:** MIN wind speed (e.g. 4–6 m/s), MAX wind/gusts, wind direction in allowed directions, acceptable weather, no night.
- **Paragliding:** Often near-zero MIN, strict MAX wind/gusts, wind direction, precipitation checks.

For implementation details and wind-direction mapping, see [reference.md](reference.md).

## Example: Kite Spots

**Spot data:**
```typescript
interface KiteSpot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  allowedDirections: string[];  // e.g. ['w', 'sw'] – onshore for this beach
}
```

**Rule (example thresholds):**
```typescript
const KITE_RULE = {
  MIN_WIND_SPEED: 5,
  MAX_WIND_SPEED: 14,
  MAX_GUST: 18,
};
```

**Validation:**
```typescript
function isKitePromising(forecast: MinimalForecast, spot: KiteSpot): boolean {
  if (forecast.is_day !== 1) return false;
  if (forecast.wind_speed < KITE_RULE.MIN_WIND_SPEED) return false;
  if (forecast.wind_speed > KITE_RULE.MAX_WIND_SPEED) return false;
  if (forecast.wind_gusts != null && forecast.wind_gusts > KITE_RULE.MAX_GUST) return false;
  if (!isWindDirectionGood(forecast.wind_direction, spot.allowedDirections)) return false;
  const good = ['clearsky_day', 'fair_day', 'partlycloudy_day', 'cloudy'];
  if (!good.includes(forecast.weather_code)) return false;
  return true;
}
```

**Usage (filter kite spots on map):**
```tsx
<PromisingFilter
  isExpanded={isPromisingFilterExpanded}
  setIsExpanded={setIsPromisingFilterExpanded}
  onFilterChange={setPromisingFilter}
  initialFilter={promisingFilter}
  closeOverlays={closeOverlays}
/>
// When filter active: filter spots using isKitePromising + consecutive hours check
```

## Quick Checklist

- [ ] Day tabs (0, 1, 2)
- [ ] Time range slider (restrict "today" to current hour+)
- [ ] Min consecutive hours (1–6) with −/+ and slider
- [ ] Weather condition toggles (optional)
- [ ] Apply / Reset
- [ ] Domain-specific `isPromising` for forecast validation
- [ ] Wind direction mapping (degrees → n/ne/e/se/s/sw/w/nw)
