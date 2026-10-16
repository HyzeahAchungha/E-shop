import type { LocationValues } from './location-validation.ts';
import type { Query } from './profile-store.ts';

export type LocationRecord = LocationValues & { createdAt: string; updatedAt: string };

export type LocationStore = {
  get(userId: string): Promise<LocationRecord | null>;
  upsert(userId: string, values: LocationValues): Promise<LocationRecord>;
};

const COLUMNS = 'place_name, latitude, longitude, created_at, updated_at';

function toRecord(row: Record<string, unknown>): LocationRecord {
  const iso = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value));
  return {
    placeName: String(row.place_name),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

// Every value travels as a bound parameter ($1…), never concatenated into the SQL text.
export function createSqlLocationStore(query: Query): LocationStore {
  return {
    async get(userId) {
      const rows = await query(`SELECT ${COLUMNS} FROM user_locations WHERE clerk_user_id = $1`, [userId]);
      return rows[0] ? toRecord(rows[0]) : null;
    },
    async upsert(userId, values) {
      const rows = await query(
        `INSERT INTO user_locations (clerk_user_id, place_name, latitude, longitude)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (clerk_user_id) DO UPDATE SET
           place_name = EXCLUDED.place_name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, updated_at = now()
         RETURNING ${COLUMNS}`,
        [userId, values.placeName, values.latitude, values.longitude],
      );
      if (!rows[0]) throw new Error('Location was not saved.');
      return toRecord(rows[0]);
    },
  };
}
