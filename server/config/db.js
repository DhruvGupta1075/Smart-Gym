const mongoose = require('mongoose');

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
      console.error('❌ [MongoDB Error]: No MONGODB_URI detected in environment variables.');
      throw new Error('MONGODB_URI missing');
    }
  } catch (error) {
    console.error('❌ [MongoDB Connection Error]:', error.message);
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('👉 Hint: Check your Atlas username and password in server/.env');
    } else if (error.message.includes('querySrv ETIMEOUT') || error.message.includes('Server selection timed out')) {
      console.error('👉 Hint: Make sure your current IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP 0.0.0.0/0).');
    }
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
};

module.exports = { connectDB, disconnectDB };
