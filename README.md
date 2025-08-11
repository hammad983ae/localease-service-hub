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

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:

```env
# Other environment variables as needed
```



### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
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
