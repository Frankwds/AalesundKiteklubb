# Ålesund Kiteklubb — Build Checklist

Progress tracker for the full-stack implementation. Work top to bottom — later sections depend on earlier ones.

---

## Phase 1 — External Setup (Manual)

- [ ] Create Supabase hosted project; note URL, anon key, service role key
- [ ] Enable Google OAuth in Supabase Dashboard (Authentication > Providers > Google); add redirect URL `/auth/callback`
- [ ] Create OAuth 2.0 credentials in Google Cloud Console; add Supabase callback URL to Authorized redirect URIs; paste Client ID + Secret into Supabase
- [ ] Set up Resend account; verify sending domain (or use `onboarding@resend.dev` for dev); obtain API key

---

## Phase 2 — Project Scaffold

- [x] Init Next.js 15 with TypeScript, Tailwind, App Router, `src/` dir, pnpm
- [x] Install runtime dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `resend`, `@react-email/components`, `sonner`, `zod`
- [x] Install dev dependency: `supabase` CLI
- [x] Init shadcn/ui (`pnpm dlx shadcn@latest init`)
- [x] Create `.env.local.example` with all required env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`)
- [x] Create `.env.local` with real values
- [x] Create `src/lib/supabase/client.ts` — browser client (`createBrowserClient`)
- [x] Create `src/lib/supabase/server.ts` — async server client with `await cookies()` + `getAll`/`setAll`
- [x] Create `src/lib/supabase/middleware.ts` — session refresh helper using `request.cookies`/`response.cookies`
- [x] Create `src/lib/supabase/admin.ts` — service role client (`import 'server-only'`)
- [x] Configure `next.config.ts` — `images.remotePatterns` for Supabase Storage domain
- [x] Add `db:push`, `db:types`, `db:sync` scripts to `package.json`

---

## Phase 3 — Database Migrations

- [x] Run `supabase init` and `supabase link` to connect local project to hosted Supabase

### Migration 0001 — Initial Schema
- [x] Create enums: `user_role` (`user`, `instructor`, `admin`), `season` (`summer`, `winter`), `skill_level` (`beginner`, `experienced`)
- [x] Create `users` table
- [x] Create `instructors` table
- [x] Create `courses` table (with `end_time > start_time` CHECK constraint)
- [x] Create `course_participants` table (with unique constraint on `user_id, course_id`)
- [x] Create `messages` table (`user_id` nullable with `ON DELETE SET NULL`)
- [x] Create `subscriptions` table (`user_id` unique)
- [x] Create `spots` table (`wind_directions text[]`, `water_type text[]`)

### Migration 0002 — RLS Policies (33 total)
- [x] Enable RLS on all 7 tables
- [x] **Users** — 4 policies: own read, co-participant read, instructor read own courses, admin full access
- [x] **Instructors** — 4 policies: public read (anon), authenticated read, own update, admin full access
- [x] **Courses** — 6 policies: public read (anon), authenticated read, instructor insert/update/delete own, admin full access
- [x] **Course Participants** — 7 policies: own enrollments, instructor view own course participants, co-participant read, self-enroll, self-unenroll, instructor remove from own, admin full access
- [x] **Messages** — 5 policies: participant read, instructor read own courses, participant insert, instructor insert own courses, admin full access
- [x] **Subscriptions** — 4 policies: own read, own insert, own delete, admin full access
- [x] **Spots** — 3 policies: public read (anon), authenticated read, admin full access

### Migration 0003 — User Sync Trigger
- [x] `handle_new_user()` function + `on_auth_user_created` AFTER INSERT trigger on `auth.users`
- [x] `handle_user_deleted()` function + `on_auth_user_deleted` AFTER DELETE trigger on `auth.users`

### Migration 0004 — Custom JWT Claims Hook
- [x] `custom_access_token_hook()` function (SECURITY DEFINER, with `EXCEPTION WHEN OTHERS` fallback)
- [x] Grant `supabase_auth_admin` usage on schema, execute on function, all on `users` table; revoke from `authenticated`/`anon`/`public`

### Migration 0005 — Realtime Publication
- [x] `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages`

### Migration 0006 — Storage Buckets
- [x] Create `spot-maps` bucket (5 MB, jpeg/png/webp, public)
- [x] Create `instructor-photos` bucket (2 MB, jpeg/png/webp, public)
- [x] `spot-maps` RLS: public SELECT; admin-only INSERT, UPDATE, DELETE (JWT `user_role = 'admin'`)
- [x] `instructor-photos` RLS: public SELECT; instructor/admin INSERT to own folder; own folder UPDATE/DELETE

### Migration 0007 — Promote/Demote RPCs
- [x] `promote_to_instructor(p_user_id)` — creates `instructors` row + sets `users.role = 'instructor'`
- [x] `promote_to_admin(p_user_id)` — creates `instructors` row + sets `users.role = 'admin'`
- [x] `demote_to_user(p_user_id)` — deletes `instructors` row + sets `users.role = 'user'`; guards: self-demotion, last-admin
- [x] `demote_admin_to_instructor(p_user_id)` — sets `users.role = 'instructor'` only (preserves `instructors` row); guards: self-demotion, last-admin

### Apply & Type-gen
- [x] Run `supabase db push` to apply all migrations **(dev Supabase project)**
- [x] Configure Auth Hook in Supabase Dashboard (Authentication > Hooks > Custom Access Token → `public.custom_access_token_hook`) **(dev Supabase project)**
- [x] Run `pnpm db:types` to generate `src/types/database.ts`
- [x] Bootstrap first admin: log in via Google, then via SQL Editor set `users.role = 'admin'` and insert `instructors` row; re-login to get updated JWT

---

## Phase 4 — Authentication & Middleware

- [x] Create `src/app/auth/callback/route.ts` — exchange code for session, upsert `public.users` via service role client (Zod `UserSyncSchema` whitelist, no `role` field), redirect to `/`
- [x] Create `src/lib/validations/user-sync.ts` — `UserSyncSchema` (id, email, name, avatar_url only)
- [x] Create `src/lib/auth/decode-jwt.ts` — Edge-safe base64url → JSON decoder
- [x] Create `src/lib/auth/index.ts` — `getCurrentUser()` using `getSession()` + JWT decode for `user_role`
- [x] Create `src/proxy.ts` — calls `updateSession()`, reads JWT for role, applies route guards:
  - `/admin/*` → admin only
  - `/instructor/*` → instructor or admin
  - `/courses/*/chat` → authenticated only (enrollment checked at page level)
  - Copy cookies from `supabaseResponse` onto any redirect response
- [x] Create `src/app/login/page.tsx` — "Sign in with Google" button

---

## Phase 5 — Design System & Root Layout

- [x] Set up Tailwind design tokens: blue palette (`sky-600`, `sky-800`), off-white (`#FAFAF8`), Inter font via `next/font`
- [x] Create `src/lib/utils/date.ts` — `formatDate`, `formatDateTime`, `formatTime`, `formatCourseTime`, `todayOsloISO` (all `Europe/Oslo`, `nb-NO`)
- [x] Create `src/lib/logger.ts` — `log()` and `logError()` structured console output (no PII)
- [x] Create `src/app/layout.tsx` — root layout: panorama background, off-white content card, sticky navbar, footer, `<Sonner />` toast provider
- [x] Build `Navbar` component — sticky top, centered items; hamburger + full-screen overlay on mobile; horizontal on desktop
- [x] Build `Footer` component
- [x] Build `ContentCard` component — off-white card over panorama background
- [x] Create `src/app/loading.tsx` — global `<SkeletonSpinner />`
- [x] Create `src/app/error.tsx` — global error boundary with retry button
- [x] Create `src/app/not-found.tsx` — custom 404 page
- [x] Create `src/components/ui/skeletons.tsx` — `SkeletonCard`, `SkeletonTable`, `SkeletonDetail`, `SkeletonSpinner`

