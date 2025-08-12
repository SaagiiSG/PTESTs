'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, QrCode, CreditCard, Smartphone, CheckCircle, XCircle, RefreshCw, Lock, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PaymentGatewayProps {
  itemId: string;
  itemType: 'test' | 'course';
  itemTitle: string;
  itemDescription?: string;
  price: number;
  thumbnailUrl?: string;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface PaymentStatus {
  status: 'idle' | 'loading' | 'qr_generated' | 'checking' | 'paid' | 'failed';
  paymentId?: string;
  qrData?: any;
  error?: string;
}

export default function PaymentGateway({
  itemId,
  itemType,
  itemTitle,
  itemDescription,
  price,
  thumbnailUrl,
  onSuccess,
  onError,
  className = ''
}: PaymentGatewayProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'idle' });
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');
  const [checkCount, setCheckCount] = useState(0);
  const [lastError, setLastError] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);

  // Check if user has already purchased this item
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/purchase/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            itemId,
            itemType
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setHasPurchased(data.hasPurchased);
        }
      } catch (error) {
        console.error('Error checking purchase status:', error);
      } finally {
        setCheckingPurchase(false);
      }
    };

    checkPurchaseStatus();
  }, [session?.user?.id, itemId, itemType]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [checkInterval]);

  const generatePaymentQR = async () => {
    if (!session?.user?.id) {
      toast.error('Please log in to make a purchase');
      router.push('/login');
      return;
    }

    setPaymentStatus({ status: 'loading' });

    try {
      const response = await fetch('/api/public/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: price,
          description: `${itemType === 'test' ? 'Test' : 'Course'} Purchase: ${itemTitle}`,
          receiverCode: process.env.NEXT_PUBLIC_QPAY_RECEIVER_CODE || 'PPNIM',
          invoiceCode: `${itemType}_${itemId}_${session.user.id}`,
          metadata: {
            itemId,
            itemType,
            userId: session.user.id,
            itemTitle
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment invoice');
      }

      setPaymentStatus({
        status: 'qr_generated',
        qrData: data,
        paymentId: data.invoice_id
      });

      toast.success('Payment QR Code generated successfully!');

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate payment QR code';
      setPaymentStatus({ status: 'failed', error: errorMessage });
      toast.error(errorMessage);
      onError?.(errorMessage);
    }
  };

  const resetPayment = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      setCheckInterval(null);
    }
    setPaymentStatus({ status: 'idle' });
    setCheckCount(0);
    setLastError('');
    setIsMonitoring(false);
    setLastCheckTime('');
    setCheckingPayment(false);
  };

  if (checkingPurchase) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Checking purchase status...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasPurchased) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2 text-green-800 dark:text-green-200">Already Purchased!</h3>
            <p className="text-green-600 dark:text-green-300 mb-4">
              You already have access to this {itemType}.
            </p>
            <Button 
              onClick={() => {
                if (itemType === 'test') {
                  router.push(`/ptests/${itemId}`);
                } else {
                  router.push(`/Course/${itemId}`);
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Access {itemType === 'test' ? 'Test' : 'Course'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Purchase {itemType === 'test' ? 'Test' : 'Course'}
          </CardTitle>
          <CardDescription>
            Complete payment to access {itemType === 'test' ? 'this test' : 'this course'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Item Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {thumbnailUrl && (
                <img 
                  src={thumbnailUrl} 
                  alt={itemTitle}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{itemTitle}</h4>
                {itemDescription && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{itemDescription}</p>
                )}
              </div>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                ₮{price.toLocaleString()}
              </Badge>
            </div>
          </div>

          {/* Payment Form */}
          {paymentStatus.status === 'idle' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Secure Payment</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your payment is processed securely through QPay. You'll receive immediate access after payment.
                </p>
              </div>

              <Button 
                onClick={generatePaymentQR} 
                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                size="lg"
              >
                <QrCode className="h-5 w-5 inline-block mr-2" />
                <span className="font-semibold">Pay ₮{price.toLocaleString()} with QPay</span>
              </Button>
            </div>
          )}

          {/* Loading State */}
          {paymentStatus.status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Generating Payment QR Code...</p>
            </div>
          )}

          {/* Payment Success */}
          {paymentStatus.status === 'paid' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Payment Successful!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your payment of ₮{price.toLocaleString()} has been processed.
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                Redirecting you to {itemType === 'test' ? 'the test' : 'the course'}...
              </p>
            </div>
          )}

          {/* Payment Failed */}
          {paymentStatus.status === 'failed' && (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Payment Failed</h3>
              {paymentStatus.error && (
                <p className="text-gray-600 dark:text-gray-300 mb-4">{paymentStatus.error}</p>
              )}
              <Button onClick={resetPayment} className="inline-flex items-center justify-center w-full">
                <span className="font-semibold">Try Again</span>
              </Button>
            </div>
          )}

          {/* Error Alert */}
          {paymentStatus.error && paymentStatus.status !== 'failed' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{paymentStatus.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 