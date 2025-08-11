# Localease Service Hub - REST API Backend

This backend has been converted from GraphQL to REST APIs for better performance and easier integration.

## Architecture

- **REST API Server**: `server-rest.cjs` - Main REST API endpoints
- **Socket.IO Server**: `socket-server.cjs` - Real-time chat functionality
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Authentication with JSON Web Tokens

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB running locally on port 27017
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB:
```bash
# Make sure MongoDB is running on localhost:27017
mongod
```

### Running the Servers

#### Option 1: Run both servers separately

1. Start the REST API server:
```bash
npm run start:backend
# or for development with auto-restart:
npm run dev:backend
```

2. Start the Socket.IO server (in a separate terminal):
```bash
npm run start:socket
# or for development with auto-restart:
npm run dev:socket
```

#### Option 2: Run both servers with a single command

You can create a script to run both servers simultaneously, or use a process manager like PM2.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout (client-side token removal)

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID (admin only)
- `GET /api/users` - Get all users (admin only)
- `PATCH /api/users/:id/role` - Update user role (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `PUT /api/users/change-password` - Change password

### Bookings
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/company` - Get company's bookings (company users)
- `GET /api/bookings/:id` - Get specific booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company by ID
- `POST /api/companies` - Create company profile
- `PUT /api/companies/:id` - Update company profile
- `DELETE /api/companies/:id` - Delete company (admin only)
- `GET /api/companies/email/:email` - Get company by email
- `GET /api/companies/type/:companyType` - Get companies by type

### Chat
- `GET /api/chat/rooms` - Get user's chat rooms
- `GET /api/chat/rooms/:roomId` - Get chat room by ID
- `GET /api/chat/rooms/:roomId/messages` - Get messages for a chat room
- `POST /api/chat/rooms` - Create a new chat room
- `POST /api/chat/rooms/:roomId/messages` - Send a message
- `PATCH /api/chat/rooms/:roomId/read` - Mark messages as read
- `GET /api/chat/unread-count` - Get unread message count
- `DELETE /api/chat/rooms/:roomId` - Delete chat room (admin only)

### Quotes
- `GET /api/quotes` - Get user's quotes
- `GET /api/quotes/:id` - Get quote by ID
- `POST /api/quotes` - Create a new quote
- `PUT /api/quotes/:id` - Update quote
- `PATCH /api/quotes/:id/status` - Accept/Reject quote
- `GET /api/quotes/:id/invoices` - Get invoices for a quote
- `POST /api/quotes/:id/invoices` - Create invoice for a quote
- `DELETE /api/quotes/:id` - Delete quote (admin only)

### Admin (Admin role required)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/companies` - Get all companies
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/bookings/:type` - Get bookings by type
- `PATCH /api/admin/bookings/:type/:id/status` - Update booking status
- `GET /api/admin/quotes` - Get all quotes
- `GET /api/admin/invoices` - Get all invoices
- `GET /api/admin/chat/rooms` - Get all chat rooms
- `GET /api/admin/chat/rooms/:roomId/messages` - Get messages for a chat room
- `GET /api/admin/stats` - Get dashboard statistics

## Socket.IO Events

### Client to Server
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

### Server to Client
- `new_message` - New message received
- `chat_updated` - Chat room updated
- `user_typing` - User started typing
- `user_stopped_typing` - User stopped typing
- `user_joined` - User joined chat room
- `user_left` - User left chat room
- `error` - Error message

## Environment Variables

Create a `.env` file in the backend directory:

```env
JWT_SECRET=your_jwt_secret_here
PORT=5002
SOCKET_PORT=5003
MONGODB_URI=mongodb://localhost:27017/localease
```

## Database Models

- **User**: User accounts and authentication
- **UserProfile**: Extended user profile information
- **Company**: Company profiles and services
- **MovingBooking**: Moving service bookings
- **DisposalBooking**: Disposal service bookings
- **TransportBooking**: Transport service bookings
- **ChatRoom**: Chat rooms for communication
- **Message**: Individual chat messages
- **Quote**: Service quotes and estimates
- **Invoice**: Billing invoices

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token contains:
- `userId`: User's unique identifier
- `role`: User's role (user, company, admin)

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

### File Structure
```
backend/
├── models/          # Database models
├── routes/          # API route handlers
├── middleware/      # Authentication and validation middleware
├── server-rest.cjs  # Main REST API server
├── socket-server.cjs # Socket.IO server
└── README-REST.md   # This file
```

### Adding New Endpoints

1. Create or update route files in `routes/`
2. Add the route to `server-rest.cjs`
3. Update this documentation

### Testing

Test the API endpoints using tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

## Migration from GraphQL

This backend has been completely converted from GraphQL to REST APIs. The main changes include:

- Removed all GraphQL dependencies
- Converted GraphQL resolvers to REST route handlers
- Replaced GraphQL subscriptions with Socket.IO for real-time features
- Simplified data fetching and mutations
- Improved performance and reduced complexity

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: Ensure MongoDB is running on port 27017
2. **Port Already in Use**: Change ports in environment variables
3. **JWT Token Invalid**: Check token expiration and secret
4. **CORS Error**: Verify frontend origin matches CORS configuration

### Logs

Check console output for:
- Server startup messages
- Database connection status
- API request logs
- Socket.IO connection logs
- Error messages

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check MongoDB connection and database state
