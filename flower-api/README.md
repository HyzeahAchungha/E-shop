# Flower API

The secure backend for the Flower Shop app. It is the only service that talks to Neon PostgreSQL: the mobile app never receives database credentials. Built with Node.js, TypeScript and Hono.

## What it does today

| Route | Purpose |
| --- | --- |
| `GET /health` | Public liveness check. Reveals nothing. |
| `GET /v1/profile` | The signed-in user's profile, or `{ "profile": null }` when they have not completed one. |
| `PUT /v1/profile` | Validates and saves (create or update) the signed-in user's profile. |
| `GET /v1/location` | The signed-in user's saved location, or `{ "location": null }`. |
| `PUT /v1/location` | Validates and saves (create or replace) the user's one location: `placeName`, `latitude`, `longitude`. |

Every `/v1` route requires `Authorization: Bearer <Clerk session token>`. The server verifies the token's signature, expiry and not-before time with `@clerk/backend`; the user id comes only from the verified token. A user id in a request body is ignored, so one user can never read or write another's profile.

Profile rules are enforced here and never trusted from the app: name 2–80 characters; a country (ISO code) and a phone number that is valid for it, checked with libphonenumber-js and stored both as typed-nationally and as E.164; gender one of `male`, `female`, `other`, `prefer_not_to_say`. The profile photo lives in Clerk, so `PUT` asks Clerk whether the user has one and answers `422` with `{ "fields": { "photo": … } }` when they do not. The app shows these messages on the matching field.

Location rules: place name 2–120 characters without control characters; latitude −90..90 and longitude −180..180 as real numbers. Coordinates are rounded to 2 decimals (about 1 km) on the server and by a database CHECK constraint, so a precise point is never stored. One row per user, replaced on each save.

Other protections: request bodies are limited to 4 KB, only JSON is accepted, responses are `Cache-Control: no-store`, security headers are set, every SQL value is a bound parameter, and errors reach the client as short codes while details stay in the server log. The log gets only an error's message: request bodies, tokens and profile fields are never written to it by this code.

## Run it

Requires Node.js 22.18 or newer.

```sh
cd flower-api
npm ci
cp .env.example .env     # then fill in the two secrets below
npm run migrate          # creates the profiles and user_locations tables in Neon (safe to run again)
npm start                # listens on PORT (default 8787); `npm run dev` restarts on changes
```

`.env` (never committed; set the same values as environment variables on your host):

- `CLERK_SECRET_KEY`: Clerk dashboard → API keys → Secret key. Use the secret key of the same Clerk application whose publishable key the app uses.
- `DATABASE_URL`: Neon dashboard → Connect → the pooled connection string.
- `CLERK_JWT_KEY` (optional): Clerk's JWT public key, so tokens are verified without calling Clerk.

Then set `EXPO_PUBLIC_API_URL` in the app's `.env.local` to this server's address. Use `https` in production.

## Checks

```sh
npm run typecheck
npm test
```

The tests run the real SQL (the migration and the upsert) in an in-memory PostgreSQL (PGlite), call the HTTP app with fake Clerk resources, and check that the app and server validators agree (`tests/parity.test.mjs`, `tests/location-parity.test.mjs`).

## Not done yet

- **Hosting is not chosen.** This is a plain Node server, so Render, Railway, Fly.io or any VPS will run it. Put it behind HTTPS.
- **Rate limiting.** Add it at the host or a gateway before a public launch.
- **Live verification.** Real Clerk tokens and a real Neon database have not been exercised from this repo's tests (no keys here). Run `npm run migrate`, then a real sign-in from the app, to confirm them.
- **Account deletion.** Deleting a Clerk user does not yet remove their profile row.
