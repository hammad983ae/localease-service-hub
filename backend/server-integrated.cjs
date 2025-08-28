const express = require('express');
const { createServer } = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookingRoutes = require('./routes/bookings');
const companyRoutes = require('./routes/companies');
const companyDashboardRoutes = require('./routes/company-dashboard');
const chatRoutes = require('./routes/chat');
const quoteRoutes = require('./routes/quotes');
const adminRoutes = require('./routes/admin');

// Import models
const { User } = require('./models/User.js');
const { Message } = require('./models/Message.js');
const { ChatRoom } = require('./models/ChatRoom.js');
const { UserProfile } = require('./models/UserProfile.js'); // Added UserProfile import

// Import middleware
const { authenticateToken } = require('./middleware/auth');

// Register signal handlers early
console.log('🔧 Registering signal handlers...');

// Test signal handler registration
const testSignalHandlers = () => {
  console.log('🔍 Testing signal handler registration...');
  const signals = ['SIGTERM', 'SIGINT', 'SIGUSR1', 'SIGUSR2'];
  signals.forEach(signal => {
    const listeners = process.listeners(signal);
    console.log(`📡 ${signal}: ${listeners.length} listener(s) registered`);
  });
};

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  console.log('📊 Process info:', {
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
  
  // Close HTTP server
  if (global.httpServer) {
    global.httpServer.close(() => {
      console.log('✅ HTTP server closed');
      
      // Close MongoDB connection
      if (mongoose.connection.readyState === 1) {
        mongoose.connection.close(false, () => {
          console.log('✅ MongoDB connection closed');
          process.exit(0);
        });
      } else {
        console.log('✅ MongoDB already disconnected');
        process.exit(0);
      }
    });
  } else {
    console.log('❌ HTTP server not found, exiting directly');
    process.exit(0);
  }
  
  // Force close after 30 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.emit('SIGTERM');
});

// Additional signal handlers for production
process.on('SIGUSR1', () => {
  console.log('📊 SIGUSR1 received - Process info:', {
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongoState: mongoose.connection.readyState
  });
});

process.on('SIGUSR2', () => {
  console.log('🔄 SIGUSR2 received - Graceful restart signal');
  process.emit('SIGTERM');
});

// Process error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('📊 Process state before exit:', {
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('📊 Process state before exit:', {
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
  process.exit(1);
});

console.log('✅ Signal handlers registered');
testSignalHandlers();

const app = express();
const httpServer = createServer(app);
// Make httpServer globally accessible for signal handlers
global.httpServer = httpServer;
const PORT = process.env.PORT || 5002;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// CORS configuration - allow development and production origins
const allowedOrigins = [
  // Development servers
  'http://localhost:3000',    // Vite dev server
  'http://localhost:8081',    // Current dev port
  'http://localhost:8080',    // Current server port
  'http://localhost:5173',    // Common Vite port
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
  // Production domains
  'https://local.high-score.dev',
  'https://localease-service-hub-production-108d.up.railway.app'
];

console.log('🌐 CORS Configuration:');
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Allowed Origins:`, allowedOrigins);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Specific preflight handler for admin routes to ensure PATCH is allowed
app.options('/api/admin/*', cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Comprehensive preflight handler for all routes
app.options('*', (req, res) => {
  console.log(`🔧 Preflight request: ${req.method} ${req.path}`);
  console.log(`🔧 Origin: ${req.headers.origin}`);
  console.log(`🔧 Access-Control-Request-Method: ${req.headers['access-control-request-method']}`);
  console.log(`🔧 Access-Control-Request-Headers: ${req.headers['access-control-request-headers']}`);
  
  // Set CORS headers for preflight
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
  
  res.status(200).end();
});

// CORS debugging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'} - User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'Unknown'}`);
  
  // Special handling for admin routes and PATCH requests
  if (req.path.startsWith('/api/admin') || req.method === 'PATCH') {
    console.log(`🔧 Admin/PATCH request detected: ${req.method} ${req.path}`);
    console.log(`🔧 Origin: ${req.headers.origin}`);
    console.log(`🔧 Method: ${req.method}`);
    console.log(`🔧 Headers:`, req.headers);
  }
  
  // Add CORS headers to all responses
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  next();
});

// Additional CORS middleware specifically for admin routes
app.use('/api/admin', (req, res, next) => {
  console.log(`🔧 Admin route accessed: ${req.method} ${req.path}`);
  console.log(`🔧 Origin: ${req.headers.origin}`);
  console.log(`🔧 Method: ${req.method}`);
  console.log(`🔧 User-Agent: ${req.headers['user-agent']}`);
  
  // Set CORS headers specifically for admin routes
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`🔧 Admin preflight request handled for: ${req.path}`);
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:bomgIVKQxBvDazjNOecSPsxTywtBAOdO@shinkansen.proxy.rlwy.net:21344';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      mongo: mongoStatus,
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
      },
      pid: process.pid,
      cors: {
        allowedOrigins,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint (required for deployment)
app.get('/railway-health', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      mongo: mongoStatus,
      pid: process.pid
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    method: req.method,
    headers: req.headers
  });
});

// Simple test endpoint (no MongoDB required)
app.get('/api/simple-test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    status: 'success',
    endpoint: '/api/simple-test',
    cors: 'enabled',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test PATCH endpoint for CORS debugging
app.patch('/api/test-patch', (req, res) => {
  console.log('🔧 Test PATCH endpoint hit');
  console.log('🔧 Headers:', req.headers);
  console.log('🔧 Body:', req.body);
  
  res.json({
    message: 'PATCH request successful!',
    timestamp: new Date().toISOString(),
    method: req.method,
    headers: req.headers,
    body: req.body
  });
});

// AUTH FLOW - Direct implementation (no external route files)
// Register new user
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, address, role = 'user' } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      full_name,
      phone,
      address,
      role
    });

    await user.save();
    
    // Create user profile
    const profile = new UserProfile({
      userId: user._id,
      full_name,
      phone,
      address
    });
    await profile.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    // Return user data (without password)
    const userData = {
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
    };
    
    res.status(201).json({ 
      token, 
      user: userData,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login user
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    // Return user data (without password)
    const userData = {
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
    };
    
    res.json({ 
      token, 
      user: userData,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Register external route files
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/bookings', authenticateToken, bookingRoutes);
app.use('/api/companies', authenticateToken, companyRoutes);
app.use('/api/company', authenticateToken, companyDashboardRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/quotes', authenticateToken, quoteRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start integrated server
httpServer.listen(PORT, () => {
  console.log(`🚀 Integrated Server running on port ${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Process ENV PORT: ${process.env.PORT || 'NOT SET'}`);
  console.log(`🔧 Actual PORT used: ${PORT}`);
  console.log(`🔧 Binding to: 0.0.0.0:${PORT}`);
  console.log(`🌐 REST API: http://0.0.0.0:${PORT}`);
  console.log(`✅ MongoDB: Connected`);
  console.log(`🔧 Process ID: ${process.pid}`);
  console.log(`🔧 Node Version: ${process.version}`);
  console.log(`🔧 Platform: ${process.platform}`);
  console.log(`🔧 Architecture: ${process.arch}`);
  console.log(`🔧 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB used`);
  console.log(`🔧 Signal handlers: SIGTERM, SIGINT, SIGUSR1, SIGUSR2 registered`);
});

module.exports = { app, httpServer };