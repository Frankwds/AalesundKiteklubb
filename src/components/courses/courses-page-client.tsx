"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { GraduationCap, ArrowDown } from "lucide-react"
import { CourseCard } from "./course-card"
import { SubscribeSection } from "./subscribe-section"
import type { CourseWithRelations } from "@/lib/queries/courses"
import type { CurrentUser } from "@/lib/auth"
import type { Database } from "@/types/database"

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]

interface CoursesPageClientProps {
  courses: CourseWithRelations[]
  user: CurrentUser | null
  enrolledCourseIds: string[]
  subscription: Subscription | null
}

export function CoursesPageClient({
  courses,
  user,
  enrolledCourseIds,
  subscription,
}: CoursesPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (searchParams.get("error") === "not_enrolled") {
      toast.error("Du må være meldt på kurset for å se chatten.")
      router.replace(pathname)
    }
  }, [searchParams, router, pathname])

  return (
    <div className="px-6 py-8">
      {/* Intro */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Kurs
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Vi arrangerer kurs for alle nivåer med sertifiserte instruktører.
          Meld deg på et kommende kurs, eller abonner på varsler for å bli
          informert når nye kurs publiseres.
        </p>
      </div>

      {/* Course cards or empty state */}
      {courses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 mb-12">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              user={user}
              isEnrolled={enrolledCourseIds.includes(course.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-16 text-center mb-12">
          <p className="text-muted-foreground">
            Kurs legges ut når forholdene ser lovende ut, ikke langt i forkant.
          </p>
          <button
            onClick={() =>
              document
                .getElementById("subscribe-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/90 transition-colors"
          >
            Meld deg på varsler for å bli informert når nye kurs publiseres
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Subscribe section */}
      <SubscribeSection user={user} subscription={subscription} />
    </div>
  )
}
