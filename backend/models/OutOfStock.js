const mongoose = require('mongoose');

const OutOfStockSchema = new mongoose.Schema({
  searchTerm: { 
    type: String, 
    required: true,
    trim: true,
    index: true // Add index for better query performance
  },
  searchedAt: { 
    type: Date, 
    default: Date.now,
    index: true // Add index for time-based queries
  },
  username: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer',
    required: false // Optional - for logged in users
  },
  // Additional fields for analytics
  userAgent: String, // Browser info
  ipAddress: String, // IP address for analytics
  sessionId: String // Session tracking
});

// Compound index for better query performance
OutOfStockSchema.index({ searchTerm: 1, searchedAt: -1 });
OutOfStockSchema.index({ username: 1, searchedAt: -1 });

module.exports = mongoose.model('OutOfStock', OutOfStockSchema);
