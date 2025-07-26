const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, required: true },
  bookingType: { type: String, required: true, enum: ['moving', 'disposal', 'transport'] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure only one active chat room per booking
ChatRoomSchema.index({ bookingId: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = { ChatRoom: mongoose.model('ChatRoom', ChatRoomSchema) }; 