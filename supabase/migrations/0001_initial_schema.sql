-- 0001_initial_schema.sql
-- Enums + 7 tables: users, instructors, courses, course_participants, messages, subscriptions, spots

-- Enums
CREATE TYPE public.user_role AS ENUM ('user', 'instructor', 'admin');
CREATE TYPE public.season AS ENUM ('summer', 'winter');
CREATE TYPE public.skill_level AS ENUM ('beginner', 'experienced');

-- Users (synced from auth.users via trigger in 0003)
CREATE TABLE public.users (
  id         uuid PRIMARY KEY,
  email      text NOT NULL,
  name       text,
  avatar_url text,
  role       public.user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Instructors (created atomically via promote RPCs in 0007)
CREATE TABLE public.instructors (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  bio              text,
  certifications   text,
  years_experience integer,
  phone            text,
  photo_url        text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Courses
CREATE TABLE public.courses (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  description      text,
  price            integer,
  start_time       timestamptz NOT NULL,
  end_time         timestamptz NOT NULL,
  max_participants integer,
  instructor_id    uuid REFERENCES public.instructors(id) ON DELETE SET NULL,
  spot_id          uuid,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT end_after_start CHECK (end_time > start_time)
);

-- Course Participants
CREATE TABLE public.course_participants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_enrollment UNIQUE (user_id, course_id)
);

-- Messages (user_id nullable for "Slettet bruker" display)
CREATE TABLE public.messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES public.users(id) ON DELETE SET NULL,
  course_id  uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Subscriptions (one per user)
CREATE TABLE public.subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Spots
CREATE TABLE public.spots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  description     text,
  season          public.season,
  area            text NOT NULL,
  wind_directions text[],
  map_image_url   text,
  latitude        numeric,
  longitude       numeric,
  skill_level     public.skill_level,
  skill_notes     text,
  water_type      text[],
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Add FK from courses to spots (spots table must exist first)
ALTER TABLE public.courses
  ADD CONSTRAINT courses_spot_id_fkey
  FOREIGN KEY (spot_id) REFERENCES public.spots(id) ON DELETE SET NULL;
