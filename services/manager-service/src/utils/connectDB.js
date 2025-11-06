import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ Manager Service MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Manager Service Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;