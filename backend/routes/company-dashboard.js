const express = require('express');
const { Company } = require('../models/Company.js');
const { MovingBooking } = require('../models/MovingBooking.js');
const { DisposalBooking } = require('../models/DisposalBooking.js');
const { TransportBooking } = require('../models/TransportBooking.js');
const { ChatRoom } = require('../models/ChatRoom.js');
const { Invoice } = require('../models/Invoice.js');

const router = express.Router();

// Get company's bookings
router.get('/bookings', async (req, res) => {
  try {
    console.log('🔍 Company bookings request received for user:', req.user.userId);
    
    // Find the company associated with this user
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) {
      console.log('❌ Company not found for user:', req.user.userId);
      return res.status(404).json({ error: 'Company not found' });
    }

    console.log('✅ Company found:', company._id);

    // Get all bookings where this company is assigned
    const [movingBookings, disposalBookings, transportBookings] = await Promise.all([
      MovingBooking.find({ companyId: company._id }).populate('userId', 'name email'),
      DisposalBooking.find({ companyId: company._id }).populate('userId', 'name email'),
      TransportBooking.find({ companyId: company._id }).populate('userId', 'name email')
    ]);

    const allBookings = [
      ...movingBookings.map(booking => ({ 
        ...booking.toObject(), 
        id: booking._id, // Add id field for frontend compatibility
        type: 'moving' 
      })),
      ...disposalBookings.map(booking => ({ 
        ...booking.toObject(), 
        id: booking._id, // Add id field for frontend compatibility
        type: 'disposal' 
      })),
      ...transportBookings.map(booking => ({ 
        ...booking.toObject(), 
        id: booking._id, // Add id field for frontend compatibility
        type: 'transport' 
      }))
    ];

    // Group bookings by status
    const pendingApproval = allBookings.filter(booking => booking.status === 'pending_company_approval');
    const approved = allBookings.filter(booking => booking.status === 'approved');
    const rejected = allBookings.filter(booking => booking.status === 'rejected');
    const completed = allBookings.filter(booking => booking.status === 'completed');

    console.log(`✅ Found ${allBookings.length} bookings for company`);
    console.log(`📊 Status breakdown: ${pendingApproval.length} pending, ${approved.length} approved, ${rejected.length} rejected, ${completed.length} completed`);

    res.json({
      bookings: allBookings,
      summary: {
        total: allBookings.length,
        pendingApproval: pendingApproval.length,
        approved: approved.length,
        rejected: rejected.length,
        completed: completed.length,
        moving: movingBookings.length,
        disposal: disposalBookings.length,
        transport: transportBookings.length
      },
      pendingApproval, // Highlight pending approvals
      approved,
      rejected,
      completed
    });
  } catch (error) {
    console.error('❌ Error fetching company bookings:', error);
    res.status(500).json({ error: 'Failed to fetch company bookings' });
  }
});

// Get company's chat rooms
router.get('/chat-rooms', async (req, res) => {
  try {
    console.log('🔍 Company chat rooms request received for user:', req.user.userId);
    
    // Find the company associated with this user
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) {
      console.log('❌ Company not found for user:', req.user.userId);
      return res.status(404).json({ error: 'Company not found' });
    }

    console.log('✅ Company found:', company._id);

    // Get chat rooms where this company is involved
    const chatRooms = await ChatRoom.find({
      $or: [
        { companyId: company._id },
        { 'companyId': company._id }
      ]
    }).populate('userId', 'name email')
      .populate('adminId', 'name email')
      .populate('bookingId')
      .sort({ updatedAt: -1 });

    console.log(`✅ Found ${chatRooms.length} chat rooms for company`);

    // Fix any chat rooms that are missing companyId but should belong to this company
    // This handles the case where chat rooms were created by admin but need companyId
    for (const chatRoom of chatRooms) {
      if (!chatRoom.companyId && chatRoom.chatType === 'company_user') {
        console.log('⚠️ Fixing chat room missing companyId:', chatRoom._id);
        chatRoom.companyId = company._id;
        await chatRoom.save();
        console.log('✅ Fixed chat room companyId');
      }
    }

    // Transform _id to id for frontend compatibility
    const transformedChatRooms = chatRooms.map(room => ({
      ...room.toObject(),
      id: room._id
    }));

    res.json({
      chatRooms: transformedChatRooms
    });
  } catch (error) {
    console.error('❌ Error fetching company chat rooms:', error);
    res.status(500).json({ error: 'Failed to fetch company chat rooms' });
  }
});

