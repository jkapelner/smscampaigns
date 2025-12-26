import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { db } from '../src/config/database.js';
import { users } from '../src/models';
import { eq } from 'drizzle-orm';
import './setup.js';

describe('Authentication API', () => {
  describe('POST /auth/signup', () => {
    it('should successfully register a new user with valid credentials', async () => {
      const response = await request(app).post('/auth/signup').send({
        email: 'newuser@example.com',
        password: 'SecurePass123',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.user).toHaveProperty('accountId');
      expect(response.body.user).toHaveProperty('apiKey');
      expect(response.body.user).not.toHaveProperty('password');
      expect(typeof response.body.user.apiKey).toBe('string');
      expect(response.body.user.apiKey.length).toBeGreaterThan(0);
    });

    it('should reject signup with missing email', async () => {
      const response = await request(app).post('/auth/signup').send({
        password: 'SecurePass123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should reject signup with missing password', async () => {
      const response = await request(app).post('/auth/signup').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should reject signup with invalid email format', async () => {
      const response = await request(app).post('/auth/signup').send({
        email: 'invalid-email',
        password: 'SecurePass123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid email format');
    });

    it('should reject signup with password shorter than 8 characters', async () => {
      const response = await request(app).post('/auth/signup').send({
        email: 'test@example.com',
        password: 'Short1',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('at least 8 characters');
    });

    it('should reject signup with password missing uppercase letter', async () => {
      const response = await request(app).post('/auth/signup').send({
        email: 'test@example.com',
        password: 'lowercase123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('uppercase letter');
    });

    it('should reject signup with password missing lowercase letter', async () => {
      const response = await request(app).post('/auth/signup').send({
        email: 'test@example.com',
        password: 'UPPERCASE123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('lowercase letter');
    });

    it('should reject signup with password missing number', async () => {
      const response = await request(app).post('/auth/signup').send({
        email: 'test@example.com',
        password: 'NoNumbers',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('number');
    });

    it('should reject signup with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'SecurePass123',
      };

      // First signup should succeed
      const firstResponse = await request(app).post('/auth/signup').send(userData);
      expect(firstResponse.status).toBe(201);

      // Second signup with same email should fail
      const secondResponse = await request(app).post('/auth/signup').send(userData);
      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body).toHaveProperty('error', 'Email already exists');
    });

    it('should create account and user with correct associations', async () => {
      const response = await request(app).post('/auth/signup').send({
        email: 'association@example.com',
        password: 'SecurePass123',
      });

      expect(response.status).toBe(201);

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, 'association@example.com'))
        .limit(1);

      expect(user).toBeDefined();
      expect(user.accountId).toBeDefined();
      expect(user.apiKey).toBeDefined();
      expect(user.apiKey.length).toBe(64); // 32 bytes as hex = 64 chars
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app).post('/auth/signup').send({
        email: 'logintest@example.com',
        password: 'LoginPass123',
      });
    });

    it('should successfully login with correct credentials', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'logintest@example.com',
        password: 'LoginPass123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'logintest@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject login with missing email', async () => {
      const response = await request(app).post('/auth/login').send({
        password: 'LoginPass123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should reject login with missing password', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'logintest@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'SomePass123',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'logintest@example.com',
        password: 'WrongPass123',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return a valid JWT token', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'logintest@example.com',
        password: 'LoginPass123',
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('API Key Authentication', () => {
    let testUserApiKey: string;

    beforeEach(async () => {
      // Create a test user and get their API key
      const signupResponse = await request(app).post('/auth/signup').send({
        email: 'apitest@example.com',
        password: 'ApiTest123',
      });
      testUserApiKey = signupResponse.body.user.apiKey;
    });

    it('should authenticate with valid API key for server-to-server requests', async () => {
      const response = await request(app)
        .get('/campaigns')
        .set('X-Api-Key', testUserApiKey);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject invalid API key', async () => {
      const response = await request(app)
        .get('/campaigns')
        .set('X-Api-Key', 'invalid-api-key-12345');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid API key');
    });

    it('should reject API key authentication for CORS requests', async () => {
      const response = await request(app)
        .get('/campaigns')
        .set('X-Api-Key', testUserApiKey)
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should allow API key to access protected routes', async () => {
      // Create a campaign using API key
      const createResponse = await request(app)
        .post('/campaigns')
        .set('X-Api-Key', testUserApiKey)
        .send({
          name: 'API Key Test Campaign',
          message: 'Test message',
          phoneNumber: '+14155551234',
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty('name', 'API Key Test Campaign');

      // Get the campaign using API key
      const getResponse = await request(app)
        .get(`/campaigns/${createResponse.body.id}`)
        .set('X-Api-Key', testUserApiKey);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toHaveProperty('name', 'API Key Test Campaign');
    });

    it('should not allow API key from one user to access another users resources', async () => {
      // Create another user
      const user2Response = await request(app).post('/auth/signup').send({
        email: 'apitest2@example.com',
        password: 'ApiTest456',
      });
      const user2ApiKey = user2Response.body.user.apiKey;

      // Create campaign with first user
      const createResponse = await request(app)
        .post('/campaigns')
        .set('X-Api-Key', testUserApiKey)
        .send({
          name: 'User 1 Campaign',
          message: 'Test message',
          phoneNumber: '+14155551234',
        });

      // Try to access with second user's API key
      const getResponse = await request(app)
        .get(`/campaigns/${createResponse.body.id}`)
        .set('X-Api-Key', user2ApiKey);

      expect(getResponse.status).toBe(404);
      expect(getResponse.body).toHaveProperty('error', 'Campaign not found');
    });
  });
});
