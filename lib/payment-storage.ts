import Payment from '@/app/models/payment';
import { connectMongoose } from '@/lib/mongodb';

// In-memory cache for faster access (fallback)
const paymentStatusMap = new Map<string, any>();

export async function storePaymentStatus(invoiceId: string, paymentInfo: any) {
  try {
    // Store in database
    await connectMongoose();
    
    // Check if payment already exists
    const existingPayment = await Payment.findOne({ 
      $or: [
        { object_id: invoiceId },
        { payment_id: paymentInfo.payment_id }
      ]
    });

    if (existingPayment) {
      // Update existing payment
      await Payment.findByIdAndUpdate(existingPayment._id, {
        ...paymentInfo,
        updatedAt: new Date()
      });
      console.log('Payment updated in database for invoice:', invoiceId);
    } else {
      // Create new payment
      await Payment.create({
        ...paymentInfo,
        object_id: invoiceId
      });
      console.log('Payment stored in database for invoice:', invoiceId);
    }

    // Also store in memory cache for faster access
    paymentStatusMap.set(invoiceId, paymentInfo);
    
  } catch (error) {
    console.error('Failed to store payment in database:', error);
    // Fallback to memory storage
    paymentStatusMap.set(invoiceId, paymentInfo);
    console.log('Payment stored in memory cache for invoice:', invoiceId);
  }
}

export async function getPaymentStatus(invoiceId: string) {
  try {
    // First check memory cache
    const cachedPayment = paymentStatusMap.get(invoiceId);
    if (cachedPayment) {
      return cachedPayment;
    }

    // If not in cache, check database
    await connectMongoose();
    const payment = await Payment.findOne({ object_id: invoiceId });
    
    if (payment) {
      // Store in cache for future access
      const paymentData = payment.toObject();
      paymentStatusMap.set(invoiceId, paymentData);
      return paymentData;
    }

    return null;
  } catch (error) {
    console.error('Failed to get payment from database:', error);
    // Fallback to memory cache
    return paymentStatusMap.get(invoiceId) || null;
  }
}

// Function to clear cache (useful for testing)
export function clearPaymentCache() {
  paymentStatusMap.clear();
} 