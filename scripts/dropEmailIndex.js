const mongoose = require('mongoose');

// Use your actual MongoDB URI here or from your .env.local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function dropEmailIndex() {
  await mongoose.connect(MONGODB_URI);
  try {
    const result = await mongoose.connection.collection('users').dropIndex('email_1');
    console.log('Index dropped:', result);
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Index not found, nothing to drop.');
    } else {
      console.error('Error dropping index:', err);
    }
  } finally {
    await mongoose.disconnect();
  }
}

dropEmailIndex();
