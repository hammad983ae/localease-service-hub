const mongoose = require('mongoose');

const DisposalItemSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: String,
  quantity: { type: Number, default: 1 },
  photos: [String],
  specialInstructions: String
}, { _id: false });

const PickupAddressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  fullAddress: String
}, { _id: false });

const CompanySchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  rating: Number,
  total_reviews: Number,
  location: String,
  services: [String],
  price_range: String,
  image_url: String,
  contact_phone: String,
  contact_email: String
}, { _id: false });

const DisposalBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType: { type: String, required: true },
  items: [DisposalItemSchema],
  dateTime: Date,
  dateTimeFlexible: String,
  pickupAddress: PickupAddressSchema,
  contact: {
    name: String,
    email: String,
    phone: String,
    notes: String
  },
  company: CompanySchema,
  status: { type: String, default: 'pending' },
  estimatedCost: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = { DisposalBooking: mongoose.model('DisposalBooking', DisposalBookingSchema) }; 