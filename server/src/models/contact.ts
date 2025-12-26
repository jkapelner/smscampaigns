import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql, eq, and } from 'drizzle-orm';
import { campaigns } from './campaign.js';
import { db } from '../config/database.js';

export const contacts = sqliteTable(
  'contacts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    campaignId: integer('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    phoneNumber: text('phone_number').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    canSend: integer('can_send', { mode: 'boolean' }).notNull().default(true),
    created: integer('created', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    campaignIdIdx: index('contact_campaign_id_idx').on(table.campaignId),
    campaignCanSendIdx: index('contact_campaign_cansend_idx').on(table.campaignId, table.canSend),
  })
);

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

// Repository methods
export async function findByCampaignId(campaignId: number): Promise<Contact[]> {
  return db.select().from(contacts).where(eq(contacts.campaignId, campaignId));
}

export async function findById(id: number): Promise<Contact | undefined> {
  const [contact] = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  return contact;
}

export async function findByIdWithCampaign(
  id: number,
  accountId: number
): Promise<{ id: number; campaignId: number } | undefined> {
  const [contact] = await db
    .select({ id: contacts.id, campaignId: contacts.campaignId })
    .from(contacts)
    .innerJoin(campaigns, eq(contacts.campaignId, campaigns.id))
    .where(and(eq(contacts.id, id), eq(campaigns.accountId, accountId)))
    .limit(1);
  return contact;
}

export async function createContact(data: {
  campaignId: number;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  canSend?: boolean;
}): Promise<Contact> {
  const [contact] = await db.insert(contacts).values(data).returning();
  return contact;
}

export async function updateContact(
  id: number,
  updates: Partial<Pick<Contact, 'phoneNumber' | 'firstName' | 'lastName' | 'canSend'>>
): Promise<Contact> {
  const [contact] = await db.update(contacts).set(updates).where(eq(contacts.id, id)).returning();
  return contact;
}

export async function deleteContact(id: number): Promise<void> {
  await db.delete(contacts).where(eq(contacts.id, id));
}

export async function findByCampaignIdAndCanSend(
  campaignId: number,
  canSend: boolean
): Promise<Contact[]> {
  return db
    .select()
    .from(contacts)
    .where(and(eq(contacts.campaignId, campaignId), eq(contacts.canSend, canSend)));
}

export async function findByIdWithCampaignMessage(
  contactId: number
): Promise<{
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  campaignId: number;
  campaignMessage: string;
} | undefined> {
  const [result] = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      phoneNumber: contacts.phoneNumber,
      campaignId: campaigns.id,
      campaignMessage: campaigns.message,
    })
    .from(contacts)
    .innerJoin(campaigns, eq(contacts.campaignId, campaigns.id))
    .where(eq(contacts.id, contactId))
    .limit(1);
  return result;
}

export async function findByCampaignAndPhone(
  campaignId: number,
  phoneNumber: string
): Promise<Contact | undefined> {
  const [contact] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.campaignId, campaignId), eq(contacts.phoneNumber, phoneNumber)))
    .limit(1);
  return contact;
}
