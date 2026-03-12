-- 0002_rls_policies.sql
-- Enable RLS on all 7 tables + 33 policies

-- ============================================================
-- USERS (4 policies)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Co-participants can read profile fields" ON public.users
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.course_participants cp1
      WHERE cp1.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.course_participants cp2
        WHERE cp2.course_id = cp1.course_id AND cp2.user_id = users.id
      )
    )
  );

CREATE POLICY "Instructors can read users in own courses" ON public.users
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.course_participants cp
      JOIN public.courses c ON c.id = cp.course_id
      JOIN public.instructors i ON i.id = c.instructor_id
      WHERE i.user_id = auth.uid() AND cp.user_id = users.id
    )
  );

CREATE POLICY "Admin full access users" ON public.users
  FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin')
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin');

-- ============================================================
-- INSTRUCTORS (4 policies)
-- ============================================================
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view instructor profiles" ON public.instructors
  FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated can view instructor profiles" ON public.instructors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Instructors can update own profile" ON public.instructors
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin full access instructors" ON public.instructors
  FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin')
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin');

-- ============================================================
-- COURSES (6 policies)
-- ============================================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view courses" ON public.courses
  FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated can view courses" ON public.courses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Instructors can insert own courses" ON public.courses
  FOR INSERT TO authenticated WITH CHECK (
    instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid())
  );

CREATE POLICY "Instructors can update own courses" ON public.courses
  FOR UPDATE TO authenticated
  USING (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()))
  WITH CHECK (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

CREATE POLICY "Instructors can delete own courses" ON public.courses
  FOR DELETE TO authenticated
  USING (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

CREATE POLICY "Admin full access courses" ON public.courses
  FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin')
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin');

-- ============================================================
-- COURSE PARTICIPANTS (7 policies)
-- ============================================================
ALTER TABLE public.course_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments" ON public.course_participants
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Instructors can view their course participants" ON public.course_participants
  FOR SELECT TO authenticated USING (
    course_id IN (
      SELECT id FROM public.courses
      WHERE instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Participants can see co-participants in same course" ON public.course_participants
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.course_participants my
      WHERE my.user_id = auth.uid() AND my.course_id = course_participants.course_id
    )
  );

CREATE POLICY "Users can enroll themselves" ON public.course_participants
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unenroll themselves" ON public.course_participants
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Instructors can remove participants from their courses" ON public.course_participants
  FOR DELETE TO authenticated USING (
    course_id IN (
      SELECT id FROM public.courses
      WHERE instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admin full access course_participants" ON public.course_participants
  FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin')
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin');

-- ============================================================
-- MESSAGES (5 policies)
-- ============================================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course participants can read messages" ON public.messages
  FOR SELECT TO authenticated USING (
    course_id IN (SELECT course_id FROM public.course_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Instructors can read messages in own courses" ON public.messages
  FOR SELECT TO authenticated USING (
    course_id IN (
      SELECT id FROM public.courses
      WHERE instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Course participants can send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid() AND
    course_id IN (SELECT course_id FROM public.course_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Instructors can send messages in own courses" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid() AND
    course_id IN (
      SELECT id FROM public.courses
      WHERE instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admin full access messages" ON public.messages
  FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin')
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin');

-- ============================================================
-- SUBSCRIPTIONS (4 policies)
-- ============================================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can create own subscription" ON public.subscriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own subscription" ON public.subscriptions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admin full access subscriptions" ON public.subscriptions
  FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin')
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin');

-- ============================================================
-- SPOTS (3 policies)
-- ============================================================
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view spots" ON public.spots
  FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated can view spots" ON public.spots
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin full access spots" ON public.spots
  FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin')
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin');
