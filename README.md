# Localease Service Hub

A comprehensive service booking platform for moving, disposal, and transport services.

## Features

- **Multi-service Booking**: Moving, disposal, and transport services
- **Real-time Chat**: Live messaging between users and companies
- **Quote Management**: Send and accept quotes with document generation
- **Company Dashboard**: Comprehensive dashboard for service providers
- **Google Maps Integration**: Address autocomplete and location selection
- **Multi-language Support**: Internationalization support
- **Responsive Design**: Mobile-first approach

## Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Google Maps API Key

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
# Google Maps API Key (Required for location selection)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Other environment variables as needed
```

### Google Maps Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Create credentials (API Key)
5. Add the API key to your `.env` file as `VITE_GOOGLE_MAPS_API_KEY`

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
- GraphQL subscriptions for real-time updates
- Message read status tracking
- Quote sending and acceptance

## Google Maps Integration

Location selection throughout the application uses Google Maps for:
- Address autocomplete
- Precise location coordinates
- Address validation
- Enhanced user experience

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