// Fix existing chat rooms that are missing companyId
router.post('/fix-chat-rooms', async (req, res) => {
  try {
    console.log('🔍 Fixing chat rooms for company user:', req.user.userId);
    
    // Find the company associated with this user
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Find chat rooms that should belong to this company but are missing companyId
    const chatRoomsToFix = await ChatRoom.find({
      chatType: 'company_user',
      $or: [
        { companyId: { $exists: false } },
        { companyId: null }
      ]
    });

    console.log(`🔍 Found ${chatRoomsToFix.length} chat rooms to fix`);

    let fixedCount = 0;
    for (const chatRoom of chatRoomsToFix) {
      // Check if this chat room is related to a booking that belongs to this company
      const { MovingBooking, DisposalBooking, TransportBooking } = require('../models/index.js');
      
      let relatedBooking = null;
      if (chatRoom.bookingType === 'moving') {
        relatedBooking = await MovingBooking.findById(chatRoom.bookingId);
      } else if (chatRoom.bookingType === 'disposal') {
        relatedBooking = await DisposalBooking.findById(chatRoom.bookingId);
      } else if (chatRoom.bookingType === 'transport') {
        relatedBooking = await TransportBooking.findById(chatRoom.bookingId);
      }

      if (relatedBooking && relatedBooking.companyId?.toString() === company._id.toString()) {
        console.log('🔧 Fixing chat room:', chatRoom._id);
        chatRoom.companyId = company._id;
        await chatRoom.save();
        fixedCount++;
        console.log('✅ Fixed chat room companyId');
      }
    }

    console.log(`✅ Fixed ${fixedCount} chat rooms`);

    res.json({
      message: `Fixed ${fixedCount} chat rooms`,
      fixedCount
    });
  } catch (error) {
    console.error('❌ Error fixing chat rooms:', error);
    res.status(500).json({ error: 'Failed to fix chat rooms' });
  }
});

