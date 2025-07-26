import mongoose from 'mongoose';

const TransportItemSchema = new mongoose.Schema({
  type: { type: String, required: true }, // small-delivery, furniture, same-day, scheduled
  description: String,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number
  },
  quantity: Number,
  specialInstructions: String,
  fragile: Boolean,
  insuranceRequired: Boolean
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
  serviceType: { type: String, required: true }, // small-delivery, furniture, same-day, scheduled
  items: [TransportItemSchema],
  dateTime: Date, // for specific date/time
  dateTimeFlexible: String, // for flexible options (stringified object)
  pickupLocation: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    fullAddress: String,
    instructions: String
  },
  dropoffLocation: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    fullAddress: String,
    instructions: String
  },
  contact: {
    name: String,
    email: String,
    phone: String,
    notes: String
  },
  company: CompanySchema,
  status: { type: String, default: 'pending' },
  estimatedCost: Number,
  estimatedTime: String, // e.g., "1-2 hours", "2-4 hours"
  createdAt: { type: Date, default: Date.now }
});

export const TransportBooking = mongoose.model('TransportBooking', TransportBookingSchema); 