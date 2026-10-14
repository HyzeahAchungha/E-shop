// Applies every migrations/*.sql file in name order. Each file is safe to run again.
import { neon } from '@neondatabase/serverless';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error('Missing DATABASE_URL. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const sql = neon(url);
const dir = join(import.meta.dirname, '..', 'migrations');
for (const file of (await readdir(dir)).filter((name) => name.endsWith('.sql')).sort()) {
  await sql.query(await readFile(join(dir, file), 'utf8'), []);
  console.log(`applied ${file}`);
}
