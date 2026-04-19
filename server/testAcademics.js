/**
 * Test script for academics login
 * Run: node testAcademics.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://prococomelon32_db_user:axZbhOgkCOUIaatX@cluster0.ybg128b.mongodb.net/?appName=Cluster0';

async function testAcademics() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    const User = require('./models/User');

    // Test 1: Check if academics user exists
    console.log('=== Test 1: Checking existing academics users ===');
    const academics = await User.find({ role: 'academics' }).select('-password');
    console.log('Found academics accounts:', academics.length);
    academics.forEach(a => {
      console.log(`  - ${a.email} | name: ${a.name} | isActive: ${a.isActive}`);
    });

    // Test 2: Create a test academics user with KNOWN password
    console.log('\n=== Test 2: Creating test academics user ===');
    const testEmail = 'testacademics@test.com';
    const testPassword = 'Test@123';

    // Delete existing test user if exists
    await User.deleteOne({ email: testEmail });
    console.log('Deleted any existing test user');

    // Pass plain password - let middleware hash it (like academics.js does)
    const user = new User({
      name: 'Test Academics',
      email: testEmail,
      password: testPassword,  // Plain password - middleware will hash it
      role: 'academics',
      department: 'Testing',
      isVerified: true,
      isActive: true
    });

    await user.save();
    console.log('Test user created!');
    console.log('Stored password hash:', user.password.substring(0, 60));

    // Test 3: Try to login with the credentials
    console.log('\n=== Test 3: Testing login ===');
    const foundUser = await User.findOne({ email: testEmail, role: 'academics', isActive: true });
    
    if (!foundUser) {
      console.log('ERROR: User not found after creation');
    } else {
      console.log('User found:', foundUser.email);
      
      // Test password comparison
      const match = await bcrypt.compare(testPassword, foundUser.password);
      console.log('Password comparison result:', match ? 'MATCH ✅' : 'NO MATCH ❌');
      
      if (match) {
        console.log('\n✅ SUCCESS: Login should work with these credentials:');
        console.log(`   Email: ${testEmail}`);
        console.log(`   Password: ${testPassword}`);
      } else {
        console.log('\n❌ FAILED: Password still not matching');
        console.log('Stored hash:', foundUser.password.substring(0, 50) + '...');
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

testAcademics();