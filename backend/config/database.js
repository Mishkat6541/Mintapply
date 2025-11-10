import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('📦 Using existing MongoDB connection');
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri || mongoUri === 'mongodb+srv://your_connection_string') {
      console.warn('⚠️  MONGO_URI not configured in .env file');
      console.warn('⚠️  Please add your MongoDB Atlas connection string');
      throw new Error('MongoDB connection string not configured');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    isConnected = true;
    console.log('✅ MongoDB Connected:', conn.connection.host);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('📦 MongoDB disconnected');
  isConnected = false;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

export default connectDB;
