import 'dotenv/config';
import mongoose from 'mongoose';
import RedeemCode from './models/RedeemCode.js';

const MONGO_URI = process.env.MONGO_URI;

const seedCodes = [
  { code: 'MINT25', tokens: 25 },
  { code: 'MINT100', tokens: 100 },
  { code: 'WELCOME10', tokens: 10 },
  { code: 'TEST5', tokens: 5 }
];

async function seedRedeemCodes() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing codes (optional - comment out if you want to keep existing)
    // await RedeemCode.deleteMany({});
    // console.log('🗑️  Cleared existing redeem codes');

    // Add new codes
    for (const codeData of seedCodes) {
      const existing = await RedeemCode.findOne({ code: codeData.code });
      if (existing) {
        console.log(`⏭️  Code ${codeData.code} already exists, skipping`);
      } else {
        await RedeemCode.create(codeData);
        console.log(`✅ Created code: ${codeData.code} (${codeData.tokens} tokens)`);
      }
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Available redeem codes:');
    const allCodes = await RedeemCode.find({ isActive: true });
    allCodes.forEach(code => {
      console.log(`   ${code.code} → ${code.tokens} tokens`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedRedeemCodes();
