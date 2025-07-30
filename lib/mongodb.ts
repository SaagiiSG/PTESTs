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
    cached.mongoose.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }
  cached.mongoose.conn = await cached.mongoose.promise;
  return cached.mongoose.conn;
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