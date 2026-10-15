import { Hono, type Context } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { secureHeaders } from 'hono/secure-headers';

import type { Authenticator, PhotoChecker } from './auth.ts';
import type { LocationStore } from './location-store.ts';
import { validateLocation } from './location-validation.ts';
import type { ProfileStore } from './profile-store.ts';
import { validateProfile } from './profile-validation.ts';

type Deps = { authenticate: Authenticator; store: ProfileStore; locationStore: LocationStore; hasProfilePhoto: PhotoChecker };
type Env = { Variables: { userId: string } };

export function createApp({ authenticate, store, locationStore, hasProfilePhoto }: Deps) {
  const app = new Hono();
  app.use(secureHeaders());

  app.get('/health', (c) => c.json({ ok: true }));

  const v1 = new Hono<Env>();
  // Private data must never be cached by a proxy or the device.
  v1.use(async (c, next) => {
    await next();
    c.header('Cache-Control', 'no-store');
  });
  v1.use(bodyLimit({ maxSize: 4 * 1024, onError: (c) => c.json({ error: 'payload_too_large' }, 413) }));

  // Every /v1 route needs a valid Clerk session. The user id comes only from the verified token.
  v1.use(async (c, next) => {
    const session = await authenticate(c.req.header('authorization'));
    if (!session) return c.json({ error: 'unauthorized' }, 401);
    c.set('userId', session.userId);
    await next();
  });

  // Reads a JSON request body, or returns the error response to send back.
  async function readJson(c: Context<Env>): Promise<{ body: unknown } | { error: Response }> {
    if (!c.req.header('content-type')?.toLowerCase().startsWith('application/json')) {
      return { error: c.json({ error: 'unsupported_media_type' }, 415) };
    }
    try {
      return { body: await c.req.json() };
    } catch {
      return { error: c.json({ error: 'invalid_json' }, 400) };
    }
  }

  v1.get('/profile', async (c) => c.json({ profile: await store.get(c.get('userId')) }));

  v1.put('/profile', async (c) => {
    const parsed = await readJson(c);
    if ('error' in parsed) return parsed.error;
    // Only the fields we validate are saved. A user id in the body is ignored on purpose.
    const result = validateProfile(parsed.body);
    if (!result.ok) return c.json({ error: 'validation_failed', fields: result.errors }, 422);
    // A photo is required. It is stored in Clerk, so ask Clerk rather than trusting the app.
    if (!(await hasProfilePhoto(c.get('userId')))) {
      return c.json({ error: 'validation_failed', fields: { photo: 'Add a profile photo.' } }, 422);
    }
    return c.json({ profile: await store.upsert(c.get('userId'), result.value) });
  });

  v1.get('/location', async (c) => c.json({ location: await locationStore.get(c.get('userId')) }));

  v1.put('/location', async (c) => {
    const parsed = await readJson(c);
    if ('error' in parsed) return parsed.error;
    // Coordinates are rounded to about 1 km here, whatever precision the app sent.
    const result = validateLocation(parsed.body);
    if (!result.ok) return c.json({ error: 'validation_failed', fields: result.errors }, 422);
    return c.json({ location: await locationStore.upsert(c.get('userId'), result.value) });
  });

  app.route('/v1', v1);
  app.notFound((c) => c.json({ error: 'not_found' }, 404));
  // Details stay in the server log; clients only learn that something failed.
  app.onError((error, c) => {
    console.error('Unhandled error:', error instanceof Error ? error.message : 'unknown');
    return c.json({ error: 'server_error' }, 500);
  });
  return app;
}
