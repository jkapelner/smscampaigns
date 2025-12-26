# SMS Campaign Management System

A full-stack application for managing SMS marketing campaigns with simulated message delivery. This system allows users to create campaigns, manage contacts, send messages, and track campaign performance.

## Project Overview

This is a modern web application that provides a complete SMS campaign management solution:

- **Backend API**: TypeScript Express.js REST API with SQLite database
- **Frontend** (planned): Vue.js 3 with Vite and Tailwind CSS
- **Authentication**: JWT-based user authentication
- **Message Simulation**: Asynchronous job queue for simulating message delivery

**Note**: No real SMS messages are sent - this is a simulation system for learning and testing purposes.

## Project Structure

```
smscampaign/
├── server/              # Backend API (Express.js + TypeScript)
│   ├── src/            # Source code
│   ├── tests/          # Test suites (147 tests)
│   ├── data/           # SQLite database
│   ├── drizzle/        # Database migrations
│   └── README.md       # Backend documentation
├── client/             # Frontend (Vue.js 3) - Coming soon
│   └── (to be created)
└── README.md           # This file
```

## Features

### Current (Backend - Complete ✅)

- ✅ User registration and authentication (JWT)
- ✅ Campaign CRUD operations
- ✅ Contact management with phone validation
- ✅ Simulated asynchronous message sending
- ✅ Campaign statistics and analytics
- ✅ Rate limiting and security features
- ✅ Comprehensive test coverage (147 tests, 73.72% coverage)

### Planned (Frontend)

- 🔲 Vue.js 3 application with Vite
- 🔲 Tailwind CSS for styling
- 🔲 Vue Router for navigation
- 🔲 Vuex for state management
- 🔲 Responsive dashboard interface
- 🔲 Campaign creation and management UI
- 🔲 Contact list management
- 🔲 Real-time statistics display

## Technology Stack

### Backend
- **Runtime**: Node.js 24.x (LTS/Krypton)
- **Language**: TypeScript 5.7
- **Framework**: Express.js 4.21
- **Database**: SQLite with Drizzle ORM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, express-rate-limit, CORS
- **Validation**: libphonenumber-js, express-validator
- **Testing**: Vitest, Supertest

### Frontend (Planned)
- **Framework**: Vue.js 3
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: Vue Router
- **State Management**: Vuex
- **HTTP Client**: Axios
- **Testing**: Vitest

## Quick Start

### Prerequisites

- Node.js 24.x or higher
- npm (comes with Node.js)
- nvm (recommended for Node version management)

### Backend Setup

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and set JWT_SECRET to a strong random value
   ```

4. **Initialize database:**
   ```bash
   npm run db:generate
   npm run db:push
   npm run seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`

6. **Run tests:**
   ```bash
   npm test
   ```

### Frontend Setup (Coming Soon)

Frontend development will begin after backend is deployed. The frontend will be created in the `client/` directory.

## Documentation

- [Backend API Documentation](./server/README.md) - Complete API reference, endpoints, and backend setup

## API Overview

The backend API provides the following endpoints:

### Public Endpoints
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Authenticate and get JWT token
- `GET /health` - Health check

### Authenticated Endpoints (require JWT)
- `GET /campaigns` - List all campaigns
- `POST /campaigns` - Create campaign
- `GET /campaigns/:id` - Get campaign details
- `PUT /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign
- `GET /campaigns/:id/contacts` - List campaign contacts
- `POST /campaigns/:id/contacts` - Add contact
- `GET /contacts/:id` - Get contact details
- `PUT /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact
- `POST /campaigns/:id/send` - Queue messages for sending
- `GET /campaigns/:id/stats` - Get campaign statistics

## Testing

The backend has comprehensive test coverage:

```bash
cd server
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Generate coverage report
```

**Test Statistics:**
- 147 tests across 8 test suites
- 73.72% code coverage
- All tests passing ✅

## Database Schema

- **accounts** - User account records
- **users** - User credentials and profile
- **campaigns** - SMS campaign information
- **contacts** - Campaign recipients
- **messages** - Message delivery tracking

See [Backend Documentation](./server/README.md) for complete schema details.

## Security Features

- JWT authentication with secure token management
- Password hashing with bcryptjs (12 salt rounds)
- Rate limiting on authentication endpoints
- CORS protection with configurable origins
- Input validation and sanitization
- SQL injection protection via parameterized queries
- Proper authorization checks for resource access

## Development Workflow

### Backend Development

1. Make changes to TypeScript files in `server/src/`
2. Tests run automatically with `npm run dev` (hot reload)
3. Run tests: `npm test`
4. Check code quality: `npm run lint` and `npm run format`
5. Commit changes with descriptive messages

### Testing Strategy

- Unit tests for utilities and validation
- Integration tests for API endpoints
- Authentication and authorization tests
- Edge case and error handling tests
- Database transaction tests

## Environment Variables

### Backend (.env in server/)

```bash
NODE_ENV=development              # Environment (development/production)
PORT=3000                         # Server port
DATABASE_URL=file:./data/smscampaign.db  # SQLite database path
JWT_SECRET=your-secret-here       # REQUIRED: Strong random secret
JWT_EXPIRES_IN=1d                 # Token expiration
WEBHOOK_SECRET=your-webhook-secret-here  # REQUIRED: Webhook HMAC signature secret
ALLOWED_ORIGINS=http://localhost:3000  # CORS allowed origins
```

**Important**: Never commit `.env` files. Use `.env.example` as a template.

## Deployment

### Backend Deployment

1. Build the TypeScript code:
   ```bash
   cd server
   npm run build
   ```

2. Set production environment variables

3. Use a process manager (PM2 recommended):
   ```bash
   pm2 start dist/server.js --name smscampaign-api
   ```

4. Set up reverse proxy (nginx) with SSL/TLS

5. Monitor logs and performance

See [Backend README](./server/README.md) for detailed deployment instructions.

## Project Status

| Component | Status | Progress |
|-----------|--------|----------|
| Backend API | ✅ Complete | 100% |
| Database Schema | ✅ Complete | 100% |
| Authentication | ✅ Complete | 100% |
| Testing | ✅ Complete | 147 tests passing |
| Security Hardening | ✅ Complete | All critical issues fixed |
| Frontend | 🔲 Planned | 0% |
| Integration | 🔲 Pending | 0% |
| Deployment | 🔲 Pending | 0% |

## Contributing

When contributing to this project:

1. Follow the existing code structure and patterns
2. Write tests for new features
3. Ensure all tests pass before committing
4. Use TypeScript strict mode
5. Follow ESLint and Prettier configurations
6. Update documentation as needed

## License

ISC

## Acknowledgments

- Uses modern TypeScript and Express.js best practices
- Implements security recommendations from OWASP
- Test-driven development approach

## Support

For detailed information about specific components:
- Backend API: See [server/README.md](./server/README.md)

---

**Note**: This is a learning/demonstration project. For production use, consider implementing real SMS providers (Twilio, AWS SNS, etc.) and additional production-grade features like comprehensive logging, monitoring, and backup strategies.
