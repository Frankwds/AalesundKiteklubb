---
name: Phased Build Execution Plan
overview: Break the validated full-plan into 11 distinct, sequential build steps. Each step is scoped so a single agent can complete it within one context window, followed by human testing before the next agent picks up.
todos:
  - id: step-01
    content: "Step 1: Project Scaffold and Configuration (Phase 2) -- Next.js init, deps, Supabase clients, env config, next.config.ts"
    status: completed
  - id: step-02
    content: "Step 2: Database Migrations (Phase 3) -- 7 SQL migration files: schema, RLS, triggers, JWT hook, Realtime, storage, RPCs"
    status: completed
  - id: step-03
    content: "Step 3: Authentication and Middleware (Phase 4) -- OAuth callback, JWT decode, auth helpers, middleware route guards, login page"
    status: pending
  - id: step-04
    content: "Step 4: Design System, Root Layout and Shared Components (Phase 5) -- Tailwind tokens, layout, navbar, footer, skeletons, error/404 pages"
    status: pending
  - id: step-05
    content: "Step 5: Validation Schemas, Data Queries and Email Templates (Phases 6/7/8) -- Zod schemas, all query functions, Resend client, 3 email templates"
    status: pending
  - id: step-06
    content: "Step 6: Server Actions (Phase 6) -- courses, instructors, messages, subscriptions, spots, users, auth actions"
    status: pending
  - id: step-07
    content: "Step 7: Front Page and Spots Pages (Phase 9) -- hero, about, spots listing with filters, spot detail with wind compass"
    status: pending
  - id: step-08
    content: "Step 8: Courses Page and Subscriptions (Phase 9) -- course cards, enroll/unenroll, subscribe/unsubscribe, chat button visibility"
    status: pending
  - id: step-09
    content: "Step 9: Course Chat (Phase 9) -- Realtime chat, access gating, ChatWindow, MessageBubble, MessageInput, profile cache"
    status: pending
  - id: step-10
    content: "Step 10: Admin Dashboard (Phase 9) -- 5 tabs: Instruktorer, Kurs, Spotter, Abonnenter, Brukere with full CRUD"
    status: pending
  - id: step-11
    content: "Step 11: Instructor Dashboard and Polish (Phases 9/10) -- profile edit, course CRUD, responsive audit, loading states, SEO"
    status: pending
isProject: false
---

# Phased Build Execution Plan -- Ålesund Kiteklubb

The full implementation is divided into **11 sequential steps**. Each step is designed to:

- Be completable by a single agent in one context window
- Produce a testable artifact for human validation
- Have a clear handoff boundary for the next agent

Reference documents:

- [kite-club-full-plan.md](kite-club-full-plan.md) -- full implementation spec (~1664 lines)
- [checklist.md](checklist.md) -- progress tracker (Phases 1--10)

---

## Step 1: Project Scaffold and Configuration

**Checklist phase:** Phase 2  
**Plan sections:** Section 1 (Project Scaffolding), lines 196--290

**What the agent does:**

- Run `npx create-next-app@latest . --typescript --tailwind --app --src-dir --use-pnpm`
- Install runtime deps: `@supabase/supabase-js`, `@supabase/ssr`, `resend`, `@react-email/components`, `sonner`, `zod`
- Install dev dep: `supabase` CLI
- Init shadcn/ui (`pnpm dlx shadcn@latest init`)
- Create `src/lib/supabase/client.ts` -- browser client with `Database` type import
- Create `src/lib/supabase/server.ts` -- async server client (Next.js 15 async `cookies()` + `getAll`/`setAll`)
- Create `src/lib/supabase/middleware.ts` -- session refresh helper using `request.cookies`/`response.cookies`
- Create `src/lib/supabase/admin.ts` -- service role client with `import 'server-only'`
- Create `.env.local.example` with all 6 env vars
- Configure `next.config.ts` -- `images.remotePatterns` for Supabase Storage
- Add `db:push`, `db:types`, `db:sync` scripts to `package.json`
- Create placeholder `src/types/database.ts` (empty `Database` type so imports resolve until types are generated)

**Files created:** ~10 files  
**Agent input context:** Point agent to [kite-club-full-plan.md](kite-club-full-plan.md) lines 196--290 and the Phase 2 section of [checklist.md](checklist.md).

**Human validation:**

- `pnpm dev` starts without errors
- All Supabase client files exist and compile
- `.env.local.example` lists all required vars
- `package.json` has db scripts

---

## Step 2: Database Migrations

**Checklist phase:** Phase 3  
**Plan sections:** Section 2 (Database Schema), lines 292--870

