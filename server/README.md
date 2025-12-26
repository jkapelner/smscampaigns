# SMS Campaign Management System - Backend API

A TypeScript Express.js REST API for managing SMS marketing campaigns. This backend service allows users to create campaigns, manage contacts, simulate message sending, and retrieve campaign statistics.

## Features

- **Dual Authentication** - JWT tokens for browser clients, API keys for server-to-server
- **Campaign Management** - Create, read, update, and delete SMS campaigns
- **Contact Management** - Manage campaign contacts with phone number validation
- **Message Personalization** - Template messages with {first_name} and {last_name} placeholders
- **Message Sending** - Asynchronous job queue simulation for sending personalized messages
- **Campaign Statistics** - Track message delivery status and campaign performance
- **Inbound Webhooks** - HMAC-secured webhook endpoint for processing inbound messages and STOP requests
- **Security** - Rate limiting, CORS protection, password hashing, HMAC verification, and input validation
- **Type Safety** - Full TypeScript implementation with Drizzle ORM
- **Repository Pattern** - Clean separation of data access logic in model layer

## Tech Stack

- **Runtime:** Node.js 24.x (LTS/Krypton)
- **Language:** TypeScript 5.7
- **Framework:** Express.js 4.21
- **Database:** SQLite with Drizzle ORM
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs (12 salt rounds)
- **Phone Validation:** libphonenumber-js
- **Testing:** Vitest with Supertest
- **Code Quality:** ESLint, Prettier

## Prerequisites

- Node.js 24.x or higher (use `nvm use lts/krypton`)
- npm (comes with Node.js)

## Installation

1. **Clone the repository and navigate to the server directory:**
   ```bash
   cd /path/to/smscampaign/server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration (see [Environment Variables](#environment-variables) below).

4. **Generate and apply database schema:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Seed the database with test data (optional):**
   ```bash
   npm run seed
   ```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```bash
# Application Environment
NODE_ENV=development

# Server Port
PORT=3000

# Database Configuration
DATABASE_URL=file:./data/smscampaign.db

# JWT Configuration (REQUIRED - generate a strong secret)
JWT_SECRET=your-very-secure-secret-key-change-this-in-production
JWT_EXPIRES_IN=1d

# Webhook Configuration (REQUIRED for inbound message webhooks)
WEBHOOK_SECRET=your-webhook-secret-for-hmac-signature-verification

# CORS Configuration (comma-separated list of allowed origins)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Important Security Notes:**
- `JWT_SECRET` is **REQUIRED** - the application will not start without it
- `WEBHOOK_SECRET` is **REQUIRED** for webhook endpoint security
- Use strong, randomly generated secrets for production
- Never commit `.env` files to version control

## Running the Application

### Development Mode
Start the server with hot-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

### Production Mode
Build and start the production server:
```bash
npm run build
npm start
```

### Health Check
Verify the server is running:
```bash
curl http://localhost:3000/health
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

**Test Statistics:**
- 164 tests across 7 test suites
- Comprehensive coverage of authentication, CRUD operations, webhooks, validation, security, and edge cases

## API Endpoints

### Authentication (Public)

#### POST `/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

**Response (201):**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "accountId": 1,
    "apiKey": "generated-api-key-for-server-to-server"
  }
}
```

**Note:** Save the `apiKey` - it can be used for server-to-server API authentication.

#### POST `/auth/login`
Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "accountId": 1
  }
}
```

### Campaigns (Authenticated)

All campaign endpoints require authentication via one of two methods:

**Method 1: JWT Token (Browser/Mobile Apps)**
```
Authorization: Bearer <your-jwt-token>
```

**Method 2: API Key (Server-to-Server)**
```
X-Api-Key: <your-api-key>
```

**Note:** API key authentication is only available for non-CORS requests (server-to-server). Browser requests with an `Origin` header must use JWT tokens.

#### GET `/campaigns`
Get all campaigns for the authenticated user.

**Response (200):**
```json
[
  {
    "id": 1,
    "accountId": 1,
    "name": "Summer Sale",
    "message": "Get 50% off all items!",
    "phoneNumber": "+12025551234",
    "created": "2025-12-26T08:00:00.000Z"
  }
]
```

#### GET `/campaigns/:id`
Get a specific campaign by ID.

#### POST `/campaigns`
Create a new campaign.

**Request Body:**
```json
{
  "name": "Holiday Promotion",
  "message": "Hi {first_name}, special holiday discounts just for you!",
  "phoneNumber": "+12025551234"
}
```

**Message Personalization:**
- Use `{first_name}` to insert contact's first name
- Use `{last_name}` to insert contact's last name
- Placeholders are replaced when messages are sent

