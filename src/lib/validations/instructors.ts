import { z } from "zod"

export const updateInstructorProfileSchema = z.object({
  bio: z.string().max(2000).optional(),
  certifications: z.string().max(500).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(100).optional(),
  phone: z.string().max(30).optional(),
})
