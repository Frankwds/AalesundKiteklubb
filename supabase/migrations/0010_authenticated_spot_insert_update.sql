-- 0010_authenticated_spot_insert_update.sql
-- Temporary: any signed-in user may create/update spots and spot map files.
-- DELETE on spots stays admin-only (no new DELETE policy for authenticated).

-- ============================================================
-- SPOTS: INSERT + UPDATE for authenticated (DELETE unchanged)
-- ============================================================
CREATE POLICY "Authenticated can insert spots" ON public.spots
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update spots" ON public.spots
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- STORAGE spot-maps: authenticated upload / replace / remove
-- (Admin policies from 0006 remain; permissive policies combine with OR.)
-- ============================================================
CREATE POLICY "spot-maps authenticated insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'spot-maps');

CREATE POLICY "spot-maps authenticated update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'spot-maps')
  WITH CHECK (bucket_id = 'spot-maps');

CREATE POLICY "spot-maps authenticated delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'spot-maps');
