const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI?.trim();

    // Event listeners for connection lifecycle
    mongoose.connection.on('connected', () => {
      console.log('✅ [MongoDB Atlas] Mongoose connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ [MongoDB Atlas Error]:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [MongoDB Atlas] Mongoose connection disconnected');
    });

    if (mongoUri && mongoUri !== '') {
      const isAtlas = mongoUri.includes('mongodb+srv') || mongoUri.includes('mongodb.net');
      console.log(`📡 [MongoDB] Connecting to ${isAtlas ? 'MongoDB Atlas Cloud Cluster' : 'Custom MongoDB instance'}...`);
      
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 8000, // Timeout after 8s instead of hanging
        socketTimeoutMS: 45000,
      });

      console.log(`🚀 [MongoDB Connected]: ${conn.connection.host} / Database: ${conn.connection.name}`);
      return conn;
    } else {
      console.log('💡 [MongoDB] No MONGODB_URI detected in .env. Initializing local in-memory MongoDB server...');
      mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`⚡ [MongoDB In-Memory Connected]: ${inMemoryUri}`);
      return conn;
    }
  } catch (error) {
    console.error('❌ [MongoDB Connection Error]:', error.message);
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('👉 Hint: Check your Atlas username and password in server/.env');
    } else if (error.message.includes('querySrv ETIMEOUT') || error.message.includes('Server selection timed out')) {
      console.error('👉 Hint: Make sure your current IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP 0.0.0.0/0).');
    }
    
    // Fallback to in-memory server so development never breaks
    console.log('🔄 Falling back to embedded in-memory MongoDB instance for continuous uptime...');
    try {
      mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`⚡ [MongoDB Fallback Connected]: ${inMemoryUri}`);
      return conn;
    } catch (fallbackErr) {
      console.error('Fatal database error:', fallbackErr);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
};

module.exports = { connectDB, disconnectDB };