**What the agent does:**

- Run `supabase init` (creates `supabase/` directory)
- Write 7 SQL migration files in `supabase/migrations/`:
  - `0001_initial_schema.sql` -- enums (`user_role`, `season`, `skill_level`) + 7 tables (`users`, `instructors`, `courses`, `course_participants`, `messages`, `subscriptions`, `spots`)
  - `0002_rls_policies.sql` -- enable RLS on all tables + 33 policies
  - `0003_user_sync_trigger.sql` -- `handle_new_user()` + `handle_user_deleted()` triggers on `auth.users`
  - `0004_custom_jwt_hook.sql` -- `custom_access_token_hook()` with SECURITY DEFINER, grants, and revokes
  - `0005_realtime_messages.sql` -- add `messages` to Realtime publication
  - `0006_storage_buckets.sql` -- `spot-maps` + `instructor-photos` buckets with storage RLS
  - `0007_promote_demote_rpcs.sql` -- 4 RPCs: `promote_to_instructor`, `promote_to_admin`, `demote_to_user`, `demote_admin_to_instructor`

**Files created:** 7 SQL files  
**Agent input context:** Point agent to [kite-club-full-plan.md](kite-club-full-plan.md) Section 2 (lines 292--870). This section contains complete SQL for every migration.

**Human validation:**

- Run `supabase link` (manual, requires Supabase project)
- Run `supabase db push` -- all migrations apply cleanly
- Configure Auth Hook in Supabase Dashboard
- Run `pnpm db:types` -- `src/types/database.ts` is generated with real types
- Bootstrap first admin via SQL Editor

---

## Step 3: Authentication and Middleware

**Checklist phase:** Phase 4  
**Plan sections:** Section 3 (Authentication), lines 872--1060

**What the agent does:**

- Create `src/lib/validations/user-sync.ts` -- `UserSyncSchema` (id, email, name, avatar_url only)
- Create `src/app/auth/callback/route.ts` -- exchange code for session, upsert `public.users` via service role client with Zod whitelist, redirect to `/`
- Create `src/lib/auth/decode-jwt.ts` -- Edge-safe base64url to JSON decoder (no Node.js `Buffer`)
- Create `src/lib/auth/index.ts` -- `getCurrentUser()` using `getSession()` + JWT decode for `user_role`
- Create `src/middleware.ts` -- call `updateSession()`, read JWT for role, apply route guards (`/admin/`* admin-only, `/instructor/*` instructor/admin, `/courses/*/chat` authenticated)
- Create `src/app/login/page.tsx` -- "Sign in with Google" button using Supabase `signInWithOAuth`

**Files created:** ~6 files  
**Agent input context:** Point agent to [kite-club-full-plan.md](kite-club-full-plan.md) Section 3 (lines 872--1060) and Phase 4 of [checklist.md](checklist.md). Agent should also read existing `src/lib/supabase/` files from Step 1.

**Human validation:**

- Click "Sign in with Google" -- redirects to Google, then back to `/`
- Check Supabase `public.users` table -- row created with correct data
- Try accessing `/admin` as regular user -- redirected away
- Log out and back in -- session persists correctly

---

## Step 4: Design System, Root Layout and Shared Components

**Checklist phase:** Phase 5  
**Plan sections:** Section 8 (UI Components, lines 1390--1445), Section 9 (Design System, lines 1447--1500)

**What the agent does:**

- Set up Tailwind design tokens: blue palette (`sky-600`, `sky-800`), off-white (`#FAFAF8`), Inter font via `next/font`
- Create `src/lib/utils/date.ts` -- `formatDate`, `formatDateTime`, `formatTime`, `formatCourseTime`, `todayOsloISO` (all `Europe/Oslo`, `nb-NO`)
- Create `src/lib/logger.ts` -- `log()` and `logError()` structured console output
- Create `src/app/layout.tsx` -- root layout with panorama background, off-white content card, sticky navbar, footer, `<Sonner />` toast provider
- Build `Navbar` component -- sticky top, centered items; hamburger + full-screen overlay on mobile; horizontal on desktop. Auth-aware (login/logout, role-conditional links)
- Build `Footer` component
- Build `ContentCard` component -- off-white card over panorama background
- Create `src/app/loading.tsx` -- global skeleton spinner
- Create `src/app/error.tsx` -- global error boundary with retry button
- Create `src/app/not-found.tsx` -- custom 404 page
- Create `src/components/ui/skeletons.tsx` -- `SkeletonCard`, `SkeletonTable`, `SkeletonDetail`, `SkeletonSpinner`
- Add any needed shadcn/ui components (`Button`, `Card`, `Dialog`, `Tabs`, etc.)

