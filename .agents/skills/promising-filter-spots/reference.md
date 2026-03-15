# Promising Filter — Reference

## Data Structures

### Filter State

```typescript
interface PromisingFilter {
  selectedDay: number;           // 0=today, 1=tomorrow, 2=day after
  selectedTimeRange: [number, number];  // [startHour, endHour], 0-24
  minPromisingHours: number;      // 1-6
  selectedWeatherConditions: WeatherCondition[];  // empty = any weather
}

type WeatherCondition = 'clearsky_day' | 'fair_day' | 'partlycloudy_day' | 'cloudy';
```

### Spot Requirements

Each spot needs:

- **Coordinates** (lat, lon) — to fetch Yr forecast
- **Allowed wind directions** — array of symbols: `['n','ne','e','se','s','sw','w','nw']`

Wind direction mapping (degrees → symbol):

| Symbol | Degrees |
|--------|---------|
| N  | 337.5–22.5 |
| NE | 22.5–67.5 |
| E  | 67.5–112.5 |
| SE | 112.5–157.5 |
| S  | 157.5–202.5 |
| SW | 202.5–247.5 |
| W  | 247.5–292.5 |
| NW | 292.5–337.5 |

### MinimalForecast (from Yr)

Required fields for validation:

```typescript
interface MinimalForecast {
  time: string;           // ISO 8601
  is_day: 0 | 1;
  weather_code: string;   // Yr symbol_code
  wind_speed: number;     // m/s
  wind_gusts?: number;    // m/s
  wind_direction: number; // 0-360
}
```

## Filtering Algorithm

```
For each spot:
  1. Fetch or retrieve forecast for spot coordinates (Yr API)
  2. Resolve target date: today + selectedDay
  3. Filter forecast entries where time ∈ [targetDate + selectedTimeRange[0], targetDate + selectedTimeRange[1])
  4. Sort by time
  5. For each hourly entry:
     - Check weather: if selectedWeatherConditions non-empty, weather_code must be in list
     - Check domain-specific validation (wind speed, gusts, direction, is_day, precipitation)
     - If both pass → count as promising
  6. Compute max consecutive promising hours
  7. Include spot if maxConsecutive >= minPromisingHours
```

## What Is "Promising"? — Four Parameters

An hour is promising when all four checks pass:

1. **Wind speed:** `rule.MIN_WIND_SPEED ≤ forecast.wind_speed ≤ rule.MAX_WIND_SPEED`
2. **Gusts:** `forecast.wind_gusts ≤ rule.MAX_GUST` (or skip if gusts undefined)
3. **Wind direction:** `forecast.wind_direction` falls within one of the spot's allowed directions (degrees → n/ne/e/se/s/sw/w/nw)
4. **Weather / time:** `forecast.is_day === 1` (daytime only); `forecast.weather_code` in good codes (clearsky_day, fair_day, partlycloudy_day, cloudy)

Optional extras: precipitation check, MUCH_WIND/MUCH_GUST combo (see WindAlert `validateDataPoint`).

## Domain-Specific Validation

### Paragliding (WindAlert)

- `is_day === 1` (daytime only)
- Wind speed: MIN_WIND_SPEED ≤ wind_speed ≤ MAX_WIND_SPEED
- Gusts: wind_gusts ≤ MAX_GUST
- Wind direction within allowed directions for spot
- weather_code in good codes (clearsky_day, fair_day, partlycloudy_day, cloudy) if daytime
- Precipitation below threshold

### Kiting

- Same four parameters, different rule:
  - **MIN_WIND_SPEED** typically 5–6 m/s (needs wind to fly)
  - **MAX_WIND_SPEED** and **MAX_GUST** higher than paragliding (e.g. 14 m/s, 18 m/s gusts)
- Same wind direction check
- Same weather and precipitation logic

**Example kite rule:**
```typescript
const KITE_RULE = {
  MIN_WIND_SPEED: 5,
  MAX_WIND_SPEED: 14,
  MAX_GUST: 18,
  MUCH_WIND: 10,
  MUCH_GUST: 14,
};
```

**Example kite spot:**
```typescript
{
  id: 'beach-west',
  name: 'Beach West',
  lat: 59.91,
  lon: 10.72,
  allowedDirections: ['n', 'nw', 'w', 'sw'],
}
```

Implement a `validateSpotHour(forecast, spotDirections, domainRule): boolean` that encapsulates these rules.

## Time Range Behavior

- **Today**: Slider min = current hour; default range often `currentHour+1` to `currentHour+7`
- **Tomorrow / day after**: Slider min = 0; default range e.g. `[12, 18]`
- Marks on slider: 00:00, 06:00, 12:00, 18:00, 24:00 (and current hour for today)

## Integration with Yr

For direct Yr integration (no cache):

1. Use `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat={lat}&lon={lon}`
2. Map `properties.timeseries[]` to `MinimalForecast[]` (see yr-minimal-forecast-client)
3. Run promising filter logic client-side per spot
4. Consider batching or lazy-loading forecasts if many spots

For many spots, fetch forecasts when needed (e.g. on map viewport change) and cache in memory to avoid repeated requests.
