import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql, eq } from 'drizzle-orm';
import { accounts } from './account.js';
import { db } from '../config/database.js';

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    apiKey: text('api_key').notNull().unique(),
    created: integer('created', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    accountIdIdx: index('user_account_id_idx').on(table.accountId),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Repository methods
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
}

export async function findUserById(id: number): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

export async function findUserByApiKey(apiKey: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.apiKey, apiKey)).limit(1);
  return user;
}

export async function createUser(data: {
  accountId: number;
  email: string;
  password: string;
  apiKey: string;
}): Promise<Pick<User, 'id' | 'email' | 'accountId' | 'apiKey'>> {
  const [user] = await db
    .insert(users)
    .values(data)
    .returning({ id: users.id, email: users.email, accountId: users.accountId, apiKey: users.apiKey });
  return user;
}
