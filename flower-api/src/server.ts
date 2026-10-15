import { serve } from '@hono/node-server';

import { createApp } from './app.ts';
import { createClerkAuthenticator, createClerkPhotoChecker } from './auth.ts';
import { createSqlLocationStore } from './location-store.ts';
import { createNeonQuery, createSqlProfileStore } from './profile-store.ts';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing ${name}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
  return value;
}

const clerkSecretKey = required('CLERK_SECRET_KEY');
const query = createNeonQuery(required('DATABASE_URL'));
const app = createApp({
  authenticate: createClerkAuthenticator(clerkSecretKey, { jwtKey: process.env.CLERK_JWT_KEY?.trim() || undefined }),
  hasProfilePhoto: createClerkPhotoChecker(clerkSecretKey),
  store: createSqlProfileStore(query),
  locationStore: createSqlLocationStore(query),
});

const port = Number(process.env.PORT) || 8787;
serve({ fetch: app.fetch, port });
console.log(`flower-api listening on port ${port}`);
