# Agent Prompt: Step 11 — Instructor Dashboard and Polish

You are building **Step 11** of the Ålesund Kiteklubb phased plan. Steps 1–10 are complete and verified. Your task is to implement the Instructor Dashboard and final polish items.

---

## Context

- **Phased plan:** [plan/phased_plan.md](phased_plan.md) — Step 11 (lines 357–382)
- **Full implementation spec:** [plan/kite-club-full-plan.md](kite-club-full-plan.md) — Section 5f (Instructor Dashboard, lines 1118–1133), Section 8 (UI Components, lines 1390–1432), Section 10 (Deployment, lines 1500–1530)
- **Checklist:** [plan/checklist.md](plan/checklist.md) — Phase 9 (Instructor Dashboard) and Phase 10 (Polish)
- **Instructions:** [plan/instructions.md](plan/instructions.md) — update full-plan if you diverge; check off completed items in the checklist

---

## What You Must Build

### 1. Instructor Dashboard

Create the instructor dashboard at `/instructor`. It is protected by middleware (instructor or admin role). **Admins also use this dashboard** for course creation — they see the same UI.

**Files to create:**

- `src/app/instructor/loading.tsx` — use `<SkeletonTable />` from `src/components/ui/skeletons.tsx`
- `src/app/instructor/page.tsx` — server component that:
  - Calls `getCurrentUser()` — redirect to `/` if not logged in
  - Redirects if user is not instructor or admin (check `user.role`)
  - Fetches instructor profile (see below) and courses via `getCoursesForInstructor()`
  - Passes data to a client component
- `src/components/instructor/instructor-dashboard-client.tsx` — tabbed client component with two tabs: **Profil** and **Mine Kurs**

**Tab: Profil**

- Edit own instructor profile: bio, certifications, years experience, phone, photo upload
- Use `updateInstructorProfile` from `src/lib/actions/instructors.ts` (already implemented)
- Form fields: bio (textarea), certifications (text), years experience (number), phone (text), photo (file input)
- Photo upload goes to `instructor-photos/{uid}/` — the action handles this
- Use `useTransition` + `isPending` on submit; on success: close any dialog, `toast.success('Profil oppdatert')`; on error: `toast.error(result.error)`

**Tab: Mine Kurs**

- DataTable listing own courses sorted by `start_time` (same structure as Admin Kurs tab)
- Columns: title, date/time range (via `formatCourseTime`), status tag ("Kommende"/"Tidligere" based on `start_time` vs now), spot name, participant count / max
- **"Nytt kurs" button** → Dialog with course form:
  - Title, description, price, max participants
  - Date picker (day) + two time inputs (HH:MM) for start and end time
  - Searchable spot dropdown (shadcn Combobox) — use `getSpots()` for options
  - **Timezone:** When combining date + time, construct ISO string with Europe/Oslo offset (e.g. `2026-03-12T10:00:00+01:00` in winter, `+02:00` in summer). Use `todayOsloISO` or equivalent so the server receives correct timestamps regardless of browser timezone.
  - Call `publishCourse` — it looks up `instructorId` from the current user's instructor record; do not pass it from the form
  - On success: close dialog, show toast (handle `notificationsSent`/`notificationsFailed` like Admin Kurs tab)
- **Row actions:** Edit, Delete, View participants
  - **Edit:** Dialog with same form fields, pre-filled; call `updateCourse`
  - **Delete:** Confirmation dialog; on confirm call `deleteCourse` (sends cancellation emails); close dialog, toast, `router.refresh()`
  - **View participants:** Dialog with participant list (fetch from `course_participants` with `users(name, email)`); remove buttons that delete the participant row

**Query for instructor profile:** You need to fetch the current user's instructor row. Add `getInstructorByUserId(userId: string)` to `src/lib/queries/instructors.ts` — `select('*').eq('user_id', userId).single()` with joined `users(name, avatar_url)`. Return `null` if not found (e.g. admin without instructor profile — admins should have one per RPC; if edge case, redirect or show empty state).

**Pattern consistency:** Reuse patterns from Admin dashboard:
- `src/components/admin/tabs/courses-tab.tsx` — DataTable structure, participant dialog, delete flow
- `src/components/admin/admin-dashboard-client.tsx` — Tabs layout
- Use shadcn `Tabs`, `DataTable`, `Dialog`, `Form`, `Combobox`

