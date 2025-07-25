import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: String,
  phone: String,
  address: String,
  role: { type: String, enum: ['user', 'company', 'admin'], default: 'user' },
});

export const User = mongoose.model('User', userSchema); 