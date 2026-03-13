Task: Implement Step 5 — Validation Schemas, Data Queries, and Email Templates (Phases 6/7/8)
Read these files first:

plan/checklist.md — progress tracker. Phases 1-5 are complete. Check off Phase 6 (schemas only), Phase 7, and Phase 8 items as you complete them.
plan/instructions.md — general workflow instructions.
plan/kite-club-full-plan.md — Section 6 (lines ~1100-1385) for queries and action signatures, Section 7 (lines ~1300-1385) for email templates.
plan/phased_plan.md — you are executing Step 5.
src/types/database.ts — generated Supabase types, use for all type references.
src/lib/supabase/server.ts — server Supabase client (async createClient with await cookies()).
src/lib/supabase/admin.ts — service role client (bypasses RLS, import 'server-only').
src/lib/supabase/client.ts — browser client.
src/lib/validations/user-sync.ts — existing Zod schema for reference on conventions.
What to build:

1. Zod Validation Schemas (Phase 6 — schemas only)
src/lib/validations/courses.ts — publishCourseSchema (with endTime > startTime refine)
src/lib/validations/spots.ts
src/lib/validations/instructors.ts
src/lib/validations/subscriptions.ts
2. Data Query Functions (Phase 7)
src/lib/queries/courses.ts — getCoursesForPublicPage() (future courses only, gte(new Date().toISOString())), getCoursesForAdmin() (all), getCoursesForInstructor() (lookup instructor ID first, filter by instructor_id)
src/lib/queries/instructors.ts — getInstructors() with joined users(*)
src/lib/queries/messages.ts — getMessages(courseId) with joined users(name, avatar_url), ordered by created_at
src/lib/queries/subscriptions.ts — getUserSubscription(userId) (own row); getAllSubscriberEmails() via service role client
src/lib/queries/spots.ts — getSpots() (all spots); getSpot(id)
src/lib/queries/users.ts — getAllUsers() via service role client (for admin Brukere tab)
3. Email Infrastructure (Phase 8)
src/lib/email/resend.ts — Resend client instance with import 'server-only'
src/lib/email/templates/new-course.tsx — subscriber notification (course title, date/time, instructor, price, spot link, enroll link)
src/lib/email/templates/enrollment-confirmation.tsx — user confirmation on enroll (course details, spot link, chat link)
src/lib/email/templates/course-cancellation.tsx — participant notification when course is deleted
Important conventions established by prior steps:

Project uses shadcn "base-nova" style with @base-ui/react. Button component does NOT support asChild — use buttonVariants from src/components/ui/button-variants.ts (no "use client") for Link styling, or Button from src/components/ui/button.tsx for real buttons.
v0-ui-inspiration/ folder exists at root as a design reference but is excluded from tsconfig.json — don't touch it.
All query functions should use the async server client from src/lib/supabase/server.ts except getAllSubscriberEmails() and getAllUsers() which need the admin client from src/lib/supabase/admin.ts.
Email templates use @react-email/components.
Env var for Resend: RESEND_API_KEY. Env var for from email: RESEND_FROM_EMAIL.
Run pnpm build when done to verify no TypeScript errors.
Do NOT build server actions (those come in Step 6). Only schemas, queries, and email templates. After completing each item, check it off in plan/checklist.md