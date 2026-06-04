require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neurolearn';

async function cleanAllDocs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    const result = await mongoose.connection.collection('documents').deleteMany({});
    console.log(`Deleted ALL ${result.deletedCount} documents. Fresh start!`);
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

cleanAllDocs();
