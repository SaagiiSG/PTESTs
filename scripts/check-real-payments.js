const mongoose = require('mongoose');
require('dotenv').config();

async function checkRealPayments() {
  try {
    console.log('🔍 Checking REAL Payment Data Structure...');
    
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI is not set!');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Check payments collection structure
    console.log('\n💰 PAYMENTS Collection Structure:');
    const paymentsCollection = mongoose.connection.db.collection('payments');
    const totalPayments = await paymentsCollection.countDocuments();
    console.log(`  Total Payments: ${totalPayments}`);
    
    if (totalPayments > 0) {
      // Get a sample payment to see the structure
      const samplePayment = await paymentsCollection.findOne({});
      console.log('\n📋 Sample Payment Structure:');
      console.log(JSON.stringify(samplePayment, null, 2));
      
      // Check all unique fields
      const allPayments = await paymentsCollection.find({}).toArray();
      const allFields = new Set();
      allPayments.forEach(payment => {
        Object.keys(payment).forEach(key => allFields.add(key));
      });
      
      console.log('\n🔍 All Fields Found:');
      Array.from(allFields).forEach(field => {
        console.log(`  - ${field}`);
      });
      
      // Check for amount fields
      const amountFields = ['amount', 'payment_amount', 'total', 'value', 'price'];
      console.log('\n💵 Checking for Amount Fields:');
      amountFields.forEach(field => {
        const hasField = allPayments.some(p => p[field] !== undefined && p[field] !== null);
        console.log(`  ${field}: ${hasField ? '✅ Found' : '❌ Not found'}`);
        
        if (hasField) {
          const values = allPayments.filter(p => p[field] !== undefined && p[field] !== null).map(p => p[field]);
          console.log(`    Values: ${values.slice(0, 5).join(', ')}${values.length > 5 ? '...' : ''}`);
        }
      });
      
      // Check for date fields
      const dateFields = ['createdAt', 'date', 'payment_date', 'timestamp'];
      console.log('\n📅 Checking for Date Fields:');
      dateFields.forEach(field => {
        const hasField = allPayments.some(p => p[field] !== undefined && p[field] !== null);
        console.log(`  ${field}: ${hasField ? '✅ Found' : '❌ Not found'}`);
      });
      
      // Check for status fields
      const statusFields = ['status', 'state', 'payment_status'];
      console.log('\n📊 Checking for Status Fields:');
      statusFields.forEach(field => {
        const hasField = allPayments.some(p => p[field] !== undefined && p[field] !== null);
        console.log(`  ${field}: ${hasField ? '✅ Found' : '❌ Not found'}`);
        
        if (hasField) {
          const statuses = [...new Set(allPayments.map(p => p[field]))];
          console.log(`    Statuses: ${statuses.join(', ')}`);
        }
      });
    }
    
    // Check users collection for signup dates
    console.log('\n👥 USERS Collection (Signup Dates):');
    const usersCollection = mongoose.connection.db.collection('users');
    const totalUsers = await usersCollection.countDocuments();
    console.log(`  Total Users: ${totalUsers}`);
    
    if (totalUsers > 0) {
      const usersWithDates = await usersCollection.find({ createdAt: { $exists: true } }).toArray();
      console.log(`  Users with Created Dates: ${usersWithDates.length}`);
      
      if (usersWithDates.length > 0) {
        // Group users by month
        const monthlyUsers = {};
        usersWithDates.forEach(user => {
          const date = new Date(user.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyUsers[monthKey] = (monthlyUsers[monthKey] || 0) + 1;
        });
        
        console.log('\n📈 Monthly User Signups:');
        Object.entries(monthlyUsers).forEach(([month, count]) => {
          console.log(`  ${month}: ${count} users`);
        });
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error checking real payments:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 MongoDB disconnected');
    }
  }
}

checkRealPayments();
