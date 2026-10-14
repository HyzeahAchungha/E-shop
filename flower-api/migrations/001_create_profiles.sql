-- One profile per Clerk user. The id comes from the verified session token, never from the client.
-- Keep this file to a single statement: Neon's HTTP driver runs one statement per request.
CREATE TABLE IF NOT EXISTS profiles (
  clerk_user_id  text PRIMARY KEY,
  name           text        NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  country_iso    text        NOT NULL CHECK (country_iso ~ '^[A-Z]{2}$'),
  phone_national text        NOT NULL CHECK (phone_national ~ '^[0-9]{3,14}$'),
  phone_e164     text        NOT NULL CHECK (phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  gender         text        NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
)
