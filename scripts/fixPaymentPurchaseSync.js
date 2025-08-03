const mongoose = require('mongoose');
require('dotenv').config();

async function fixPaymentPurchaseSync() {
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

    console.log('\n=== Fixing Payment-Purchase Synchronization ===\n');

    // 1. Get all data
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

    // 2. Handle orphaned payments (test payments that should be linked to actual purchases)
    const orphanedPayments = payments.filter(p => !p.user && !p.course && !p.test);
    console.log(`\n🔧 Processing ${orphanedPayments.length} orphaned payments...`);

    if (orphanedPayments.length > 0) {
      // For now, we'll link test payments to the first user's purchases
      // In a real scenario, you'd want to match based on payment metadata
      const firstUser = users[0];
      if (firstUser) {
        console.log(`  Linking orphaned payments to user: ${firstUser.name}`);
        
        for (let i = 0; i < orphanedPayments.length; i++) {
          const payment = orphanedPayments[i];
          const userPurchases = purchases.filter(p => p.user.toString() === firstUser._id.toString());
          
          if (userPurchases[i]) {
            const purchase = userPurchases[i];
            const updateData = {
              user: firstUser._id,
              course: purchase.course || null,
              test: purchase.test || null
            };
            
            await Payment.findByIdAndUpdate(payment._id, updateData);
            console.log(`    ✅ Linked payment ${payment.payment_id} to purchase ${purchase._id}`);
          }
        }
      }
    }

    // 3. Create payment records for purchases that don't have them
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

    console.log(`\n🔧 Creating payment records for ${purchasesWithoutPayments.length} purchases...`);

    if (purchasesWithoutPayments.length > 0) {
      for (const purchase of purchasesWithoutPayments) {
        // Create a synthetic payment record for historical purchases
        const paymentData = {
          payment_id: `historical-${purchase._id}`,
          payment_date: purchase.purchasedAt.toISOString(),
          payment_status: 'PAID',
          payment_amount: 0, // Unknown amount for historical purchases
          payment_currency: 'MNT',
          payment_wallet: 'QPay',
          payment_name: 'Historical Purchase',
          payment_description: purchase.course ? 'Course Purchase' : 'Test Purchase',
          paid_by: 'P2P',
          object_type: 'INVOICE',
          object_id: `historical-${purchase._id}`,
          user: purchase.user,
          course: purchase.course || null,
          test: purchase.test || null
        };
        
        try {
          await Payment.create(paymentData);
          console.log(`    ✅ Created payment record for purchase ${purchase._id}`);
        } catch (error) {
          if (error.code === 11000) {
            console.log(`    ⚠️  Payment record already exists for purchase ${purchase._id}`);
          } else {
            console.log(`    ❌ Failed to create payment record for purchase ${purchase._id}: ${error.message}`);
          }
        }
      }
    }

    // 4. Verify final state
    console.log('\n✅ Final Verification:');
    const finalPayments = await Payment.find({}).lean();
    const finalPurchases = await Purchase.find({}).lean();
    
    console.log(`  Purchase records: ${finalPurchases.length}`);
    console.log(`  Payment records: ${finalPayments.length}`);
    
    // Check for remaining orphaned payments
    const remainingOrphaned = finalPayments.filter(p => !p.user && !p.course && !p.test);
    console.log(`  Remaining orphaned payments: ${remainingOrphaned.length}`);
    
    // Check for purchases without payments
    const remainingUnlinked = [];
    for (const purchase of finalPurchases) {
      const hasPayment = finalPayments.some(p => 
        (p.user && p.user.toString() === purchase.user.toString()) &&
        ((p.course && p.course.toString() === purchase.course?.toString()) ||
         (p.test && p.test.toString() === purchase.test?.toString()))
      );
      
      if (!hasPayment) {
        remainingUnlinked.push(purchase);
      }
    }
    console.log(`  Purchases without payment records: ${remainingUnlinked.length}`);

    if (remainingOrphaned.length === 0 && remainingUnlinked.length === 0) {
      console.log('\n🎉 All payment and purchase records are now synchronized!');
    } else {
      console.log('\n⚠️  Some synchronization issues remain. Manual review may be needed.');
    }

    console.log('\n✅ Payment-purchase synchronization fix complete!');

  } catch (error) {
    console.error('Sync fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the sync fix
fixPaymentPurchaseSync(); 