**Files created:** ~12 files  
**Agent input context:** Point agent to [kite-club-full-plan.md](kite-club-full-plan.md) Sections 8--9 and Phase 5 of [checklist.md](checklist.md). Agent should also read existing layout/component structure from previous steps.

**Human validation:**

- App shows panorama background with off-white content card
- Navbar is sticky, responsive (hamburger on mobile, horizontal on desktop)
- Footer renders
- Loading state shows skeleton spinner
- `/nonexistent` shows 404 page
- Design tokens (blue palette, Inter font, off-white) applied correctly

---

## Step 5: Validation Schemas, Data Queries and Email Templates

**Checklist phases:** Phase 6 (schemas only), Phase 7, Phase 8  
**Plan sections:** Section 6 (lines 1100--1385) for queries; Section 7 (lines 1300--1385) for email

**What the agent does:**

- Create Zod validation schemas:
  - `src/lib/validations/courses.ts` -- `publishCourseSchema` (with `endTime > startTime` refine)
  - `src/lib/validations/spots.ts`
  - `src/lib/validations/instructors.ts`
  - `src/lib/validations/subscriptions.ts`
- Create data query functions:
  - `src/lib/queries/courses.ts` -- `getCoursesForPublicPage()`, `getCoursesForAdmin()`, `getCoursesForInstructor()`
  - `src/lib/queries/instructors.ts` -- `getInstructors()` with joined `users(*)`
  - `src/lib/queries/messages.ts` -- `getMessages(courseId)` with joined user data
  - `src/lib/queries/subscriptions.ts` -- `getUserSubscription(userId)`, `getAllSubscriberEmails()`
  - `src/lib/queries/spots.ts` -- `getSpots()`, `getSpot(id)`
  - `src/lib/queries/users.ts` -- `getAllUsers()` via service role client
- Create email infrastructure:
  - `src/lib/email/resend.ts` -- Resend client instance with `import 'server-only'`
  - `src/lib/email/templates/new-course.tsx` -- subscriber notification
  - `src/lib/email/templates/enrollment-confirmation.tsx` -- user enrollment confirmation
  - `src/lib/email/templates/course-cancellation.tsx` -- cancellation notification

**Files created:** ~14 files  
**Agent input context:** Point agent to [kite-club-full-plan.md](kite-club-full-plan.md) Sections 6--7 and Phases 6--8 of [checklist.md](checklist.md). Agent must read `src/types/database.ts` for type references and existing Supabase client files.

**Human validation:**

- All files compile without TypeScript errors
- No lint errors
- Query functions use correct Supabase SDK patterns (`.select()`, `.eq()`, joins)
- Email templates render properly (can preview with `@react-email/components`)

---

## Step 6: Server Actions

**Checklist phase:** Phase 6 (actions)  
**Plan sections:** Section 6 (Server Actions subsection, lines 1100--1290)

**What the agent does:**

- Create `src/lib/actions/courses.ts`:
  - `publishCourse` -- Zod validate, insert, notify subscribers via `Promise.allSettled` + single retry
  - `enrollInCourse` -- capacity check, insert, handle 23505 duplicate, send confirmation email
  - `unenrollFromCourse` -- delete own participation
  - `updateCourse` -- update own course
  - `deleteCourse` -- fetch participant emails, send cancellation emails, delete course
- Create `src/lib/actions/instructors.ts` -- `promoteToInstructor`, `promoteToAdmin`, `demoteToUser`, `demoteAdminToInstructor`, `updateInstructorProfile` (with photo upload)
- Create `src/lib/actions/messages.ts` -- `sendMessage`
- Create `src/lib/actions/subscriptions.ts` -- `subscribe`, `unsubscribe`
- Create `src/lib/actions/spots.ts` -- `createSpot` (create + upload + update URL, rollback on failure), `updateSpot`, `deleteSpot`
- Create `src/lib/actions/users.ts` -- re-export role-change RPCs
- Create `src/lib/actions/auth.ts` -- `signOut`, `deleteAccount` (implemented but no UI entry point in v1)

All actions follow the pattern: (1) Zod validation, (2) early return on failure, (3) `await createClient()`, (4) DB operations, (5) `revalidatePath()`.

**Files created:** ~7 files  
**Agent input context:** Point agent to [kite-club-full-plan.md](kite-club-full-plan.md) Section 6 (Server Actions) and Phase 6 of [checklist.md](checklist.md). Agent must read existing validation schemas (`src/lib/validations/`), queries (`src/lib/queries/`), email templates (`src/lib/email/`), and Supabase clients.

