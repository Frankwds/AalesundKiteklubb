-- 0007_promote_demote_rpcs.sql
-- Atomic promote/demote functions called via supabase.rpc()

CREATE OR REPLACE FUNCTION public.promote_to_instructor(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  current_role text;
BEGIN
  IF (current_setting('request.jwt.claims', true)::jsonb)->>'user_role' != 'admin' THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;

  SELECT role INTO current_role FROM users WHERE id = p_user_id;
  IF current_role = 'admin' THEN
    RAISE EXCEPTION 'Cannot change an admin role via promotion';
  END IF;

  INSERT INTO instructors (user_id) VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  UPDATE users SET role = 'instructor' WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.promote_to_admin(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  IF (current_setting('request.jwt.claims', true)::jsonb)->>'user_role' != 'admin' THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;

  INSERT INTO instructors (user_id) VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  UPDATE users SET role = 'admin' WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.demote_to_user(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  admin_count int;
BEGIN
  IF (current_setting('request.jwt.claims', true)::jsonb)->>'user_role' != 'admin' THEN
    RAISE EXCEPTION 'Only admins can demote users';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;

  SELECT count(*) INTO admin_count FROM users WHERE role = 'admin';
  IF admin_count <= 1 AND EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Cannot demote the last admin';
  END IF;

  DELETE FROM instructors WHERE user_id = p_user_id;
  UPDATE users SET role = 'user' WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.demote_admin_to_instructor(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  admin_count int;
BEGIN
  IF (current_setting('request.jwt.claims', true)::jsonb)->>'user_role' != 'admin' THEN
    RAISE EXCEPTION 'Only admins can change roles';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;

  SELECT count(*) INTO admin_count FROM users WHERE role = 'admin';
  IF admin_count <= 1 AND EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Cannot demote the last admin';
  END IF;

  UPDATE users SET role = 'instructor' WHERE id = p_user_id;
END;
$$;
