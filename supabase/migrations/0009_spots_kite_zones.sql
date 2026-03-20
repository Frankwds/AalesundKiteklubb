-- Kite flying zone polygons per spot (GeoJSON FeatureCollection + schemaVersion in JSON)
alter table public.spots
  add column if not exists kite_zones jsonb null;

comment on column public.spots.kite_zones is
  'Optional GeoJSON FeatureCollection with schemaVersion; Polygon features with properties id, color (red|yellow|green), tag, optional order.';
