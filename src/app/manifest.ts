import type { MetadataRoute } from "next"
import { getDefaultSiteDescription } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Ålesund Kiteklubb",
    short_name: "Ålesund KK",
    description: getDefaultSiteDescription(),
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#132a45",
    theme_color: "#132a45",
    lang: "nb",
    icons: [
      {
        src: "/logo-emblem-transparent-square.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-emblem-transparent-square.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-emblem-transparent-square.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
