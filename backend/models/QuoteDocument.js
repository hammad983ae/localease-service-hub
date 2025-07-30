const mongoose = require('mongoose');

const quoteDocumentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  createdBy: {
    type: String,
    enum: ['admin', 'company'],
    default: 'company'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['draft', 'final', 'accepted'],
    default: 'draft'
  },
  documentUrl: {
    type: String
  },
  bookingDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = { QuoteDocument: mongoose.model('QuoteDocument', quoteDocumentSchema) }; 