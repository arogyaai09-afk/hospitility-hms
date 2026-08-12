export {};

const mongoose = require('mongoose');
const { MONGO_URI } = require('./index');

async function connectDB() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 45000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
    retryWrites: true
  });
  console.log('MongoDB connected with optimized pooling');
}

module.exports = connectDB;
