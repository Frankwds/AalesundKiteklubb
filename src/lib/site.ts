import { showCoursePages } from "@/lib/feature-flags"

/** Default meta description (matches home when courses are on/off). */
export function getDefaultSiteDescription(): string {
  return showCoursePages
    ? "Kiteklubben for Sunnmøre — Kurs, Spot guide og fellesskap"
    : "Kiteklubben for Sunnmøre — Spot guide og fellesskap"
}

/** Public site URL for metadata, sitemap, and JSON-LD (no trailing slash). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (fromEnv) return fromEnv
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
  return "http://localhost:3000"
}

/** Club emblem — Open Graph, Twitter card, Organization schema logo */
export const SITE_LOGO_PATH = "/logo-emblem-transparent.png" as const
