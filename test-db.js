require('dotenv').config();
const mongoose = require('mongoose');

async function testMongoDBConnection() {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Connection state:', mongoose.connection.readyState);
    console.log('🏠 Database name:', mongoose.connection.name);
    
    // Test basic database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testMongoDBConnection();
