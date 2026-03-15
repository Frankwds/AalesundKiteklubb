---
name: yr-minimal-forecast-client
description: Integrate MET Norway Yr Locationforecast API client-side with direct API calls and render a minimal hourly weather forecast UI. Use when building spot/location weather views, client-side Yr integration, minimal forecast components, or when the user mentions Yr, yr.no, MET Norway, minimal weather forecast, or hourly forecast UI.
---

# Yr Minimal Forecast (Client-Side)

Client-side integration with MET Norway's Locationforecast API and a minimal hourly weather forecast component. No server proxy required for simple requests; direct fetch from the browser.

## Quick Start

1. **Fetch Yr data** from `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat={lat}&lon={lon}` using coordinates (4 decimal places).
2. **Map** the API response to `MinimalForecast[]`.
3. **Render** the minimal forecast component with weather icons, temperature, wind, and wind direction.

## Direct Client Fetch

Use a **simple GET** with no custom headers to avoid CORS preflight (MET supports simple requests):

```typescript
const YR_API = 'https://api.met.no/weatherapi/locationforecast/2.0/complete';

async function fetchYrDataClient(latitude: number, longitude: number): Promise<unknown> {
  const url = `${YR_API}?lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather data');
  return res.json();
}
```

**Note:** Custom headers (e.g. `User-Agent`) trigger CORS preflight and may fail in Firefox. MET identifies clients via `Referer`/`Origin` for simple requests. If throttled or blocked, use a minimal Next.js API proxy; see [reference.md](reference.md).

## MinimalForecast Type

```typescript
interface MinimalForecast {
  time: string;           // ISO 8601 e.g. "2025-03-15T12:00:00Z"
  is_day: 0 | 1;          // 1 = daytime symbol
  weather_code: string;   // Yr symbol_code e.g. "clearsky_day"
  temperature: number;    // Celsius
  wind_speed: number;     // m/s
  wind_gusts?: number;    // m/s (optional)
  wind_direction: number; // degrees 0-360
  landing_wind?: number;  // optional, for paragliding
  landing_gust?: number;
  landing_wind_direction?: number;
}
```

## Mapping Yr Response → MinimalForecast

The API returns `properties.timeseries[]` with hourly entries. Each entry has `data.next_1_hours` (hourly) or `data.next_6_hours` (6-hour blocks). For minimal forecast, use **hourly** only:

```typescript
function mapYrToMinimalForecast(rawData: any): MinimalForecast[] {
  const timeseries = rawData?.properties?.timeseries ?? [];
  const result: MinimalForecast[] = [];

  for (const item of timeseries) {
    if (!item?.data?.next_1_hours) break; // hourly data ends

    const instant = item.data.instant.details;
    const next1h = item.data.next_1_hours;
    const symbolCode = next1h.summary?.symbol_code ?? 'cloudy';

    result.push({
      time: item.time,
      is_day: symbolCode.includes('_day') || symbolCode.includes('_polartwilight') ? 1 : 0,
      weather_code: symbolCode,
      temperature: instant.air_temperature ?? 0,
      wind_speed: instant.wind_speed ?? 0,
      wind_gusts: instant.wind_speed_of_gust,
      wind_direction: instant.wind_from_direction ?? 0,
    });
  }
  return result;
}
```

## Minimal Forecast UI Component

Structure: day tabs → hourly columns → rows (icon, temp, wind, direction).

**Day grouping:** Group by weekday (e.g. `toLocaleDateString([], { weekday: 'short', timeZone })`).

**Table rows:**
1. Weather icon (use `getWeatherIcon(weather_code)` from icons mapping)
2. Temperature: `Math.round(temp)°`
3. Wind: `wind_speed` or `wind_speed (wind_gusts)` if gusts present
4. Wind direction: arrow SVG rotated by `wind_direction` degrees

**Wind direction arrow** (inline SVG, 24×24):

```tsx
<svg
  width={24}
  height={24}
  viewBox="0 0 24 24"
  style={{ transform: `rotate(${direction}deg)` }}
  aria-label={`Wind ${direction}°`}
>
  <path d="M12 22L8 12L12 14L16 12L12 22Z" fill="currentColor" />
  <line x1="12" y1="14" x2="12" y2="2" stroke="currentColor" strokeWidth="2" />
</svg>
```

**Filter future hours** on the client to avoid hydration mismatches:

```typescript
const cutoff = Date.now() - 60 * 60 * 1000;
const filtered = forecast.filter(f => new Date(f.time).getTime() >= cutoff);
```

## Weather Icons

Place SVGs in `public/weather-icons/{code}.svg`. Use the icon mapping in [icons/weather-icons-map.ts](icons/weather-icons-map.ts). Example:

```typescript
// Fallback: try _polartwilight -> _day, then cloudy
const code = hour.weather_code;
const icon = WEATHER_ICONS_MAP[code] ?? WEATHER_ICONS_MAP[code?.replace('_polartwilight','_day')] ?? WEATHER_ICONS_MAP['cloudy'];
<img src={icon?.image ?? '/weather-icons/cloudy.svg'} alt={icon?.description ?? ''} width={32} height={32} />
```

MET Norway symbol codes (e.g. `clearsky_day`, `fair_night`, `rain`) match the icon filenames. Copy SVGs from [MET symbol server](https://symbol.yr.no/) or the WindAlert project's `public/weather-icons/`.

## Usage in a Spot/Location View

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function SpotWeather({ lat, lon, timezone = 'Europe/Oslo' }: { lat: number; lon: number; timezone?: string }) {
  const [forecast, setForecast] = useState<MinimalForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchYrDataClient(lat, lon)
      .then(data => setForecast(mapYrToMinimalForecast(data)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [lat, lon]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <MinimalHourlyWeather forecast={forecast} timezone={timezone} locationWindDirections={[]} />;
}
```

## Optional: Promising Hours Visual

For paragliding/wind-sport spots, show a bar per daytime hour: green = suitable, red = not. Pass `locationWindDirections` (e.g. `['n','e','s']`) and use `validateMinimalForecast(hour, locationWindDirections)`. See [reference.md](reference.md) for validation logic.

## Additional Resources

- API schema and fallback proxy: [reference.md](reference.md)
- Full weather icon mapping: [icons/weather-icons-map.ts](icons/weather-icons-map.ts)
- MET docs: https://api.met.no/doc/GettingStarted
