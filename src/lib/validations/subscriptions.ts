import { z } from "zod"

export const subscribeSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email("Ugyldig e-postadresse"),
})
