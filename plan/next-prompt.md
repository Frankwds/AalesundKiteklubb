Task: Implement Phase 9 — Courses Page & Components

Read these files first:

plan/checklist.md — progress tracker. Phases 1–8, Phase 6 Server Actions, and Phase 9 Spots are complete. Build the Courses section items and check them off as you complete them.
plan/instructions.md — general workflow instructions.
plan/kite-club-full-plan.md — Section 5c (lines ~1061–1071) for the courses page spec, Section 8 (lines ~1391–1403) for the UI component list (CourseCard, CourseList, EnrollConfirmDialog, UnenrollConfirmDialog, SubscribeDialog, UnsubscribeDialog), Section 9 (lines ~1434–1494) for the design system. Also read lines ~1420–1431 for the form submission pending-state and toast conventions.

Files you must read before writing any code:

src/app/layout.tsx — root layout with panorama background, off-white content card, Navbar, Footer, Sonner toast provider. Content is rendered inside a `max-w-6xl` container with `bg-[#FAFAF8]` card.
src/app/page.tsx — front page for visual style reference.
src/app/spots/page.tsx — spots page for how server components pass data to client components with Suspense.
src/components/spots/spot-list.tsx — example of a client component that reads URL search params (for the `?error=not_enrolled` toast pattern).
src/components/ui/skeletons.tsx — exports `SkeletonCard`. Use in `loading.tsx`.
src/components/ui/dialog.tsx — shadcn Dialog using @base-ui/react. Exports: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`. Note: `DialogClose` wraps `@base-ui/react DialogPrimitive.Close` — use it to close dialogs from footer buttons.
src/components/ui/card.tsx — shadcn Card.
src/components/ui/badge.tsx — shadcn Badge.
src/components/ui/button.tsx — shadcn Button (uses `render` prop pattern from base-ui).
src/components/ui/button-variants.ts — cva button variants (use `buttonVariants()` for Link-based buttons).
src/lib/queries/courses.ts — `getCoursesForPublicPage()` returns future courses with joined `instructors(*)` and `spots(*)` via `select("*, instructors(*), spots(*)")`. Returns `Database['public']['Tables']['courses']['Row']` extended with `instructors` and `spots` relations.
src/lib/queries/subscriptions.ts — `getUserSubscription(userId)` returns the user's subscription row or null.
src/lib/actions/courses.ts — `enrollInCourse(courseId)` (capacity check + insert + confirmation email; returns `{ success, error? }`), `unenrollFromCourse(courseId)` (delete + returns `{ success, error? }`).
src/lib/actions/subscriptions.ts — `subscribe()` and `unsubscribe()` (both auto-read user from auth; return `{ success, error? }`).
src/lib/auth/index.ts — `getCurrentUser()` returns `{ id, email, name, avatarUrl, role }` or null. Role is `'user' | 'instructor' | 'admin'`.
src/lib/utils/date.ts — `formatCourseTime(start, end)` returns `"12. mars 2026, 10:00–14:00"`.
src/lib/utils.ts — `cn()` for merging Tailwind classes.
src/types/database.ts — full DB types. Course row: `id`, `title`, `description`, `start_time`, `end_time`, `price`, `max_participants`, `instructor_id`, `spot_id`, `created_at`. Subscription row: `id`, `user_id`, `email`, `created_at`.

What to build (2 page files + components):

1. src/app/courses/loading.tsx
   - Import and render a grid of `SkeletonCard` components (e.g. 6 cards).

2. src/app/courses/page.tsx — Server component
   - Calls `getCoursesForPublicPage()` to get courses with joined instructors + spots.
   - Calls `getCurrentUser()` to get the logged-in user (may be null).
   - If user is logged in, query `course_participants` via the Supabase server client to get the list of `course_id` values where `user_id` matches (enrolled course IDs). Also call `getUserSubscription(user.id)`.
   - Passes all data to a client component: `<CoursesPageClient courses={courses} user={user} enrolledCourseIds={enrolledIds} subscription={subscription} />`.
   - Wrap the client component in `<Suspense>` (for `useSearchParams`).

3. src/components/courses/courses-page-client.tsx — `"use client"` — Main client component
   - Receives: `courses`, `user` (CurrentUser | null), `enrolledCourseIds` (string[]), `subscription` (Subscription row | null).
   - On mount, reads `?error=not_enrolled` from URL search params via `useSearchParams()`. If present, shows `toast.error("Du må være meldt på kurset for å se chatten.")` and removes the param from URL (router.replace without it).
   - Renders three sections in order:
     a. **Intro section** — heading "Kurs", brief description about the club's courses.
     b. **Course cards** — if courses exist, render a grid/list of `CourseCard` components. If no courses, render the empty state (see below).
     c. **Subscribe section** — at the bottom of the page.

4. src/components/courses/course-card.tsx — `CourseCard`
   - Props: `course` (with joined instructor + spot), `user` (CurrentUser | null), `isEnrolled` (boolean).
   - Displays: title, date/time range (`formatCourseTime`), spot name linked to `/spots/[spot.id]` (or "Ikke bestemt" if `spot_id` is null), instructor name from joined instructor→users relation (or "Ikke bestemt" if null), price (formatted as "kr X" or "Gratis" if null/0).
   - Participant count: if `max_participants` is set, display it (e.g. "Maks X deltakere").
   - Buttons section (depends on user state):
     - **Not logged in (`user` is null):** Show a Link styled as button: "Logg inn for å melde på" → `/login`.
     - **Logged in, not enrolled:** "Meld på" button opens `EnrollDialog`.
     - **Logged in, enrolled:** "Meld av" button opens `UnenrollDialog`. Also show "Chat" Link button → `/courses/[id]/chat`.
   - **Chat button visibility:** Show "Chat" when user is enrolled OR user.role is `'instructor'` or `'admin'`.
   - Use white background, border, rounded corners, subtle card style matching the spots cards.

5. src/components/courses/enroll-dialog.tsx — `EnrollDialog`
   - Props: `courseId` (string), `courseTitle` (string), `userEmail` (string).
   - Uses shadcn Dialog. Trigger is the "Meld på" button.
   - Dialog content: title "Meld på kurs", description "Du melder deg på [courseTitle]. En bekreftelse sendes til:", then a display-only email field (styled as a muted input showing `userEmail`, not editable).
   - Footer: "Avbryt" (DialogClose) + "Meld på" (submit button).
   - On submit: use `useTransition` to call `enrollInCourse(courseId)`. While pending, disable button and show spinner (`Loader2` from lucide-react). On success: close dialog, `toast.success("Du er påmeldt!")`. On error: keep dialog open, `toast.error(result.error)`.

6. src/components/courses/unenroll-dialog.tsx — `UnenrollDialog`
   - Props: `courseId` (string), `courseTitle` (string).
   - Dialog content: title "Meld av kurs", description "Er du sikker på at du vil melde deg av [courseTitle]?".
   - Footer: "Avbryt" (DialogClose) + "Meld av" (submit button).
   - On submit: `useTransition` + `unenrollFromCourse(courseId)`. On success: close dialog, `toast.success("Du er avmeldt")`. On error: `toast.error(result.error)`.

7. src/components/courses/subscribe-section.tsx — `SubscribeSection`
   - Props: `user` (CurrentUser | null), `subscription` (Subscription row | null).
   - Renders a section with heading "Varsler", description about receiving email notifications when new courses are published.
   - If not logged in: show text "Logg inn for å motta kursvarsler" with a Link to `/login`.
   - If logged in and not subscribed: "Meld på varsler" button opens a confirmation dialog. Dialog shows: action description, display-only email field (user.email), "Avbryt" + "Meld på" buttons. On confirm: `useTransition` + `subscribe()`. Success: close dialog, `toast.success("Du vil få varsler om nye kurs")`. Error: `toast.error(result.error)`.
   - If logged in and subscribed: show "Du mottar varsler om nye kurs" text + "Meld av varsler" button opens a confirmation dialog. Dialog: "Er du sikker på at du vil slutte å motta kursvarsler?", "Avbryt" + "Meld av". On confirm: `useTransition` + `unsubscribe()`. Success: close dialog, `toast.success("Du mottar ikke lenger kursvarsler")`. Error: `toast.error(result.error)`.

Empty state (no courses):

When `courses` array is empty, instead of the card grid, render:
- Muted text: "Kurs legges ut når forholdene ser lovende ut, ikke langt i forkant."
- A call-to-action: "Meld deg på varsler for å bli informert når nye kurs publiseres." — this should scroll to or draw attention to the subscribe section below.

Design guidelines:

- Mobile-first: single-column card stack on mobile, 2-column grid on md+.
- Use the existing design system: off-white card (`bg-[#FAFAF8]`), sky-600/sky-800 blue accents, Inter font.
- Course cards: white background, border, rounded-lg, p-5, subtle hover shadow (same feel as spot cards).
- Badges: use for spot name link (neutral), price.
- Page padding: `px-6 py-8`, matching the spots page style.
- External links open in new tabs.
- Use lucide-react icons: `Calendar`, `MapPin`, `User`, `MessageCircle`, `Bell`, `Loader2`, `ArrowRight`.
- All mutation buttons must use `useTransition` + `isPending` for pending state (spinner + disabled).
- Dialog close-then-toast sequence: on success, (1) set dialog open to `false`, (2) show `toast.success()`.
- Toast import: `import { toast } from "sonner"`.

Important conventions:

- `getCoursesForPublicPage()` returns courses with `.instructors` and `.spots` as joined relations. The instructor relation has nested `users` — but the public query uses `instructors(*)`, which returns the instructor row (bio, certifications, etc.) but NOT the joined user name. To get the instructor name: the query selects `"*, instructors(*), spots(*)"`. The `instructors` row has `user_id`, `bio`, `certifications`, etc. but not `name`. You need to handle this — either show instructor `certifications` or `bio` on the card, or accept that the instructor name is not directly available from this query. For v1, show the instructor info that IS available (e.g. skip showing instructor name if not in the join, or show "Instruktør" as a generic label). Alternatively, modify the query to `"*, instructors(*, users(name)), spots(*)"` — but check if this works by reading `src/lib/queries/courses.ts` and testing. The simplest correct approach: update `COURSE_SELECT` in `src/lib/queries/courses.ts` to `"*, instructors(*, users(name)), spots(name)"` so instructor name and spot name are available, then type the result accordingly.
- `enrollInCourse` and `unenrollFromCourse` call `revalidatePath('/courses')`, so the page data refreshes automatically after enrollment changes.
- `subscribe` and `unsubscribe` also call `revalidatePath('/courses')`.
- In Next.js 15 App Router, `params` is a Promise that must be awaited.
- For the `?error=not_enrolled` toast: use `useSearchParams` + `useEffect` to check on mount, then `router.replace(pathname)` to clean the URL.
- The Dialog component uses @base-ui/react, not Radix. `DialogClose` works as a close trigger. To programmatically control open state, use `<Dialog open={open} onOpenChange={setOpen}>` and set `open` to `false` after successful mutation.

Run `pnpm build` when done to verify no TypeScript errors.
After completing each item, check it off in plan/checklist.md (Phase 9, Courses section).
