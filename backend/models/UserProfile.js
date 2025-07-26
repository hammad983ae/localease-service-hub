const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  full_name: String,
  phone: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = { UserProfile: mongoose.model('UserProfile', userProfileSchema) }; 