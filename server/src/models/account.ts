import { sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  created: integer('created', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

// Repository methods
export async function createAccount(): Promise<Account> {
  const [account] = await db.insert(accounts).values({}).returning();
  return account;
}
