const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Customer = require('./models/Customer');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding');

  // Create sample products
  const products = await Product.insertMany([
    { name: 'Milk', details: '1L full cream', price: 40, specifications: 'Dairy', availability: true },
    { name: 'Bread', details: 'Whole wheat', price: 30, specifications: 'Bakery', availability: true },
    { name: 'Eggs', details: 'Pack of 12', price: 120, specifications: 'Poultry', availability: true }
  ]);

  console.log('Inserted products:', products.map(p => p._id));

  // Create sample customer
  const customer = new Customer({ name: 'Seed User', email: 'seed@example.com', password: 'password', address: 'Seed Address' });
  await customer.save();
  console.log('Inserted customer:', customer._id);

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
