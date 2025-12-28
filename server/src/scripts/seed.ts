import { db } from '../config/database.js';
import { accounts, users, campaigns, contacts } from '../models';
import { hashPassword, generateApiKey } from '../utils/auth.js';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  try {
    console.log('Seeding database...');

    const password = await hashPassword('Test1234');
    const apiKey = generateApiKey();

    const [account] = await db.insert(accounts).values({}).returning();
    console.log('Created account:', account.id);

    const [user] = await db
      .insert(users)
      .values({
        accountId: account.id,
        email: 'test@example.com',
        password,
        apiKey,
      })
      .returning();
    console.log('Created user:', user.email);

    const [campaign1] = await db
      .insert(campaigns)
      .values({
        accountId: account.id,
        name: 'Summer Sale',
        message: 'Hi {first_name}, Get 50% off all items this summer! Visit our store today.',
        phoneNumber: '+12025551234',
      })
      .returning();
    console.log('Created campaign:', campaign1.name);

    const [campaign2] = await db
      .insert(campaigns)
      .values({
        accountId: account.id,
        name: 'Holiday Promotion',
        message: 'Happy holidays {first_name}! Special discounts on all products.',
        phoneNumber: '+12025555678',
      })
      .returning();
    console.log('Created campaign:', campaign2.name);

    await db.insert(contacts).values([
      {
        campaignId: campaign1.id,
        phoneNumber: '+14155551001',
        firstName: 'John',
        lastName: 'Doe',
        canSend: true,
      },
      {
        campaignId: campaign1.id,
        phoneNumber: '+14155551002',
        firstName: 'Jane',
        lastName: 'Smith',
        canSend: true,
      },
      {
        campaignId: campaign1.id,
        phoneNumber: '+14155551003',
        firstName: 'Bob',
        lastName: 'Johnson',
        canSend: false,
      },
      {
        campaignId: campaign2.id,
        phoneNumber: '+14155552001',
        firstName: 'Alice',
        lastName: 'Williams',
        canSend: true,
      },
      {
        campaignId: campaign2.id,
        phoneNumber: '+14155552002',
        firstName: 'Charlie',
        lastName: 'Brown',
        canSend: true,
      },
    ]);
    console.log('Created 5 contacts');

    console.log('\nSeed data created successfully!');
    console.log('Test credentials:');
    console.log('  Email: test@example.com');
    console.log('  Password: Test1234');
    console.log('  API Key:', apiKey);
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
