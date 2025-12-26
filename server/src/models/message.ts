import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql, eq } from 'drizzle-orm';
import { campaigns } from './campaign.js';
import { contacts } from './contact.js';
import { db } from '../config/database.js';
import { MessageStatus } from '../types/enums.js';

export const messages = sqliteTable(
  'messages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    messageId: text('message_id').notNull().unique(),
    campaignId: integer('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    contactId: integer('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    status: text('status', {
      enum: ['pending', 'success', 'undeliverable', 'blocked'],
    }).notNull(),
    timestamp: integer('timestamp', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    messageIdIdx: index('message_id_idx').on(table.messageId),
    campaignIdIdx: index('message_campaign_id_idx').on(table.campaignId),
    campaignStatusIdx: index('message_campaign_status_idx').on(table.campaignId, table.status),
  })
);

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

// Repository methods
export async function createMessage(data: {
  messageId: string;
  campaignId: number;
  contactId: number;
  message: string;
  status: MessageStatus;
}): Promise<void> {
  await db.insert(messages).values(data);
}

export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus
): Promise<void> {
  await db.update(messages).set({ status }).where(eq(messages.messageId, messageId));
}

export async function getCampaignStats(campaignId: number): Promise<
  Array<{
    status: MessageStatus;
    count: number;
  }>
> {
  const stats = await db
    .select({
      status: messages.status,
      count: sql<number>`count(*)`,
    })
    .from(messages)
    .where(eq(messages.campaignId, campaignId))
    .groupBy(messages.status);

  return stats.map((stat) => ({
    status: stat.status as MessageStatus,
    count: Number(stat.count),
  }));
}
