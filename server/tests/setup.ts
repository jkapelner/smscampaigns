import { beforeAll, afterAll, beforeEach } from 'vitest';
import { sql } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'file:./data/test-' + Date.now() + '.db';

// Import db and client after setting environment variables
// This ensures the app uses the test database
const databaseModule = await import('../src/config/database.js');
const schema = await import('../src/models');

export const db = databaseModule.db;
export const client = databaseModule.client;
export const testDb = db; // Use the same db instance as the app

beforeAll(async () => {
  // Run migrations to set up test database schema
  console.log('Setting up test database...');

  try {
    const migrationSql = readFileSync(
      join(__dirname, '../drizzle/0000_huge_wallop.sql'),
      'utf-8'
    );

    // Split by statement breakpoint and execute each statement
    const statements = migrationSql
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Use the underlying client for migrations
    for (const statement of statements) {
      await client.execute(statement);
    }

    // Run additional migrations
    const migration0002 = readFileSync(
      join(__dirname, '../drizzle/0002_add_message_field.sql'),
      'utf-8'
    );
    await client.execute(migration0002.trim());
  } catch (error) {
    console.error('Migration error:', error);
  }
});

beforeEach(async () => {
  // Clean up database before each test
  try {
    await testDb.delete(schema.messages);
    await testDb.delete(schema.contacts);
    await testDb.delete(schema.campaigns);
    await testDb.delete(schema.users);
    await testDb.delete(schema.accounts);
  } catch (error) {
    // Ignore errors during cleanup
  }
});

afterAll(async () => {
  console.log('Cleaning up test database...');
});
