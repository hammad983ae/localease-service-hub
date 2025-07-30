const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, required: true },
  bookingType: { type: String, required: true, enum: ['moving', 'disposal', 'transport'] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // Optional for admin chats
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For admin-user chats
  chatType: { type: String, required: true, enum: ['company_user', 'admin_user'], default: 'company_user' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure only one active chat room per booking per chat type
ChatRoomSchema.index({ bookingId: 1, chatType: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = { ChatRoom: mongoose.model('ChatRoom', ChatRoomSchema) }; 