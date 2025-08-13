// Production configuration for Railway deployment
module.exports = {
  NODE_ENV: 'production',
  PORT: process.env.PORT || 5002,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/LocalE',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  
  // CORS origins for production
  ALLOWED_ORIGINS: [
    'https://clear.high-score.dev',
    'https://localease-service-hub-production.up.railway.app'
  ],
  
  // Logging
  LOG_LEVEL: 'info',
  
  // Security
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100 // requests per window
};
