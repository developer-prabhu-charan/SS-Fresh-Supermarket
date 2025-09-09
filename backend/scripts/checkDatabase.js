const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('MongoDB URI:', mongoUri ? 'Set' : 'Not set');
    
    if (!mongoUri) {
      console.log('Please set MONGO_URI environment variable');
      console.log('Example: MONGO_URI=mongodb://localhost:27017/your-database-name');
      return;
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');
    
    // List all databases
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // List collections in current database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in current database:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check data in each collection
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`  ${collection.name}: ${count} documents`);
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabase();
