import { z } from "zod"

const VALID_SEASONS = ["summer", "winter"] as const
const VALID_SKILL_LEVELS = ["beginner", "experienced"] as const

const VALID_WIND_DIRECTIONS = [
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
] as const

const VALID_WATER_TYPES = ["flat", "chop", "waves"] as const

export const createSpotSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd").max(200),
  description: z.string().max(2000).optional(),
  area: z.string().min(1, "Område er påkrevd").max(200),
  season: z.enum(VALID_SEASONS).optional(),
  skillLevel: z.enum(VALID_SKILL_LEVELS).optional(),
  skillNotes: z.string().max(500).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  windDirections: z.array(z.enum(VALID_WIND_DIRECTIONS)).optional(),
  waterType: z.array(z.enum(VALID_WATER_TYPES)).optional(),
})

export const updateSpotSchema = createSpotSchema.partial().extend({
  id: z.string().uuid(),
})
