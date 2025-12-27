# SMS Campaign Manager - Frontend Client

A modern, responsive Vue 3 frontend application for managing SMS campaigns.

## Features

- User authentication (signup/login)
- Campaign management (create, read, update, delete)
- Contact management with phone number validation
- Message sending with personalization ({first_name}, {last_name})
- Real-time campaign statistics
- Responsive design with Tailwind CSS
- Form validation and error handling
- Loading states and user feedback

## Tech Stack

- **Vue 3** (Composition API)
- **Vite** - Build tool
- **Vue Router** - Routing with auth guards
- **Vuex** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vitest** - Testing

## Project Structure

```
client/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Alert.vue
│   │   ├── Button.vue
│   │   ├── Card.vue
│   │   ├── Input.vue
│   │   ├── LoadingSpinner.vue
│   │   └── Modal.vue
│   ├── views/           # Page components
│   │   ├── Login.vue
│   │   ├── Signup.vue
│   │   ├── Campaigns.vue
│   │   ├── CampaignDetails.vue
│   │   └── Statistics.vue
│   ├── store/           # Vuex store
│   │   ├── index.js
│   │   └── modules/
│   │       ├── auth.js
│   │       ├── campaigns.js
│   │       └── contacts.js
│   ├── services/        # API services
│   │   └── api.js
│   ├── router/          # Vue Router
│   │   └── index.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on http://localhost:3000

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
# Edit .env if you need to change the API URL (default: http://localhost:3000)
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

The frontend uses environment variables for configuration. Create a `.env` file in the client directory:

```bash
# Copy the example file
cp .env.example .env
```

### Available Variables

- `VITE_API_URL` - Backend API server URL (default: `http://localhost:3000`)

Example `.env` file:

```bash
VITE_API_URL=http://localhost:3000
```

For production:

```bash
VITE_API_URL=https://api.yourdomain.com
```

**Note:** After changing environment variables, restart the dev server for changes to take effect.

## API Configuration

The frontend is configured to proxy API requests to the backend:

- **Development**: Requests to `/api/*` are proxied to the URL specified in `VITE_API_URL` (default: `http://localhost:3000`)
- **Production**: Configure your web server to proxy `/api/*` to your backend URL

For production deployments:

- Backend API URL
- Authentication token storage
- Other environment-specific settings

## Authentication

The app uses JWT token-based authentication:

1. User signs up or logs in
2. JWT token is received and stored in localStorage
3. Token is automatically included in all API requests via Axios interceptor
4. Routes are protected with navigation guards

## Features Overview

### Authentication
- Signup with email/password validation
- Login with error handling
- Automatic token refresh
- Protected routes

### Campaign Management
- Create campaigns with name, message, and phone number
- Edit campaign details
- Delete campaigns with confirmation
- View campaign list with contact count
- Message template with personalization placeholders

### Contact Management
- Add contacts to campaigns
- Edit contact details
- Delete contacts with confirmation
- Phone number validation
- Toggle message sending permission

### Message Sending
- Queue messages for all eligible contacts
- Success/error feedback
- Automatic personalization with contact data

### Statistics
- Real-time campaign statistics
- Visual progress indicators
- Sent/Failed/Pending message counts
- Percentage breakdowns
- Refresh functionality

## Styling

The app uses Tailwind CSS with a custom color palette:

- Primary: Blue (#3b82f6)
- Success: Green
- Error: Red
- Warning: Yellow

All components are responsive and mobile-friendly.

## State Management

Vuex store modules:

- **auth**: User authentication state
- **campaigns**: Campaign list and current campaign
- **contacts**: Contact list for current campaign

## Error Handling

- Global error handling via Axios interceptors
- Form validation with user-friendly messages
- API error display with Alert component
- Loading states for async operations

## Development

### Code Style

- Vue 3 Composition API
- Single File Components (.vue)
- ES6+ JavaScript
- Tailwind utility classes

### Testing

```bash
npm run test
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
