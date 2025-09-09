require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Order = require('../models/Order');
  const Customer = require('../models/Customer');
  const id = '68b5f424765c335edfd602a9';
  const cust = await Customer.findById(id).lean();
  const name = cust ? cust.name : null;
  const or = [{ customer: id }];
  if (name) {
    or.push({ customer: name });
    or.push({ 'customer._id': id });
    or.push({ 'customer.id': id });
  }
  const orders = await Order.find({ $or: or }).lean();
  console.log('searchOr:', JSON.stringify(or, null, 2));
  console.log('found:', JSON.stringify(orders, null, 2));
  process.exit(0);
}

run().catch(e=>{ console.error(e); process.exit(1); });
