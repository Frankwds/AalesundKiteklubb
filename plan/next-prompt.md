Task: Implement Step 9 — Course Chat (Realtime)

Read these files first:

plan/checklist.md — progress tracker. Phases 1–8 and Phase 9 (Front Page, Spots, Courses) are complete. Build the Course Chat items and check them off as you complete them.
plan/instructions.md — general workflow instructions.
plan/kite-club-full-plan.md — Section 5d (lines ~1073–1087) for the course chat spec, Section 6 (lines ~1291–1316) for Realtime subscription and profile cache details, Section 8 (lines ~1398) for the chat component list (ChatWindow, MessageBubble, MessageInput), Section 9 (lines ~1434–1494) for the design system. Also read lines ~1420–1431 for the form submission pending-state and toast conventions.

Files you must read before writing any code:

src/app/layout.tsx — root layout with panorama background, off-white content card, Navbar, Footer, Sonner toast provider. Content is rendered inside a `max-w-6xl` container with `bg-[#FAFAF8]` card.
src/app/courses/page.tsx — courses page server component (pattern reference for how server components pass data to client components).
src/components/courses/courses-page-client.tsx — client component that reads `?error=not_enrolled` from URL search params and shows a toast. The chat page redirect sends users here with this param.
src/components/courses/course-card.tsx — has the "Chat" button linking to `/courses/[id]/chat`. Note: currently `showChat` is only based on `isEnrolled`. The plan says chat should also be visible to the course instructor and admins — you may fix this as part of this step if you want, or leave it as-is (the chat page itself does the full access check).
src/lib/supabase/client.ts — browser Supabase client (used for Realtime subscription on the client side).
src/lib/supabase/server.ts — server Supabase client (used in the page server component).
src/lib/supabase/admin.ts — service role client (bypasses RLS — use only where documented).
src/lib/auth/index.ts — `getCurrentUser()` returns `{ id, email, name, avatarUrl, role }` or null. Role is `'user' | 'instructor' | 'admin'`.
src/lib/queries/messages.ts — `getMessages(courseId)` returns messages with joined `users(name, avatar_url)`, ordered by `created_at`.
src/lib/actions/messages.ts — `sendMessage(courseId, content)` server action. Returns `{ success, error? }`.
src/lib/utils/date.ts — `formatTime(d)` returns `"14:30"` in Europe/Oslo timezone. Use this for chat message timestamps.
src/lib/utils.ts — `cn()` for merging Tailwind classes.
src/components/ui/avatar.tsx — shadcn Avatar using @base-ui/react. Exports: `Avatar`, `AvatarImage`, `AvatarFallback`. Use `size="sm"` for chat bubbles.
src/components/ui/skeletons.tsx — exports `SkeletonSpinner`. Use or create a chat-specific skeleton in `loading.tsx`.
src/components/ui/button.tsx — shadcn Button.
src/proxy.ts — middleware. Chat routes (`/courses/*/chat`) only check authentication. Enrollment/instructor/admin check happens at the page level.
src/types/database.ts — full DB types. Message row: `id`, `course_id`, `user_id` (nullable — null means deleted user), `content`, `created_at`. Course row has `instructor_id`.

What to build (2 page files + 3-4 components):

1. src/app/courses/[id]/chat/loading.tsx
   - Chat-specific skeleton: a column of message-like skeleton rows (e.g. 8 rows, each with a small circle skeleton for avatar + two line skeletons for name/content) plus a skeleton input bar at the bottom.
   - Keep it simple and lightweight.

2. src/app/courses/[id]/chat/page.tsx — Server component
   - In Next.js 15, `params` is a Promise — await it: `const { id } = await params`.
   - Call `getCurrentUser()`. If not logged in, redirect to `/login`.
   - **Page-level access check:** The user must be one of:
     (a) Enrolled in the course: query `course_participants` for a row where `user_id = user.id` AND `course_id = id`.
     (b) The course instructor: query `courses` for this course, then check if `courses.instructor_id` matches the user's instructor record (query `instructors` where `user_id = user.id`).
     (c) An admin: `user.role === 'admin'`.
   - If none apply → `redirect('/courses?error=not_enrolled')`.
   - **Fetch data for the client component:**
     - `getMessages(id)` — initial messages with joined user data.
     - Fetch the course row (for the title and `instructor_id`).
     - Fetch the instructor's user profile: `instructors → users(id, name, avatar_url)` for the course's `instructor_id`. This is needed because the instructor may not have a message in the chat yet, and RLS on `users` is limited to co-participants — the server component can fetch this and pass it down.
   - Pass everything to: `<ChatClient courseId={id} courseTitle={course.title} initialMessages={messages} currentUser={user} instructorProfile={instructorProfile} />`.
   - Add metadata: `title: "[Course Title] — Chat"` (dynamic, based on fetched course data).

