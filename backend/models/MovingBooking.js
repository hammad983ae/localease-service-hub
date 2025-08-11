const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  floor: String,
  room: String,
  count: Number
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

const MovingBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // Company assigned to this booking
  rooms: [RoomSchema],
  items: { type: Map, of: Number },
  dateTime: Date, // for specific date/time
  dateTimeFlexible: String, // for flexible options (stringified object)
  addresses: {
    from: String,
    to: String
  },
  contact: {
    name: String,
    email: String,
    phone: String,
    notes: String
  },
  company: CompanySchema, // Company details (legacy field)
  status: { type: String, default: 'pending' },
  bookingType: { type: String, default: 'quote_request' }, // 'quote_request' or 'company_booking'
  createdAt: { type: Date, default: Date.now }
});

module.exports = { MovingBooking: mongoose.model('MovingBooking', MovingBookingSchema) }; 