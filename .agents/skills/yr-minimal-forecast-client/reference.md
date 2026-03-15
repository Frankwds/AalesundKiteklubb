# Yr Minimal Forecast — Reference

## API Response Schema

Locationforecast 2.0 `complete` returns JSON with:

```
{
  "type": "Feature",
  "geometry": { "coordinates": [lon, lat, elevation] },
  "properties": {
    "meta": { "updated_at": "..." },
    "timeseries": [
      {
        "time": "2025-03-15T12:00:00Z",
        "data": {
          "instant": {
            "details": {
              "air_temperature": 8.2,
              "wind_speed": 5.1,
              "wind_from_direction": 180,
              "wind_speed_of_gust": 8.3,
              "air_pressure_at_sea_level": 1012.3,
              ...
            }
          },
          "next_1_hours": {
            "summary": { "symbol_code": "clearsky_day" },
            "details": { "precipitation_amount": 0, ... }
          },
          "next_6_hours": { ... }
        }
      },
      ...
    ]
  }
}
```

- `next_1_hours` exists for ~48h of hourly data, then only `next_6_hours`.
- `symbol_code` values: `clearsky_day`, `fair_night`, `partlycloudy_day`, `cloudy`, `rain`, `lightrain`, etc.
- Temperatures in Celsius, wind in m/s.

## Fallback: Next.js API Proxy

If direct client fetch fails (CORS, throttling), add `app/api/yr/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  if (!lat || !lon) return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 });

  try {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat}&lon=${lon}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'YourApp (https://yoursite.com/)' },
    });
    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch' }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

Then call `/api/yr?lat=${lat}&lon=${lon}` from the client.

## is_day Derivation

From `symbol_code`:
- `*_day` or `*_polartwilight` → `is_day: 1`
- `*_night` or no suffix → `is_day: 0`

## Minimal validateMinimalForecast (Paragliding)

For the promising-hours visual, validate:

- `temperature` within acceptable range
- `wind_speed` and `wind_gusts` below thresholds
- `wind_direction` matching allowed directions (N, NE, E, SE, S, SW, W, NW)
- Precipitation below threshold

Direction mapping (degrees → symbol):
- N: 337.5–22.5
- NE: 22.5–67.5
- E: 67.5–112.5
- SE: 112.5–157.5
- S: 157.5–202.5
- SW: 202.5–247.5
- W: 247.5–292.5
- NW: 292.5–337.5

Compare `wind_direction` to these ranges and check against `locationWindDirections` (e.g. `['n','e','s']`).
