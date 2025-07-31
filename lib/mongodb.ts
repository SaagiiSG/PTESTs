import mongoose from 'mongoose';

const cached = global as typeof globalThis & { mongoose: { conn: typeof mongoose | null, promise: Promise<typeof mongoose> | null } };

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

export async function connectMongoose() {
  const MONGODB_URI = process.env.MONGODB_URI as string;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    // Improved connection options for Vercel
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      retryWrites: true,
      w: 'majority',
    };

    cached.mongoose.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    });
  }
  
  try {
    cached.mongoose.conn = await cached.mongoose.promise;
    return cached.mongoose.conn;
  } catch (error) {
    // Reset the promise on error so we can retry
    cached.mongoose.promise = null;
    throw error;
  }
}

// Safe connection function that doesn't throw during build time
export async function safeConnectMongoose() {
  try {
    return await connectMongoose();
  } catch (error) {
    // During build time, just return null instead of throwing
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return null;
    }
    throw error;
  }
}

// Function to check if MongoDB is connected
export function isConnected() {
  return mongoose.connection.readyState === 1;
}

// Function to get connection status
export function getConnectionStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
}