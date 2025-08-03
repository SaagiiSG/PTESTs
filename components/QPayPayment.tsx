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
      const response = await fetch('/api/public/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount) || 1000, // Fallback amount
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
    if (checkInterval) {
      clearInterval(checkInterval);
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/public/payment/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          if (data.payment && data.payment.count > 0) {
            // Payment found
            const payment = data.payment.rows[0];
            console.log('Payment found:', payment);
            
            clearInterval(interval);
            setCheckInterval(null);
            
            // Handle successful payment
            handlePaymentSuccess(payment, invoiceId);
          }
        }
      } catch (error) {
        console.error('Payment check error:', error);
      }
    }, 5000); // Check every 5 seconds

    setCheckInterval(interval);
  };

  const handlePaymentSuccess = (payment: any, invoiceId: string) => {
    setPaymentStatus({ status: 'paid', paymentId: invoiceId });
    clearInterval(checkInterval!);
    setCheckInterval(null);
    setIsMonitoring(false);
    toast.success(`Payment completed successfully! Amount: ₮${payment.amount || 'N/A'}`);
    onSuccess?.(payment);
  };

  const manuallyCheckPayment = async () => {
    if (!paymentStatus.qrData?.invoice_id) return;

    setCheckingPayment(true);
    setLastCheckTime(new Date().toLocaleTimeString());

    try {
      const response = await fetch('/api/public/payment/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: paymentStatus.qrData.invoice_id })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.payment && data.payment.count > 0) {
          // Payment found
          const payment = data.payment.rows[0];
          console.log('Payment found:', payment);
          
          // Handle successful payment
          handlePaymentSuccess(payment, paymentStatus.qrData.invoice_id);
        } else {
          setLastError('Payment not found yet. Please try again.');
          setCheckCount(prev => prev + 1);
        }
      } else {
        setLastError(data.error || 'Failed to check payment status');
        setCheckCount(prev => prev + 1);
      }
    } catch (error: any) {
      setLastError(error.message || 'Failed to check payment status');
      setCheckCount(prev => prev + 1);
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