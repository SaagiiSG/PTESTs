'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, QrCode, CreditCard, Smartphone, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface QPayPaymentProps {
  amount?: number;
  description?: string;
  receiverCode?: string;
  invoiceCode?: string;
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

export default function QPayPayment({
  amount: initialAmount = 0,
  description: initialDescription = '',
  receiverCode: initialReceiverCode = '',
  invoiceCode,
  onSuccess,
  onError,
  className = ''
}: QPayPaymentProps) {
  const [amount, setAmount] = useState(initialAmount.toString());
  const [description, setDescription] = useState(initialDescription);
  const [receiverCode, setReceiverCode] = useState(initialReceiverCode);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'idle' });
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  // Add new state variables for better tracking
  const [checkCount, setCheckCount] = useState(0);
  const [lastError, setLastError] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [checkInterval]);

  const generateQR = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!receiverCode.trim()) {
      toast.error('Receiver code is required');
      return;
    }

    setPaymentStatus({ status: 'loading' });

    try {
      const response = await fetch('/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          description: description || 'Payment via QPay',
          receiverCode: receiverCode.trim(),
          invoiceCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invoice');
      }

      setPaymentStatus({
        status: 'qr_generated',
        qrData: data,
        paymentId: data.invoice_id
      });

      toast.success('QR Code generated successfully!');
      
      // Start checking payment status
      startPaymentCheck(data.invoice_id);

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate QR code';
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
          // QPay returns {count: 0, rows: []} when no payment found
          // or {count: 1, rows: [{payment_status: 'PAID'}]} when payment found
          if (data.payment && data.payment.count > 0 && data.payment.rows.length > 0) {
            const payment = data.payment.rows[0];
            const status = payment.payment_status;
            
            console.log(`Payment found with status: ${status}`);
            setLastError(''); // Clear any previous errors
            
            if (status === 'PAID') {
              console.log('Payment completed successfully!');
              setPaymentStatus({ status: 'paid', paymentId: invoiceId });
              clearInterval(interval);
              setCheckInterval(null);
              setIsMonitoring(false);
              toast.success(`Payment completed successfully! Amount: ₮${payment.amount || 'N/A'}`);
              onSuccess?.(payment);
            } else if (status === 'FAILED') {
              console.log('Payment failed');
              setPaymentStatus({ status: 'failed', paymentId: invoiceId, error: 'Payment was declined or failed' });
              clearInterval(interval);
              setCheckInterval(null);
              setIsMonitoring(false);
              toast.error('Payment failed. Please try again.');
              onError?.('Payment failed');
            } else if (status === 'NEW') {
              console.log('Payment is new/processing, continuing to monitor...');
            } else {
              console.log(`Payment status: ${status} - continuing to monitor...`);
            }
          } else {
            // No payment found yet, continue checking silently
            console.log(`Check #${currentCheck}: No payment completed yet, continuing to monitor...`);
            setLastError(''); // Clear any previous errors
          }
        } else if (response.status === 404) {
          // Payment not found yet, continue checking
          console.log(`Check #${currentCheck}: Payment not found yet, continuing to check...`);
          setLastError(''); // Clear any previous errors
        } else {
          // API error
          const errorMsg = data.error || data.message || 'Unknown API error';
          console.error(`Check #${currentCheck} failed:`, errorMsg);
          setLastError(errorMsg);
          
          // Don't stop checking on API errors, but log them
          if (currentCheck % 3 === 0) { // Show error every 3rd failed check
            toast.error(`Payment check error: ${errorMsg}`);
          }
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Network error';
        console.error(`Check #${checkCount + 1} network error:`, errorMsg);
        setLastError(errorMsg);
        
        // Don't stop checking on network errors, but log them
        if ((checkCount + 1) % 3 === 0) { // Show error every 3rd failed check
          toast.error(`Network error: ${errorMsg}`);
        }
      }
    }, 10000); // Check every 10 seconds

    setCheckInterval(interval);
    
    // Stop checking after 10 minutes (60 checks) instead of 5 minutes
    setTimeout(() => {
      if (checkInterval) {
        console.log('Payment monitoring timeout - stopping automatic checks after 10 minutes');
        clearInterval(interval);
        setCheckInterval(null);
        setIsMonitoring(false);
        toast.info('Automatic payment monitoring stopped. You can still check manually.');
        // Don't change status, let user manually check if needed
      }
    }, 600000); // 10 minutes
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
        // QPay returns {count: 0, rows: []} when no payment found
        // or {count: 1, rows: [{payment_status: 'PAID'}]} when payment found
        if (data.payment && data.payment.count > 0 && data.payment.rows.length > 0) {
          const payment = data.payment.rows[0];
          const status = payment.payment_status;
          
          console.log('Manual check - Payment found with status:', status);
          setLastError(''); // Clear any previous errors
          
          if (status === 'PAID') {
            setPaymentStatus({ status: 'paid', paymentId: paymentStatus.paymentId });
            if (checkInterval) {
              clearInterval(checkInterval);
              setCheckInterval(null);
              setIsMonitoring(false);
            }
            toast.success(`Payment completed successfully! Amount: ₮${payment.amount || 'N/A'}`);
            onSuccess?.(payment);
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
          toast.info('No payment completed yet. Please complete the payment in your QPay app and try again.');
          setLastError(''); // Clear any previous errors
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

  const stopPaymentMonitoring = () => {
    if (checkInterval) {
      console.log('Stopping payment monitoring');
      clearInterval(checkInterval);
      setCheckInterval(null);
      setIsMonitoring(false);
      toast.info('Payment monitoring stopped');
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

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QPay Payment
          </CardTitle>
          <CardDescription>
            Generate QR code to pay with QPay mobile app
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Payment Form */}
          {paymentStatus.status === 'idle' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₮)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Payment description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiverCode">Receiver Code</Label>
                <Input
                  id="receiverCode"
                  type="text"
                  value={receiverCode}
                  onChange={(e) => setReceiverCode(e.target.value)}
                  placeholder="Enter receiver code"
                  required
                />
              </div>

              <Button 
                onClick={generateQR} 
                className="w-full"
                disabled={!amount || !receiverCode.trim()}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </Button>
            </div>
          )}

          {/* Loading State */}
          {paymentStatus.status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Generating QR Code...</p>
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
                <Label>Payment Amount</Label>
                <div className="text-2xl font-bold text-green-600">
                  ₮{Number(amount).toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <Label>QR Text</Label>
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

              <div className="space-y-3">
                {/* Enhanced Status indicator */}
                <div className={`border rounded-lg p-3 ${
                  lastError 
                    ? 'bg-red-50 border-red-200' 
                    : isMonitoring 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        lastError ? 'bg-red-500' : isMonitoring ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <span className={lastError ? 'text-red-700' : isMonitoring ? 'text-blue-700' : 'text-gray-600'}>
                        {lastError ? 'Payment check error' : isMonitoring ? 'Payment monitoring active' : 'Monitoring stopped'}
                      </span>
                    </div>
                    {isMonitoring && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Check #{checkCount}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs mt-1">
                    {lastError ? (
                      <span className="text-red-600">Error: {lastError}</span>
                    ) : (
                      <span className="text-blue-600">
                        QR code generated • Waiting for payment completion
                      </span>
                    )}
                  </p>
                  
                  <p className="text-xs mt-1 text-gray-500">
                    Checking every 10 seconds • Last check: {lastCheckTime || 'Not started yet'}
                  </p>
                  
                  {isMonitoring && (
                    <div className="flex gap-2 mt-2">
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
                
                <div className="text-center">
                  <Button 
                    onClick={resetPayment} 
                    variant="outline" 
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New QR
                  </Button>
                </div>
              </div>

              <Button 
                onClick={resetPayment} 
                variant="outline" 
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New QR
              </Button>
            </div>
          )}

          {/* Payment Success */}
          {paymentStatus.status === 'paid' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your payment of ₮{Number(amount).toLocaleString()} has been processed.
              </p>
              <Button onClick={resetPayment} className="w-full">
                Make Another Payment
              </Button>
            </div>
          )}

          {/* Payment Failed */}
          {paymentStatus.status === 'failed' && (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Payment Failed</h3>
              {paymentStatus.error && (
                <p className="text-gray-600 mb-4">{paymentStatus.error}</p>
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