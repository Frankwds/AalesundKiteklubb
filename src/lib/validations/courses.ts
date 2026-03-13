import { z } from "zod"

export const publishCourseSchema = z
  .object({
    title: z.string().min(1, "Tittel er påkrevd").max(200),
    description: z.string().max(2000).optional(),
    price: z.coerce.number().int().min(0, "Pris kan ikke være negativ").optional(),
    startTime: z.coerce.date({ message: "Starttid er påkrevd" }),
    endTime: z.coerce.date({ message: "Sluttid er påkrevd" }),
    maxParticipants: z.coerce.number().int().min(1).optional(),
    spotId: z.string().uuid().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Sluttid må være etter starttid",
    path: ["endTime"],
  })