3. src/components/chat/chat-client.tsx — `"use client"` — Main chat client component
   - Props: `courseId`, `courseTitle`, `initialMessages`, `currentUser` (CurrentUser), `instructorProfile` ({ id: string, name: string | null, avatar_url: string | null } | null).
   - **Profile cache:** Build a `Map<string, { name: string | null; avatarUrl: string | null }>` seeded from:
     (a) All unique users from `initialMessages` (from the joined `users` data).
     (b) The `instructorProfile` (so the instructor's name/avatar is available even if they haven't sent a message yet).
   - Use `useRef` for the profile cache (it's mutable, doesn't need to trigger re-renders).
   - **Messages state:** `useState` initialized from `initialMessages`.
   - **Realtime subscription:** `useEffect` that creates a Supabase browser client channel:
     ```
     const channel = supabase.channel(`chat-${courseId}`)
       .on('postgres_changes', {
         event: 'INSERT',
         schema: 'public',
         table: 'messages',
         filter: `course_id=eq.${courseId}`,
       }, async (payload) => { ... })
       .subscribe()
     ```
     On INSERT payload:
     - If `payload.new.user_id` is null → append with "Slettet bruker" label and default avatar (no fetch).
     - If `payload.new.user_id` is in the profile cache → append immediately with cached profile.
     - Else → append with a temporary placeholder ("..." name), fetch the user on demand via `supabase.from('users').select('name, avatar_url').eq('id', payload.new.user_id).single()`, update the cache, and update the message in state. If fetch fails → use "Ukjent bruker" with default avatar.
     Cleanup: `return () => { supabase.removeChannel(channel) }`.
   - **Auto-scroll:** Use a ref on the message container. After messages state updates, scroll to bottom. Use `useEffect` with `[messages]` dependency. Only auto-scroll if the user is already near the bottom (within ~100px), to avoid disrupting manual scrolling.
   - **Layout:** A full-height flex column:
     - Header bar: course title, back link (← to `/courses`).
     - Messages area: scrollable, takes remaining space (`flex-1 overflow-y-auto`).
     - Input bar: fixed at the bottom of the chat area.

4. src/components/chat/message-bubble.tsx — `MessageBubble`
   - Props: `message` (the message row), `profile` ({ name: string | null; avatarUrl: string | null } | null), `isOwnMessage` (boolean).
   - Displays: avatar (using shadcn Avatar component with `size="sm"`), name, message content, timestamp (`formatTime(message.created_at)`).
   - **Own messages** (right-aligned, blue background `bg-sky-100`) vs **others** (left-aligned, white/gray background).
   - For null `user_id`: show "Slettet bruker" with a neutral avatar fallback.
   - For placeholder while fetching: show "..." with a neutral avatar fallback.
   - Avatar fallback: first letter of name (uppercase), or "?" if no name.

5. src/components/chat/message-input.tsx — `MessageInput`
   - Props: `courseId` (string).
   - A form with a text input and a send button.
   - On submit: use `useTransition` to call `sendMessage(courseId, content)`. While pending, disable the send button and show a spinner (`Loader2`). On success: clear the input. On error: show `toast.error(result.error)`.
   - No optimistic UI in v1 — the message appears when Realtime fires the INSERT event.
   - Input: autofocus, placeholder "Skriv en melding...", submit on Enter (but Shift+Enter for newline is optional — can use a simple single-line input for v1).
   - Send button: icon-only (`Send` icon from lucide-react) or text "Send".

Design guidelines:

- Mobile-first: the chat should work well on mobile. Full-height layout that uses available viewport space.
- Use the existing design system: off-white page background (`bg-[#FAFAF8]`), sky-600/sky-800 blue accents, Inter font.
- Message bubbles: compact, with small avatars. Own messages on the right with blue tint, others on the left with white/light gray.
- Input bar: sticky at the bottom, with a border-top separator. Padding that matches the rest of the app.
- Keep the chat area clean and readable. No excessive decoration.
- Use lucide-react icons: `ArrowLeft` (back), `Send` (send button), `Loader2` (spinner), `MessageCircle` (empty state).
- All mutation buttons (send) must use `useTransition` + `isPending` for pending state.
- Toast import: `import { toast } from "sonner"`.

Important conventions:

- The Supabase browser client (`src/lib/supabase/client.ts`) is used for the Realtime subscription. Import: `import { createClient } from "@/lib/supabase/client"`.
- The server client is used in `page.tsx` for data fetching and access checks.
- RLS on `messages` ensures users only receive Realtime events for courses they're enrolled in (or are instructor/admin of). The Realtime subscription respects RLS.
- `getMessages(courseId)` returns `data` typed as `{ id, course_id, user_id, content, created_at, users: { name, avatar_url } | null }[]`. The `users` relation is null when `user_id` is null (deleted user).
- `sendMessage` does NOT call `revalidatePath` — live updates are handled by Realtime.
- In Next.js 15 App Router, `params` is a Promise that must be awaited.
- The `course_participants` table has `user_id` and `course_id` columns. Query: `supabase.from('course_participants').select('id').eq('user_id', userId).eq('course_id', courseId).maybeSingle()`.
- The `courses` table has `instructor_id` (references `instructors.id`, NOT `users.id`). To check if the current user is the instructor: first get their instructor row from `instructors` where `user_id = currentUserId`, then compare `instructor.id` with `course.instructor_id`.
- The Dialog component in this project uses @base-ui/react, not Radix.

Known issue to optionally fix:

In `src/components/courses/course-card.tsx`, the Chat button visibility (`showChat`) is currently only based on `isEnrolled`. According to the plan (Section 5c), it should also be visible when `user.role === 'instructor' || user.role === 'admin'`. You may update this while working on the chat feature — it's a one-line change: `const showChat = isEnrolled || user?.role === 'instructor' || user?.role === 'admin'`.

Run `pnpm build` when done to verify no TypeScript errors.
After completing each item, check it off in plan/checklist.md (Phase 9, Course Chat section).
