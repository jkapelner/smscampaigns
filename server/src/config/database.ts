import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../models';

export const client = createClient({
  url: process.env.DATABASE_URL || 'file:./data/smscampaign.db',
});

// Enable WAL mode for better concurrency (only works with file: URLs)
if (process.env.DATABASE_URL?.startsWith('file:') || !process.env.DATABASE_URL) {
  try {
    client.execute('PRAGMA journal_mode=WAL');
    client.execute('PRAGMA busy_timeout=10000');
    client.execute('PRAGMA synchronous=NORMAL');
  } catch (error) {
    // Ignore errors for non-file databases
  }
}

export const db = drizzle(client, { schema });
