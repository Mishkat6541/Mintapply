import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import RedeemCode from './models/RedeemCode.js';

const MONGO_URI = process.env.MONGO_URI;

async function viewDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!\n');

    // View all users
    console.log('👥 USERS:');
    console.log('═'.repeat(80));
    const users = await User.find({}).select('-password'); // Exclude password
    if (users.length === 0) {
      console.log('   (No users yet)\n');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Tokens: ${user.tokens}`);
        console.log(`   Created: ${user.createdAt.toLocaleString()}`);
        console.log('');
      });
    }

    // View all redeem codes
    console.log('🎫 REDEEM CODES:');
    console.log('═'.repeat(80));
    const codes = await RedeemCode.find({});
    if (codes.length === 0) {
      console.log('   (No codes yet)\n');
    } else {
      codes.forEach((code, index) => {
        const status = code.isActive ? '✅ Active' : '❌ Used';
        console.log(`${index + 1}. Code: ${code.code}`);
        console.log(`   Tokens: ${code.tokens}`);
        console.log(`   Status: ${status}`);
        if (!code.isActive) {
          console.log(`   Used at: ${code.usedAt?.toLocaleString()}`);
        }
        console.log('');
      });
    }

    console.log('═'.repeat(80));
    console.log(`Total Users: ${users.length}`);
    console.log(`Total Codes: ${codes.length}`);
    console.log(`Active Codes: ${codes.filter(c => c.isActive).length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

viewDatabase();
