import { neon } from '@neondatabase/serverless';

import type { Gender, ProfileValues } from './profile-validation.ts';

export type ProfileRecord = {
  name: string;
  countryIso: string;
  phoneNational: string;
  phoneE164: string;
  gender: Gender;
  createdAt: string;
  updatedAt: string;
};

export type ProfileStore = {
  get(userId: string): Promise<ProfileRecord | null>;
  upsert(userId: string, values: ProfileValues): Promise<ProfileRecord>;
};

/** Runs one parameterised statement and returns its rows. */
export type Query = (text: string, params: unknown[]) => Promise<Record<string, unknown>[]>;

const COLUMNS = 'name, country_iso, phone_national, phone_e164, gender, created_at, updated_at';

function toRecord(row: Record<string, unknown>): ProfileRecord {
  const iso = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value));
  return {
    name: String(row.name),
    countryIso: String(row.country_iso),
    phoneNational: String(row.phone_national),
    phoneE164: String(row.phone_e164),
    gender: row.gender as Gender,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

// Every value travels as a bound parameter ($1…), never concatenated into the SQL text.
export function createSqlProfileStore(query: Query): ProfileStore {
  return {
    async get(userId) {
      const rows = await query(`SELECT ${COLUMNS} FROM profiles WHERE clerk_user_id = $1`, [userId]);
      return rows[0] ? toRecord(rows[0]) : null;
    },
    async upsert(userId, values) {
      const rows = await query(
        `INSERT INTO profiles (clerk_user_id, name, country_iso, phone_national, phone_e164, gender)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (clerk_user_id) DO UPDATE SET
           name = EXCLUDED.name, country_iso = EXCLUDED.country_iso, phone_national = EXCLUDED.phone_national,
           phone_e164 = EXCLUDED.phone_e164, gender = EXCLUDED.gender, updated_at = now()
         RETURNING ${COLUMNS}`,
        [userId, values.name, values.countryIso, values.phoneNational, values.phoneE164, values.gender],
      );
      if (!rows[0]) throw new Error('Profile was not saved.');
      return toRecord(rows[0]);
    },
  };
}

export function createNeonQuery(databaseUrl: string): Query {
  const sql = neon(databaseUrl);
  return async (text, params) => (await sql.query(text, params)) as Record<string, unknown>[];
}
