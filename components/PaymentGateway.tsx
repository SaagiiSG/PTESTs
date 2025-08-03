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
      const response = await fetch('/api/create-invoice', {
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
      
      // Start checking payment status
      startPaymentCheck(data.invoice_id);

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate payment QR code';
      setPaymentStatus({ status: 'failed', error: errorMessage });
      toast.error(errorMessage);
      onError?.(errorMessage);
    }
  };

  const startPaymentCheck = (invoiceId: string) => {
    console.log('Starting payment monitoring for invoice:', invoiceId);
    setIsMonitoring(true);
    setCheckCount(0);
    setLastError('');
    
    // Check payment status every 10 seconds
    const interval = setInterval(async () => {
      try {
        setCheckCount(prev => prev + 1);
        const currentCheck = checkCount + 1;
        
        console.log(`Payment check #${currentCheck} for invoice:`, invoiceId);
        
        const response = await fetch('/api/qpay/payment/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_id: invoiceId }),
        });

        const data = await response.json();
        const checkTime = new Date().toLocaleTimeString();
        setLastCheckTime(checkTime);
        
        console.log(`Check #${currentCheck} response:`, data);

        if (response.ok && data.success) {
          if (data.payment && data.payment.count > 0 && data.payment.rows.length > 0) {
            const payment = data.payment.rows[0];
            const status = payment.payment_status;
            
            console.log(`Payment found with status: ${status}`);
            setLastError('');
            
            if (status === 'PAID') {
              console.log('Payment completed successfully!');
              await handlePaymentSuccess(payment, invoiceId);
            } else if (status === 'FAILED') {
              console.log('Payment failed');
              setPaymentStatus({ status: 'failed', paymentId: invoiceId, error: 'Payment was declined or failed' });
              clearInterval(interval);
              setCheckInterval(null);
              setIsMonitoring(false);
              toast.error('Payment failed. Please try again.');
              onError?.('Payment failed');
            } else {
              console.log(`Payment status: ${status} - continuing to monitor...`);
            }
          } else {
            console.log(`Check #${currentCheck}: No payment completed yet, continuing to monitor...`);
            setLastError('');
          }
        } else if (response.status === 404) {
          console.log(`Check #${currentCheck}: Payment not found yet, continuing to check...`);
          setLastError('');
        } else {
          const errorMsg = data.error || data.message || 'Unknown API error';
          console.error(`Check #${currentCheck} failed:`, errorMsg);
          setLastError(errorMsg);
          
          if (currentCheck % 3 === 0) {
            toast.error(`Payment check error: ${errorMsg}`);
          }
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Network error';
        console.error(`Check #${checkCount + 1} network error:`, errorMsg);
        setLastError(errorMsg);
        
        if ((checkCount + 1) % 3 === 0) {
          toast.error(`Network error: ${errorMsg}`);
        }
      }
    }, 10000);

    setCheckInterval(interval);
    
    // Stop checking after 10 minutes
    setTimeout(() => {
      if (checkInterval) {
        console.log('Payment monitoring timeout - stopping automatic checks after 10 minutes');
        clearInterval(interval);
        setCheckInterval(null);
        setIsMonitoring(false);
        toast.info('Automatic payment monitoring stopped. You can still check manually.');
      }
    }, 600000);
  };

  const handlePaymentSuccess = async (payment: any, invoiceId: string) => {
    try {
      // Record the purchase
      const purchaseResponse = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          itemType,
          amount: payment.amount || price,
          paymentId: invoiceId,
          paymentData: payment
        }),
      });

      if (purchaseResponse.ok) {
        setPaymentStatus({ status: 'paid', paymentId: invoiceId });
        setHasPurchased(true);
        
        if (checkInterval) {
          clearInterval(checkInterval);
          setCheckInterval(null);
          setIsMonitoring(false);
        }
        
        toast.success(`Payment successful! You now have access to ${itemTitle}`);
        onSuccess?.(payment);
        
        // Redirect to the item after a short delay
        setTimeout(() => {
          if (itemType === 'test') {
            router.push(`/ptests/${itemId}`);
          } else {
            router.push(`/Course/${itemId}`);
          }
        }, 2000);
      } else if (purchaseResponse.status === 202) {
        // Payment is still processing
        const responseData = await purchaseResponse.json();
        console.log('Payment still processing:', responseData);
        toast.info('Payment is still being processed. Please wait a moment and try again.');
        // Continue monitoring
      } else {
        const errorData = await purchaseResponse.json();
        throw new Error(errorData.message || 'Failed to record purchase');
      }
    } catch (error) {
      console.error('Error recording purchase:', error);
      toast.error('Payment successful but failed to record purchase. Please contact support.');
    }
  };

  const manuallyCheckPayment = async () => {
    if (!paymentStatus.paymentId) {
      toast.error('No payment ID available for checking');
      return;
    }
    
    setCheckingPayment(true);
    try {
      console.log('Manual payment check for:', paymentStatus.paymentId);
      
      const response = await fetch('/api/qpay/payment/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentStatus.paymentId }),
      });

      const data = await response.json();
      const checkTime = new Date().toLocaleTimeString();
      setLastCheckTime(checkTime);
      
      console.log('Manual payment check response:', data);

      if (response.ok && data.success) {
        if (data.payment && data.payment.count > 0 && data.payment.rows.length > 0) {
          const payment = data.payment.rows[0];
          const status = payment.payment_status;
          
          console.log('Manual check - Payment found with status:', status);
          setLastError('');
          
          if (status === 'PAID') {
            await handlePaymentSuccess(payment, paymentStatus.paymentId);
          } else if (status === 'FAILED') {
            setPaymentStatus({ status: 'failed', paymentId: paymentStatus.paymentId, error: 'Payment was declined or failed' });
            if (checkInterval) {
              clearInterval(checkInterval);
              setCheckInterval(null);
              setIsMonitoring(false);
            }
            toast.error('Payment failed. Please try again.');
            onError?.('Payment failed');
          } else {
            toast.info(`Payment status: ${status}. Continuing to monitor...`);
          }
        } else {
          toast.info('Payment not found yet. This could be a timing issue. Please wait a moment and try again, or check if the payment was completed in your QPay app.');
          setLastError('Payment not found - timing issue');
        }
      } else {
        const errorMsg = data.error || data.message || 'Unable to check payment status';
        toast.error(errorMsg);
        setLastError(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to check payment status';
      console.error('Manual payment check error:', errorMsg);
      toast.error(errorMsg);
      setLastError(errorMsg);
    } finally {
      setCheckingPayment(false);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const openDeeplink = (url: string) => {
    window.open(url, '_blank');
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
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                size="lg"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Pay ₮{price.toLocaleString()} with QPay
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

          {/* QR Code Display */}
          {paymentStatus.status === 'qr_generated' && paymentStatus.qrData && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Scan QR Code to Pay</h3>
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img 
                    src={`data:image/png;base64,${paymentStatus.qrData.qr_image}`} 
                    alt="QPay QR Code" 
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Amount</Label>
                <div className="text-2xl font-bold text-green-600">
                  ₮{price.toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">QR Text</Label>
                <div className="flex gap-2">
                  <Input 
                    value={paymentStatus.qrData.qr_text} 
                    readOnly 
                    className="text-xs"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(paymentStatus.qrData.qr_text)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => openDeeplink(paymentStatus.qrData.deeplink)}
                  className="flex-1"
                  variant="outline"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Open in App
                </Button>
                <Button 
                  onClick={() => openDeeplink(paymentStatus.qrData.web_url)}
                  className="flex-1"
                  variant="outline"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Web Payment
                </Button>
              </div>

              {/* Payment Status Monitor */}
              <div className={`border rounded-lg p-3 ${
                lastError 
                  ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                  : isMonitoring 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                  : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      lastError ? 'bg-red-500' : isMonitoring ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <span className={lastError ? 'text-red-700 dark:text-red-300' : isMonitoring ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}>
                      {lastError ? 'Payment check error' : isMonitoring ? 'Payment monitoring active' : 'Monitoring stopped'}
                    </span>
                  </div>
                  {isMonitoring && (
                    <span className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">
                      Check #{checkCount}
                    </span>
                  )}
                </div>
                
                <p className="text-xs mt-1">
                  {lastError ? (
                    <span className="text-red-600 dark:text-red-400">Error: {lastError}</span>
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400">
                      QR code generated • Waiting for payment completion
                    </span>
                  )}
                </p>
                
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  Checking every 10 seconds • Last check: {lastCheckTime || 'Not started yet'}
                </p>
                
                {isMonitoring && (
                  <div className="flex gap-2 mt-2">
                    <Button 
                      onClick={() => {
                        if (checkInterval) {
                          clearInterval(checkInterval);
                          setCheckInterval(null);
                          setIsMonitoring(false);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      Stop Monitoring
                    </Button>
                    <Button 
                      onClick={manuallyCheckPayment}
                      disabled={checkingPayment}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      {checkingPayment ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Check Now
                        </>
                      )}
                    </Button>
                  </div>
                )}


                  </div>
                )}
                                  </div>
                  </div>

                  {/* Development Only: Manual Payment Verification */}
                  {process.env.NODE_ENV === 'development' && paymentStatus.paymentId && (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                        <span className="text-sm font-medium">🧪 Development Mode</span>
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                        QPay callbacks cannot reach localhost. Use this button to simulate payment completion.
                      </p>
                      <Button 
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/manual-payment-verify', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                invoice_id: paymentStatus.paymentId,
                                payment_status: 'PAID',
                                payment_amount: price
                              })
                            });
                            
                            if (response.ok) {
                              toast.success('Payment manually verified! Checking status...');
                              // Auto-check payment after verification
                              setTimeout(() => manuallyCheckPayment(), 1000);
                            } else {
                              const error = await response.json();
                              toast.error(error.message || 'Failed to verify payment');
                            }
                          } catch (error) {
                            toast.error('Error verifying payment');
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200 text-xs"
                      >
                        ✅ Simulate Payment Completion
                      </Button>
                    </div>
                  )}
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
              <Button onClick={resetPayment} className="w-full">
                Try Again
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