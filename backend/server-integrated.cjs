const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
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

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:8081", "https://clear.high-score.dev"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map();

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'https://clear.high-score.dev'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/LocalE';
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

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/bookings', authenticateToken, bookingRoutes);
app.use('/api/companies', authenticateToken, companyRoutes);
app.use('/api/company', authenticateToken, companyDashboardRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/quotes', authenticateToken, quoteRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// Socket.IO Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user still exists in database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Add user info to socket
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    socket.userEmail = user.email;
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO Connection handler
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} (${socket.userRole}) connected`);
  
  // Store connected user
  connectedUsers.set(socket.userId, {
    socketId: socket.id,
    role: socket.userRole,
    email: socket.userEmail
  });

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Handle joining a chat room
  socket.on('join_room', async (data) => {
    try {
      const { roomId, chatRoomId } = data;
      const targetRoomId = chatRoomId || roomId; // Support both parameter names
      
      console.log(`🔍 join_room event received:`, {
        roomId,
        chatRoomId,
        targetRoomId,
        userId: socket.userId,
        userRole: socket.userRole
      });
      
      if (!targetRoomId) {
        console.log(`❌ No room ID provided for join_room`);
        socket.emit('error', { message: 'Room ID is required' });
        return;
      }
      
      // Verify user has access to this chat room
      const chatRoom = await ChatRoom.findById(targetRoomId);
      if (!chatRoom) {
        console.log(`❌ Chat room not found for join_room: ${targetRoomId}`);
        socket.emit('error', { message: 'Chat room not found' });
        return;
      }

      console.log(`✅ Chat room found for join_room:`, {
        id: chatRoom._id,
        bookingId: chatRoom.bookingId,
        userId: chatRoom.userId,
        adminId: chatRoom.adminId
      });

      // Check if user has access to this chat room
      if (socket.userRole !== 'admin' && 
          chatRoom.userId?.toString() !== socket.userId && 
          chatRoom.companyId?.toString() !== socket.userId) {
        console.log(`❌ Access denied for join_room: user ${socket.userId} to chat room ${targetRoomId}`);
        socket.emit('error', { message: 'Access denied to this chat room' });
        return;
      }

      // Leave previous chat room if any
      socket.leaveAll();
      
      // Join the new chat room
      socket.join(`chat_${targetRoomId}`);
      socket.join(`user_${socket.userId}`);
      
      console.log(`✅ User ${socket.userId} joined chat room ${targetRoomId}`);
      console.log(`✅ Socket joined rooms:`, Array.from(socket.rooms));
      
      // Notify other users in the chat room
      socket.to(`chat_${targetRoomId}`).emit('user_joined', {
        userId: socket.userId,
        userRole: socket.userRole,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('❌ Error joining chat room:', error);
      socket.emit('error', { message: 'Failed to join chat room' });
    }
  });

  // Handle leaving a chat room
  socket.on('leave_room', async (data) => {
    try {
      const { roomId, chatRoomId } = data;
      const targetRoomId = chatRoomId || roomId; // Support both parameter names
      
      if (targetRoomId) {
        socket.leave(`chat_${targetRoomId}`);
        console.log(`User ${socket.userId} left chat room ${targetRoomId}`);
      }
    } catch (error) {
      console.error('Error leaving chat room:', error);
    }
  });

  // Handle chat room subscription
  socket.on('subscribe', async (data) => {
    try {
      const { roomId } = data;
      
      // Verify user has access to this chat room
      const chatRoom = await ChatRoom.findById(roomId);
      if (!chatRoom) {
        socket.emit('error', { message: 'Chat room not found' });
        return;
      }

      // Check if user has access to this chat room
      if (socket.userRole !== 'admin' && 
          chatRoom.userId?.toString() !== socket.userId && 
          chatRoom.companyId?.toString() !== socket.userId) {
        socket.emit('error', { message: 'Access denied to this chat room' });
        return;
      }

      // Join the chat room
      socket.join(`chat_${roomId}`);
      console.log(`User ${socket.userId} subscribed to chat room ${roomId}`);
      
    } catch (error) {
      console.error('Error subscribing to chat room:', error);
      socket.emit('error', { message: 'Failed to subscribe to chat room' });
    }
  });

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { chatRoomId, content, messageType = 'text' } = data;
      
      console.log(`🔍 send_message event received:`, {
        chatRoomId,
        content,
        messageType,
        userId: socket.userId,
        userRole: socket.userRole
      });
      
      // Verify user has access to this chat room
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        console.log(`❌ Chat room not found for ID: ${chatRoomId}`);
        socket.emit('error', { message: 'Chat room not found' });
        return;
      }

      console.log(`✅ Chat room found:`, {
        id: chatRoom._id,
        bookingId: chatRoom.bookingId,
        userId: chatRoom.userId,
        adminId: chatRoom.adminId
      });

      // Check if user has access to this chat room
      if (socket.userRole !== 'admin' && 
          chatRoom.userId?.toString() !== socket.userId && 
          chatRoom.companyId?.toString() !== socket.userId) {
        console.log(`❌ Access denied for user ${socket.userId} to chat room ${chatRoomId}`);
        socket.emit('error', { message: 'Access denied to this chat room' });
        return;
      }

      // Create and save the message
      const message = new Message({
        chatRoomId,
        senderId: socket.userId,
        senderType: socket.userRole,
        content,
        messageType,
        isRead: false
      });

      await message.save();
      console.log(`✅ Message saved:`, message._id);

      // Update chat room's last message and timestamp
      await ChatRoom.findByIdAndUpdate(chatRoomId, {
        lastMessage: content,
        lastMessageAt: new Date(),
        updatedAt: new Date()
      });

      // Populate sender info
      await message.populate('senderId', 'full_name email');

      // Emit the message to all users in the chat room
      io.to(`chat_${chatRoomId}`).emit('new_message', {
        message: {
          id: message._id,
          chatRoomId: message.chatRoomId,
          senderId: message.senderId,
          senderType: message.senderType,
          content: message.content,
          messageType: message.messageType,
          isRead: message.isRead,
          createdAt: message.createdAt
        }
      });

      // Emit chat room update
      io.to(`chat_${chatRoomId}`).emit('chat_room_updated', {
        chatRoomId,
        lastMessage: content,
        lastMessageAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`🎉 Message sent in chat room ${chatRoomId} by user ${socket.userId}`);
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { roomId, chatRoomId } = data;
    const targetRoomId = chatRoomId || roomId; // Support both parameter names
    
    console.log(`🔍 typing_start event received:`, {
      roomId,
      chatRoomId,
      targetRoomId,
      userId: socket.userId,
      userRole: socket.userRole
    });
    
    if (targetRoomId) {
      socket.to(`chat_${targetRoomId}`).emit('user_typing', {
        userId: socket.userId,
        userRole: socket.userRole,
        timestamp: new Date()
      });
      console.log(`✅ Typing start emitted to chat_${targetRoomId}`);
    } else {
      console.log(`❌ No room ID provided for typing_start`);
    }
  });

  socket.on('typing_stop', (data) => {
    const { roomId, chatRoomId } = data;
    const targetRoomId = chatRoomId || roomId; // Support both parameter names
    
    console.log(`🔍 typing_stop event received:`, {
      roomId,
      chatRoomId,
      targetRoomId,
      userId: socket.userId,
      userRole: socket.userRole
    });
    
    if (targetRoomId) {
      socket.to(`chat_${targetRoomId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        userRole: socket.userRole,
        timestamp: new Date()
      });
      console.log(`✅ Typing stop emitted to chat_${targetRoomId}`);
    } else {
      console.log(`❌ No room ID provided for typing_stop`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
    
    // Remove from connected users
    connectedUsers.delete(socket.userId);
    
    // Notify all chat rooms this user was in
    socket.rooms.forEach(room => {
      if (room.startsWith('chat_')) {
        socket.to(room).emit('user_left', {
          userId: socket.userId,
          userRole: socket.userRole,
          timestamp: new Date()
        });
      }
    });
  });
});

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
  console.log(`📡 REST API: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`✅ MongoDB: Connected`);
  console.log(`🔧 Process ID: ${process.pid}`);
  console.log(`🔧 Node Version: ${process.version}`);
  console.log(`🔧 Platform: ${process.platform}`);
  console.log(`🔧 Architecture: ${process.arch}`);
  console.log(`🔧 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB used`);
  console.log(`🔧 Signal handlers: SIGTERM, SIGINT, SIGUSR1, SIGUSR2 registered`);
});

module.exports = { app, io, connectedUsers };
