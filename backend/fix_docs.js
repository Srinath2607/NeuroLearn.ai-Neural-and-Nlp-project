require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neurolearn';

async function fixDocs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    const result = await mongoose.connection.collection('documents').updateMany(
      { status: 'processing' },
      { $set: { status: 'failed', extractedText: 'Failed due to server interruption.' } }
    );
    console.log(`Fixed ${result.modifiedCount} stuck documents.`);
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

fixDocs();
