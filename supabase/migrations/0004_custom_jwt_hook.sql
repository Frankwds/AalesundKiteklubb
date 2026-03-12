-- 0004_custom_jwt_hook.sql
-- Auth hook to inject user_role into JWT claims
-- Must be SECURITY DEFINER: the hook runs as supabase_auth_admin with no auth.uid() context

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = (event->>'user_id')::uuid;

  IF user_role IS NOT NULL THEN
    event := jsonb_set(event, '{claims,user_role}', to_jsonb(user_role));
  ELSE
    event := jsonb_set(event, '{claims,user_role}', '"user"');
  END IF;

  RETURN event;
EXCEPTION WHEN OTHERS THEN
  event := jsonb_set(event, '{claims,user_role}', '"user"');
  RETURN event;
END;
$$;

-- supabase_auth_admin must be able to call the hook and read users.role
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
GRANT ALL ON TABLE public.users TO supabase_auth_admin;
