import type { Json } from "@/types/database"
import {
  kiteZonesDocumentSchema,
  type KiteZonesDocument,
} from "@/lib/kite-zones/schema"

export type ParseKiteZonesResult =
  | { ok: true; value: Json | null }
  | { ok: false; message: string }

/** FormData value: missing, empty, or whitespace → clear zones (null). */
export function parseKiteZonesFormValue(raw: FormDataEntryValue | null): ParseKiteZonesResult {
  if (raw == null) return { ok: true, value: null }
  if (typeof raw !== "string") {
    return { ok: false, message: "Ugyldig kite-soner data" }
  }
  const trimmed = raw.trim()
  if (trimmed === "") return { ok: true, value: null }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed) as unknown
  } catch {
    return { ok: false, message: "Kite-soner er ikke gyldig JSON" }
  }

  const result = kiteZonesDocumentSchema.safeParse(parsed)
  if (!result.success) {
    const first = result.error.issues[0]
    const msg = first?.message ?? "Ugyldige kite-soner"
    const path = first?.path?.length ? ` (${first.path.join(".")})` : ""
    return { ok: false, message: `${msg}${path}` }
  }

  const doc = result.data as KiteZonesDocument
  if (doc.features.length === 0) {
    return { ok: true, value: null }
  }

  return { ok: true, value: doc as unknown as Json }
}
