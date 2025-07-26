import mongoose from 'mongoose';

const DisposalItemSchema = new mongoose.Schema({
  type: { type: String, required: true }, // household, construction, electronic, yard
  description: String,
  quantity: Number,
  photos: [String], // URLs to uploaded photos
  specialInstructions: String
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
  serviceType: { type: String, required: true }, // household, construction, electronic, yard
  items: [DisposalItemSchema],
  dateTime: Date, // for specific date/time
  dateTimeFlexible: String, // for flexible options (stringified object)
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    fullAddress: String
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
  createdAt: { type: Date, default: Date.now }
});

export const DisposalBooking = mongoose.model('DisposalBooking', DisposalBookingSchema); 