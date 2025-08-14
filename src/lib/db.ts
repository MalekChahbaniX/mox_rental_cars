import mongoose from 'mongoose';

const globalForMongoose = globalThis as unknown as {
  mongoose: typeof mongoose | undefined;
};

export const connectToDatabase = async () => {
  if (globalForMongoose.mongoose) {
    return globalForMongoose.mongoose;
  }

  const mongooseInstance = await mongoose.connect(process.env.DATABASE_URL!, {
    // Add any mongoose connection options here
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForMongoose.mongoose = mongooseInstance;
  }

  return mongooseInstance;
};

export const db = mongoose.connection;

export default mongoose;