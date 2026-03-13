import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getInstructors } from "@/lib/queries/instructors"
import { getCoursesForAdmin } from "@/lib/queries/courses"
import { getSpots } from "@/lib/queries/spots"
import { getAllSubscriptions } from "@/lib/queries/subscriptions"
import { getAllUsers } from "@/lib/queries/users"
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client"

export const metadata = {
  title: "Admin — Ålesund Kiteklubb",
  description: "Administrasjonspanel for Ålesund Kiteklubb",
}

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/")
  }

  const [instructors, courses, spots, subscriptions, users] =
    await Promise.all([
      getInstructors(),
      getCoursesForAdmin(),
      getSpots(),
      getAllSubscriptions(),
      getAllUsers(),
    ])

  return (
    <Suspense>
      <AdminDashboardClient
        instructors={instructors}
        courses={courses}
        spots={spots}
        subscriptions={subscriptions}
        users={users}
        currentUser={user}
      />
    </Suspense>
  )
}
