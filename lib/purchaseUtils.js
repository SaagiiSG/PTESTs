const mongoose = require('mongoose');

/**
 * Hybrid Purchase System Utility Functions
 * 
 * This module ensures that purchases are stored in both:
 * 1. User model (purchasedCourses/purchasedTests arrays) - for fast access
 * 2. Purchase collection - for analytics and history
 */

/**
 * Check if user has already purchased a specific course or test (fast check)
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID (optional)
 * @param {string} testId - Test ID (optional)
 * @returns {Promise<boolean>} - Whether user has purchased
 */
async function hasPurchased(userId, courseId = null, testId = null) {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(userId).select('purchasedCourses purchasedTests');
    
    if (!user) return false;
    
    if (courseId) {
      return user.purchasedCourses.includes(courseId);
    }
    
    if (testId) {
      return user.purchasedTests.includes(testId);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking purchase status:', error);
    return false;
  }
}

/**
 * Create a new purchase and update both user model and purchase collection
 * WITH DUPLICATE PROTECTION
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID (optional)
 * @param {string} testId - Test ID (optional)
 * @param {Object} purchaseData - Additional purchase data (amount, paymentMethod, etc.)
 * @returns {Promise<Object>} - Created purchase record or existing purchase info
 */
async function createPurchase(userId, courseId = null, testId = null, purchaseData = {}) {
  const session = await mongoose.startSession();
  
  try {
    // First, check if user already owns this item (fast check)
    const alreadyOwns = await hasPurchased(userId, courseId, testId);
    if (alreadyOwns) {
      console.log(`User ${userId} already owns this item. Preventing duplicate purchase.`);
      return { 
        success: false, 
        reason: 'already_owned',
        message: 'User already owns this item'
      };
    }

    // Check for recent duplicate purchase attempts (within last 5 minutes)
    const Purchase = mongoose.model('Purchase');
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const recentPurchase = await Purchase.findOne({
      user: userId,
      course: courseId || null,
      test: testId || null,
      purchasedAt: { $gte: fiveMinutesAgo }
    });

    if (recentPurchase) {
      console.log(`Recent duplicate purchase attempt detected for user ${userId}. Preventing duplicate.`);
      return { 
        success: false, 
        reason: 'recent_duplicate',
        message: 'Recent purchase attempt detected. Please wait a moment.',
        existingPurchase: recentPurchase
      };
    }

    await session.withTransaction(async () => {
      // Double-check ownership within transaction (race condition protection)
      const user = await mongoose.model('User').findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // Check again within transaction
      if (courseId && user.purchasedCourses.includes(courseId)) {
        throw new Error('User already owns this course');
      }
      if (testId && user.purchasedTests.includes(testId)) {
        throw new Error('User already owns this test');
      }

      // 1. Update user model (fast access)
      const updateData = {};
      if (courseId) {
        updateData.$addToSet = { purchasedCourses: courseId };
      }
      if (testId) {
        updateData.$addToSet = { purchasedTests: testId };
      }
      
      if (Object.keys(updateData).length > 0) {
        await mongoose.model('User').findByIdAndUpdate(userId, updateData, { session });
      }
      
      // 2. Create purchase record (analytics)
      const purchaseRecord = {
        user: userId,
        purchasedAt: new Date(),
        ...purchaseData
      };
      
      if (courseId) purchaseRecord.course = courseId;
      if (testId) purchaseRecord.test = testId;
      
      await Purchase.create([purchaseRecord], { session });
    });
    
    console.log(`Purchase created successfully for user ${userId}`);
    return { 
      success: true,
      message: 'Purchase completed successfully'
    };
    
  } catch (error) {
    console.error('Error creating purchase:', error);
    
    // Handle specific error cases
    if (error.message.includes('already owns')) {
      return { 
        success: false, 
        reason: 'already_owned',
        message: 'User already owns this item'
      };
    }
    
    throw error;
  } finally {
    await session.endSession();
  }
}

/**
 * Create a purchase with additional duplicate protection using unique constraints
 * This is the most robust method for preventing duplicates
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID (optional)
 * @param {string} testId - Test ID (optional)
 * @param {Object} purchaseData - Additional purchase data
 * @returns {Promise<Object>} - Result of purchase creation
 */
async function createPurchaseWithUniqueConstraint(userId, courseId = null, testId = null, purchaseData = {}) {
  const session = await mongoose.startSession();
  
  try {
    // Check if user already owns this item
    const alreadyOwns = await hasPurchased(userId, courseId, testId);
    if (alreadyOwns) {
      return { 
        success: false, 
        reason: 'already_owned',
        message: 'User already owns this item'
      };
    }

    await session.withTransaction(async () => {
      const User = mongoose.model('User');
      const Purchase = mongoose.model('Purchase');
      
      // Final check within transaction
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      if (courseId && user.purchasedCourses.includes(courseId)) {
        throw new Error('User already owns this course');
      }
      if (testId && user.purchasedTests.includes(testId)) {
        throw new Error('User already owns this test');
      }

      // Update user model
      const updateData = {};
      if (courseId) {
        updateData.$addToSet = { purchasedCourses: courseId };
      }
      if (testId) {
        updateData.$addToSet = { purchasedTests: testId };
      }
      
      if (Object.keys(updateData).length > 0) {
        await User.findByIdAndUpdate(userId, updateData, { session });
      }
      
      // Create purchase record with unique constraint
      const purchaseRecord = {
        user: userId,
        purchasedAt: new Date(),
        ...purchaseData
      };
      
      if (courseId) purchaseRecord.course = courseId;
      if (testId) purchaseRecord.test = testId;
      
      try {
        await Purchase.create([purchaseRecord], { session });
      } catch (createError) {
        // Handle duplicate key error (if unique index exists)
        if (createError.code === 11000) {
          throw new Error('Duplicate purchase detected');
        }
        throw createError;
      }
    });
    
    return { 
      success: true,
      message: 'Purchase completed successfully'
    };
    
  } catch (error) {
    console.error('Error creating purchase:', error);
    
    if (error.message.includes('already owns') || error.message.includes('Duplicate purchase')) {
      return { 
        success: false, 
        reason: 'duplicate_detected',
        message: 'Purchase already exists'
      };
    }
    
    throw error;
  } finally {
    await session.endSession();
  }
}

