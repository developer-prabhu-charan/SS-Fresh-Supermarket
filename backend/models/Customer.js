const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

const Customer = mongoose.model('Customer', CustomerSchema);
module.exports = Customer;