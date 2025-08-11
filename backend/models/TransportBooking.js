const mongoose = require('mongoose');

const ItemDimensionsSchema = new mongoose.Schema({
  length: Number,
  width: Number,
  height: Number,
  weight: Number
}, { _id: false });

const TransportItemSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: String,
  dimensions: ItemDimensionsSchema,
  quantity: { type: Number, default: 1 },
  specialInstructions: String,
  fragile: { type: Boolean, default: false },
  insuranceRequired: { type: Boolean, default: false }
}, { _id: false });

const LocationSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  fullAddress: String,
  instructions: String
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

const TransportBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // Company assigned to this booking
  serviceType: { type: String, required: true },
  items: [TransportItemSchema],
  dateTime: Date,
  dateTimeFlexible: String,
  pickupLocation: LocationSchema,
  dropoffLocation: LocationSchema,
  contact: {
    name: String,
    email: String,
    phone: String,
    notes: String
  },
  company: CompanySchema, // Company details (legacy field)
  status: { type: String, default: 'pending' },
  bookingType: { type: String, default: 'quote_request' }, // 'quote_request' or 'company_booking'
  estimatedCost: { type: Number, default: 0 },
  estimatedTime: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = { TransportBooking: mongoose.model('TransportBooking', TransportBookingSchema) }; 