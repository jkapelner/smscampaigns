import { db } from '../src/config/database.js';
import { accounts, users, campaigns, contacts } from '../src/models';
import { hashPassword, generateToken, generateApiKey } from '../src/utils/auth.js';

export interface TestUser {
  id: number;
  email: string;
  password: string;
  accountId: number;
  token: string;
  apiKey: string;
}

export async function createTestUser(
  email = 'test@example.com',
  password = 'TestPass123'
): Promise<TestUser> {
  const hashedPassword = await hashPassword(password);
  const apiKey = generateApiKey();

  const [account] = await db.insert(accounts).values({}).returning();

  const [user] = await db
    .insert(users)
    .values({
      accountId: account.id,
      email,
      password: hashedPassword,
      apiKey,
    })
    .returning();

  const token = generateToken(user.id);

  return {
    id: user.id,
    email: user.email,
    password,
    accountId: user.accountId,
    token,
    apiKey,
  };
}

export async function createTestCampaign(accountId: number, name = 'Test Campaign') {
  const [campaign] = await db
    .insert(campaigns)
    .values({
      accountId,
      name,
      message: 'Test message content',
      phoneNumber: '+1234567890',
    })
    .returning();

  return campaign;
}

export async function createTestContact(
  campaignId: number,
  phoneNumber = '+1234567890',
  canSend = true
) {
  const [contact] = await db
    .insert(contacts)
    .values({
      campaignId,
      phoneNumber,
      firstName: 'John',
      lastName: 'Doe',
      canSend,
    })
    .returning();

  return contact;
}
