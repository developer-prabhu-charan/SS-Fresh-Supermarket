const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.Mixed, required: true },
  customer_name: { type: String, required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Changed to ObjectId reference
    quantity: { type: Number }
  }],
  total: Number,
  address: String,
  status: { type: String, default: 'Placed' },
  phone: { type: String, default: null },
  paymentMethod: { type: String, enum: ['cod', 'qr'], required: true },
  location: {
    latitude: Number,
    longitude: Number,
    city: String,
    region: String,
    country: String,
    mapsLink: String
  },
  createdAt: { type: Date, default: Date.now }
});


// Pre-save hook to automatically generate Google Maps link
OrderSchema.pre('save', function(next) {
  // Check if location exists and has latitude/longitude
  if (this.location && 
      this.location.latitude && 
      this.location.longitude && 
      typeof this.location.latitude === 'number' && 
      typeof this.location.longitude === 'number') {
    
    // Generate Google Maps link
    this.location.mapsLink = `https://www.google.com/maps?q=${this.location.latitude},${this.location.longitude}`;
  }
  
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
