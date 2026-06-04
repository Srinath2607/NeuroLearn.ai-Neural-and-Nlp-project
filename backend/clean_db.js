require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neurolearn';

async function cleanDocs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    const result = await mongoose.connection.collection('documents').deleteMany({ status: 'failed' });
    console.log(`Deleted ${result.deletedCount} failed documents so the user has a clean slate.`);
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

cleanDocs();