---

## Phase 6 — Validation Schemas & Server Actions

- [x] Create `src/lib/validations/courses.ts` — `publishCourseSchema` (with `endTime > startTime` refine)
- [x] Create `src/lib/validations/spots.ts`
- [x] Create `src/lib/validations/instructors.ts`
- [x] Create `src/lib/validations/subscriptions.ts`

### Server Actions
- [x] `src/lib/actions/courses.ts`:
  - [x] `publishCourse` — lookup instructorId from auth, insert course, fetch subscribers via service role client, send notification emails via `Promise.allSettled` + single retry; return `{ course, notificationsSent, notificationsFailed }`; `revalidatePath('/courses', '/instructor', '/admin')`
  - [x] `enrollInCourse` — capacity check, insert; on 23505 return "already enrolled"; send enrollment confirmation email; `revalidatePath('/courses')`
  - [x] `unenrollFromCourse` — delete own `course_participants` row; `revalidatePath('/courses')`
  - [x] `updateCourse` — update own course; `revalidatePath('/courses', '/instructor', '/admin')`
  - [x] `deleteCourse` — fetch participant emails (regular client), send cancellation emails via `Promise.allSettled` + single retry, delete course; `revalidatePath('/courses', '/instructor', '/admin')`
- [x] `src/lib/actions/instructors.ts`:
  - [x] `promoteToInstructor` — `supabase.rpc('promote_to_instructor', ...)`; `revalidatePath('/admin')`
  - [x] `promoteToAdmin` — `supabase.rpc('promote_to_admin', ...)`; `revalidatePath('/admin')`
  - [x] `demoteToUser` — `supabase.rpc('demote_to_user', ...)`; `revalidatePath('/admin')`
  - [x] `demoteAdminToInstructor` — `supabase.rpc('demote_admin_to_instructor', ...)`; `revalidatePath('/admin')`
  - [x] `updateInstructorProfile` — update own instructor row; upload photo to `instructor-photos/{uid}/` if provided; `revalidatePath('/instructor', '/courses')`
