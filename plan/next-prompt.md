Task: Implement Step 6 — Server Actions (Phase 6, actions only)

Read these files first:

plan/checklist.md — progress tracker. Phases 1–8 are complete (schemas, queries, email templates). Check off the Server Actions items in Phase 6 as you complete them.
plan/instructions.md — general workflow instructions.
plan/kite-club-full-plan.md — Section 6 (lines ~1141–1275) for the full server action spec including the canonical action skeleton, return conventions, and cache invalidation table. Section 7 (lines ~1331–1388) for email sending flow details (Promise.allSettled + single retry pattern). Section 2h (lines ~404–423) for storage bucket paths and RLS rules.

Files you must read before writing any code:

src/lib/supabase/server.ts — async server client (await createClient()).
src/lib/supabase/admin.ts — service role client (createAdminClient(), import 'server-only'). Used for subscriber email fetch and account deletion.
src/lib/supabase/client.ts — browser client (not needed in actions, but know it exists).
src/lib/validations/courses.ts — publishCourseSchema (Zod v4 — uses `message` not `required_error`).
src/lib/validations/spots.ts — createSpotSchema, updateSpotSchema.
src/lib/validations/instructors.ts — updateInstructorProfileSchema.
src/lib/validations/subscriptions.ts — subscribeSchema.
src/lib/queries/subscriptions.ts — getAllSubscriberEmails() (used by publishCourse for notification emails).
src/lib/email/resend.ts — exports `resend` (Resend instance) and `fromEmail` (env var).
src/lib/email/templates/new-course.tsx — NewCourseEmail component (props: courseTitle, courseDate, instructorName, price, spotName, spotUrl, enrollUrl).
src/lib/email/templates/enrollment-confirmation.tsx — EnrollmentConfirmationEmail component (props: courseTitle, courseDate, instructorName, price, spotName, spotUrl, chatUrl, coursesPageUrl).
src/lib/email/templates/course-cancellation.tsx — CourseCancellationEmail component (props: courseTitle, courseDate, instructorName, coursesPageUrl).
src/lib/logger.ts — exports log(action, detail?) and logError(action, error). NOTE: the plan's action skeleton shows a 4-arg logError call; the actual API is 2-arg: logError('actionName', error).
src/lib/utils/date.ts — formatCourseTime(startTime, endTime) for email date formatting.
src/lib/auth/index.ts — getCurrentUser() returns { id, email, name, avatarUrl, role } | null.
src/types/database.ts — generated Supabase types for all tables, enums, and RPC functions.

What to build (7 files):

1. src/lib/actions/courses.ts
   - `publishCourse(formData: FormData)` — (1) Zod validate with publishCourseSchema, (2) create Supabase client, (3) lookup instructor ID via instructors table (not from form), (4) insert course, (5) fetch subscribers via getAllSubscriberEmails(), (6) send notification emails via Promise.allSettled + single retry for failures using resend.emails.send() with NewCourseEmail template, (7) revalidatePath('/courses', '/instructor', '/admin'), (8) return { success: true, course, notificationsSent, notificationsFailed }.
   - `enrollInCourse(courseId: string)` — (1) create client, (2) get auth user, (3) capacity check: select count from course_participants where course_id, compare to course.max_participants (if set), return error 'Kurset er fullt' if full, (4) insert course_participant — on Postgres 23505 unique violation return 'Du er allerede påmeldt', (5) fetch course + spot + instructor details for email, (6) send enrollment confirmation email, (7) revalidatePath('/courses'), (8) return { success: true }.
   - `unenrollFromCourse(courseId: string)` — delete own course_participants row, revalidatePath('/courses').
   - `updateCourse(courseId: string, formData: FormData)` — Zod validate, update own course, revalidatePath('/courses', '/instructor', '/admin').
   - `deleteCourse(courseId: string)` — (1) fetch course details + participant emails via regular client (instructor RLS grants access), (2) send cancellation emails via Promise.allSettled + single retry, (3) delete course (ON DELETE CASCADE handles participants/messages), (4) revalidatePath('/courses', '/instructor', '/admin'), (5) return { success: true, cancellationsSent, cancellationsFailed }. Email failures never block deletion.

