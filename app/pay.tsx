import React from 'react';
import QPayPayment from '@/components/QPayPayment';
import { Toaster } from 'sonner';

export default function PayPage() {
  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    // Handle successful payment - update database, send confirmation, etc.
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Handle payment error
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              QPay Payment Gateway
            </h1>
            <p className="text-gray-600">
              Secure and fast payments using QPay mobile app
            </p>
          </div>

          <QPayPayment
            amount={1000}
            description="Test payment"
            receiverCode="TEST_RECEIVER"
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Powered by{' '}
              <a 
                href="https://developer.qpay.mn/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                QPay API
              </a>
            </p>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
} 