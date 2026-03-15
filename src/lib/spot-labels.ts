/**
 * Shared label configs for spots — season, skill level, water type.
 * Uses design system badge variants for consistency.
 */

export const seasonLabels: Record<
  string,
  { text: string; variant: "primarySoft" | "info" }
> = {
  summer: { text: "Sommer", variant: "primarySoft" },
  winter: { text: "Vinter", variant: "info" },
}

export const skillLabels: Record<
  string,
  { text: string; variant: "success" | "warning" }
> = {
  beginner: { text: "Nybegynner", variant: "success" },
  experienced: { text: "Erfaren", variant: "warning" },
}

export const waterTypeLabels: Record<string, string> = {
  flat: "Flatt vann",
  chop: "Chop",
  waves: "Bølger",
}