- [x] `src/lib/actions/messages.ts` — `sendMessage` — insert into `messages`; no `revalidatePath` (Realtime handles updates)
- [x] `src/lib/actions/subscriptions.ts` — `subscribe` / `unsubscribe`; `revalidatePath('/courses')`
- [x] `src/lib/actions/spots.ts` — `createSpot` (create row → upload image → update `map_image_url`; rollback spot row on upload failure), `updateSpot`, `deleteSpot`; `revalidatePath('/spots', '/admin')`
- [x] `src/lib/actions/users.ts` — re-exports role-change RPCs for use in Brukere tab
- [x] `src/lib/actions/auth.ts` — `signOut` (signOut + `redirect('/')`), `deleteAccount` (service role `deleteUser` + `redirect('/')`) — **v1 scope decision:** `deleteAccount` is implemented but has no UI entry point; add a "Delete account" button to the courses page or defer to a future account settings page (`src/app/account/page.tsx`)

---

## Phase 7 — Data Queries

- [x] `src/lib/queries/courses.ts` — `getCoursesForPublicPage()` (future only, `gte(new Date().toISOString())`), `getCoursesForAdmin()` (all), `getCoursesForInstructor()` (lookup instructor ID first, then filter by `instructor_id`)
- [x] `src/lib/queries/instructors.ts` — `getInstructors()` with joined `users(*)`
- [x] `src/lib/queries/messages.ts` — `getMessages(courseId)` with joined `users(name, avatar_url)`, ordered by `created_at`
- [x] `src/lib/queries/subscriptions.ts` — `getUserSubscription(userId)` (own row); `getAllSubscriberEmails()` via service role client
- [x] `src/lib/queries/spots.ts` — `getSpots()` (all spots, filtering done client-side); `getSpot(id)`
- [x] `src/lib/queries/users.ts` — `getAllUsers()` via service role client (admin Brukere tab)

---

## Phase 8 — Email Templates

- [x] Create `src/lib/email/resend.ts` — Resend client (`import 'server-only'`)
- [x] Create `src/lib/email/templates/new-course.tsx` — subscriber notification (title, date/time range, instructor, price, spot link, enroll link)
- [x] Create `src/lib/email/templates/enrollment-confirmation.tsx` — user confirmation on enroll (course details, spot link, chat link, unenroll note)
- [x] Create `src/lib/email/templates/course-cancellation.tsx` — enrolled participant notification on course deletion

---

## Phase 9 — Pages

### Front Page
- [x] `src/app/page.tsx` — hero (Giske panorama + club name), about section, Facebook/chat links

### Spots
- [x] `src/app/spots/loading.tsx` — `SkeletonCard` grid
- [x] `src/app/spots/page.tsx` — filter drawer (season, area, wind direction — URL param sync), spot card grid, empty state
- [x] `src/app/spots/[id]/loading.tsx` — `SkeletonDetail`
- [x] `src/app/spots/[id]/page.tsx` — wind compass, description, map image, Yr link, Google Maps link (null guards), skill level + notes, water type badges
- [x] Build `SpotCard`, `SpotList`, `SpotFilters`, `WindCompass` components

