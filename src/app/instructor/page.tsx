import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getInstructorByUserId } from "@/lib/queries/instructors"
import { getCoursesForInstructor } from "@/lib/queries/courses"
import { getSpots } from "@/lib/queries/spots"
import { InstructorDashboardClient } from "@/components/instructor/instructor-dashboard-client"

export const metadata = {
  title: "Instruktør",
  description: "Administrer din profil og kurs som instruktør",
  robots: { index: false, follow: false },
}

export default async function InstructorPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "instructor" && user.role !== "admin") {
    redirect("/")
  }

  const [instructor, courses, spots] = await Promise.all([
    getInstructorByUserId(user.id),
    getCoursesForInstructor(),
    getSpots(),
  ])

  if (!instructor) {
    redirect("/")
  }

  return (
    <InstructorDashboardClient
      instructor={instructor}
      courses={courses}
      spots={spots}
    />
  )
}
