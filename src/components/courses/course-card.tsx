"use client"

import Link from "next/link"
import { Calendar, MapPin, User, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"
import { formatCourseTime } from "@/lib/utils/date"
import { EnrollDialog } from "@/components/courses/enroll-dialog"
import { UnenrollDialog } from "@/components/courses/unenroll-dialog"
import type { CourseWithRelations } from "@/lib/queries/courses"
import type { CurrentUser } from "@/lib/auth"

interface CourseCardProps {
  course: CourseWithRelations
  user: CurrentUser | null
  isEnrolled: boolean
}

export function CourseCard({ course, user, isEnrolled }: CourseCardProps) {
  const instructorLabel = course.instructors?.certifications ?? (course.instructors ? "Instruktør" : null)
  const spotName = course.spots?.name ?? null
  const dateTime = formatCourseTime(course.start_time, course.end_time)
  const showChat =
    isEnrolled ||
    (user && (user.role === "instructor" || user.role === "admin"))

  return (
    <div className="rounded-lg border border-border bg-white p-5 card-lift">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">
          {course.title}
        </h3>

        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{dateTime}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            {spotName && course.spot_id ? (
              <Link
                href={`/spots/${course.spot_id}`}
                className="hover:text-primary hover:underline transition-colors"
              >
                {spotName}
              </Link>
            ) : (
              <span>Ikke bestemt</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{instructorLabel ?? "Ikke bestemt"}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={
              course.price
                ? "bg-primary-muted text-primary border-primary/30"
                : "bg-green-100 text-green-800 border-green-200"
            }
          >
            {course.price ? `kr ${course.price}` : "Gratis"}
          </Badge>

          {course.max_participants && (
            <Badge className="bg-neutral-100 text-neutral-700 border-neutral-200">
              Maks {course.max_participants} deltakere
            </Badge>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {!user ? (
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-primary hover:bg-primary/90 text-white btn-lift"
            )}
          >
            Logg inn for å melde på
          </Link>
        ) : isEnrolled ? (
          <>
            <UnenrollDialog
              courseId={course.id}
              courseTitle={course.title}
            />
          </>
        ) : (
          <EnrollDialog
            courseId={course.id}
            courseTitle={course.title}
            userEmail={user.email}
          />
        )}

        {showChat && (
          <Link
            href={`/courses/${course.id}/chat`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5"
            )}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Chat
          </Link>
        )}
      </div>
    </div>
  )
}
