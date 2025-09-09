const mongoose = require('mongoose');
require('dotenv').config();

const OutOfStock = require('../models/OutOfStock');

async function testOutOfStockTracking() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for out-of-stock tracking test');

    // Test 1: Simulate frontend tracking out-of-stock searches
    console.log('\n=== Test 1: Simulate frontend out-of-stock tracking ===');
    
    const testSearches = [
      'nonexistentproduct123',
      'rare item',
      'out of stock product',
      'unavailable item'
    ];

    for (const searchTerm of testSearches) {
      const outOfStockRecord = new OutOfStock({
        searchTerm: searchTerm,
        username: null, // Anonymous user
        userAgent: 'Test Script',
        ipAddress: '127.0.0.1'
      });
      
      await outOfStockRecord.save();
      console.log(`✅ Tracked search: "${searchTerm}"`);
    }

    // Test 2: View out-of-stock searches
    console.log('\n=== Test 2: View out-of-stock searches ===');
    const outOfStockSearches = await OutOfStock.find().sort({ searchedAt: -1 }).limit(10);
    console.log(`Found ${outOfStockSearches.length} out-of-stock searches:`);
    outOfStockSearches.forEach(search => {
      console.log(`- "${search.searchTerm}" searched at ${search.searchedAt} by ${search.username || 'anonymous'}`);
    });

    // Test 3: Analytics
    console.log('\n=== Test 3: Out-of-stock analytics ===');
    const analytics = await OutOfStock.aggregate([
      {
        $group: {
          _id: '$searchTerm',
          count: { $sum: 1 },
          lastSearched: { $max: '$searchedAt' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    console.log('Top searched terms with no results:');
    analytics.forEach(term => {
      console.log(`- "${term._id}": ${term.count} searches (last: ${term.lastSearched})`);
    });

    // Test 4: Test the API endpoint
    console.log('\n=== Test 4: Test API endpoint ===');
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch('http://localhost:5000/api/out-of-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchTerm: 'api test search' })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ API endpoint test successful:', result.message);
      } else {
        console.log('❌ API endpoint test failed:', response.status);
      }
    } catch (apiError) {
      console.log('❌ API endpoint test failed (server not running?):', apiError.message);
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testOutOfStockTracking();
