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

The application features real-time chat functionality using:
- WebSocket connections for live messaging
- REST API endpoints for data management
- Message read status tracking
- Quote sending and acceptance



## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
