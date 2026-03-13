-- Fix infinite recursion in course_participants RLS policy.
-- The "Participants can see co-participants" policy references course_participants
-- inside its own USING clause, triggering recursive RLS evaluation (error 42P17).
-- Solution: use a SECURITY DEFINER function to bypass RLS in the membership check.

CREATE OR REPLACE FUNCTION public.is_course_participant(p_user_id uuid, p_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.course_participants
    WHERE user_id = p_user_id AND course_id = p_course_id
  );
$$;

DROP POLICY IF EXISTS "Participants can see co-participants in same course" ON public.course_participants;

CREATE POLICY "Participants can see co-participants in same course" ON public.course_participants
  FOR SELECT TO authenticated USING (
    public.is_course_participant(auth.uid(), course_id)
  );
