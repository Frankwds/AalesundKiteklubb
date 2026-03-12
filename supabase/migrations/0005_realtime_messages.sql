-- 0005_realtime_messages.sql
-- Add messages table to Supabase Realtime publication for live chat

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
