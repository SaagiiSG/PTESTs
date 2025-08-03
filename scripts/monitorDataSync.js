const mongoose = require('mongoose');
require('dotenv').config();

async function monitorDataSync() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define schemas
    const UserSchema = new mongoose.Schema({
      name: { type: String, required: true },
      phoneNumber: { type: String, required: false, unique: true, sparse: true },
      password: { type: String, required: false },
      email: { type: String, required: false, unique: true, sparse: true },
      age: { type: Number },
      gender: { type: String },
      verificationCode: { type: String },
      isPhoneVerified: { type: Boolean, default: false },
      verificationCodeExpires: { type: Date },
      isAdmin: { type: Boolean, default: false },
      purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
      purchasedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
    }, { timestamps: true });

    const PurchaseSchema = new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
      purchasedAt: { type: Date, default: Date.now },
    });

    const PaymentSchema = new mongoose.Schema({
      payment_id: { type: String, required: true, unique: true },
      payment_date: { type: String, required: true },
      payment_status: { 
        type: String, 
        required: true, 
        enum: ['NEW', 'FAILED', 'PAID', 'REFUNDED'],
        default: 'NEW'
      },
      payment_fee: { type: Number, default: 0 },
      payment_amount: { type: Number, required: true },
      payment_currency: { type: String, default: 'MNT' },
      payment_wallet: { type: String, default: 'QPay' },
      payment_name: { type: String },
      payment_description: { type: String },
      qr_code: { type: String },
      paid_by: { 
        type: String, 
        enum: ['P2P', 'CARD'],
        default: 'P2P'
      },
      object_type: { type: String, required: true },
      object_id: { type: String, required: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    }, { timestamps: true });

    // Get models
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
    const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

    console.log('\n=== Data Synchronization Monitor ===');
    console.log(`Timestamp: ${new Date().toISOString()}\n`);

    // Get counts
    const userCount = await User.countDocuments({
      $or: [
        { purchasedCourses: { $exists: true, $ne: [] } },
        { purchasedTests: { $exists: true, $ne: [] } }
      ]
    });
    const purchaseCount = await Purchase.countDocuments();
    const paymentCount = await Payment.countDocuments();
    const orphanedPaymentCount = await Payment.countDocuments({
      $and: [
        { user: { $exists: false } },
        { course: { $exists: false } },
        { test: { $exists: false } }
      ]
    });

    // Quick health check
    const isHealthy = orphanedPaymentCount === 0;
    const status = isHealthy ? '✅ HEALTHY' : '❌ ISSUES DETECTED';

    console.log(`📊 Current Status: ${status}`);
    console.log(`  Users with purchases: ${userCount}`);
    console.log(`  Purchase records: ${purchaseCount}`);
    console.log(`  Payment records: ${paymentCount}`);
    console.log(`  Orphaned payments: ${orphanedPaymentCount}`);

    if (!isHealthy) {
      console.log('\n⚠️  Issues detected:');
      console.log(`  - ${orphanedPaymentCount} orphaned payment records found`);
      console.log('  - Run "node scripts/fixPaymentPurchaseSync.js" to fix issues');
    } else {
      console.log('\n✅ All systems synchronized!');
    }

    // Show recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentPurchases = await Purchase.countDocuments({
      purchasedAt: { $gte: oneDayAgo }
    });
    const recentPayments = await Payment.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });

    console.log(`\n📈 Recent Activity (24h):`);
    console.log(`  New purchases: ${recentPurchases}`);
    console.log(`  New payments: ${recentPayments}`);

    console.log('\n✅ Monitor complete!');

  } catch (error) {
    console.error('Monitor failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the monitor
monitorDataSync(); 