**Response (201):**
```json
{
  "id": 2,
  "accountId": 1,
  "name": "Holiday Promotion",
  "message": "Special holiday discounts!",
  "phoneNumber": "+12025551234",
  "created": "2025-12-26T08:30:00.000Z"
}
```

#### PUT `/campaigns/:id`
Update a campaign.

**Request Body:**
```json
{
  "name": "Updated Campaign Name",
  "message": "Updated message",
  "phoneNumber": "+12025555678"
}
```

#### DELETE `/campaigns/:id`
Delete a campaign.

**Response (200):**
```json
{
  "message": "Campaign deleted successfully"
}
```

### Contacts (Authenticated)

#### GET `/campaigns/:id/contacts`
Get all contacts for a campaign.

**Response (200):**
```json
[
  {
    "id": 1,
    "campaignId": 1,
    "phoneNumber": "+14155551001",
    "firstName": "John",
    "lastName": "Doe",
    "canSend": true,
    "created": "2025-12-26T08:00:00.000Z"
  }
]
```

#### POST `/campaigns/:id/contacts`
Add a contact to a campaign.

**Request Body:**
```json
{
  "phoneNumber": "+14155551001",
  "firstName": "John",
  "lastName": "Doe",
  "canSend": true
}
```

**Response (201):**
```json
{
  "id": 1,
  "campaignId": 1,
  "phoneNumber": "+14155551001",
  "firstName": "John",
  "lastName": "Doe",
  "canSend": true,
  "created": "2025-12-26T08:00:00.000Z"
}
```

#### GET `/contacts/:id`
Get a specific contact by ID.

#### PUT `/contacts/:id`
Update a contact.

**Request Body:**
```json
{
  "phoneNumber": "+14155559999",
  "firstName": "Jane",
  "lastName": "Smith",
  "canSend": false
}
```

#### DELETE `/contacts/:id`
Delete a contact.

### Webhooks (Public - HMAC Authenticated)

#### POST `/campaigns/:id/inbound`
Receive inbound messages from a 3rd party messaging service (e.g., Twilio, Plivo).

**Headers:**
```
X-Webhook-Signature: <hmac-sha256-signature>
Content-Type: application/json
```

**Request Body:**
```json
{
  "from": "+14155551234",
  "to": "+12025551234",
  "message": "STOP"
}
```

**HMAC Signature Generation:**
```javascript
import crypto from 'crypto';
const payload = JSON.stringify(requestBody);
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');
```

**Response (200):**
```json
{
  "status": "processed"
}
```

**Behavior:**
- Verifies HMAC signature using `WEBHOOK_SECRET` from environment
- Looks up contact by campaign ID and `from` phone number
- If message is "STOP" (case-insensitive), sets contact's `canSend` to `false`
- Returns 200 even if contact not found (idempotent)
- Does not require JWT or API key authentication

**STOP Message Handling:**
- Automatically opts out contacts who reply with "STOP"
- Case-insensitive matching (STOP, stop, Stop, etc.)
- Whitespace is trimmed before matching
- Contact will no longer receive messages from this campaign

### Messages (Authenticated)

#### POST `/campaigns/:id/send`
Queue personalized messages for sending to all contacts in the campaign.

**Response (202):**
```json
{
  "message": "Messages queued for sending"
}
```

**How It Works:**
- Messages are sent asynchronously to contacts with `canSend: true`
- Message content is personalized with contact's first and last name
- Status updates happen automatically after 1-6 seconds
- 93% success rate, 7% undeliverable rate (simulated)

#### GET `/campaigns/:id/stats`
Get campaign statistics.

**Response (200):**
```json
{
  "total": 100,
  "pending": 10,
  "success": 80,
  "failed": 10,
  "undeliverable": 8,
  "blocked": 2
}
```

## Database Schema

### Tables

**accounts**
- `id` - Auto-increment primary key
- `created` - Timestamp (default: current time)

**users**
- `id` - Auto-increment primary key
- `accountId` - Foreign key to accounts
- `email` - Unique email address
- `password` - Hashed password (bcrypt, 12 rounds)
- `apiKey` - Unique API key
- `created` - Timestamp

**campaigns**
- `id` - Auto-increment primary key
- `accountId` - Foreign key to accounts
- `name` - Campaign name
- `message` - Message content
- `phoneNumber` - Sender phone number
- `created` - Timestamp

**contacts**
- `id` - Auto-increment primary key
- `campaignId` - Foreign key to campaigns
- `phoneNumber` - Contact phone number
- `firstName` - First name
- `lastName` - Last name
- `canSend` - Boolean flag (default: true)
- `created` - Timestamp

