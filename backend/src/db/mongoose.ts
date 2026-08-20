import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017/interviewflow?authSource=admin';
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
};

export const getMongoStatus = () => {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
};