### Courses
- [x] `src/app/courses/loading.tsx` — `SkeletonCard` grid
- [x] `src/app/courses/page.tsx`:
  - [x] Intro section
  - [x] Course card list (instructor, date/time via `formatCourseTime`, spot link, price; null-guards for `instructor_id` and `spot_id`)
  - [x] Enroll / unenroll buttons with confirmation dialogs (display-only email field in enroll dialog)
  - [x] "Chat" button visible only when enrolled / instructor / admin
  - [x] Empty state with subscribe CTA
  - [x] Subscribe / unsubscribe section (login required, confirmation dialogs)
  - [x] Read `?error=not_enrolled` param and show toast

### Course Chat
- [x] `src/app/courses/[id]/chat/loading.tsx` — skeleton for message list
- [x] `src/app/courses/[id]/chat/page.tsx`:
  - [x] Page-level access check (enrolled OR instructor OR admin); redirect with error param if not
  - [x] Server-side: fetch initial messages with joined user data; fetch instructor profile
  - [x] Pass seed data to client component (profile cache)
  - [x] Build `ChatWindow` — append-only message log, newest at bottom, auto-scroll
  - [x] Build `MessageBubble` — avatar, name, timestamp (`formatTime`)
  - [x] Build `MessageInput` — form that calls `sendMessage` action; no optimistic UI in v1
  - [x] Supabase Realtime subscription (`postgres_changes` on `messages` filtered by `course_id`)
  - [x] Profile cache: seed from initial messages + instructor; on-demand fetch on cache miss; placeholder while fetching; "Ukjent bruker" on fetch failure; "Slettet bruker" for `null` user_id

### Admin Dashboard
- [x] `src/app/admin/loading.tsx` — `SkeletonTable`
- [x] `src/app/admin/page.tsx` — server component fetches all tab data upfront; passes as props
- [x] **Tab: Instruktører** — DataTable; "Legg til instruktør" dialog (user search/select, excludes existing instructors); remove action with confirmation dialog
- [x] **Tab: Kurs** — DataTable with "Kommende"/"Tidligere" tags; delete action (confirmation + cancellation emails); view participants dialog with remove buttons
- [x] **Tab: Spotter** — DataTable with season/area filters; "Ny spot" dialog; edit/delete row actions *(spot admin CMS — server actions implemented in Phase 6: `createSpot`, `updateSpot`, `deleteSpot`)*
- [x] **Tab: Abonnenter** — read-only DataTable
- [x] **Tab: Brukere** — DataTable; role change dropdown (disabled for own row); confirmation dialogs for instructor→user, admin→user, admin→instructor demotions; toast messages per operation

### Instructor Dashboard
- [ ] `src/app/instructor/loading.tsx` — `SkeletonTable`
- [ ] `src/app/instructor/page.tsx` — server component fetches profile + courses
- [ ] **Tab: Profil** — edit bio, certifications, years experience, phone, photo upload
- [ ] **Tab: Mine Kurs** — DataTable; "Nytt kurs" dialog (date picker + HH:MM start/end time, spot Combobox, Oslo timezone ISO construction); edit/delete row actions (delete sends cancellation emails); view participants drawer/dialog with remove buttons

---

## Phase 10 — Polish & Deploy

- [ ] Add `loading.tsx` to all remaining routes (`/login`, etc.)
- [ ] Confirm all mutation buttons use `useTransition` + `isPending` spinner; dialog-close-then-toast sequence
- [ ] Mobile-first responsive audit: hamburger nav, touch targets, single-column card stacks, tap-friendly forms
- [ ] SEO meta tags in layout and key pages
- [ ] Connect GitHub repo to Vercel; configure project settings
- [ ] Set all environment variables in Vercel dashboard (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`)
- [ ] Run `supabase db push` against production Supabase project **(production Supabase project)**
- [ ] Configure Auth Hook in production Supabase Dashboard **(production Supabase project)**
- [ ] Bootstrap first admin in production via SQL Editor
- [ ] Verify Google OAuth redirect URIs include production domain
- [ ] Verify Resend sending domain for production `RESEND_FROM_EMAIL`
- [ ] Smoke test: sign in, enroll in course, access chat, send message, sign out
