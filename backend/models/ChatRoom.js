const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
  // Support both bookings and quotes
  bookingId: { type: mongoose.Schema.Types.ObjectId }, // Optional for quotes
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' }, // For quote-based chats
  bookingType: { type: String, enum: ['moving', 'disposal', 'transport'] }, // Optional for quotes
  quoteType: { type: String, enum: ['moving', 'disposal', 'transport', 'general'] }, // For quote-based chats
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // Optional for admin chats
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For admin-user chats
  
  chatType: { type: String, required: true, enum: ['company_user', 'admin_user', 'quote_chat'], default: 'admin_user' },
  
  // Chat state
  status: { type: String, enum: ['active', 'pending', 'resolved', 'closed'], default: 'active' },
  isActive: { type: Boolean, default: true },
  
  // Quote workflow tracking
  quoteStatus: { type: String, enum: ['pending', 'reviewing', 'quoted', 'accepted', 'rejected'], default: 'pending' },
  companyProfileSent: { type: Boolean, default: false },
  invoiceSent: { type: Boolean, default: false },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastMessageAt: { type: Date, default: Date.now },
  lastMessage: { type: String, default: '' }
});

// Ensure only one active chat room per booking/quote per chat type
ChatRoomSchema.index({ 
  $or: [
    { bookingId: { $exists: true } },
    { quoteId: { $exists: true } }
  ],
  chatType: 1, 
  isActive: 1 
}, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = { ChatRoom: mongoose.model('ChatRoom', ChatRoomSchema) }; 