// Get company's invoices
router.get('/invoices', async (req, res) => {
  try {
    console.log('🔍 Company invoices request received for user:', req.user.userId);
    
    // Find the company associated with this user
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) {
      console.log('❌ Company not found for user:', req.user.userId);
      return res.status(404).json({ error: 'Company not found' });
    }

    console.log('✅ Company found:', company._id);

    // Get invoices where this company is involved
    const invoices = await Invoice.find({
      companyId: company._id
    }).populate('userId', 'name email')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${invoices.length} invoices for company`);

    // Transform _id to id for frontend compatibility
    const transformedInvoices = invoices.map(invoice => ({
      ...invoice.toObject(),
      id: invoice._id
    }));

    res.json({
      invoices: transformedInvoices
    });
  } catch (error) {
    console.error('❌ Error fetching company invoices:', error);
    res.status(500).json({ error: 'Failed to fetch company invoices' });
  }
});

// Approve a booking
router.put('/bookings/:bookingId/approve', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { bookingType } = req.body;
    
    console.log('🔍 Company approving booking:', { bookingId, bookingType, userId: req.user.userId });
    
    // Find the company associated with this user
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    let booking;
    switch (bookingType) {
      case 'moving':
        booking = await MovingBooking.findById(bookingId);
        break;
      case 'disposal':
        booking = await DisposalBooking.findById(bookingId);
        break;
      case 'transport':
        booking = await TransportBooking.findById(bookingId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid booking type' });
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.companyId?.toString() !== company._id.toString()) {
      return res.status(403).json({ error: 'Access denied to this booking' });
    }

    // Update booking status
    booking.status = 'approved';
    await booking.save();

    console.log('✅ Booking approved successfully');

    // Create chat room between company and user
    try {
      const { ChatRoom } = require('../models/ChatRoom.js');
      const { Message } = require('../models/Message.js');
      
      // Check if chat room already exists
      const existingChatRoom = await ChatRoom.findOne({
        bookingId: bookingId,
        chatType: 'company_user',
        isActive: true
      });

      if (existingChatRoom) {
        console.log('ℹ️ Chat room already exists for this booking');
        console.log('🔍 Existing chat room data:', {
          id: existingChatRoom._id,
          bookingId: existingChatRoom.bookingId,
          companyId: existingChatRoom.companyId,
          chatType: existingChatRoom.chatType
        });
        
        // Check if companyId is missing and fix it
        if (!existingChatRoom.companyId) {
          console.log('⚠️ Company ID missing from existing chat room, updating...');
          existingChatRoom.companyId = company._id;
          await existingChatRoom.save();
          console.log('✅ Updated existing chat room with company ID');
        }
      } else {
        console.log('🏗️ Creating chat room between company and user...');
        
        // Create new chat room
        const chatRoom = new ChatRoom({
          bookingId: bookingId,
          bookingType: bookingType,
          userId: booking.userId,
          companyId: company._id, // Company is the service provider
          chatType: 'company_user',
          status: 'active',
          isActive: true
        });
        
        console.log('🏗️ Chat room data being saved:', {
          bookingId: chatRoom.bookingId,
          bookingType: chatRoom.bookingType,
          userId: chatRoom.userId,
          companyId: chatRoom.companyId,
          chatType: chatRoom.chatType
        });
        
        await chatRoom.save();
        console.log('✅ Chat room created successfully:', chatRoom._id);
        
        // Verify the saved chat room
        const savedChatRoom = await ChatRoom.findById(chatRoom._id);
        console.log('✅ Saved chat room verification:', {
          id: savedChatRoom._id,
          bookingId: savedChatRoom.bookingId,
          companyId: savedChatRoom.companyId,
          chatType: savedChatRoom.chatType
        });
        
        // Create welcome message
        const welcomeMessage = new Message({
          chatRoomId: chatRoom._id,
          senderId: company._id,
          senderType: 'company',
          content: `Booking approved! Welcome to your service chat. We're excited to help you with your ${bookingType} service. How can we assist you today?`,
          messageType: 'text',
          isSystemMessage: false
        });
        
        await welcomeMessage.save();
        console.log('✅ Welcome message created successfully');
      }
    } catch (chatError) {
      console.error('⚠️ Error creating chat room:', chatError);
      // Don't fail the approval if chat room creation fails
    }

    res.json({
      message: 'Booking approved successfully',
      booking,
      chatRoomCreated: true
    });
  } catch (error) {
    console.error('❌ Error approving booking:', error);
    res.status(500).json({ error: 'Failed to approve booking' });
  }
});

// Reject a booking
router.put('/bookings/:bookingId/reject', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { bookingType } = req.body;
    
    console.log('🔍 Company rejecting booking:', { bookingId, bookingType, userId: req.user.userId });
    
    // Find the company associated with this user
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    let booking;
    switch (bookingType) {
      case 'moving':
        booking = await MovingBooking.findById(bookingId);
        break;
      case 'disposal':
        booking = await DisposalBooking.findById(bookingId);
        break;
      case 'transport':
        booking = await TransportBooking.findById(bookingId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid booking type' });
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.companyId?.toString() !== company._id.toString()) {
      return res.status(403).json({ error: 'Access denied to this booking' });
    }

    booking.status = 'rejected';
    await booking.save();

    console.log('✅ Booking rejected successfully');

    res.json({
      message: 'Booking rejected successfully',
      booking
    });
  } catch (error) {
    console.error('❌ Error rejecting booking:', error);
    res.status(500).json({ error: 'Failed to reject booking' });
  }
});

module.exports = router;
