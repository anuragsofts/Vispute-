require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection to URI:', process.env.MONGODB_URI?.substring(0, 30) + '...');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 8000
})
.then(() => {
  console.log('✅ MongoDB Atlas connected successfully!');
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});
