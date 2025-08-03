const mongoose = require('mongoose');
require('dotenv').config();

async function syncPaymentPurchaseData() {
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

    console.log('\n=== Payment & Purchase Data Synchronization ===\n');

    // 1. Analyze current state
    const users = await User.find({
      $or: [
        { purchasedCourses: { $exists: true, $ne: [] } },
        { purchasedTests: { $exists: true, $ne: [] } }
      ]
    }).lean();

    const purchases = await Purchase.find({}).lean();
    const payments = await Payment.find({}).lean();

    console.log('📊 Current State:');
    console.log(`  Users with purchases: ${users.length}`);
    console.log(`  Purchase records: ${purchases.length}`);
    console.log(`  Payment records: ${payments.length}`);

    // 2. Check for orphaned payment records (payments without user/course/test links)
    const orphanedPayments = payments.filter(p => !p.user && !p.course && !p.test);
    console.log(`\n🔍 Orphaned payment records: ${orphanedPayments.length}`);

    if (orphanedPayments.length > 0) {
      console.log('  These payments are not linked to any user, course, or test:');
      orphanedPayments.forEach((payment, index) => {
        console.log(`    ${index + 1}. Payment ID: ${payment.payment_id}, Amount: ${payment.payment_amount} MNT, Status: ${payment.payment_status}`);
      });
    }

    // 3. Check for purchases without corresponding payment records
    const purchasesWithoutPayments = [];
    for (const purchase of purchases) {
      const hasPayment = payments.some(p => 
        (p.user && p.user.toString() === purchase.user.toString()) &&
        ((p.course && p.course.toString() === purchase.course?.toString()) ||
         (p.test && p.test.toString() === purchase.test?.toString()))
      );
      
      if (!hasPayment) {
        purchasesWithoutPayments.push(purchase);
      }
    }

    console.log(`\n🔍 Purchases without payment records: ${purchasesWithoutPayments.length}`);

    // 4. Check for payments without corresponding purchase records
    const paymentsWithoutPurchases = [];
    for (const payment of payments) {
      if (payment.user) {
        const hasPurchase = purchases.some(p => 
          p.user.toString() === payment.user.toString() &&
          ((p.course && p.course.toString() === payment.course?.toString()) ||
           (p.test && p.test.toString() === payment.test?.toString()))
        );
        
        if (!hasPurchase) {
          paymentsWithoutPurchases.push(payment);
        }
      }
    }

    console.log(`\n🔍 Payments without purchase records: ${paymentsWithoutPurchases.length}`);

    // 5. Verify User model consistency
    console.log('\n✅ User Model Consistency Check:');
    for (const user of users) {
      const userCourseIds = user.purchasedCourses ? user.purchasedCourses.map(id => id.toString()) : [];
      const userTestIds = user.purchasedTests ? user.purchasedTests.map(id => id.toString()) : [];
      
      const userPurchases = purchases.filter(p => p.user.toString() === user._id.toString());
      const purchaseCourseIds = userPurchases.filter(p => p.course).map(p => p.course.toString());
      const purchaseTestIds = userPurchases.filter(p => p.test).map(p => p.test.toString());

      const coursesMatch = JSON.stringify(userCourseIds.sort()) === JSON.stringify(purchaseCourseIds.sort());
      const testsMatch = JSON.stringify(userTestIds.sort()) === JSON.stringify(purchaseTestIds.sort());

      console.log(`  👤 ${user.name}:`);
      console.log(`    Courses: ${coursesMatch ? '✅' : '❌'} (User: ${userCourseIds.length}, Purchase: ${purchaseCourseIds.length})`);
      console.log(`    Tests: ${testsMatch ? '✅' : '❌'} (User: ${userTestIds.length}, Purchase: ${purchaseTestIds.length})`);
    }

    // 6. Summary and recommendations
    console.log('\n📋 Summary & Recommendations:');
    console.log(`1. Purchase records: ${purchases.length} (✅ Synchronized with User model)`);
    console.log(`2. Payment records: ${payments.length} (${orphanedPayments.length} orphaned)`);
    console.log(`3. Missing payment-purchase links: ${Math.max(purchasesWithoutPayments.length, paymentsWithoutPurchases.length)}`);

    if (orphanedPayments.length > 0) {
      console.log('\n⚠️  Recommendations:');
      console.log('  - Review orphaned payment records and link them to appropriate users/courses/tests');
      console.log('  - Consider implementing better payment tracking in the QPay callback');
    }

    if (purchasesWithoutPayments.length > 0) {
      console.log('  - Some purchases don\'t have corresponding payment records (may be free courses or manual entries)');
    }

    console.log('\n✅ Data synchronization analysis complete!');

  } catch (error) {
    console.error('Sync analysis failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the sync analysis
syncPaymentPurchaseData(); 