2. src/lib/actions/instructors.ts
   - `promoteToInstructor(userId: string)` — supabase.rpc('promote_to_instructor', { p_user_id: userId }), revalidatePath('/admin').
   - `promoteToAdmin(userId: string)` — supabase.rpc('promote_to_admin', { p_user_id: userId }), revalidatePath('/admin').
   - `demoteToUser(userId: string)` — supabase.rpc('demote_to_user', { p_user_id: userId }), revalidatePath('/admin').
   - `demoteAdminToInstructor(userId: string)` — supabase.rpc('demote_admin_to_instructor', { p_user_id: userId }), revalidatePath('/admin').
   - `updateInstructorProfile(formData: FormData)` — Zod validate with updateInstructorProfileSchema, update own instructor row, handle photo upload to instructor-photos/{auth.uid()}/{filename} bucket, store public URL in photo_url, revalidatePath('/instructor', '/courses').

3. src/lib/actions/messages.ts
   - `sendMessage(courseId: string, content: string)` — insert into messages table with user_id from auth. No revalidatePath (Realtime handles updates). No Zod schema needed — just validate content is non-empty string.

4. src/lib/actions/subscriptions.ts
   - `subscribe()` — get auth user, auto-fill email from session (Google email), insert into subscriptions, revalidatePath('/courses').
   - `unsubscribe()` — get auth user, delete own subscription row, revalidatePath('/courses').

5. src/lib/actions/spots.ts
   - `createSpot(formData: FormData)` — Zod validate with createSpotSchema, (1) insert spot row, (2) if image file provided: upload to spot-maps/{spotId}/{filename}, (3) update spot row with map_image_url, (4) on upload failure: rollback by deleting the spot row. revalidatePath('/spots', '/admin').
   - `updateSpot(formData: FormData)` — Zod validate with updateSpotSchema, update spot, handle optional image re-upload, revalidatePath('/spots', '/admin').
   - `deleteSpot(spotId: string)` — delete spot row, revalidatePath('/spots', '/admin').

6. src/lib/actions/users.ts
   - Re-export the 4 RPC actions from instructors.ts: promoteToInstructor, promoteToAdmin, demoteToUser, demoteAdminToInstructor. This file exists so the Brukere tab can import role-change actions from a users-centric module.

7. src/lib/actions/auth.ts
   - `signOut()` — supabase.auth.signOut(), then redirect('/') from next/navigation.
   - `deleteAccount()` — get auth user, call createAdminClient().auth.admin.deleteUser(userId), then redirect('/'). Since redirect() throws in Next.js, no return value needed. The AFTER DELETE trigger on auth.users cascades to public.users and all dependent rows.

Strict action pattern (every action must follow this order):

1. Zod validation (pure, no infrastructure)
2. Early return on failure: { success: false as const, error: parsed.error.issues[0].message }
3. await createClient() — only after validation passes
4. DB operations via Supabase SDK
5. revalidatePath() for affected routes
6. Return success response

Email sending pattern (used in publishCourse, enrollInCourse, deleteCourse):

```typescript
const results = await Promise.allSettled(
  emails.map((email) =>
    resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '...',
      react: <TemplateComponent {...props} />,
    })
  )
)
const failed = results.filter((r) => r.status === 'rejected')
if (failed.length > 0) {
  const retryResults = await Promise.allSettled(
    failed.map((_, i) => /* retry the failed ones */)
  )
  // Count final failures after retry
}
```

Important conventions:

- All files start with 'use server'.
- Supabase SDK uses snake_case for column names (instructor_id, user_id, etc.).
- No application-level auth checks needed — RLS handles authorization. If a non-admin tries an admin action, Postgres returns an error.
- The logger API is log(action, detail?) and logError(action, error) — NOT the 4-arg version in the plan skeleton.
- Zod v4 is installed (^4.3.6). Uses `message` not `required_error` for error customization.
- For storage uploads, use supabase.storage.from('bucket-name').upload(path, file) then getPublicUrl().
- NEXT_PUBLIC_SITE_URL env var is available for constructing absolute URLs in emails.
- redirect() is imported from 'next/navigation', not 'next/router'.

Run pnpm build when done to verify no TypeScript errors.
After completing each item, check it off in plan/checklist.md (Phase 6, Server Actions section).
