const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

async function testProductsAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connected to MongoDB');

    // Create test products with originalPrice
    const testProducts = [
      {
        name: 'Premium Apple',
        price: 2.99,
        originalPrice: 3.99,
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
        description: 'Fresh, crisp premium apples',
        available: true,
        featured: true
      },
      {
        name: 'Organic Banana',
        price: 1.49,
        originalPrice: 1.99,
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
        description: 'Organic bananas, perfect for smoothies',
        available: true,
        featured: false
      },
      {
        name: 'Fresh Milk',
        price: 3.49,
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
        description: 'Fresh whole milk, 1 gallon',
        available: true,
        featured: false
      }
    ];

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert test products
    const createdProducts = await Product.insertMany(testProducts);
    console.log(`Created ${createdProducts.length} test products`);

    // Test fetching products
    const allProducts = await Product.find();
    console.log('\nAll products:');
    allProducts.forEach(product => {
      console.log(`- ${product.name}: $${product.price}${product.originalPrice ? ` (was $${product.originalPrice})` : ''} - Stock: ${product.stock}`);
    });

    console.log('\n✅ Products API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testProductsAPI();