**Human validation:**

- All files compile without TypeScript errors
- No lint errors
- Actions use correct pattern (Zod -> early return -> createClient -> DB -> revalidatePath)
- Email sending is wired up in `publishCourse`, `enrollInCourse`, `deleteCourse`

---

## Step 7: Front Page and Spots Pages

**Checklist phase:** Phase 9 (partial)  
**Plan sections:** Section 5a (Front Page, lines 1060--1080), Section 5b (Spots, lines 1080--1165)

**What the agent does:**

- Create `src/app/page.tsx` -- hero section with Giske panorama background + club name, about section, Facebook/chat links
- Create `src/app/spots/loading.tsx` -- `SkeletonCard` grid
- Create `src/app/spots/page.tsx` -- filter drawer (season, area, wind direction with URL param sync), spot card grid, empty state
- Create `src/app/spots/[id]/loading.tsx` -- `SkeletonDetail`
- Create `src/app/spots/[id]/page.tsx` -- wind compass, description, map image, Yr link, Google Maps link (null guards), skill level + notes, water type badges
- Build components: `SpotCard`, `SpotList`, `SpotFilters`, `WindCompass`

**Files created:** ~10 files  
**Agent input context:** Point agent to [kite-club-full-plan.md](kite-club-full-plan.md) Sections 5a--5b and Phase 9 (Front Page + Spots) of [checklist.md](checklist.md). Agent should read the layout, design system, queries, and component files.

**Human validation:**

- Front page renders with hero, about section, and links
- `/spots` shows spot cards (or empty state if no data)
- Filters update URL params and filter the list
- `/spots/[id]` shows wind compass, description, map, links
- Mobile responsive: single-column cards, touch-friendly filters

---

## Step 8: Courses Page and Subscriptions

**Checklist phase:** Phase 9 (partial)  
**Plan sections:** Section 5c (Courses, lines 1165--1250)

**What the agent does:**

- Create `src/app/courses/loading.tsx` -- `SkeletonCard` grid
- Create `src/app/courses/page.tsx`:
  - Intro section
  - Course card list (instructor, date/time via `formatCourseTime`, spot link, price; null-guards for `instructor_id` and `spot_id`)
  - Enroll / unenroll buttons with confirmation dialogs (display-only email field in enroll dialog)
  - "Chat" button visible only when enrolled / instructor / admin
  - Empty state with subscribe CTA
  - Subscribe / unsubscribe section (login required, confirmation dialogs)
  - Read `?error=not_enrolled` param and show toast
- Build course-related components: `CourseCard`, `CourseList`, `EnrollDialog`, `SubscribeSection`

**Files created:** ~8 files  
**Agent input context:** Point agent to [kite-club-full-plan.md](kite-club-full-plan.md) Section 5c and Phase 9 (Courses) of [checklist.md](checklist.md). Agent should read existing queries, actions, layout, and component conventions.

**Human validation:**

- `/courses` shows course cards with instructor, date, spot, price
- Enroll dialog works (with display-only email field)
- Unenroll dialog works
- Subscribe/unsubscribe section works (requires login)
- "Chat" button appears only for enrolled users/instructors/admins
- `?error=not_enrolled` triggers toast
- Empty state shows subscribe CTA

---

## Step 9: Course Chat

**Checklist phase:** Phase 9 (partial)  
**Plan sections:** Section 5d (Course Chat, lines 1250--1310)

**What the agent does:**

- Create `src/app/courses/[id]/chat/loading.tsx` -- skeleton for message list
- Create `src/app/courses/[id]/chat/page.tsx`:
  - Page-level access check (enrolled OR instructor OR admin); redirect with `?error=not_enrolled` if not
  - Server-side: fetch initial messages with joined user data; fetch instructor profile
  - Pass seed data to client component
- Build `ChatWindow` -- append-only message log, newest at bottom, auto-scroll
- Build `MessageBubble` -- avatar, name, timestamp via `formatTime`
- Build `MessageInput` -- form calling `sendMessage` action; no optimistic UI in v1
- Supabase Realtime subscription (`postgres_changes` on `messages` filtered by `course_id`)
- Profile cache: seed from initial messages + instructor; on-demand fetch on cache miss; "Ukjent bruker" placeholder; "Slettet bruker" for null `user_id`

**Files created:** ~6 files  
**Agent input context:** Point agent to [kite-club-full-plan.md](kite-club-full-plan.md) Section 5d and Phase 9 (Course Chat) of [checklist.md](checklist.md). Agent should read existing Supabase client, message queries/actions, auth helpers, and date utilities.

