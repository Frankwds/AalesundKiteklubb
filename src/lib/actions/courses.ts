'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { publishCourseSchema } from '@/lib/validations/courses'
import { getAllSubscriberEmails } from '@/lib/queries/subscriptions'
import { resend, fromEmail } from '@/lib/email/resend'
import { NewCourseEmail } from '@/lib/email/templates/new-course'
import { EnrollmentConfirmationEmail } from '@/lib/email/templates/enrollment-confirmation'
import { CourseCancellationEmail } from '@/lib/email/templates/course-cancellation'
import { formatCourseTime } from '@/lib/utils/date'
import { log, logError } from '@/lib/logger'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

export async function publishCourse(formData: FormData) {
  const parsed = publishCourseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    price: formData.get('price') || undefined,
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    maxParticipants: formData.get('maxParticipants') || undefined,
    spotId: formData.get('spotId') || undefined,
  })

  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false as const, error: 'Ikke autentisert' }
  }

  const { data: instructor, error: instructorError } = await supabase
    .from('instructors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (instructorError || !instructor) {
    logError('publishCourse', instructorError || new Error('Instructor not found'))
    return { success: false as const, error: 'Kunne ikke finne instruktørprofil' }
  }

  const { data: course, error: insertError } = await supabase
    .from('courses')
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      start_time: parsed.data.startTime.toISOString(),
      end_time: parsed.data.endTime.toISOString(),
      max_participants: parsed.data.maxParticipants,
      spot_id: parsed.data.spotId,
      instructor_id: instructor.id,
    })
    .select()
    .single()

  if (insertError || !course) {
    logError('publishCourse', insertError || new Error('Insert returned no data'))
    return { success: false as const, error: 'Kunne ikke opprette kurs' }
  }

  log('publishCourse', `course ${course.id} created`)

  let spotName: string | null = null
  let spotUrl: string | null = null
  if (course.spot_id) {
    const { data: spot } = await supabase
      .from('spots')
      .select('name')
      .eq('id', course.spot_id)
      .single()
    if (spot) {
      spotName = spot.name
      spotUrl = `${siteUrl}/spots/${course.spot_id}`
    }
  }

  const subscriberEmails = await getAllSubscriberEmails()
  let notificationsSent = 0
  let notificationsFailed = 0

  if (subscriberEmails.length > 0) {
    const instructorName = user.user_metadata.full_name ?? 'Ukjent instruktør'
    const courseDate = formatCourseTime(course.start_time, course.end_time)
    const enrollUrl = `${siteUrl}/courses`

    const emailPayload = (to: string) => ({
      from: fromEmail,
      to,
      subject: `Nytt kurs: ${course.title}`,
      react: NewCourseEmail({
        courseTitle: course.title,
        courseDate,
        instructorName,
        price: course.price,
        spotName,
        spotUrl,
        enrollUrl,
      }),
    })

    const results = await Promise.allSettled(
      subscriberEmails.map((email) => resend.emails.send(emailPayload(email)))
    )

    const failedIndices: number[] = []
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        failedIndices.push(i)
      } else if (r.value.error) {
        failedIndices.push(i)
      }
    })

    if (failedIndices.length > 0) {
      const retryResults = await Promise.allSettled(
        failedIndices.map((i) =>
          resend.emails.send(emailPayload(subscriberEmails[i]))
        )
      )
      notificationsFailed = retryResults.filter(
        (r) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)
      ).length
    }

    notificationsSent = subscriberEmails.length - notificationsFailed
  }

  revalidatePath('/courses')
  revalidatePath('/instructor')
  revalidatePath('/admin')

  return {
    success: true as const,
    course,
    notificationsSent,
    notificationsFailed,
  }
}

export async function enrollInCourse(courseId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false as const, error: 'Ikke autentisert' }
  }

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (courseError || !course) {
    logError('enrollInCourse', courseError || new Error('Course not found'))
    return { success: false as const, error: 'Kurset ble ikke funnet' }
  }

  if (course.max_participants) {
    const admin = createAdminClient()
    const { count, error: countError } = await admin
      .from('course_participants')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)

    if (countError) {
      logError('enrollInCourse', countError)
      return { success: false as const, error: 'Kunne ikke sjekke kapasitet' }
    }

    if (count !== null && count >= course.max_participants) {
      return { success: false as const, error: 'Kurset er fullt' }
    }
  }

  const { error: insertError } = await supabase
    .from('course_participants')
    .insert({ user_id: user.id, course_id: courseId })

  if (insertError) {
    if (insertError.code === '23505') {
      return { success: false as const, error: 'Du er allerede påmeldt' }
    }
    logError('enrollInCourse', insertError)
    return { success: false as const, error: 'Kunne ikke melde på' }
  }

  log('enrollInCourse', `user ${user.id} enrolled in course ${courseId}`)

  const { data: courseDetails } = await supabase
    .from('courses')
    .select('*, spots(name), instructors(users(name))')
    .eq('id', courseId)
    .single()

  if (courseDetails) {
    const courseDate = formatCourseTime(courseDetails.start_time, courseDetails.end_time)
    const instructorName =
      (courseDetails.instructors as { users: { name: string | null } | null } | null)?.users
        ?.name ?? 'Ukjent instruktør'
    const spotName = (courseDetails.spots as { name: string } | null)?.name ?? null
    const spotUrl = courseDetails.spot_id
      ? `${siteUrl}/spots/${courseDetails.spot_id}`
      : null

    await resend.emails.send({
      from: fromEmail,
      to: user.email!,
      subject: `Påmelding bekreftet: ${courseDetails.title}`,
      react: EnrollmentConfirmationEmail({
        courseTitle: courseDetails.title,
        courseDate,
        instructorName,
        price: courseDetails.price,
        spotName,
        spotUrl,
        chatUrl: `${siteUrl}/courses/${courseId}/chat`,
        coursesPageUrl: `${siteUrl}/courses`,
      }),
    })
  }

  revalidatePath('/courses')

  return { success: true as const }
}

