const express = require('express');
const { ChatRoom } = require('../models/ChatRoom.js');
const { Message } = require('../models/Message.js');
const { requireAdmin } = require('../middleware/auth.js');

const router = express.Router();

// Get user's chat rooms
router.get('/rooms', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    let query = {};
    
    // Admin can see all chat rooms
    if (userRole === 'admin') {
      query = {};
    } else if (userRole === 'company') {
      // Company users see chat rooms where they are the company
      query.companyId = userId;
    } else {
      // Regular users see chat rooms where they are the user
      query.userId = userId;
    }
    
    const chatRooms = await ChatRoom.find(query)
      .populate('userId', 'full_name email')
      .populate('companyId', 'name email')
      .sort({ updatedAt: -1 });
    
    res.json(chatRooms);
  } catch (error) {
    console.error('Chat rooms fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
});

// Get chat room by ID
router.get('/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    const chatRoom = await ChatRoom.findById(roomId)
      .populate('userId', 'full_name email')
      .populate('companyId', 'name email');
    
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    // Check if user has access to this chat room
    if (userRole === 'admin' || 
        chatRoom.userId?._id.toString() === userId || 
        chatRoom.companyId?._id.toString() === userId) {
      
      res.json(chatRoom);
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    console.error('Chat room fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch chat room' });
  }
});

// Get messages for a chat room
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // First check if user has access to this chat room
    const chatRoom = await ChatRoom.findById(roomId);
    
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    if (userRole !== 'admin' && 
        chatRoom.userId?.toString() !== userId && 
        chatRoom.companyId?.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({ chatRoomId: roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('senderId', 'full_name email');
    
    const total = await Message.countDocuments({ chatRoomId: roomId });
    
    // Mark messages as read if user is the recipient
    if (userRole !== 'admin') {
      const unreadMessages = messages.filter(msg => 
        msg.senderId._id.toString() !== userId && !msg.isRead
      );
      
      if (unreadMessages.length > 0) {
        await Message.updateMany(
          { _id: { $in: unreadMessages.map(msg => msg._id) } },
          { isRead: true }
        );
      }
    }
    
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
    console.error('Messages fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new chat room
router.post('/rooms', async (req, res) => {
  try {
    const { bookingId, bookingType, companyId } = req.body;
    const userId = req.user.userId;
    
    // Check if chat room already exists for this booking
    const existingRoom = await ChatRoom.findOne({ 
      bookingId, 
      bookingType 
    });
    
    if (existingRoom) {
      return res.status(400).json({ 
        error: 'Chat room already exists for this booking',
        chatRoom: existingRoom
      });
    }
    
    const chatRoom = new ChatRoom({
      bookingId,
      bookingType,
      userId,
      companyId,
      isActive: true
    });
    
    await chatRoom.save();
    
    // Populate user and company info
    await chatRoom.populate('userId', 'full_name email');
    if (companyId) {
      await chatRoom.populate('companyId', 'name email');
    }
    
    res.status(201).json({
      message: 'Chat room created successfully',
      chatRoom
    });
  } catch (error) {
    console.error('Chat room creation error:', error);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

// Send a message
router.post('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Check if user has access to this chat room
    const chatRoom = await ChatRoom.findById(roomId);
    
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    if (userRole !== 'admin' && 
        chatRoom.userId?.toString() !== userId && 
        chatRoom.companyId?.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Determine sender type
    let senderType = 'user';
    if (userRole === 'company') {
      senderType = 'company';
    } else if (userRole === 'admin') {
      senderType = 'admin';
    }
    
    const message = new Message({
      chatRoomId: roomId,
      senderId: userId,
      senderType,
      content,
      messageType,
      isRead: false
    });
    
    await message.save();
    
    // Update chat room's last message and timestamp
    await ChatRoom.findByIdAndUpdate(roomId, {
      lastMessage: content,
      lastMessageAt: new Date(),
      updatedAt: new Date()
    });
    
    // Populate sender info
    await message.populate('senderId', 'full_name email');
    
    res.status(201).json({
      message: 'Message sent successfully',
      message: message
    });
  } catch (error) {
    console.error('Message creation error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.patch('/rooms/:roomId/read', async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Check if user has access to this chat room
    const chatRoom = await ChatRoom.findById(roomId);
    
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    if (userRole !== 'admin' && 
        chatRoom.userId?.toString() !== userId && 
        chatRoom.companyId?.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Mark all unread messages from other users as read
    await Message.updateMany(
      { 
        chatRoomId: roomId, 
        senderId: { $ne: userId },
        isRead: false
      },
      { isRead: true }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread message count
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    let query = {};
    
    if (userRole === 'company') {
      query.companyId = userId;
    } else if (userRole === 'user') {
      query.userId = userId;
    }
    
    // Get user's chat rooms
    const chatRooms = await ChatRoom.find(query);
    const chatRoomIds = chatRooms.map(room => room._id);
    
    if (chatRoomIds.length === 0) {
      return res.json({ unreadCount: 0, unreadChats: [] });
    }
    
    // Count unread messages from other users
    const unreadMessages = await Message.find({
      chatRoomId: { $in: chatRoomIds },
      senderId: { $ne: userId },
      isRead: false
    });
    
    // Group by chat room
    const unreadByRoom = {};
    unreadMessages.forEach(msg => {
      if (!unreadByRoom[msg.chatRoomId]) {
        unreadByRoom[msg.chatRoomId] = 0;
      }
      unreadByRoom[msg.chatRoomId]++;
    });
    
    const unreadChats = Object.keys(unreadByRoom).map(roomId => ({
      roomId,
      count: unreadByRoom[roomId]
    }));
    
    const totalUnread = unreadMessages.length;
    
    res.json({
      unreadCount: totalUnread,
      unreadChats
    });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Delete chat room (admin only)
router.delete('/rooms/:roomId', requireAdmin, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Delete all messages in the chat room
    await Message.deleteMany({ chatRoomId: roomId });
    
    // Delete the chat room
    await ChatRoom.findByIdAndDelete(roomId);
    
    res.json({ message: 'Chat room deleted successfully' });
  } catch (error) {
    console.error('Chat room deletion error:', error);
    res.status(500).json({ error: 'Failed to delete chat room' });
  }
});

module.exports = router;
