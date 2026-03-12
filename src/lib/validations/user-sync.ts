import { z } from "zod"

/**
 * Whitelist of fields allowed in the auth callback upsert.
 * `role` is intentionally excluded — it is admin-managed.
 */
export const UserSyncSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
})