export async function unenrollFromCourse(courseId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false as const, error: 'Ikke autentisert' }
  }

  const { error } = await supabase
    .from('course_participants')
    .delete()
    .match({ user_id: user.id, course_id: courseId })

  if (error) {
    logError('unenrollFromCourse', error)
    return { success: false as const, error: 'Kunne ikke melde av' }
  }

  log('unenrollFromCourse', `user ${user.id} unenrolled from course ${courseId}`)

  revalidatePath('/courses')

  return { success: true as const }
}

export async function updateCourse(courseId: string, formData: FormData) {
  const parsed = publishCourseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    price: formData.get('price') || undefined,
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    maxParticipants: formData.get('maxParticipants') || undefined,
    spotId: formData.get('spotId') || undefined,
  })

  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data: course, error } = await supabase
    .from('courses')
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      price: parsed.data.price ?? null,
      start_time: parsed.data.startTime.toISOString(),
      end_time: parsed.data.endTime.toISOString(),
      max_participants: parsed.data.maxParticipants ?? null,
      spot_id: parsed.data.spotId ?? null,
    })
    .eq('id', courseId)
    .select()
    .single()

  if (error) {
    logError('updateCourse', error)
    return { success: false as const, error: 'Kunne ikke oppdatere kurs' }
  }

  log('updateCourse', `course ${courseId} updated`)

  revalidatePath('/courses')
  revalidatePath('/instructor')
  revalidatePath('/admin')

  return { success: true as const, course }
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient()

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*, spots(name), instructors(users(name))')
    .eq('id', courseId)
    .single()

  if (courseError || !course) {
    logError('deleteCourse', courseError || new Error('Course not found'))
    return { success: false as const, error: 'Kurset ble ikke funnet' }
  }

  const { data: participants } = await supabase
    .from('course_participants')
    .select('users(email)')
    .eq('course_id', courseId)

  let cancellationsSent = 0
  let cancellationsFailed = 0

  const participantEmails = (participants ?? [])
    .map((p) => (p.users as { email: string } | null)?.email)
    .filter((e): e is string => !!e)

  if (participantEmails.length > 0) {
    const courseDate = formatCourseTime(course.start_time, course.end_time)
    const instructorName =
      (course.instructors as { users: { name: string | null } | null } | null)?.users?.name ??
      'Ukjent instruktør'
    const coursesPageUrl = `${siteUrl}/courses`

    const emailPayload = (to: string) => ({
      from: fromEmail,
      to,
      subject: `Kurs avlyst: ${course.title}`,
      react: CourseCancellationEmail({
        courseTitle: course.title,
        courseDate,
        instructorName,
        coursesPageUrl,
      }),
    })

    const results = await Promise.allSettled(
      participantEmails.map((email) => resend.emails.send(emailPayload(email)))
    )

    const failedIndices: number[] = []
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        failedIndices.push(i)
      } else if (r.value.error) {
        failedIndices.push(i)
      }
    })

    if (failedIndices.length > 0) {
      const retryResults = await Promise.allSettled(
        failedIndices.map((i) =>
          resend.emails.send(emailPayload(participantEmails[i]))
        )
      )
      cancellationsFailed = retryResults.filter(
        (r) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)
      ).length
    }

    cancellationsSent = participantEmails.length - cancellationsFailed
  }

  const { error: deleteError } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)

  if (deleteError) {
    logError('deleteCourse', deleteError)
    return { success: false as const, error: 'Kunne ikke slette kurs' }
  }

  log('deleteCourse', `course ${courseId} deleted`)

  revalidatePath('/courses')
  revalidatePath('/instructor')
  revalidatePath('/admin')

  return {
    success: true as const,
    cancellationsSent,
    cancellationsFailed,
  }
}