**Human validation:**

- Non-enrolled users are redirected away from chat
- Messages load on page open (server-rendered)
- Sending a message works and appears in the log
- Realtime: messages from another session appear without refresh
- Auto-scroll to newest message on new messages
- Deleted user messages show "Slettet bruker"

---

## Step 10: Admin Dashboard

**Checklist phase:** Phase 9 (partial)  
**Plan sections:** Section 5e (Admin Dashboard, lines 1310--1395)

**What the agent does:**

- Create `src/app/admin/loading.tsx` -- `SkeletonTable`
- Create `src/app/admin/page.tsx` -- server component fetches all tab data upfront; passes as props
- Build **Tab: Instruktorer** -- DataTable; "Legg til instruktor" dialog (user search/select, excludes existing instructors); remove action with confirmation
- Build **Tab: Kurs** -- DataTable with "Kommende"/"Tidligere" tags; delete action (confirmation + cancellation emails); view participants dialog with remove buttons
- Build **Tab: Spotter** -- DataTable with season/area filters; "Ny spot" dialog; edit/delete row actions
- Build **Tab: Abonnenter** -- read-only DataTable
- Build **Tab: Brukere** -- DataTable; role change dropdown (disabled for own row); confirmation dialogs for demotions; toast messages per operation

**Files created:** ~12 files  
**Agent input context:** Point agent to [kite-club-full-plan.md](kite-club-full-plan.md) Section 5e and Phase 9 (Admin Dashboard) of [checklist.md](checklist.md). Agent should read existing queries, actions, components, and shadcn/ui setup.

**Human validation:**

- `/admin` only accessible to admin users
- All 5 tabs render with correct data
- Instruktorer: can add/remove instructors
- Kurs: can delete courses (sends cancellation emails), view/remove participants
- Spotter: full CRUD with image upload
- Brukere: role changes work with confirmation dialogs
- Abonnenter: read-only list renders

---

## Step 11: Instructor Dashboard and Polish

**Checklist phases:** Phase 9 (partial), Phase 10  
**Plan sections:** Section 5f (Instructor Dashboard, lines 1395--1445), Section 10 (Deployment, lines 1500--1530)

**What the agent does:**

- Create `src/app/instructor/loading.tsx` -- `SkeletonTable`
- Create `src/app/instructor/page.tsx` -- server component fetches profile + courses
- Build **Tab: Profil** -- edit bio, certifications, years experience, phone, photo upload
- Build **Tab: Mine Kurs** -- DataTable; "Nytt kurs" dialog (date picker, HH:MM start/end, spot Combobox, Oslo timezone ISO construction); edit/delete row actions; view participants drawer/dialog with remove buttons
- Add `loading.tsx` to any remaining routes (`/login`, etc.)
- Ensure all mutation buttons use `useTransition` + `isPending` spinner; dialog-close-then-toast sequence
- Mobile-first responsive audit: hamburger nav, touch targets, single-column card stacks
- SEO meta tags in layout and key pages

**Files created:** ~10 files  
**Agent input context:** Point agent to [kite-club-full-plan.md](kite-club-full-plan.md) Sections 5f and 10, plus Phase 9 (Instructor Dashboard) and Phase 10 of [checklist.md](checklist.md). Agent should read existing admin dashboard code for pattern consistency.

**Human validation:**

- `/instructor` only accessible to instructors/admins
- Profile edit works with photo upload
- Course creation works with date/time pickers and spot selection
- Course edit/delete works (delete sends cancellation emails)
- Participant view/remove works
- All pages responsive on mobile
- Loading states present on all routes
- SEO meta tags in page source

---

## Deployment (Manual -- not an agent step)

After Step 11, the human completes:

- Connect GitHub repo to Vercel
- Set all 6 environment variables in Vercel dashboard
- Run `supabase db push` against production Supabase project
- Configure Auth Hook in production
- Bootstrap first admin in production
- Verify Google OAuth redirect URIs include production domain
- Verify Resend sending domain
- Smoke test the full flow

---

## Summary of Agent Handoff Protocol

Each agent receives:

1. **This plan** -- to understand which step they are executing
2. **The relevant sections of [kite-club-full-plan.md](kite-club-full-plan.md)** -- for detailed implementation specs (line numbers given above)
3. **The [checklist.md](checklist.md)** -- to check off completed items
4. **Instruction to read existing code** -- to understand conventions established by prior agents

After each step, the human:

1. Tests the validation criteria listed above
2. Fixes any issues or asks the agent to fix them
3. Commits the working state
4. Starts a new agent for the next step, providing this plan and the step number

