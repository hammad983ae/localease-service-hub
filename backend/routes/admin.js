const express = require('express');
const { User } = require('../models/User.js');
const { Company } = require('../models/Company.js');
const { MovingBooking } = require('../models/MovingBooking.js');
const { DisposalBooking } = require('../models/DisposalBooking.js');
const { TransportBooking } = require('../models/TransportBooking.js');
const { Quote } = require('../models/Quote.js');
const { Invoice } = require('../models/Invoice.js');
const { ChatRoom } = require('../models/ChatRoom.js');
const { Message } = require('../models/Message.js');

// Ensure all models are registered
require('../models/User.js');
require('../models/MovingBooking.js');
require('../models/DisposalBooking.js');
require('../models/TransportBooking.js');
require('../models/Company.js');
require('../models/Quote.js');
require('../models/Invoice.js');
require('../models/ChatRoom.js');
require('../models/Message.js');

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// ===== USER MANAGEMENT =====

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    
    let query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add role filter
    if (role) {
      query.role = role;
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Admin user fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'company', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Admin user role update error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete associated data
    await Promise.all([
      Company.deleteMany({ userId: req.params.id }),
      MovingBooking.deleteMany({ userId: req.params.id }),
      DisposalBooking.deleteMany({ userId: req.params.id }),
      TransportBooking.deleteMany({ userId: req.params.id }),
      Quote.deleteMany({ userId: req.params.id }),
      Invoice.deleteMany({ userId: req.params.id })
    ]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin user deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ===== COMPANY MANAGEMENT =====

// Get all companies
router.get('/companies', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, companyType, status } = req.query;
    
    let query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add company type filter
    if (companyType) {
      query.companyType = companyType;
    }
    
    const skip = (page - 1) * limit;
    
    const companies = await Company.find(query)
      .populate('userId', 'email full_name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Company.countDocuments(query);
    
    res.json({
      companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin companies fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get company by ID
router.get('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('userId', 'email full_name');
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Admin company fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Approve/reject company
router.patch('/companies/:id/approval', async (req, res) => {
  try {
    const { approved, reason } = req.body;
    
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { 
        status: approved ? 'approved' : 'rejected',
        approvalReason: reason,
        approvedAt: approved ? new Date() : null
      },
      { new: true }
    ).populate('userId', 'email full_name');
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({
      message: `Company ${approved ? 'approved' : 'rejected'} successfully`,
      company
    });
  } catch (error) {
    console.error('Admin company approval error:', error);
    res.status(500).json({ error: 'Failed to update company approval status' });
  }
});

// Delete company
router.delete('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    // Update user role back to 'user'
    if (company.userId) {
      await User.findByIdAndUpdate(company.userId, { role: 'user' });
    }
    
    // Delete associated data
    await Promise.all([
      MovingBooking.deleteMany({ companyId: req.params.id }),
      DisposalBooking.deleteMany({ companyId: req.params.id }),
      TransportBooking.deleteMany({ companyId: req.params.id }),
      Quote.deleteMany({ companyId: req.params.id }),
      Invoice.deleteMany({ companyId: req.params.id })
    ]);
    
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Admin company deletion error:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// ===== BOOKING MANAGEMENT =====

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, search } = req.query;
    
    let allBookings = [];
    let total = 0;
    
    // Get moving bookings
    if (!type || type === 'moving') {
      const movingBookings = await MovingBooking.find()
        .populate('userId', 'full_name email')
        .sort({ createdAt: -1 });
      
      allBookings.push(...movingBookings.map(b => ({ ...b.toObject(), type: 'moving' })));
      total += await MovingBooking.countDocuments();
    }
    
    // Get disposal bookings
    if (!type || type === 'disposal') {
      const disposalBookings = await DisposalBooking.find()
        .populate('userId', 'full_name email')
        .sort({ createdAt: -1 });
      
      allBookings.push(...disposalBookings.map(b => ({ ...b.toObject(), type: 'disposal' })));
      total += await DisposalBooking.countDocuments();
    }
    
    // Get transport bookings
    if (!type || type === 'transport') {
      const transportBookings = await TransportBooking.find()
        .populate('userId', 'full_name email')
        .sort({ createdAt: -1 });
      
      allBookings.push(...transportBookings.map(b => ({ ...b.toObject(), type: 'transport' })));
      total += await TransportBooking.countDocuments();
    }
    
    // Sort by creation date
    allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply status filter if provided
    if (status) {
      allBookings = allBookings.filter(booking => booking.status === status);
      total = allBookings.length;
    }
    
    // Apply search filter if provided
    if (search) {
      allBookings = allBookings.filter(booking => 
        booking.userId?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        booking.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        booking.company?.name?.toLowerCase().includes(search.toLowerCase())
      );
      total = allBookings.length;
    }
    
    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedBookings = allBookings.slice(skip, skip + parseInt(limit));
    
    res.json({
      bookings: paginatedBookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin bookings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get specific type of bookings
router.get('/bookings/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20, status, search } = req.query;
    
    let model;
    let query = {};
    
    switch (type) {
      case 'moving':
        model = MovingBooking;
        break;
      case 'disposal':
        model = DisposalBooking;
        break;
      case 'transport':
        model = TransportBooking;
        break;
      default:
        return res.status(400).json({ error: 'Invalid booking type' });
    }
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const bookings = await model.find(query)
      .populate('userId', 'full_name email')
      .populate('companyId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await model.countDocuments(query);
    
    res.json({
      bookings: bookings.map(b => ({ ...b.toObject(), type })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin specific bookings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status
router.patch('/bookings/:type/:id/status', async (req, res) => {
  console.log('🚀 Route hit: PATCH /bookings/:type/:id/status');
  console.log('📝 Request params:', req.params);
  console.log('📝 Request body:', req.body);
  console.log('👤 User:', req.user);
  try {
    const { type, id } = req.params;
    const { status, reason } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    let model;
    
    switch (type) {
      case 'moving':
        model = MovingBooking;
        break;
      case 'disposal':
        model = DisposalBooking;
        break;
      case 'transport':
        model = TransportBooking;
        break;
      default:
        return res.status(400).json({ error: 'Invalid booking type' });
    }
    
    const updateData = { status };
    if (reason) {
      updateData.statusReason = reason;
    }
    
    const booking = await model.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'full_name email');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // If booking is approved, assign to company and create a chat room automatically
    if (status === 'approved') {
      console.log('🎯 Attempting to assign approved booking to company and create chat room:', id);
      try {
        // Find available companies for this service type
        let availableCompanies = [];
        switch (type) {
          case 'moving':
            availableCompanies = await Company.find({ 
              services: { $in: ['moving', 'relocation'] },
              isActive: true 
            }).sort({ rating: -1, createdAt: 1 });
            break;
          case 'disposal':
            availableCompanies = await Company.find({ 
              services: { $in: ['disposal', 'waste-removal'] },
              isActive: true 
            }).sort({ rating: -1, createdAt: 1 });
            break;
          case 'transport':
            availableCompanies = await Company.find({ 
              services: { $in: ['transport', 'delivery'] },
              isActive: true 
            }).sort({ rating: -1, createdAt: 1 });
            break;
        }

        if (availableCompanies.length === 0) {
          console.log('⚠️ No available companies found for service type:', type);
          // Still create chat room but without company assignment
        } else {
          // Assign to the first available company (best rated or oldest)
          const assignedCompany = availableCompanies[0];
          console.log('🏢 Assigning booking to company:', assignedCompany._id, assignedCompany.name);
          
          // Update booking with company assignment
          await model.findByIdAndUpdate(id, { 
            companyId: assignedCompany._id,
            assignedAt: new Date()
          });
          
          console.log('✅ Booking assigned to company successfully');
        }

        // Check if chat room already exists
        const existingChatRoom = await ChatRoom.findOne({
          bookingId: id,
          chatType: 'admin_user',
          isActive: true
        });
        
        console.log('🔍 Existing chat room check:', existingChatRoom ? 'Found' : 'Not found');
        
        if (!existingChatRoom) {
          console.log('🏗️ Creating new chat room...');
          
          // Create new chat room
          const chatRoomData = {
            bookingId: id,
            bookingType: type,
            userId: booking.userId._id,
            adminId: req.user.userId, // Current admin
            chatType: 'admin_user',
            status: 'active',
            isActive: true
          };

          // Add company to chat room if assigned
          if (availableCompanies.length > 0) {
            chatRoomData.companyId = availableCompanies[0]._id;
            chatRoomData.chatType = 'admin_user_company';
          }
          
          const chatRoom = new ChatRoom(chatRoomData);
          
          console.log('📝 Chat room data:', chatRoomData);
          
          await chatRoom.save();
          console.log('✅ Chat room saved successfully:', chatRoom._id);
          
          // Create welcome message
          const welcomeMessage = new Message({
            chatRoomId: chatRoom._id,
            senderId: req.user.userId,
            senderType: 'admin',
            content: `Booking approved! Welcome to your service chat. How can we help you today?`,
            messageType: 'system_notification',
            isSystemMessage: true
          });
          
          await welcomeMessage.save();
          console.log('✅ Welcome message saved successfully');
          
          // Update chat room with last message
          await ChatRoom.findByIdAndUpdate(chatRoom._id, {
            lastMessage: welcomeMessage.content,
            lastMessageAt: welcomeMessage.createdAt
          });
          
          console.log(`🎉 Chat room creation complete for booking ${id}`);
        } else {
          console.log('ℹ️ Chat room already exists for this booking');
        }
      } catch (chatError) {
        console.error('❌ Error creating chat room:', chatError);
        console.error('❌ Error details:', {
          message: chatError.message,
          stack: chatError.stack
        });
        // Don't fail the booking approval if chat creation fails
      }
    }
    
    res.json({
      message: 'Booking status updated successfully',
      booking: { ...booking.toObject(), type }
    });
  } catch (error) {
    console.error('Admin booking status update error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// ===== QUOTE & INVOICE MANAGEMENT =====

// Get all quotes
router.get('/quotes', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (type) query.quoteType = type;
    
    const skip = (page - 1) * limit;
    
    const quotes = await Quote.find(query)
      .populate('userId', 'full_name email')
      .populate('companyId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Quote.countDocuments(query);
    
    res.json({
      quotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin quotes fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get all invoices
router.get('/invoices', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    
    const invoices = await Invoice.find(query)
      .populate('userId', 'full_name email')
      .populate('companyId', 'name email')
      .populate('quoteId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Invoice.countDocuments(query);
    
    res.json({
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin invoices fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// ===== CHAT MANAGEMENT =====

// Get all chat rooms
router.get('/chat/rooms', async (req, res) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    
    let query = {};
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const skip = (page - 1) * limit;
    
    const chatRooms = await ChatRoom.find(query)
      .populate('userId', 'full_name email')
      .populate('companyId', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await ChatRoom.countDocuments(query);
    
    res.json({
      chatRooms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin chat rooms fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
});

// Get messages for a chat room
router.get('/chat/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({ chatRoomId: roomId })
      .populate('senderId', 'full_name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Message.countDocuments({ chatRoomId: roomId });
    
    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin chat messages fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ===== DASHBOARD STATS =====

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalCompanies,
      totalBookings,
      totalQuotes,
      totalInvoices,
      totalChatRooms
    ] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      Promise.all([
        MovingBooking.countDocuments(),
        DisposalBooking.countDocuments(),
        TransportBooking.countDocuments()
      ]).then(counts => counts.reduce((a, b) => a + b, 0)),
      Quote.countDocuments(),
      Invoice.countDocuments(),
      ChatRoom.countDocuments()
    ]);

    // Calculate additional stats
    const pendingBookings = await Promise.all([
      MovingBooking.countDocuments({ status: 'pending' }),
      DisposalBooking.countDocuments({ status: 'pending' }),
      TransportBooking.countDocuments({ status: 'pending' })
    ]).then(counts => counts.reduce((a, b) => a + b, 0));

    const approvedBookings = await Promise.all([
      MovingBooking.countDocuments({ status: 'approved' }),
      DisposalBooking.countDocuments({ status: 'approved' }),
      TransportBooking.countDocuments({ status: 'approved' })
    ]).then(counts => counts.reduce((a, b) => a + b, 0));

    const completedBookings = await Promise.all([
      MovingBooking.countDocuments({ status: 'completed' }),
      DisposalBooking.countDocuments({ status: 'completed' }),
      TransportBooking.countDocuments({ status: 'completed' })
    ]).then(counts => counts.reduce((a, b) => a + b, 0));

    // Calculate completion rate
    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
    
    // Get recent activity
    const recentBookings = await Promise.all([
      MovingBooking.find().sort({ createdAt: -1 }).limit(5),
      DisposalBooking.find().sort({ createdAt: -1 }).limit(5),
      TransportBooking.find().sort({ createdAt: -1 }).limit(5)
    ]);
    
    const allRecentBookings = [
      ...recentBookings[0].map(b => ({ ...b.toObject(), type: 'moving' })),
      ...recentBookings[1].map(b => ({ ...b.toObject(), type: 'disposal' })),
      ...recentBookings[2].map(b => ({ ...b.toObject(), type: 'transport' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    
    res.json({
      stats: {
        totalUsers,
        activeCompanies: totalCompanies, // Changed from totalCompanies to match interface
        totalBookings,
        totalRevenue: 0, // Placeholder - no revenue data in current models
        monthlyRevenue: 0, // Placeholder
        growthRate: 0, // Placeholder
        pendingApprovals: pendingBookings,
        totalInvoices,
        averageBookingValue: 0, // Placeholder
        userSatisfaction: 85, // Placeholder - could be calculated from reviews
        responseTime: 2, // Placeholder - in hours
        completionRate
      },
      recentActivity: {
        recentBookings: allRecentBookings
      }
    });
  } catch (error) {
    console.error('Admin stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
