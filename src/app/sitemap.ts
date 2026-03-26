import type { MetadataRoute } from "next"
import { getSpots } from "@/lib/queries/spots"
import { getSiteUrl } from "@/lib/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const spots = await getSpots()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/spots`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ]

  const spotRoutes: MetadataRoute.Sitemap = spots.map((spot) => ({
    url: `${base}/spots/${spot.id}`,
    lastModified: new Date(spot.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }))

  return [...staticRoutes, ...spotRoutes]
}
