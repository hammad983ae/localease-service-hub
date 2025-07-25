# LocalEase Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start MongoDB locally (default: mongodb://localhost:27017/localease)

3. Start the server:
   ```bash
   node server.js
   ```

## API Endpoints

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT
- `GET /api/profile` — Get current user profile (JWT required)
- `PUT /api/profile` — Update current user profile (JWT required)

## Notes
- Update `JWT_SECRET` in `server.js` for production use.
- Add more endpoints for bookings and services as needed. 