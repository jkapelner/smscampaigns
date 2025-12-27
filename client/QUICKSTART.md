# Quick Start Guide

## Installation & Setup

1. **Install Dependencies**

```bash
npm install
```

This will install:
- Vue 3
- Vite
- Vue Router
- Vuex
- Axios
- Tailwind CSS
- Vitest
- And all other required dependencies

2. **Configure Environment Variables**

```bash
cp .env.example .env
```

The default configuration uses `http://localhost:3000` for the API server. Edit `.env` if you need to change this:

```bash
VITE_API_URL=http://localhost:3000
```

3. **Start Development Server**

```bash
npm run dev
```

The app will be available at: http://localhost:5173

4. **Make Sure Backend is Running**

The frontend expects the backend API to be running at the URL specified in `VITE_API_URL` (default: http://localhost:3000)

## First Time User Flow

1. **Sign Up**
   - Navigate to http://localhost:5173
   - You'll be redirected to the login page
   - Click "create a new account"
   - Enter email and password (minimum 6 characters)
   - Submit the form

2. **Create Your First Campaign**
   - After signup, you'll be on the Campaigns page
   - Click "Create Campaign"
   - Fill in:
     - Campaign Name (e.g., "Summer Sale")
     - Message (e.g., "Hi {first_name}, check out our sale!")
     - Phone Number (e.g., "+1234567890")
   - Click "Create"

3. **Add Contacts**
   - Click on your campaign card to view details
   - Click "Add Contact"
   - Fill in:
     - First Name
     - Last Name
     - Phone Number (format: +1234567890)
     - Toggle "Can receive messages" if needed
   - Click "Add"

4. **Send Messages**
   - Once you have contacts, click "Send Messages"
   - Messages will be queued and sent to all eligible contacts
   - The {first_name} and {last_name} placeholders will be replaced automatically

5. **View Statistics**
   - Click "View Statistics" to see campaign performance
   - See total, sent, failed, and pending message counts
   - View visual progress indicators

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests

## Environment

The API server URL is configured via the `VITE_API_URL` environment variable (default: `http://localhost:3000`).

The Vite proxy is configured to forward all `/api/*` requests to the backend server.

This means:
- Frontend makes requests to `/api/campaigns`
- Vite forwards them to `http://localhost:3000/campaigns` (or your configured URL)

## Troubleshooting

### Can't connect to backend
- Make sure the backend server is running on the port specified in `VITE_API_URL` (default: 3000)
- Verify the `.env` file exists and has the correct `VITE_API_URL`
- Restart the dev server after changing environment variables
- Check the Vite proxy configuration in `vite.config.js`

### Styles not loading
- Make sure Tailwind CSS is properly configured
- Run `npm install` again if needed

### API errors
- Check the browser console for error messages
- Verify the backend is responding correctly
- Check that your JWT token is valid (stored in localStorage)

## Project Structure

```
src/
├── components/       # Reusable UI components
├── views/           # Page components (routes)
├── store/           # Vuex state management
│   └── modules/     # Store modules (auth, campaigns, contacts)
├── services/        # API service layer
├── router/          # Vue Router configuration
├── App.vue          # Root component
├── main.js          # Application entry point
└── style.css        # Global styles with Tailwind
```

## Tips

1. **Message Personalization**: Use `{first_name}` and `{last_name}` in your campaign messages
2. **Phone Format**: Always use international format starting with + (e.g., +1234567890)
3. **Contact Management**: Toggle "Can receive messages" to control who receives SMS
4. **Statistics**: Refresh statistics to see real-time updates after sending messages

## Next Steps

- Customize the Tailwind theme in `tailwind.config.js`
- Add more components as needed
- Implement additional features
- Write tests with Vitest
- Deploy to production

Enjoy using the SMS Campaign Manager!
