# Localease Service Hub

A comprehensive service booking platform for moving, disposal, and transport services.

## Features

- **Multi-service Booking**: Moving, disposal, and transport services
- **Real-time Chat**: Live messaging between users and companies
- **Quote Management**: Send and accept quotes with document generation
- **Company Dashboard**: Comprehensive dashboard for service providers

- **Multi-language Support**: Internationalization support
- **Responsive Design**: Mobile-first approach

## Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd localease-service-hub
```

2. Install dependencies (frontend and backend):
```bash
npm install
```

   The backend lives in its own `/backend` Node project. The root `npm install` will automatically install its dependencies via a `postinstall` script. If installing manually, run `npm --prefix backend install`.

3. Set up environment variables:
   
   **Option A: Use the setup script (Recommended)**
   ```bash
   cd backend
   ./setup-env.sh
   ```
   
   **Option B: Create manually**
   Create a `.env` file in the `backend` directory with the following variables:
   
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://mongo:bomgIVKQxBvDazjNOecSPsxTywtBAOdO@shinkansen.proxy.rlwy.net:21344
   
   # Server Configuration
   NODE_ENV=development
   PORT=5002
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_change_in_production
   ```



### Running the Application

1. Start the backend server:
```bash
npm run start:backend:prod # or npm run start:backend for default start
```

2. Start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:8080`

## Real-time Chat

The application features real-time chat functionality using SendBird:
- WebSocket connections for live messaging
- REST API endpoints for data management
- Message read status tracking
- Quote sending and acceptance

### SendBird Setup

The chat system uses SendBird for real-time messaging. Follow these steps to set up:

1. **Quick Setup** (see `SENDBIRD_SETUP.md` for detailed instructions):
   - Go to [SendBird Dashboard](https://dashboard.sendbird.com/)
   - Create a new application or select existing one
   - Copy your Application ID
   - Add to `.env` file: `VITE_SENDBIRD_APP_ID=your_app_id`

2. **Environment Variables** (see `.env.example`):
   ```env
   VITE_SENDBIRD_APP_ID=your_sendbird_app_id
   VITE_SENDBIRD_API_TOKEN=your_api_token_here  # Optional
   VITE_SENDBIRD_DEBUG=false                    # Development only
   ```

3. **Advanced Features** (optional):
   - Generate API token for automatic user management
   - Enable debug logging for troubleshooting

### Troubleshooting Chat Issues

**Common Problems & Solutions:**

1. **"Connecting..." state never resolves:**
   - Check `VITE_SENDBIRD_APP_ID` in environment variables
   - Verify SendBird application is active in dashboard
   - Check browser console for connection errors

2. **Chat rooms not loading:**
   - Ensure backend server is running
   - Check network tab for API call failures
   - Verify user authentication is working

3. **Messages not sending:**
   - Check SendBird connection status badge
   - Verify user exists in SendBird system
   - Check browser console for SDK errors

4. **Participants missing from chat:**
   - Ensure all users have proper roles assigned
   - Check company assignments in database
   - Verify SendBird user creation process

**Debug Mode:**
Set `VITE_SENDBIRD_DEBUG=true` to enable detailed logging in browser console.

**Getting Help:**
- Check browser console for error messages
- Review SendBird dashboard for application status
- See `SENDBIRD_SETUP.md` for detailed configuration



## Development Notes

### SendBird Integration Architecture

The chat system uses a robust integration layer for reliable messaging:

- **User Bootstrap Process**: Automatically creates users in SendBird before connection attempts
- **Connection Management**: Centralized connection state management with retry logic
- **Participant Management**: Ensures all required participants are included in chat rooms
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

**Key Components:**
- `useSendBirdConnection` hook: Manages connection lifecycle
- `sendbird/user.ts`: User creation and management service
- `sendbird/config.ts`: Configuration and helper functions
- Enhanced API client with chat-specific error handling

**State Management:**
- Single `chatState` enum replaces multiple boolean flags
- Real-time connection status tracking
- Proper cleanup and state reset on unmount

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
