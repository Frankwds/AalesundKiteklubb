import Image from "next/image"
import {
  kiteZonesDocumentSchema,
  KITE_ZONE_MAP_FILL,
} from "@/lib/kite-zones/schema"
import type { Json } from "@/types/database"

type Props = {
  mapUrl: string
  spotName: string
  kiteZones: Json | null
}

export function SpotKiteZonesStaticMap({
  mapUrl,
  spotName,
  kiteZones,
}: Props) {
  const parsed = kiteZonesDocumentSchema.safeParse(kiteZones)
  const features = parsed.success ? parsed.data.features : []

  return (
    <div>
      <div className="relative w-full aspect-video max-w-3xl overflow-hidden rounded-lg border border-border bg-muted/30">
        <Image
          src={mapUrl}
          alt={`Kart over ${spotName}`}
          fill
          className="object-cover pointer-events-none select-none"
          sizes="(max-width: 768px) 100vw, 800px"
          unoptimized
          priority={false}
        />
      </div>
      {features.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2 max-w-3xl">
          {features.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 text-sm text-foreground/90"
            >
              <span
                className="h-4 w-4 shrink-0 rounded-sm border border-border"
                style={{
                  backgroundColor: KITE_ZONE_MAP_FILL[f.properties.color],
                }}
                aria-hidden
              />
              <span>{f.properties.tag}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