---

### 2. Polish Items

**Loading states**

- Add `src/app/login/loading.tsx` — `<SkeletonSpinner />` (simple centered spinner)

**Mutation buttons**

- Confirm all mutation buttons (enroll, unenroll, subscribe, CRUD forms, role changes, instructor profile, course create/edit) use `useTransition` + `isPending` spinner
- **Dialog close + toast sequence:** After successful mutation inside a Dialog: (1) close the dialog (`setOpen(false)`), (2) show `toast.success()`. The server action's `revalidatePath` refreshes data; `router.refresh()` may be needed in client components

**Responsive audit**

- Mobile-first: hamburger nav, touch targets (min 44px), single-column card stacks
- Instructor dashboard: tabs scroll horizontally on mobile; forms stack vertically; DataTable scrolls horizontally if needed

**SEO meta tags**

- Add `metadata` export to `src/app/layout.tsx` (title, description, openGraph if desired)
- Add `metadata` to key pages: `page.tsx` (front), `courses/page.tsx`, `spots/page.tsx`, `spots/[id]/page.tsx`, `admin/page.tsx`, `instructor/page.tsx` — title and description per page

---

## Existing Code to Read and Reuse

- `src/app/admin/page.tsx` — server component pattern, auth check, data fetch
- `src/components/admin/admin-dashboard-client.tsx` — Tabs structure
- `src/components/admin/tabs/courses-tab.tsx` — DataTable, participant dialog, delete flow, `formatCourseTime`, `deleteCourse`
- `src/components/admin/tabs/spots-tab.tsx` — "Ny spot" dialog; spot Combobox pattern
- `src/lib/queries/courses.ts` — `getCoursesForInstructor()`, `CourseWithFullRelations`
- `src/lib/queries/instructors.ts` — `getInstructors()`; add `getInstructorByUserId(userId)`
- `src/lib/queries/spots.ts` — `getSpots()` for spot dropdown
- `src/lib/actions/courses.ts` — `publishCourse`, `updateCourse`, `deleteCourse`
- `src/lib/actions/instructors.ts` — `updateInstructorProfile`
- `src/lib/validations/courses.ts` — `publishCourseSchema` (startTime/endTime are `z.coerce.date`; form will send ISO strings)
- `src/lib/utils/date.ts` — `formatCourseTime`, `formatDate`, `todayOsloISO`
- `src/components/ui/skeletons.tsx` — `SkeletonTable`, `SkeletonSpinner`
- `src/proxy.ts` — middleware already guards `/instructor/*` for instructor or admin

---

## Database Schema Reference

- `instructors`: id, user_id, bio, certifications, years_experience, phone, photo_url, created_at, updated_at
- `courses`: id, instructor_id, spot_id, title, description, price, start_time, end_time, max_participants, created_at, updated_at
- `course_participants`: id, user_id, course_id — RLS allows instructor to delete participants from own courses

---

## Human Validation Checklist

After implementation, the human will verify:

- [ ] `/instructor` only accessible to instructors and admins
- [ ] Profil tab: edit bio, certifications, years experience, phone works; photo upload works
- [ ] Mine Kurs tab: DataTable shows own courses
- [ ] "Nytt kurs" dialog: date picker + time inputs work; spot Combobox works; course is created; subscriber emails sent (if any)
- [ ] Edit course works
- [ ] Delete course works (sends cancellation emails to participants)
- [ ] View participants dialog shows list; remove participant works
- [ ] `/login` has loading.tsx
- [ ] All mutation buttons show pending spinner
- [ ] Mobile responsive: tabs, forms, tables work on small screens
- [ ] SEO meta tags present in page source for key pages

---

## Deployment (Manual — Not Your Task)

After Step 11, the human completes deployment manually (Vercel, env vars, Supabase production, etc.). No agent work for that.

---

## Notes

- **Norwegian UI:** All labels, buttons, messages in Norwegian (e.g. "Profil", "Mine Kurs", "Nytt kurs", "Lagre", "Avbryt")
- **RLS:** Instructor actions use the regular Supabase client; RLS enforces that instructors can only update their own profile and courses
- **Admins:** Admins have an instructor profile (created by RPC when promoted). They use the same Instructor dashboard for course creation
