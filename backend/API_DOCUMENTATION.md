# Localease Service Hub - REST API Documentation

## Base URL
```
http://localhost:5002/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints Overview

### 🔐 Authentication (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout

### 👤 Users (`/users`)
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `GET /users/:id` - Get user by ID (admin only)
- `GET /users` - Get all users (admin only)
- `PATCH /users/:id/role` - Update user role (admin only)
- `DELETE /users/:id` - Delete user (admin only)
- `PUT /users/change-password` - Change password

### 📚 Bookings (`/bookings`)
- `GET /bookings/moving` - Get user's moving bookings
- `GET /bookings/moving/:id` - Get moving booking by ID
- `POST /bookings/moving` - Create moving booking
- `PUT /bookings/moving/:id` - Update moving booking
- `GET /bookings/disposal` - Get user's disposal bookings
- `GET /bookings/disposal/:id` - Get disposal booking by ID
- `POST /bookings/disposal` - Create disposal booking
- `GET /bookings/transport` - Get user's transport bookings
- `GET /bookings/transport/:id` - Get transport booking by ID
- `POST /bookings/transport` - Create transport booking
- `GET /bookings/admin/all` - Get all bookings (admin only)
- `PATCH /bookings/admin/:type/:id/status` - Update booking status (admin only)

### 🏢 Companies (`/companies`)
- `GET /companies` - Get all companies (public)
- `GET /companies/:id` - Get company by ID (public)
- `GET /companies/profile/me` - Get current user's company profile
- `POST /companies` - Create company profile
- `PUT /companies/profile/me` - Update company profile
- `GET /companies/profile/bookings` - Get company's bookings
- `PATCH /companies/profile/bookings/:type/:id/status` - Update company booking status
- `GET /companies/admin/all` - Get all companies (admin only)
- `PATCH /companies/admin/:id/approval` - Approve/reject company (admin only)
- `DELETE /companies/admin/:id` - Delete company (admin only)

### 💬 Chat (`/chat`)
- `GET /chat/rooms` - Get user's chat rooms
- `GET /chat/rooms/:roomId` - Get chat room by ID
- `GET /chat/rooms/:roomId/messages` - Get messages for a chat room
- `POST /chat/rooms/:roomId/messages` - Send a message
- `POST /chat/rooms` - Create a new chat room
- `PATCH /chat/rooms/:roomId/messages/read` - Mark messages as read
- `GET /chat/unread-count` - Get unread message count

### 💰 Quotes (`/quotes`)
- `GET /quotes/chat/:chatRoomId` - Get quotes for a chat room
- `POST /quotes/chat/:chatRoomId` - Create a new quote
- `PATCH /quotes/:quoteId/status` - Update quote status
- `POST /quotes/:quoteId/counter-offer` - Create counter offer
- `GET /quotes/documents` - Get quote documents
- `POST /quotes/documents` - Create quote document
- `PUT /quotes/documents/:id` - Update quote document
- `GET /quotes/admin/all` - Get all quotes (admin only)
- `GET /quotes/admin/documents` - Get all quote documents (admin only)

### 👨‍💼 Admin (`/admin`)
- `GET /admin/stats` - Get admin dashboard statistics
- `GET /admin/users` - Get all users with filters
- `PATCH /admin/users/:id/role` - Update user role
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/bookings` - Get all bookings with filters
- `PATCH /admin/bookings/:type/:id/status` - Update booking status
- `GET /admin/companies` - Get all companies with filters
- `PATCH /admin/companies/:id/approval` - Approve/reject company
- `GET /admin/analytics/revenue` - Get revenue analytics
- `GET /admin/analytics/users` - Get user growth analytics

## Detailed Endpoint Documentation

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St, City, State",
  "role": "user"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St, City, State",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User registered successfully"
}
```

#### POST /auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  },
  "message": "Login successful"
}
```

### Booking Endpoints

#### POST /bookings/moving
Create a new moving service booking.