/**
 * Remove a purchase and update both user model and purchase collection
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID (optional)
 * @param {string} testId - Test ID (optional)
 * @returns {Promise<Object>} - Result of removal
 */
async function removePurchase(userId, courseId = null, testId = null) {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // 1. Update user model (fast access)
      const updateData = {};
      if (courseId) {
        updateData.$pull = { purchasedCourses: courseId };
      }
      if (testId) {
        updateData.$pull = { purchasedTests: testId };
      }
      
      if (Object.keys(updateData).length > 0) {
        await mongoose.model('User').findByIdAndUpdate(userId, updateData, { session });
      }
      
      // 2. Remove purchase record (analytics)
      const Purchase = mongoose.model('Purchase');
      const query = { user: userId };
      if (courseId) query.course = courseId;
      if (testId) query.test = testId;
      
      await Purchase.deleteMany(query, { session });
    });
    
    console.log(`Purchase removed successfully for user ${userId}`);
    return { success: true };
    
  } catch (error) {
    console.error('Error removing purchase:', error);
    throw error;
  } finally {
    await session.endSession();
  }
}

/**
 * Get user's purchase history (from purchase collection)
 * @param {string} userId - User ID
 * @param {Object} options - Query options (limit, skip, sort)
 * @returns {Promise<Array>} - Purchase history
 */
async function getPurchaseHistory(userId, options = {}) {
  try {
    const Purchase = mongoose.model('Purchase');
    const query = { user: userId };
    
    let purchaseQuery = Purchase.find(query)
      .populate('course', 'title thumbnail')
      .populate('test', 'title thumbnail');
    
    if (options.sort) {
      purchaseQuery = purchaseQuery.sort(options.sort);
    } else {
      purchaseQuery = purchaseQuery.sort({ purchasedAt: -1 });
    }
    
    if (options.limit) {
      purchaseQuery = purchaseQuery.limit(options.limit);
    }
    
    if (options.skip) {
      purchaseQuery = purchaseQuery.skip(options.skip);
    }
    
    return await purchaseQuery.exec();
  } catch (error) {
    console.error('Error getting purchase history:', error);
    return [];
  }
}

/**
 * Get analytics data from purchase collection
 * @param {Object} filters - Date filters, user filters, etc.
 * @returns {Promise<Object>} - Analytics data
 */
async function getPurchaseAnalytics(filters = {}) {
  try {
    const Purchase = mongoose.model('Purchase');
    
    // Build match stage
    const matchStage = {};
    if (filters.startDate) {
      matchStage.purchasedAt = { $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      matchStage.purchasedAt = { ...matchStage.purchasedAt, $lte: new Date(filters.endDate) };
    }
    
    const pipeline = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    // Get total purchases
    const totalPurchases = await Purchase.countDocuments(matchStage);
    
    // Get purchases by type
    const coursePurchases = await Purchase.countDocuments({ ...matchStage, course: { $exists: true } });
    const testPurchases = await Purchase.countDocuments({ ...matchStage, test: { $exists: true } });
    
    // Get top courses
    const topCourses = await Purchase.aggregate([
      ...pipeline,
      { $match: { course: { $exists: true } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get top tests
    const topTests = await Purchase.aggregate([
      ...pipeline,
      { $match: { test: { $exists: true } } },
      { $group: { _id: '$test', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    return {
      totalPurchases,
      coursePurchases,
      testPurchases,
      topCourses,
      topTests
    };
  } catch (error) {
    console.error('Error getting purchase analytics:', error);
    return {};
  }
}

/**
 * Clean up duplicate purchases (utility function for maintenance)
 * @param {string} userId - User ID (optional, if not provided, checks all users)
 * @returns {Promise<Object>} - Cleanup results
 */
async function cleanupDuplicatePurchases(userId = null) {
  try {
    const Purchase = mongoose.model('Purchase');
    const User = mongoose.model('User');
    
    const query = userId ? { user: userId } : {};
    const purchases = await Purchase.find(query).sort({ purchasedAt: 1 });
    
    const duplicates = [];
    const seen = new Set();
    
    for (const purchase of purchases) {
      const key = `${purchase.user}-${purchase.course || 'null'}-${purchase.test || 'null'}`;
      
      if (seen.has(key)) {
        duplicates.push(purchase._id);
      } else {
        seen.add(key);
      }
    }
    
    if (duplicates.length > 0) {
      await Purchase.deleteMany({ _id: { $in: duplicates } });
      console.log(`Cleaned up ${duplicates.length} duplicate purchases`);
    }
    
    return {
      duplicatesFound: duplicates.length,
      duplicatesRemoved: duplicates.length
    };
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
    throw error;
  }
}

module.exports = {
  createPurchase,
  createPurchaseWithUniqueConstraint,
  removePurchase,
  hasPurchased,
  getPurchaseHistory,
  getPurchaseAnalytics,
  cleanupDuplicatePurchases
}; 