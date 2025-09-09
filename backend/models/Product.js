const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  details: String,
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: null }, // For strike-off pricing
  specifications: String,
  availability: { type: Boolean, default: true },
  // new fields used by dashboard
  available: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  stock: { type: Number, default: 0 },
  imageUrl: { type: String, default: null }, // Product image URL
  description: { type: String, default: null } // Product description
}, { timestamps: true });

// Transform _id to id in JSON responses
ProductSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Transform _id to id in Object responses
ProductSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Product', ProductSchema);
