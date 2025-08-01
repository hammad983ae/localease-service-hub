const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderType: { type: String, required: true, enum: ['user', 'company', 'admin'] },
  content: { type: String, required: true },
  messageType: { type: String, default: 'text', enum: ['text', 'image', 'file', 'quote', 'quote_response', 'company_info'] },
  isRead: { type: Boolean, default: false },
  quote: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying of messages by chat room
MessageSchema.index({ chatRoomId: 1, createdAt: 1 });

module.exports = { Message: mongoose.model('Message', MessageSchema) }; 