Task: Implement Step 10 — Admin Dashboard (5 tabs)

Read these files first:

plan/checklist.md — progress tracker. Phases 1–9 are complete. Build the Admin Dashboard items (Phase 9, Admin Dashboard section) and check them off as you complete them.
plan/instructions.md — general workflow instructions.
plan/kite-club-full-plan.md — Section 5e (lines ~1088–1118) for the full Admin Dashboard spec, Section 6 (lines ~1141–1290) for server action patterns and data query details, Section 9 (lines ~1447–1500) for the design system. Also read lines ~1420–1431 for the form submission pending-state and toast conventions.

Files you must read before writing any code:

src/app/layout.tsx — root layout with panorama background, off-white content card, Navbar, Footer, Sonner toast provider. Content is rendered inside a `max-w-6xl` container with `bg-[#FAFAF8]` card.
src/app/courses/page.tsx — server component pattern: fetches data in parallel with `Promise.all`, passes as props to a client component wrapped in `<Suspense>`. Follow this exact pattern for the admin page.
src/components/courses/enroll-dialog.tsx — canonical dialog pattern for this project. Uses `@base-ui/react` Dialog (NOT Radix). Key pattern: `useState(false)` for open, `useTransition` for pending, `setOpen(false)` then `toast.success()` on success, `toast.error()` on failure. `DialogClose` uses `render={<Button variant="outline" />}`.
src/components/courses/courses-page-client.tsx — client component pattern: receives server data as props, manages local UI state, calls server actions with `useTransition`.
src/components/ui/tabs.tsx — tab component using `@base-ui/react/tabs`. Exports: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. Note: these are NOT Radix — they use `@base-ui/react`.
src/components/ui/dialog.tsx — dialog component using `@base-ui/react/dialog`. Exports: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`, `DialogOverlay`, `DialogPortal`. Note: `DialogClose` uses `render` prop for custom rendering.
src/components/ui/button.tsx — Button component.
src/components/ui/button-variants.ts — `buttonVariants` for use with non-Button triggers.
src/components/ui/badge.tsx — Badge component for tags like "Kommende"/"Tidligere".
src/components/ui/skeletons.tsx — exports `SkeletonTable`. Use this for `loading.tsx`.
src/lib/supabase/server.ts — server Supabase client.
src/lib/supabase/admin.ts — service role client (bypasses RLS — used for `getAllUsers`, `getAllSubscriptions`).
src/lib/auth/index.ts — `getCurrentUser()` returns `{ id, email, name, avatarUrl, role }` or null. Role is `'user' | 'instructor' | 'admin'`. Type: `CurrentUser`.
src/lib/queries/courses.ts — `getCoursesForAdmin()` returns `CourseWithFullRelations[]` (all courses with `instructors(*, users(name))` and `spots(name)` joins).
src/lib/queries/instructors.ts — `getInstructors()` returns instructors with joined `users(*)`.
src/lib/queries/spots.ts — `getSpots()` returns all spots.
src/lib/queries/subscriptions.ts — `getAllSubscriberEmails()` uses admin client. **Important:** This only returns emails. You need to create a new query `getAllSubscriptions()` for the Abonnenter tab (see below).
src/lib/queries/users.ts — `getAllUsers()` uses admin client, returns all users ordered by `created_at` desc.
src/lib/actions/courses.ts — `deleteCourse(courseId)` sends cancellation emails to participants then deletes. Returns `{ success, cancellationsSent?, cancellationsFailed?, error? }`.
src/lib/actions/instructors.ts — `promoteToInstructor(userId)`, `promoteToAdmin(userId)`, `demoteToUser(userId)`, `demoteAdminToInstructor(userId)`. All return `{ success: true }` or `{ success: false, error }`. Also: `updateInstructorProfile(formData)`.
src/lib/actions/spots.ts — `createSpot(formData)`, `updateSpot(formData)`, `deleteSpot(spotId)`. All return `{ success, error? }`. `createSpot` and `updateSpot` accept FormData with `image` file field for map upload.
src/lib/actions/users.ts — re-exports promote/demote functions from `instructors.ts`.
src/lib/validations/spots.ts — `createSpotSchema` and `updateSpotSchema`. Fields: name, description?, area, season?, skillLevel?, skillNotes?, latitude?, longitude?, windDirections? (array), waterType? (array). Valid wind directions: N, NE, E, SE, S, SW, W, NW. Valid water types: flat, chop, waves. Valid seasons: summer, winter. Valid skill levels: beginner, experienced.
src/lib/validations/courses.ts — `publishCourseSchema`.
src/lib/utils/date.ts — `formatDate(d)`, `formatDateTime(d)`, `formatCourseTime(start, end)`, `formatTime(d)`. All use Europe/Oslo timezone and nb-NO locale.
src/lib/utils.ts — `cn()` for merging Tailwind classes.
src/types/database.ts — full DB types. Key tables:
  - `users`: id, email, name, avatar_url, role, created_at
  - `instructors`: id, user_id, bio, certifications, years_experience, phone, photo_url, created_at
  - `courses`: id, title, description, start_time, end_time, price, max_participants, instructor_id, spot_id, created_at
  - `course_participants`: id, course_id, user_id, enrolled_at
  - `spots`: id, name, description, area, season, skill_level, skill_notes, latitude, longitude, wind_directions (text[]), water_type (text[]), map_image_url, created_at
  - `subscriptions`: id, user_id, email, created_at
  Enums: user_role (user | instructor | admin), season (summer | winter), skill_level (beginner | experienced)
src/proxy.ts — middleware. The `/admin/*` route is already protected (admin role only). No additional auth check needed in the page beyond confirming the user exists.

What to build:

You are building the Admin Dashboard at `/admin` — a single page with 5 tabs. All data is fetched server-side and passed to a client component. Tab switching is instant because data is already in the component tree.

Architecture: 1 loading file + 1 server page + 1 main client component + 5 tab panel components + supporting dialog components.

---

1. src/app/admin/loading.tsx
   - Import and render `<SkeletonTable />` from `@/components/ui/skeletons`.

2. src/lib/queries/subscriptions.ts — ADD a new query
   - Add `getAllSubscriptions()` to the existing file. Uses `createAdminClient()` (like `getAllSubscriberEmails`). Query: `supabase.from('subscriptions').select('*, users(name)').order('created_at', { ascending: false })`. Returns the full subscription rows with user names for the Abonnenter tab. If error, return `[]`.

3. src/app/admin/page.tsx — Server component
   - `getCurrentUser()`. If not logged in or `user.role !== 'admin'`, redirect to `/`.
   - Fetch all 5 datasets in parallel with `Promise.all`:
     - `getInstructors()`
     - `getCoursesForAdmin()`
     - `getSpots()`
     - `getAllSubscriptions()` (the new query)
     - `getAllUsers()`
   - Pass all data + `currentUser` as props to `<AdminDashboardClient />`.
   - Wrap in `<Suspense>`.
   - Metadata: `title: "Admin — Ålesund Kiteklubb"`.

4. src/components/admin/admin-dashboard-client.tsx — `"use client"` — Main client component
   - Props: `instructors`, `courses`, `spots`, `subscriptions`, `users`, `currentUser`.
   - Renders a page title ("Administrasjon") and a `<Tabs>` component with 5 tabs.
   - Tab labels: "Instruktører", "Kurs", "Spotter", "Abonnenter", "Brukere".
   - Each `<TabsContent>` renders the corresponding tab panel component, passing the relevant data as props.
   - The `currentUser` is passed to tabs that need it (Brukere tab needs it to disable own-row actions; Instruktører tab needs it).

5. src/components/admin/tabs/instructors-tab.tsx — `"use client"` — Tab: Instruktører
   - Props: `instructors` (from `getInstructors()`), `users` (from `getAllUsers()` — needed for the "add instructor" user search), `currentUser`.
   - **DataTable:** Rows show: user name (from joined `users.name`), email (from `users.email`), certifications, created date (`formatDate`).
   - **"Legg til instruktør" button** → opens a Dialog.
     - The dialog contains a searchable user list (a simple text input that filters the user list). The list excludes users whose role is already `instructor` or `admin` (they already have instructor profiles).
     - On select + confirm: call `promoteToInstructor(userId)` with `useTransition`. On success: `toast.success("Bruker lagt til som instruktør")`, close dialog, `router.refresh()`. On error: `toast.error(result.error)`.
   - **Row action: "Fjern"** → opens a confirmation Dialog:
     - Message: "Denne brukeren er instruktør. Å fjerne instruktørrollen vil slette instruktørprofilen. Kurs tilknyttet denne instruktøren vil miste sin instruktørtilknytning. Vil du fortsette?"
     - Buttons: "Avbryt" (DialogClose) and "Bekreft" (calls `demoteToUser(userId)`).
     - On success: `toast.success("Instruktør fjernet")`, close dialog, `router.refresh()`. On error: `toast.error(result.error)`.
   - Disable the remove button for the current admin's own row.

6. src/components/admin/tabs/courses-tab.tsx — `"use client"` — Tab: Kurs
   - Props: `courses` (from `getCoursesForAdmin()`).
   - **DataTable:** Rows show: title, date + time range (`formatCourseTime(start_time, end_time)`), "Kommende"/"Tidligere" badge (compare `start_time` to `new Date()`), spot name (from `spots.name`, with null guard), instructor name (from `instructors.users.name`, with null guard), participant info.
   - **No create button** — course creation happens in the Instructor dashboard. Admins access it via the "Instruktør" nav link.
   - **Row action: "Slett"** → confirmation Dialog:
     - Message: "Er du sikker på at du vil slette kurset «{title}»? Alle påmeldte vil bli varslet via e-post."
     - On confirm: call `deleteCourse(courseId)` with `useTransition`. On success: show toast with cancellation counts (e.g. "Kurs slettet. 5 varsler sendt." or "Kurs slettet. 3 av 5 varsler sendt." if some failed). Close dialog, `router.refresh()`. On error: `toast.error(result.error)`.
   - **Row action: "Vis deltakere"** → Dialog showing participant list.
     - Fetch participants for the course. You can either:
       (a) Pre-fetch participant counts in the server component by adding a count query, or
       (b) Fetch on-demand when the dialog opens using the Supabase browser client.
     - Option (b) is simpler for v1: when the dialog opens, use the browser Supabase client to query `course_participants` joined with `users(name, email)` for the course. Show a loading spinner while fetching.
     - Each participant row shows name + email.
     - **Remove button** per participant: calls `unenrollFromCourse` or a direct delete. For admin removal, create a small helper or use the existing Supabase client to delete the `course_participants` row. On success: toast, refresh participant list.
     - Note: the admin RLS policy on `course_participants` grants full access, so the admin can delete any row.

7. src/components/admin/tabs/spots-tab.tsx — `"use client"` — Tab: Spotter
   - Props: `spots` (from `getSpots()`).
   - **DataTable:** Rows show: name, area, season (with null guard — show "-" if null), skill level (with null guard), water type (joined as comma-separated string or badges).
   - **"Ny spot" button** → Dialog with the full spot creation form:
     - Fields: name (required), description (textarea), area (required), season (select: summer/winter/blank), skill level (select: beginner/experienced/blank), skill notes (textarea), latitude (number input), longitude (number input), wind directions (multi-select checkboxes for N/NE/E/SE/S/SW/W/NW), water type (multi-select checkboxes for flat/chop/waves), map image (file input).
     - On submit: build FormData, call `createSpot(formData)` with `useTransition`. On success: `toast.success("Spot opprettet")`, close dialog, `router.refresh()`. On error: `toast.error(result.error)`.
   - **Row action: "Rediger"** → Dialog pre-filled with spot data. On submit: build FormData with `id` field, call `updateSpot(formData)`. Same success/error pattern.
   - **Row action: "Slett"** → confirmation Dialog. On confirm: call `deleteSpot(spotId)`. On success: `toast.success("Spot slettet")`, close dialog, `router.refresh()`.

8. src/components/admin/tabs/subscribers-tab.tsx — `"use client"` — Tab: Abonnenter
   - Props: `subscriptions` (from `getAllSubscriptions()`).
   - **DataTable:** Read-only. Rows show: email, user name (from joined `users.name`, with null guard — show "Ukjent" if null), subscribed date (`formatDate(created_at)`).
   - No actions — this tab is purely informational.

9. src/components/admin/tabs/users-tab.tsx — `"use client"` — Tab: Brukere
   - Props: `users` (from `getAllUsers()`), `currentUser`.
   - **DataTable:** Rows show: name, email, role (with a Badge showing the role), created date (`formatDate`).
   - **Row action: Role change dropdown** — A `<select>` or custom dropdown with 3 options: "Bruker", "Instruktør", "Admin". The dropdown reflects the current role.
     - **Disabled for own row:** If `user.id === currentUser.id`, disable the dropdown and show a tooltip: "Du kan ikke endre din egen rolle".
     - **On change from any role to `user`:** If the user is currently `instructor`, show confirmation dialog: "Denne brukeren er instruktør. Å endre rollen til bruker vil slette instruktørprofilen. Kurs tilknyttet denne instruktøren vil miste sin instruktørtilknytning. Vil du fortsette?". If the user is currently `admin`, show: "Denne brukeren er admin. Å endre rollen til bruker vil fjerne admin-tilgangen og slette instruktørprofilen. Kurs tilknyttet denne brukeren vil miste sin instruktørtilknytning. Vil du fortsette?". On confirm: call `demoteToUser(userId)`.
     - **On change from `admin` to `instructor`:** Show confirmation dialog: "Denne brukeren er admin. Å endre rollen til instruktør vil fjerne admin-tilgangen, men beholde instruktørprofilen. Vil du fortsette?". On confirm: call `demoteAdminToInstructor(userId)`.
     - **On change from `user` to `instructor`:** No confirmation needed. Call `promoteToInstructor(userId)`.
     - **On change from `user` to `admin`:** No confirmation needed. Call `promoteToAdmin(userId)`.
     - **On change from `instructor` to `admin`:** No confirmation needed. Call `promoteToAdmin(userId)`.
     - All role changes use `useTransition`. On success: `toast.success("Rolle oppdatert")`, `router.refresh()`. On error: `toast.error(result.error)`.

Design guidelines:

- Use the existing design system: off-white page background (`bg-[#FAFAF8]`), sky-600/sky-800 blue accents, Inter font.
- DataTables: Use simple HTML `<table>` elements with Tailwind styling — no external table library needed. Style with `border-collapse`, `divide-y`, `text-sm`, alternating row colors if desired. Responsive: on mobile, consider horizontal scroll (`overflow-x-auto`) or stacked card layout.
- Dialogs: Follow the pattern from `enroll-dialog.tsx` — `Dialog` + `DialogTrigger` + `DialogContent` + `DialogHeader` + `DialogFooter` + `DialogClose`. Use `render` prop on `DialogClose` for custom button styling.
- Tabs: Use `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs`. These use `@base-ui/react/tabs`, NOT Radix.
- Badges: Use `Badge` from `@/components/ui/badge` for role tags, "Kommende"/"Tidligere" tags, season labels, etc.
- All mutation buttons must use `useTransition` + `isPending` for pending state with `Loader2` spinner.
- Toast import: `import { toast } from "sonner"`.
- Use lucide-react icons: `Plus` (add buttons), `Trash2` (delete), `Pencil` (edit), `Loader2` (spinner), `Users` (participants), `Search` (search input).
- Mobile-first: the dashboard should be usable on mobile. Tabs should scroll horizontally if needed. Tables should have `overflow-x-auto` wrapper.

Important conventions:

- The Dialog component in this project uses `@base-ui/react`, NOT Radix. Do NOT import from `@radix-ui`.
- The Tabs component uses `@base-ui/react/tabs`, NOT Radix.
- All server actions return `{ success: true, ... }` or `{ success: false, error: string }`.
- In Next.js 15 App Router, `params` is a Promise that must be awaited (not relevant here since admin has no params, but keep in mind for any sub-routes).
- `useTransition` + `startTransition` for all server action calls. Pattern:
  ```
  const [isPending, startTransition] = useTransition()
  function handleAction() {
    startTransition(async () => {
      const result = await someAction(...)
      if (result.success) {
        setOpen(false)
        toast.success("...")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }
  ```
- `router.refresh()` after successful mutations to refetch server data.
- The `cn()` utility from `@/lib/utils` is used for conditional class merging.
- Form inputs should use Norwegian labels and placeholders.
- The `buttonVariants` export from `@/components/ui/button-variants` is used when applying button styles to non-Button elements (e.g., `DialogTrigger`).

File creation summary (~8–10 files):

1. `src/app/admin/loading.tsx` — skeleton
2. `src/app/admin/page.tsx` — server component
3. `src/components/admin/admin-dashboard-client.tsx` — main client component with tabs
4. `src/components/admin/tabs/instructors-tab.tsx` — Instruktører tab
5. `src/components/admin/tabs/courses-tab.tsx` — Kurs tab
6. `src/components/admin/tabs/spots-tab.tsx` — Spotter tab
7. `src/components/admin/tabs/subscribers-tab.tsx` — Abonnenter tab
8. `src/components/admin/tabs/users-tab.tsx` — Brukere tab

Plus the new query added to `src/lib/queries/subscriptions.ts`.

Run `pnpm build` when done to verify no TypeScript errors.
After completing each item, check it off in plan/checklist.md (Phase 9, Admin Dashboard section).
