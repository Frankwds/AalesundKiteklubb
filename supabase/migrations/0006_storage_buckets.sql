-- 0006_storage_buckets.sql
-- Create spot-maps and instructor-photos buckets with storage.objects RLS

-- Create buckets (5MB for spot-maps, 2MB for instructor-photos; jpeg, png, webp)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('spot-maps', 'spot-maps', true, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('instructor-photos', 'instructor-photos', true, 2097152, ARRAY['image/jpeg','image/png','image/webp']);

-- spot-maps: public read
CREATE POLICY "spot-maps public read" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'spot-maps');

-- spot-maps: admin-only insert
CREATE POLICY "spot-maps admin insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'spot-maps' AND
    (current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin'
  );

-- spot-maps: admin-only update
CREATE POLICY "spot-maps admin update" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'spot-maps' AND
    (current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin'
  );

-- spot-maps: admin-only delete
CREATE POLICY "spot-maps admin delete" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'spot-maps' AND
    (current_setting('request.jwt.claims', true)::jsonb)->>'user_role' = 'admin'
  );

-- instructor-photos: public read
CREATE POLICY "instructor-photos public read" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'instructor-photos');

-- instructor-photos: instructor/admin upload to own folder
CREATE POLICY "instructor-photos authenticated upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'instructor-photos' AND
    (current_setting('request.jwt.claims', true)::jsonb)->>'user_role' IN ('instructor','admin') AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- instructor-photos: own folder update
CREATE POLICY "instructor-photos own folder update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'instructor-photos' AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'instructor-photos' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- instructor-photos: own folder delete
CREATE POLICY "instructor-photos own folder delete" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'instructor-photos' AND (storage.foldername(name))[1] = auth.uid()::text
  );
