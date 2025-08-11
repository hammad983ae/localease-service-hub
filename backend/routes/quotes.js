const express = require('express');
const { Quote } = require('../models/Quote.js');
const { Invoice } = require('../models/Invoice.js');
const { ChatRoom } = require('../models/ChatRoom.js');
const { Message } = require('../models/Message.js');
const { requireAdmin } = require('../middleware/auth.js');

const router = express.Router();

// Get user's quotes
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    let query = {};
    
    if (userRole === 'company') {
      // Company users see quotes for their company
      query.companyId = userId;
    } else {
      // Regular users see their own quotes
      query.userId = userId;
    }
    
    const { page = 1, limit = 20, status, type } = req.query;
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add type filter if provided
    if (type) {
      query.quoteType = type;
    }
    
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
    console.error('Quotes fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get quote by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    const quote = await Quote.findById(id)
      .populate('userId', 'full_name email')
      .populate('companyId', 'name email');
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    // Check if user has access to this quote
    if (userRole === 'admin' || 
        quote.userId?._id.toString() === userId || 
        quote.companyId?._id.toString() === userId) {
      
      res.json(quote);
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    console.error('Quote fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Create a new quote
router.post('/', async (req, res) => {
  try {
    const {
      quoteType,
      description,
      estimatedCost,
      validUntil,
      terms,
      companyId
    } = req.body;
    
    const userId = req.user.userId;
    
    const quote = new Quote({
      quoteType,
      description,
      estimatedCost,
      validUntil,
      terms,
      userId,
      companyId,
      status: 'pending'
    });
    
    await quote.save();
    
    // Populate user and company info
    await quote.populate('userId', 'full_name email');
    if (companyId) {
      await quote.populate('companyId', 'name email');
    }
    
    // Create a chat room for this quote
    const chatRoom = new ChatRoom({
      quoteId: quote._id,
      quoteType: quoteType,
      userId: userId,
      chatType: 'quote_chat',
      status: 'active',
      quoteStatus: 'pending'
    });
    
    await chatRoom.save();
    
    // Create a welcome message
    const welcomeMessage = new Message({
      chatRoomId: chatRoom._id,
      senderId: userId,
      senderType: 'user',
      content: `Quote requested for ${quoteType} service: ${description}`,
      messageType: 'system_notification',
      isSystemMessage: true
    });
    
    await welcomeMessage.save();
    
    // Update chat room with last message
    await ChatRoom.findByIdAndUpdate(chatRoom._id, {
      lastMessage: welcomeMessage.content,
      lastMessageAt: welcomeMessage.createdAt
    });
    
    res.status(201).json({
      message: 'Quote created successfully',
      quote,
      chatRoom: {
        id: chatRoom._id,
        status: chatRoom.status,
        quoteStatus: chatRoom.quoteStatus
      }
    });
  } catch (error) {
    console.error('Quote creation error:', error);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

// Update quote
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    const quote = await Quote.findById(id);
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    // Check if user has access to update this quote
    if (userRole === 'admin' || 
        quote.userId?.toString() === userId || 
        quote.companyId?.toString() === userId) {
      
      const updatedQuote = await Quote.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      ).populate('userId', 'full_name email')
       .populate('companyId', 'name email');
      
      res.json({
        message: 'Quote updated successfully',
        quote: updatedQuote
      });
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    console.error('Quote update error:', error);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// Accept/Reject quote
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    if (!['accepted', 'rejected', 'expired'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const quote = await Quote.findById(id);
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    // Check if user has access to update this quote
    if (userRole === 'admin' || 
        quote.userId?.toString() === userId || 
        quote.companyId?.toString() === userId) {
      
      const updateData = { status };
      if (reason) {
        updateData.statusReason = reason;
      }
      
      const updatedQuote = await Quote.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('userId', 'full_name email')
       .populate('companyId', 'name email');
      
      res.json({
        message: `Quote ${status} successfully`,
        quote: updatedQuote
      });
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    console.error('Quote status update error:', error);
    res.status(500).json({ error: 'Failed to update quote status' });
  }
});

// Get invoices for a quote
router.get('/:id/invoices', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // First check if user has access to this quote
    const quote = await Quote.findById(id);
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    if (userRole !== 'admin' && 
        quote.userId?.toString() !== userId && 
        quote.companyId?.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const invoices = await Invoice.find({ quoteId: id })
      .populate('userId', 'full_name email')
      .populate('companyId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(invoices);
  } catch (error) {
    console.error('Invoices fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Create invoice for a quote
router.post('/:id/invoices', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      description,
      dueDate,
      items
    } = req.body;
    
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // First check if user has access to this quote
    const quote = await Quote.findById(id);
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    if (userRole !== 'admin' && 
        quote.userId?.toString() !== userId && 
        quote.companyId?.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const invoice = new Invoice({
      quoteId: id,
      userId: quote.userId,
      companyId: quote.companyId,
      amount,
      description,
      dueDate,
      items,
      status: 'pending'
    });
    
    await invoice.save();
    
    // Populate user and company info
    await invoice.populate('userId', 'full_name email');
    await invoice.populate('companyId', 'name email');
    
    res.status(201).json({
      message: 'Invoice created successfully',
      invoice
    });
  } catch (error) {
    console.error('Invoice creation error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Delete quote (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete associated invoices first
    await Invoice.deleteMany({ quoteId: id });
    
    // Delete the quote
    await Quote.findByIdAndDelete(id);
    
    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Quote deletion error:', error);
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

module.exports = router;
