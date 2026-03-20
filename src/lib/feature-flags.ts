/**
 * Soft flags: they only hide UI entry points; routes and direct links still work.
 *
 * Set NEXT_PUBLIC_SHOW_COURSE_PAGES=true to show Kurs in navbar and admin.
 */
export const showCoursePages =
  process.env.NEXT_PUBLIC_SHOW_COURSE_PAGES === "true"
