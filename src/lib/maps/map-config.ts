/**
 * Vector map ID for Advanced Markers (WindLord-style pins).
 *
 * Use this exact string when you create a Map ID in Google Cloud Console:
 * Google Maps Platform → Map Management → Map IDs → Create Map ID.
 * Same GCP project as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 *
 * Optional: set NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID to override (e.g. staging).
 */
export const GOOGLE_MAPS_SPOTS_MAP_ID =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || "KiteKlubbMapId"
