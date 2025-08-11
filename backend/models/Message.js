const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderType: { type: String, required: true, enum: ['user', 'company', 'admin'] },
  content: { type: String, required: true },
  
  // Enhanced message types for quote workflow
  messageType: { 
    type: String, 
    default: 'text', 
    enum: [
      'text', 
      'image', 
      'file', 
      'quote', 
      'quote_response', 
      'company_info',
      'company_profile',
      'invoice',
      'system_notification'
    ] 
  },
  
  // Message metadata
  isRead: { type: Boolean, default: false },
  isSystemMessage: { type: Boolean, default: false },
  
  // Quote-related data
  quote: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
  
  // Company profile data
  companyProfile: {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    companyName: String,
    companyEmail: String,
    companyPhone: String,
    services: [String],
    priceRange: String,
    rating: Number,
    totalReviews: Number
  },
  
  // Invoice data
  invoice: {
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    amount: Number,
    currency: { type: String, default: 'USD' },
    dueDate: Date,
    status: String
  },
  
  // Action buttons for interactive messages
  actions: [{
    type: { type: String, enum: ['button', 'link', 'form'] },
    label: String,
    action: String,
    data: mongoose.Schema.Types.Mixed
  }],
  
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying of messages by chat room
MessageSchema.index({ chatRoomId: 1, createdAt: 1 });

module.exports = { Message: mongoose.model('Message', MessageSchema) }; 