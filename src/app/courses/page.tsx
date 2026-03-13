import { Suspense } from "react"
import { getCoursesForPublicPage } from "@/lib/queries/courses"
import { getCurrentUser } from "@/lib/auth"
import { getUserSubscription } from "@/lib/queries/subscriptions"
import { createClient } from "@/lib/supabase/server"
import { CoursesPageClient } from "@/components/courses/courses-page-client"

export const metadata = {
  title: "Kurs — Ålesund Kiteklubb",
  description: "Meld deg på kitekurs med erfarne instruktører på Sunnmøre",
}

export default async function CoursesPage() {
  const [courses, user] = await Promise.all([
    getCoursesForPublicPage(),
    getCurrentUser(),
  ])

  let enrolledCourseIds: string[] = []
  let subscription: Awaited<ReturnType<typeof getUserSubscription>> = null

  if (user) {
    const supabase = await createClient()

    const [participantsResult, sub] = await Promise.all([
      supabase
        .from("course_participants")
        .select("course_id")
        .eq("user_id", user.id),
      getUserSubscription(user.id),
    ])

    enrolledCourseIds =
      participantsResult.data?.map((p) => p.course_id) ?? []
    subscription = sub
  }

  return (
    <Suspense>
      <CoursesPageClient
        courses={courses}
        user={user}
        enrolledCourseIds={enrolledCourseIds}
        subscription={subscription}
      />
    </Suspense>
  )
}
