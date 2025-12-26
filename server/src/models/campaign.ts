import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql, eq, and } from 'drizzle-orm';
import { accounts } from './account.js';
import { db } from '../config/database.js';

export const campaigns = sqliteTable(
  'campaigns',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    message: text('message').notNull(),
    phoneNumber: text('phone_number').notNull(),
    created: integer('created', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    accountIdIdx: index('campaign_account_id_idx').on(table.accountId),
  })
);

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

// Repository methods
export async function findAllByAccountId(accountId: number): Promise<Campaign[]> {
  return db.select().from(campaigns).where(eq(campaigns.accountId, accountId));
}

export async function findByIdAndAccountId(
  id: number,
  accountId: number
): Promise<Campaign | undefined> {
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.accountId, accountId)))
    .limit(1);
  return campaign;
}

export async function createCampaign(data: {
  accountId: number;
  name: string;
  message: string;
  phoneNumber: string;
}): Promise<Campaign> {
  const [campaign] = await db.insert(campaigns).values(data).returning();
  return campaign;
}

export async function updateCampaign(
  id: number,
  updates: Partial<Pick<Campaign, 'name' | 'message' | 'phoneNumber'>>
): Promise<Campaign> {
  const [campaign] = await db.update(campaigns).set(updates).where(eq(campaigns.id, id)).returning();
  return campaign;
}

export async function deleteCampaign(id: number): Promise<void> {
  await db.delete(campaigns).where(eq(campaigns.id, id));
}
