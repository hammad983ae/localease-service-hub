const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderType: { type: String, required: true, enum: ['user', 'company'] },
  content: { type: String, required: true },
  messageType: { type: String, default: 'text', enum: ['text', 'image', 'file'] },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying of messages by chat room
MessageSchema.index({ chatRoomId: 1, createdAt: 1 });

module.exports = { Message: mongoose.model('Message', MessageSchema) }; 