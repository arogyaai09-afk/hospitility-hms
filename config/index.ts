export {};

const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/hms',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
  JWT_EXPIRES: process.env.JWT_EXPIRES || '15m',
  REFRESH_EXPIRES: process.env.REFRESH_EXPIRES || '7d'
};
