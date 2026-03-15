/**
 * Weather icon mapping for Yr/MET Norway symbol codes.
 * Use with SVGs in public/weather-icons/{code}.svg
 * Copy SVGs from MET symbol server (https://symbol.yr.no/) or WindAlert public/weather-icons/
 */
export interface WeatherIconData {
  description: string;
  image: string;
}

export const WEATHER_ICONS_MAP: Record<string, WeatherIconData> = {
  clearsky_day: { description: 'Klart', image: '/weather-icons/clearsky_day.svg' },
  clearsky_night: { description: 'Klart', image: '/weather-icons/clearsky_night.svg' },
  clearsky_polartwilight: { description: 'Klart', image: '/weather-icons/clearsky_polartwilight.svg' },
  fair_day: { description: 'Lettskyet', image: '/weather-icons/fair_day.svg' },
  fair_night: { description: 'Lettskyet', image: '/weather-icons/fair_night.svg' },
  fair_polartwilight: { description: 'Lettskyet', image: '/weather-icons/fair_polartwilight.svg' },
  partlycloudy_day: { description: 'Delvis skyet', image: '/weather-icons/partlycloudy_day.svg' },
  partlycloudy_night: { description: 'Delvis skyet', image: '/weather-icons/partlycloudy_night.svg' },
  partlycloudy_polartwilight: { description: 'Delvis skyet', image: '/weather-icons/partlycloudy_polartwilight.svg' },
  cloudy: { description: 'Skyet', image: '/weather-icons/cloudy.svg' },
  rainshowers_day: { description: 'Regnbyger', image: '/weather-icons/rainshowers_day.svg' },
  rainshowers_night: { description: 'Regnbyger', image: '/weather-icons/rainshowers_night.svg' },
  rainshowers_polartwilight: { description: 'Regnbyger', image: '/weather-icons/rainshowers_polartwilight.svg' },
  rainshowersandthunder_day: {
    description: 'Regnbyger og torden',
    image: '/weather-icons/rainshowersandthunder_day.svg',
  },
  rainshowersandthunder_night: {
    description: 'Regnbyger og torden',
    image: '/weather-icons/rainshowersandthunder_night.svg',
  },
  rainshowersandthunder_polartwilight: {
    description: 'Regnbyger og torden',
    image: '/weather-icons/rainshowersandthunder_polartwilight.svg',
  },
  sleetshowers_day: { description: 'Sluddbyger', image: '/weather-icons/sleetshowers_day.svg' },
  sleetshowers_night: { description: 'Sluddbyger', image: '/weather-icons/sleetshowers_night.svg' },
  sleetshowers_polartwilight: { description: 'Sluddbyger', image: '/weather-icons/sleetshowers_polartwilight.svg' },
  snowshowers_day: { description: 'Snøbyger', image: '/weather-icons/snowshowers_day.svg' },
  snowshowers_night: { description: 'Snøbyger', image: '/weather-icons/snowshowers_night.svg' },
  snowshowers_polartwilight: { description: 'Snøbyger', image: '/weather-icons/snowshowers_polartwilight.svg' },
  rain: { description: 'Regn', image: '/weather-icons/rain.svg' },
  heavyrain: { description: 'Kraftig regn', image: '/weather-icons/heavyrain.svg' },
  heavyrainandthunder: { description: 'Kraftig regn og torden', image: '/weather-icons/heavyrainandthunder.svg' },
  sleet: { description: 'Sludd', image: '/weather-icons/sleet.svg' },
  snow: { description: 'Snø', image: '/weather-icons/snow.svg' },
  snowandthunder: { description: 'Snø og torden', image: '/weather-icons/snowandthunder.svg' },
  fog: { description: 'Tåke', image: '/weather-icons/fog.svg' },
  sleetshowersandthunder_day: {
    description: 'Sluddbyger og torden',
    image: '/weather-icons/sleetshowersandthunder_day.svg',
  },
  sleetshowersandthunder_night: {
    description: 'Sluddbyger og torden',
    image: '/weather-icons/sleetshowersandthunder_night.svg',
  },
  sleetshowersandthunder_polartwilight: {
    description: 'Sluddbyger og torden',
    image: '/weather-icons/sleetshowersandthunder_polartwilight.svg',
  },
  snowshowersandthunder_day: {
    description: 'Snøbyger og torden',
    image: '/weather-icons/snowshowersandthunder_day.svg',
  },
  snowshowersandthunder_night: {
    description: 'Snøbyger og torden',
    image: '/weather-icons/snowshowersandthunder_night.svg',
  },
  snowshowersandthunder_polartwilight: {
    description: 'Snøbyger og torden',
    image: '/weather-icons/snowshowersandthunder_polartwilight.svg',
  },
  rainandthunder: { description: 'Regn og torden', image: '/weather-icons/rainandthunder.svg' },
  sleetandthunder: { description: 'Sludd og torden', image: '/weather-icons/sleetandthunder.svg' },
  lightrainshowersandthunder_day: {
    description: 'Lette regnbyger og torden',
    image: '/weather-icons/lightrainshowersandthunder_day.svg',
  },
  lightrainshowersandthunder_night: {
    description: 'Lette regnbyger og torden',
    image: '/weather-icons/lightrainshowersandthunder_night.svg',
  },
  lightrainshowersandthunder_polartwilight: {
    description: 'Lette regnbyger og torden',
    image: '/weather-icons/lightrainshowersandthunder_polartwilight.svg',
  },
  heavyrainshowersandthunder_day: {
    description: 'Kraftige regnbyger og torden',
    image: '/weather-icons/heavyrainshowersandthunder_day.svg',
  },
  heavyrainshowersandthunder_night: {
    description: 'Kraftige regnbyger og torden',
    image: '/weather-icons/heavyrainshowersandthunder_night.svg',
  },
  heavyrainshowersandthunder_polartwilight: {
    description: 'Kraftige regnbyger og torden',
    image: '/weather-icons/heavyrainshowersandthunder_polartwilight.svg',
  },
  lightssleetshowersandthunder_day: {
    description: 'Lette sluddbyger og torden',
    image: '/weather-icons/lightssleetshowersandthunder_day.svg',
  },
  lightssleetshowersandthunder_night: {
    description: 'Lette sluddbyger og torden',
    image: '/weather-icons/lightssleetshowersandthunder_night.svg',
  },
  lightssleetshowersandthunder_polartwilight: {
    description: 'Lette sluddbyger og torden',
    image: '/weather-icons/lightssleetshowersandthunder_polartwilight.svg',
  },
  heavysleetshowersandthunder_day: {
    description: 'Kraftige sluddbyger og torden',
    image: '/weather-icons/heavysleetshowersandthunder_day.svg',
  },
  heavysleetshowersandthunder_night: {
    description: 'Kraftige sluddbyger og torden',
    image: '/weather-icons/heavysleetshowersandthunder_night.svg',
  },
  heavysleetshowersandthunder_polartwilight: {
    description: 'Kraftige sluddbyger og torden',
    image: '/weather-icons/heavysleetshowersandthunder_polartwilight.svg',
  },
  lightssnowshowersandthunder_day: {
    description: 'Lette snøbyger og torden',
    image: '/weather-icons/lightssnowshowersandthunder_day.svg',
  },
  lightssnowshowersandthunder_night: {
    description: 'Lette snøbyger og torden',
    image: '/weather-icons/lightssnowshowersandthunder_night.svg',
  },
  lightssnowshowersandthunder_polartwilight: {
    description: 'Lette snøbyger og torden',
    image: '/weather-icons/lightssnowshowersandthunder_polartwilight.svg',
  },
  heavysnowshowersandthunder_day: {
    description: 'Kraftige snøbyger og torden',
    image: '/weather-icons/heavysnowshowersandthunder_day.svg',
  },
  heavysnowshowersandthunder_night: {
    description: 'Kraftige snøbyger og torden',
    image: '/weather-icons/heavysnowshowersandthunder_night.svg',
  },
  heavysnowshowersandthunder_polartwilight: {
    description: 'Kraftige snøbyger og torden',
    image: '/weather-icons/heavysnowshowersandthunder_polartwilight.svg',
  },
  lightrainandthunder: { description: 'Lett regn og torden', image: '/weather-icons/lightrainandthunder.svg' },
  lightsleetandthunder: { description: 'Lett sludd og torden', image: '/weather-icons/lightsleetandthunder.svg' },
  heavysleetandthunder: { description: 'Kraftig sludd og torden', image: '/weather-icons/heavysleetandthunder.svg' },
  lightsnowandthunder: { description: 'Lett snø og torden', image: '/weather-icons/lightsnowandthunder.svg' },
  heavysnowandthunder: { description: 'Kraftig snø og torden', image: '/weather-icons/heavysnowandthunder.svg' },
  lightrainshowers_day: { description: 'Lette regnbyger', image: '/weather-icons/lightrainshowers_day.svg' },
  lightrainshowers_night: { description: 'Lette regnbyger', image: '/weather-icons/lightrainshowers_night.svg' },
  lightrainshowers_polartwilight: {
    description: 'Lette regnbyger',
    image: '/weather-icons/lightrainshowers_polartwilight.svg',
  },
  heavyrainshowers_day: { description: 'Kraftige regnbyger', image: '/weather-icons/heavyrainshowers_day.svg' },
  heavyrainshowers_night: { description: 'Kraftige regnbyger', image: '/weather-icons/heavyrainshowers_night.svg' },
  heavyrainshowers_polartwilight: {
    description: 'Kraftige regnbyger',
    image: '/weather-icons/heavyrainshowers_polartwilight.svg',
  },
  lightsleetshowers_day: { description: 'Lette sluddbyger', image: '/weather-icons/lightsleetshowers_day.svg' },
  lightsleetshowers_night: { description: 'Lette sluddbyger', image: '/weather-icons/lightsleetshowers_night.svg' },
  lightsleetshowers_polartwilight: {
    description: 'Lette sluddbyger',
    image: '/weather-icons/lightsleetshowers_polartwilight.svg',
  },
  heavysleetshowers_day: { description: 'Kraftige sluddbyger', image: '/weather-icons/heavysleetshowers_day.svg' },
  heavysleetshowers_night: { description: 'Kraftige sluddbyger', image: '/weather-icons/heavysleetshowers_night.svg' },
  heavysleetshowers_polartwilight: {
    description: 'Kraftige sluddbyger',
    image: '/weather-icons/heavysleetshowers_polartwilight.svg',
  },
  lightsnowshowers_day: { description: 'Lette snøbyger', image: '/weather-icons/lightsnowshowers_day.svg' },
  lightsnowshowers_night: { description: 'Lette snøbyger', image: '/weather-icons/lightsnowshowers_night.svg' },
  lightsnowshowers_polartwilight: {
    description: 'Lette snøbyger',
    image: '/weather-icons/lightsnowshowers_polartwilight.svg',
  },
  heavysnowshowers_day: { description: 'Kraftige snøbyger', image: '/weather-icons/heavysnowshowers_day.svg' },
  heavysnowshowers_night: { description: 'Kraftige snøbyger', image: '/weather-icons/heavysnowshowers_night.svg' },
  heavysnowshowers_polartwilight: {
    description: 'Kraftige snøbyger',
    image: '/weather-icons/heavysnowshowers_polartwilight.svg',
  },
  lightrain: { description: 'Lett regn', image: '/weather-icons/lightrain.svg' },
  lightsleet: { description: 'Lett sludd', image: '/weather-icons/lightsleet.svg' },
  heavysleet: { description: 'Kraftig sludd', image: '/weather-icons/heavysleet.svg' },
  lightsnow: { description: 'Lett snø', image: '/weather-icons/lightsnow.svg' },
  heavysnow: { description: 'Kraftig snø', image: '/weather-icons/heavysnow.svg' },
};

export function getWeatherIcon(weatherCode: string): WeatherIconData | null {
  const icon = WEATHER_ICONS_MAP[weatherCode];
  return icon ?? null;
}
