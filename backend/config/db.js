import mongoose from 'mongoose';
import dns from 'dns';

// Configure reliable DNS servers for Windows Node SRV record resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS assignment is restricted
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hyundai_ai_db';
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (!process.env.MONGODB_URI) {
      throw new Error('[Production Configuration Error] MONGODB_URI environment variable is required in production.');
    }
    if (!process.env.MONGODB_URI.includes('mongodb+srv://') && !process.env.MONGODB_URI.includes('mongodb.net')) {
      console.warn('[MongoDB Atlas Notice] In production, MONGODB_URI should point to your MongoDB Atlas cluster (mongodb+srv://...).');
    }
  }

  try {
    const conn = await mongoose.connect(uri);
    const isAtlas = conn.connection.host.includes('mongodb.net');
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name} (${isAtlas ? 'MongoDB Atlas Cluster' : 'Local MongoDB Instance'})`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    if (isProduction) {
      throw new Error(`[Production DB Failure] Unable to connect to MongoDB Atlas: ${error.message}`);
    }
    return null;
  }
};

export default connectDB;
