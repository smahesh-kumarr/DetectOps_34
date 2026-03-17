require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing seed users by actual emails
    await User.deleteMany({
      email: {
        $in: [
          'maheshkumar08042006@gmail.com',
          'karthikesh.n2023cse@sece.ac.in',
          'maheshkumarawsdevops@gmail.com',
        ],
      },
    });
    console.log('🗑️  Cleared existing seed users');

    // Create all 3 seed users (passwords hashed by User model pre-save hook)
    const users = await User.create([
      { name: 'Mahesh (Inspector)', email: 'maheshkumar08042006@gmail.com',   password: 'password123', role: 'inspector' },
      { name: 'Karthikesh (Admin)', email: 'karthikesh.n2023cse@sece.ac.in', password: 'password123', role: 'admin'     },
      { name: 'Mahesh (Officer)',   email: 'maheshkumarawsdevops@gmail.com',  password: 'password123', role: 'officer'   },
    ]);

    console.log('🌱 Seed users created:');
    users.forEach((u) => console.log(`   - ${u.role}: ${u.email}`));
    console.log('\n📌 All passwords: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedUsers();
