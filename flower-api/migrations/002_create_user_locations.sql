-- One approximate location per Clerk user, used to find nearby florists. Coordinates are rounded to
-- 2 decimals (about 1 km) before they are stored, and the database refuses anything more precise,
-- so an exact position can never be kept by mistake. Exact delivery addresses are a separate matter.
-- Keep this file to a single statement: Neon's HTTP driver runs one statement per request.
CREATE TABLE IF NOT EXISTS user_locations (
  clerk_user_id text             PRIMARY KEY,
  place_name    text             NOT NULL CHECK (char_length(place_name) BETWEEN 2 AND 120),
  latitude      double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90 AND latitude = round(latitude::numeric, 2)::double precision),
  longitude     double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180 AND longitude = round(longitude::numeric, 2)::double precision),
  created_at    timestamptz      NOT NULL DEFAULT now(),
  updated_at    timestamptz      NOT NULL DEFAULT now()
)
