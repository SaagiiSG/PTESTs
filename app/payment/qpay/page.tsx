'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  QrCode, 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ArrowLeft,
  Copy,
  ExternalLink,
  Shield,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface PaymentStatus {
  status: 'loading' | 'qr_generated' | 'checking' | 'paid' | 'failed';
  qrData?: any;
  error?: string;
}

function QPayPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const invoiceId = searchParams.get('invoiceId');
  const itemId = searchParams.get('itemId');
  const itemType = searchParams.get('itemType');
  const returnTo = searchParams.get('returnTo') || '/home';
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'loading' });
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');
  const [checkCount, setCheckCount] = useState(0);
  const [lastError, setLastError] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [checkInterval]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && isMonitoring) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isMonitoring) {
      stopPaymentMonitoring();
      toast.info('Payment session expired. Please try again.');
    }
  }, [timeLeft, isMonitoring]);

  // Generate QR code on component mount
  useEffect(() => {
    if (invoiceId) {
      generateQRCode();
    }
  }, [invoiceId]);

  const generateQRCode = async () => {
    if (!invoiceId) return;

    setPaymentStatus({ status: 'loading' });

    try {
      // Get the existing invoice details first to get the amount
      const invoiceResponse = await fetch(`/api/qpay/invoice/${invoiceId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const invoiceData = await invoiceResponse.json();

      if (!invoiceResponse.ok) {
        throw new Error(invoiceData.error || 'Failed to get invoice details');
      }

      // Now create a new invoice with the same details to get the QR code
      const response = await fetch('/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: invoiceData.invoice.total_amount || invoiceData.invoice.gross_amount,
          description: invoiceData.invoice.invoice_description || 'Payment for course/test',
          receiverCode: 'JAVZAN_B',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get QR code data');
      }

      setPaymentStatus({
        status: 'qr_generated',
        qrData: data
      });

      toast.success('QR Code loaded successfully!');
      
      // Start checking payment status
      startPaymentCheck(invoiceId);

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get QR code data';
      setPaymentStatus({ status: 'failed', error: errorMessage });
      toast.error(errorMessage);
    }
  };

  const startPaymentCheck = (invoiceId: string) => {
    console.log('Starting payment monitoring for invoice:', invoiceId);
    setIsMonitoring(true);
    setCheckCount(0);
    setLastError('');
    setTimeLeft(600); // Reset timer
    
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
              setPaymentStatus({ status: 'failed', error: 'Payment was declined or failed' });
              stopPaymentMonitoring();
              toast.error('Payment failed. Please try again.');
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
  };

  const stopPaymentMonitoring = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      setCheckInterval(null);
    }
    setIsMonitoring(false);
    setTimeLeft(0);
  };

  const handlePaymentSuccess = async (payment: any, invoiceId: string) => {
    try {
      // Record the purchase and get unique code for tests
      const purchaseResponse = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          itemType,
          amount: payment.amount,
          paymentId: invoiceId,
          paymentData: payment
        }),
      });

      if (purchaseResponse.ok) {
        const purchaseData = await purchaseResponse.json();
        setPaymentStatus({ status: 'paid' });
        stopPaymentMonitoring();
        
        toast.success(`Payment successful! You now have access to ${itemType === 'test' ? 'the test' : 'the course'}`);
        
        // Show success message with unique code if it's a test
        if (itemType === 'test' && purchaseData.uniqueCode) {
          toast.success(`Your unique access code: ${purchaseData.uniqueCode}`);
        }
        
        // Redirect back to the item page after a short delay
        setTimeout(() => {
          router.push(returnTo);
        }, 3000);
      } else {
        throw new Error('Failed to record purchase');
      }
    } catch (error) {
      console.error('Error recording purchase:', error);
      toast.error('Payment successful but failed to record purchase. Please contact support.');
    }
  };

  const manuallyCheckPayment = async () => {
    if (!paymentStatus.qrData?.invoice_id) {
      toast.error('No payment ID available for checking');
      return;
    }
    
    setCheckingPayment(true);
    try {
      console.log('Manual payment check for:', paymentStatus.qrData.invoice_id);
      
      const response = await fetch('/api/qpay/payment/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentStatus.qrData.invoice_id }),
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
            await handlePaymentSuccess(payment, paymentStatus.qrData.invoice_id);
          } else if (status === 'FAILED') {
            setPaymentStatus({ status: 'failed', error: 'Payment was declined or failed' });
            stopPaymentMonitoring();
            toast.error('Payment failed. Please try again.');
          } else {
            toast.info(`Payment status: ${status}. Continuing to monitor...`);
          }
        } else {
          toast.info('No payment completed yet. Please complete the payment in your QPay app and try again.');
          setLastError('');
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const openDeeplink = (url: string) => {
    window.open(url, '_blank');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please log in to make a payment.
            </p>
            <Button onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Secure Payment</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Complete your payment securely using QPay
            </p>
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm">
              <Shield className="w-4 h-4" />
              <span>SSL Encrypted • Secure Payment Gateway</span>
            </div>
          </div>

          {/* Payment Card */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-6 h-6 text-blue-600" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Scan the QR code below to complete your payment
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Loading State */}
              {paymentStatus.status === 'loading' && (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Generating QR Code...</p>
                </div>
              )}

              {/* QR Code Display */}
              {paymentStatus.status === 'qr_generated' && paymentStatus.qrData && (
                <div className="space-y-6">
                  {/* Payment Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="font-medium">How to Pay</span>
                    </div>
                    <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>1. Open your QPay mobile app</li>
                      <li>2. Tap the QR scanner or use the payment link below</li>
                      <li>3. Complete the payment in your app</li>
                      <li>4. Wait for confirmation (this page will update automatically)</li>
                    </ol>
                  </div>

                  <div className="text-center">
                    <h3 className="font-semibold mb-4">Scan QR Code to Pay</h3>
                    <div className="bg-white p-6 rounded-lg border inline-block shadow-lg">
                      {paymentStatus.qrData.qr_image ? (
                        <img 
                          src={`data:image/png;base64,${paymentStatus.qrData.qr_image}`} 
                          alt="QPay QR Code" 
                          className="w-64 h-64"
                        />
                      ) : (
                        <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                          <div className="text-center">
                            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">QR Code not available</p>
                            <p className="text-gray-400 text-xs">Use payment links below</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Amount */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ₮{(paymentStatus.qrData.total_amount || paymentStatus.qrData.gross_amount || paymentStatus.qrData.amount)?.toLocaleString() || 'N/A'}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Payment Amount</p>
                  </div>

                  {/* QR Text */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">QR Text</label>
                    <div className="flex gap-2">
                      <input 
                        value={paymentStatus.qrData.qr_text || 'QR text not available'} 
                        readOnly 
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(paymentStatus.qrData.qr_text || '')}
                        disabled={!paymentStatus.qrData.qr_text}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => openDeeplink(paymentStatus.qrData.qPay_shortUrl || paymentStatus.qrData.deeplink)}
                      className="flex-1"
                      variant="outline"
                      disabled={!paymentStatus.qrData.qPay_shortUrl && !paymentStatus.qrData.deeplink}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Open in App
                    </Button>
                    <Button 
                      onClick={() => openDeeplink(paymentStatus.qrData.qPay_shortUrl || paymentStatus.qrData.web_url)}
                      className="flex-1"
                      variant="outline"
                      disabled={!paymentStatus.qrData.qPay_shortUrl && !paymentStatus.qrData.web_url}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Web Payment
                    </Button>
                  </div>

                  {/* Payment Status Monitor */}
                  <div className={`border rounded-lg p-4 ${
                    lastError 
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                      : isMonitoring 
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          lastError ? 'bg-red-500' : isMonitoring ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        <span className={lastError ? 'text-red-700 dark:text-red-300' : isMonitoring ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}>
                          {lastError ? 'Payment check error' : isMonitoring ? 'Payment monitoring active' : 'Monitoring stopped'}
                        </span>
                      </div>
                      {isMonitoring && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">
                            Check #{checkCount}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Timer className="w-3 h-3" />
                            {formatTime(timeLeft)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs mb-2">
                      {lastError ? (
                        <span className="text-red-600 dark:text-red-400">Error: {lastError}</span>
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400">
                          <Timer className="w-3 h-3 inline mr-1" />
                          Payment session active • Waiting for completion
                        </span>
                      )}
                    </p>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      Auto-checking every 10 seconds • Last check: {lastCheckTime || 'Not started yet'}
                    </p>
                    
                    {isMonitoring && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={stopPaymentMonitoring}
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
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Checking...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Check Now
                            </>
                          )}
                        </Button>
                      </div>
                    )}


                  </div>

                  {/* Development Only: Manual Payment Verification */}
                  {process.env.NODE_ENV === 'development' && invoiceId && (
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
                                invoice_id: invoiceId,
                                payment_status: 'PAID',
                                payment_amount: paymentStatus.qrData?.total_amount || 1000
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
                </div>
              )}

              {/* Payment Success */}
              {paymentStatus.status === 'paid' && (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Your payment has been processed successfully. You now have access to your purchase.
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-200 mb-2">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Secure Transaction</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your payment was processed securely through QPay. A receipt has been sent to your email.
                    </p>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                    Redirecting you back in a few seconds...
                  </p>
                </div>
              )}

              {/* Payment Failed */}
              {paymentStatus.status === 'failed' && (
                <div className="text-center py-8">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Payment Failed</h3>
                  {paymentStatus.error && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{paymentStatus.error}</p>
                  )}
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">What to do next</span>
                    </div>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 text-left">
                      <li>• Check your payment method has sufficient funds</li>
                      <li>• Ensure you completed the payment in your QPay app</li>
                      <li>• Try the payment again or contact support if issues persist</li>
                    </ul>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => router.back()}>
                      Go Back
                    </Button>
                    <Button onClick={generateQRCode} variant="outline">
                      Try Again
                    </Button>
                  </div>
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
      </div>
    </div>
  );
}

export default function QPayPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading payment page...</p>
        </div>
      </div>
    }>
      <QPayPaymentContent />
    </Suspense>
  );
}