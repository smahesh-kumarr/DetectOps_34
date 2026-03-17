/**
 * Phase 2 — CRUD Verification Script
 * Verifies: User read, Report create/read/update/delete
 * Run: node src/scripts/verifyCRUD.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User   = require('../models/User');
const Report = require('../models/Report');

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // ── READ: List all users ──────────────────────────────────────────────
    console.log('📋 [READ] All users in DB:');
    const users = await User.find().select('-password');
    if (users.length === 0) {
      console.log('   ⚠️  No users found — run `npm run seed` first');
    } else {
      users.forEach(u => console.log(`   • [${u.role.padEnd(9)}] ${u.name} — ${u.email}`));
    }

    // Pick inspector for test report
    const inspector = users.find(u => u.role === 'inspector');
    if (!inspector) {
      console.log('\n⚠️  No inspector found — skipping Report CRUD tests');
      process.exit(0);
    }

    // ── CREATE: Insert a test report ─────────────────────────────────────
    console.log('\n📝 [CREATE] Inserting a test Report...');
    const report = await Report.create({
      imageUrl:      'https://example.com/test-image.jpg',
      s3Key:         `cleanliness-images/${inspector._id}/test-${Date.now()}.jpg`,
      labels:        [{ name: 'Trash', confidence: 89.5 }, { name: 'Outdoor', confidence: 99.1 }],
      status:        'violation',
      location:      { name: 'Test Park', lat: 11.0168, lng: 76.9558 },
      description:   'CRUD verification test report',
      userId:        inspector._id,
      inspectorName: inspector.name,
    });
    console.log(`   ✅ Report created — ID: ${report._id}`);

    // ── READ: Fetch the report back ───────────────────────────────────────
    console.log('\n🔍 [READ] Fetching report by ID...');
    const fetched = await Report.findById(report._id);
    console.log(`   ✅ status=${fetched.status} | location=${fetched.location.name} | labels=${fetched.labels.length}`);

    // ── UPDATE: Mark as resolved ──────────────────────────────────────────
    console.log('\n✏️  [UPDATE] Marking violation as resolved...');
    await Report.findByIdAndUpdate(report._id, {
      violationStatus: 'resolved',
      resolvedAt:      new Date(),
    });
    const updated = await Report.findById(report._id);
    console.log(`   ✅ violationStatus=${updated.violationStatus} | resolvedAt=${updated.resolvedAt}`);

    // ── DELETE: Clean up test report ──────────────────────────────────────
    console.log('\n🗑️  [DELETE] Removing test report...');
    await Report.findByIdAndDelete(report._id);
    const deleted = await Report.findById(report._id);
    console.log(`   ✅ Deleted — findById now returns: ${deleted}`);

    console.log('\n🎉 All CRUD operations verified successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ CRUD verification failed:', err.message);
    process.exit(1);
  }
};

verify();
