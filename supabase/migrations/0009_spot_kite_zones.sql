-- Optional GeoJSON-style kite zone overlays per spot (admin-drawn polygons).
ALTER TABLE public.spots
  ADD COLUMN IF NOT EXISTS kite_zones jsonb;

COMMENT ON COLUMN public.spots.kite_zones IS
  'Versioned FeatureCollection JSON: kite area polygons (red/yellow/green) with tags.';
