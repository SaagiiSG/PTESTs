# Hybrid Purchase System Implementation

## Overview

This document describes the hybrid purchase system that stores purchase data in both:
1. **User Model** (`purchasedCourses` and `purchasedTests` arrays) - for fast access
2. **Purchase Collection** - for analytics and detailed history

## Architecture

### Data Storage Strategy

```
User Document:
{
  _id: ObjectId,
  name: String,
  purchasedCourses: [ObjectId], // Fast access array
  purchasedTests: [ObjectId],   // Fast access array
  // ... other user fields
}

Purchase Collection:
{
  _id: ObjectId,
  user: ObjectId,           // Reference to user
  course: ObjectId,         // Optional course reference
  test: ObjectId,          // Optional test reference
  purchasedAt: Date,       // Purchase timestamp
  amount: Number,          // Purchase amount
  paymentMethod: String,   // Payment method used
  // ... other purchase metadata
}
```

## Benefits

### Fast User Experience
- ✅ **Instant ownership checks** via `user.purchasedCourses.includes(courseId)`
- ✅ **No joins required** for basic access control
- ✅ **Atomic updates** ensure data consistency

### Rich Analytics
- ✅ **Purchase history** with timestamps
- ✅ **Revenue tracking** by time period
- ✅ **Popular content analysis**
- ✅ **Payment method insights**
- ✅ **User behavior patterns**

## Implementation Files

### Core Utility: `lib/purchaseUtils.js`
Contains all the functions to manage the hybrid system:

- `createPurchase(userId, courseId, testId, purchaseData)` - Creates purchase in both locations
- `removePurchase(userId, courseId, testId)` - Removes purchase from both locations
- `hasPurchased(userId, courseId, testId)` - Fast ownership check
- `getPurchaseHistory(userId, options)` - Get detailed purchase history
- `getPurchaseAnalytics(filters)` - Get analytics data

### Migration Scripts
- `scripts/migratePurchases.js` - Original migration to user model
- `scripts/implementHybridPurchases.js` - Creates purchase collection from user data
- `scripts/testHybridSystem.js` - Tests the hybrid system functionality

## Usage Examples

### Creating a Purchase
```javascript
const { createPurchase } = require('../lib/purchaseUtils');

// Purchase a course
await createPurchase(userId, courseId, null, {
  amount: 29.99,
  paymentMethod: 'credit_card'
});

// Purchase a test
await createPurchase(userId, null, testId, {
  amount: 9.99,
  paymentMethod: 'paypal'
});
```

### Checking Ownership
```javascript
const { hasPurchased } = require('../lib/purchaseUtils');

// Fast check if user owns a course
const hasCourse = await hasPurchased(userId, courseId);

// Fast check if user owns a test
const hasTest = await hasPurchased(userId, null, testId);
```

### Getting Analytics
```javascript
const { getPurchaseAnalytics } = require('../lib/purchaseUtils');

// Get overall analytics
const analytics = await getPurchaseAnalytics();

// Get analytics for specific date range
const monthlyAnalytics = await getPurchaseAnalytics({
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});
```

## Data Consistency

The system uses MongoDB transactions to ensure both the user model and purchase collection stay in sync:

1. **Atomic Operations**: All updates happen within a transaction
2. **Rollback on Failure**: If either update fails, both are rolled back
3. **Consistency Checks**: Test scripts verify data integrity

## Analytics Capabilities

### Available Metrics
- Total purchases by time period
- Course vs test purchase ratios
- Most popular content
- Revenue trends
- Payment method preferences
- User purchase patterns

### Sample Queries
```javascript
// Most popular courses
const popularCourses = await Purchase.aggregate([
  { $match: { course: { $exists: true } } },
  { $group: { _id: '$course', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
]);

// Revenue by month
const monthlyRevenue = await Purchase.aggregate([
  {
    $group: {
      _id: {
        year: { $year: '$purchasedAt' },
        month: { $month: '$purchasedAt' }
      },
      totalRevenue: { $sum: '$amount' },
      count: { $sum: 1 }
    }
  },
  { $sort: { '_id.year': -1, '_id.month': -1 } }
]);
```

## Performance Considerations

### Fast Access (User Model)
- **O(1) lookup** for ownership checks
- **No joins required** for basic queries
- **Efficient for user-facing features**

### Analytics (Purchase Collection)
- **Indexed queries** for date ranges
- **Aggregation pipelines** for complex analytics
- **Separate collection** prevents user document bloat

## Migration Status

✅ **Completed**: Original purchase data migrated to user model
✅ **Completed**: Purchase collection recreated from user data
✅ **Completed**: Hybrid system tested and verified
✅ **Completed**: Data consistency confirmed

## Future Enhancements

1. **Enhanced Purchase Metadata**: Add discount codes, refund status, etc.
2. **Advanced Analytics**: Cohort analysis, retention metrics
3. **Real-time Dashboards**: Live purchase monitoring
4. **Automated Reports**: Scheduled analytics reports
5. **A/B Testing**: Purchase flow optimization

## Testing

Run the test suite to verify system integrity:
```bash
node scripts/testHybridSystem.js
```

This will test:
- Purchase creation in both locations
- Data consistency between user model and purchase collection
- Analytics functionality
- Ownership checking
- Purchase history retrieval 