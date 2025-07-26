import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  full_name: String,
  phone: String,
  address: String,
  // Add more fields as needed
  createdAt: { type: Date, default: Date.now }
});

export const UserProfile = mongoose.model('UserProfile', userProfileSchema); 