**messages**
- `id` - Auto-increment primary key
- `messageId` - Unique UUID (indexed)
- `campaignId` - Foreign key to campaigns
- `contactId` - Foreign key to contacts
- `message` - Personalized message text (with placeholders replaced)
- `status` - Enum: pending, success, undeliverable, blocked
- `timestamp` - Timestamp

### Database Commands

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema changes (development)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.ts       # Database connection setup
│   │   └── env.ts            # Environment validation
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── campaignController.ts
│   │   ├── contactController.ts
│   │   ├── messageController.ts
│   │   └── webhookController.ts  # Inbound webhook handler
│   ├── middleware/
│   │   ├── auth.ts           # JWT + API key authentication
│   │   └── errorHandler.ts   # Global error handler
│   ├── models/               # Repository pattern - data access layer
│   │   ├── account.ts
│   │   ├── user.ts
│   │   ├── campaign.ts
│   │   ├── contact.ts
│   │   ├── message.ts
│   │   └── index.ts          # Exports all models
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── campaignRoutes.ts
│   │   ├── contactRoutes.ts
│   │   ├── messageRoutes.ts
│   │   └── webhookRoutes.ts
│   ├── services/
│   │   └── messageService.ts # Message queue logic
│   ├── utils/
│   │   ├── auth.ts           # Password hashing, JWT, API keys
│   │   ├── hmac.ts           # HMAC signature verification
│   │   └── validation.ts     # Input validation
│   ├── scripts/
│   │   └── seed.ts           # Database seeding
│   └── server.ts             # Express app setup
├── tests/
│   ├── auth.test.ts          # JWT + API key auth tests
│   ├── campaigns.test.ts
│   ├── contacts.test.ts
│   ├── messages.test.ts
│   ├── middleware.test.ts
│   ├── validation.test.ts
│   ├── webhook.test.ts       # Webhook endpoint tests
│   ├── setup.ts              # Test setup/teardown
│   └── helpers.ts            # Test utilities
├── data/
│   └── smscampaign.db        # SQLite database file
├── drizzle/                  # Migration files
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Security Features

1. **Authentication**
   - JWT tokens with configurable expiration for browser clients
   - API keys for server-to-server authentication
   - API keys blocked on CORS requests (Origin header present)
   - Bcrypt password hashing (12 salt rounds)
   - Secure password requirements (8+ chars, uppercase, lowercase, number)

2. **Webhook Security**
   - HMAC SHA-256 signature verification
   - Timing-safe signature comparison to prevent timing attacks
   - Separate webhook secret from JWT secret

3. **Rate Limiting**
   - Login endpoint: 5 attempts per 15 minutes
   - Signup endpoint: 3 attempts per hour
   - Rate limiting disabled in test environment

4. **CORS Protection**
   - Configurable allowed origins
   - Credentials support
   - Restricted HTTP methods
   - API key auth automatically disabled for CORS requests

5. **Input Validation**
   - Email format validation
   - Password complexity requirements
   - International phone number validation (libphonenumber-js)
   - SQL injection protection via parameterized queries

6. **Authorization**
   - Users can only access their own resources
   - Cascade deletion of related records
   - Proper resource ownership verification
   - No cross-user data access

7. **Database Security**
   - WAL mode for better concurrency
   - Repository pattern isolates data access
   - Indexed queries for performance
   - Foreign key constraints enforced

## Seed Data

After running `npm run seed`, you'll have test data:

**Test User:**
- Email: `test@example.com`
- Password: `Test1234`

**2 Sample Campaigns with personalized messages:**
- Summer Sale: "Hi {first_name}, Get 50% off all items this summer!"
- Holiday Promotion: "Happy holidays {first_name}! Special discounts on all products."

**5 Sample Contacts** with realistic names distributed across campaigns

Use these credentials to test the API endpoints.

## Development Tools

### Code Formatting
```bash
npm run format
```

### Linting
```bash
npm run lint
```

## Troubleshooting

### Database Issues
If you encounter database errors:
```bash
# Reset the database
rm -rf data/smscampaign.db
npm run db:push
npm run seed
```

### Port Already in Use
Change the `PORT` in your `.env` file or kill the process using the port:
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

### JWT_SECRET Not Set
Ensure your `.env` file has a `JWT_SECRET` defined. The application will not start without it.

## API Response Codes

- `200` - Success
- `201` - Created
- `202` - Accepted (async operations)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Contributing

1. Follow the existing code style (enforced by ESLint/Prettier)
2. Write tests for new features
3. Ensure all tests pass before submitting
4. Update documentation as needed

## License

ISC

## Support

For issues or questions, please check the main project documentation or contact the development team.