**Request Body:**
```json
{
  "rooms": [
    {
      "floor": "1",
      "room": "bedroom",
      "count": 2
    }
  ],
  "items": {
    "bed": 2,
    "wardrobe": 2,
    "desk": 1
  },
  "dateTime": "2024-02-01T10:00:00.000Z",
  "dateTimeFlexible": "morning",
  "addresses": {
    "from": "123 Old St, Old City, State",
    "to": "456 New St, New City, State"
  },
  "contact": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "notes": "Fragile items need special care"
  },
  "company": "company_id_here"
}
```

**Response:**
```json
{
  "message": "Moving booking created successfully",
  "booking": {
    "id": "booking_id",
    "userId": "user_id",
    "rooms": [...],
    "items": {...},
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Chat Endpoints

#### GET /chat/rooms
Get all chat rooms for the authenticated user.

**Response:**
```json
[
  {
    "id": "chat_room_id",
    "bookingId": "booking_id",
    "bookingType": "moving",
    "userId": "user_id",
    "companyId": "company_id",
    "chatType": "user_company",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /chat/rooms/:roomId/messages
Send a message in a chat room.

**Request Body:**
```json
{
  "content": "Hello! I have a question about my booking.",
  "messageType": "text"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "data": {
    "id": "message_id",
    "chatRoomId": "chat_room_id",
    "senderId": "user_id",
    "senderType": "user",
    "content": "Hello! I have a question about my booking.",
    "messageType": "text",
    "isRead": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Company Endpoints

#### POST /companies
Create a company profile (requires company role).

**Request Body:**
```json
{
  "name": "Professional Moving Co.",
  "email": "info@movingco.com",
  "phone": "+1234567890",
  "address": {
    "street": "789 Business Ave",
    "city": "Business City",
    "state": "State",
    "zipCode": "12345"
  },
  "description": "Professional moving services with 20+ years experience",
  "services": ["moving", "packing", "storage"],
  "priceRange": "$$",
  "companyType": "corporation"
}
```

**Response:**
```json
{
  "message": "Company profile created successfully",
  "company": {
    "id": "company_id",
    "name": "Professional Moving Co.",
    "services": ["moving", "packing", "storage"],
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Admin Endpoints

#### GET /admin/stats
Get comprehensive dashboard statistics (admin only).

**Response:**
```json
{
  "totalUsers": 1250,
  "activeCompanies": 45,
  "totalBookings": 890,
  "totalRevenue": 125000.50,
  "monthlyRevenue": [
    {
      "_id": {
        "year": 2024,
        "month": 1
      },
      "total": 25000.00
    }
  ],
  "growthRate": 15.5,
  "pendingApprovals": 23,
  "totalInvoices": 156,
  "averageBookingValue": 140.45,
  "completionRate": 92.3,
  "totalChatRooms": 445,
  "totalMessages": 2340
}
```

## Error Handling

All endpoints return consistent error responses:

**4xx Client Errors:**
```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```

**5xx Server Errors:**
```json
{
  "error": "Something went wrong!",
  "message": "Detailed error message"
}
```

## Pagination

Endpoints that return lists support pagination with query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## WebSocket Support

Real-time chat functionality is available via WebSocket connection:

**Connection URL:**
```
ws://localhost:5002/ws?token=<jwt_token>
```

**Message Format:**
```json
{
  "type": "message",
  "chatRoomId": "room_id",
  "content": "Message content"
}
```

## Rate Limiting

API endpoints are subject to rate limiting to prevent abuse. Limits are applied per IP address and user account.

## Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- CORS protection
- Secure password hashing with bcrypt
- Token expiration and refresh mechanism

## Environment Variables

Configure the following environment variables:

```env
PORT=5002
JWT_SECRET=your_secure_jwt_secret
MONGODB_URI=mongodb://mongo:bomgIVKQxBvDazjNOecSPsxTywtBAOdO@shinkansen.proxy.rlwy.net:21344
```

## Testing

Test the API endpoints using tools like:
- Postman
- Insomnia
- cURL
- Thunder Client (VS Code extension)

## Support

For API support and questions, please refer to the project documentation or contact the development team.
