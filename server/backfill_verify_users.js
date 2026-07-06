require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

async function runBackfill() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not set in environment variables.');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Connected. Verifying all existing users email verification status...');
    const result = await User.updateMany(
      {},
      { $set: { isEmailVerified: true } }
    );
    console.log(`Backfill completed successfully. Verified all ${result.modifiedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Backfill migration failed:', error);
    process.exit(1);
  }
}

runBackfill();
