'use client';

// Payment page with QPay integration and monitoring
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
  Timer,
  BookOpen,
  Clock,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useIsMobile } from '@/lib/device-detection';
import MobilePaymentMethods from '@/components/MobilePaymentMethods';

interface PaymentStatus {
  status: 'loading' | 'qr_generated' | 'checking' | 'paid' | 'failed';
  qrData?: any;
  error?: string;
}

interface TestInfo {
  title: string;
  description?: string;
  price: number;
  thumbnailUrl?: string;
  testType?: string;
  questionCount?: number;
  duration?: number;
  takenCount?: number;
}

function QPayPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isMobile = useIsMobile();
  
  console.log('🚀 QPayPaymentContent component mounted');
  
  const invoiceId = searchParams.get('invoiceId');
  const itemId = searchParams.get('itemId');
  const itemType = searchParams.get('itemType');
  const returnTo = searchParams.get('returnTo') || '/home';
  const qrDataParam = searchParams.get('qrData');
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'loading' });
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');
  const [checkCount, setCheckCount] = useState(0);
  const [lastError, setLastError] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (checkInterval) {
        console.log('Cleaning up payment monitoring interval');
        clearInterval(checkInterval);
        setCheckInterval(null);
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

  // Fetch test information
  useEffect(() => {
    if (itemId && itemType === 'test') {
      fetchTestInfo();
    }
  }, [itemId, itemType]);

  // Generate QR code on component mount
  useEffect(() => {
    console.log('🔧 useEffect triggered - invoiceId:', invoiceId);
    if (invoiceId) {
      console.log('Invoice ID available, checking for existing QR data...');
      
      // Check sessionStorage for existing QR data
      if (typeof window !== 'undefined') {
        console.log('🔍 Checking sessionStorage for existing QR data...');
        const storedQRData = sessionStorage.getItem(`qrData_${invoiceId}`);
        
        if (storedQRData) {
          try {
            const qrData = JSON.parse(storedQRData);
            console.log('✅ QR data found in sessionStorage:', qrData);
            console.log('Setting payment status to qr_generated...');
            
            setPaymentStatus({
              status: 'qr_generated',
              qrData: qrData
            });
            
            console.log('Payment status set, starting payment check...');
            startPaymentCheck(invoiceId);
            
            console.log('Cleaning up sessionStorage...');
            sessionStorage.removeItem(`qrData_${invoiceId}`);
            return;
          } catch (error) {
            console.error('❌ Failed to parse QR data from sessionStorage:', error);
          }
        } else {
          console.log('❌ No QR data found in sessionStorage for key:', `qrData_${invoiceId}`);
        }
      }
    } else {
      // If no invoiceId, show error
      setPaymentStatus({ status: 'failed', error: 'No invoice ID provided' });
    }
  }, [invoiceId]);

  // Start payment monitoring automatically when QR is generated (all devices)
  useEffect(() => {
    if (paymentStatus.status === 'qr_generated' && invoiceId && !isMonitoring) {
      console.log('Starting automatic payment monitoring');
      startPaymentCheck(invoiceId);
    }
  }, [paymentStatus.status, invoiceId, isMonitoring]);

  // Start payment monitoring for mobile users when QR data is ready
  useEffect(() => {
    if (isMobile && paymentStatus.status === 'qr_generated' && paymentStatus.qrData && !isMonitoring) {
      console.log('Starting payment monitoring for mobile user');
      startPaymentCheck(invoiceId!);
    }
  }, [isMobile, paymentStatus.status, paymentStatus.qrData, isMonitoring, invoiceId]);

  // Debug: Log current payment status
  useEffect(() => {
    console.log('🔄 Payment status changed:', paymentStatus);
    console.log('Status:', paymentStatus.status);
    console.log('QR Data:', paymentStatus.qrData);
    console.log('Stack trace:', new Error().stack);
  }, [paymentStatus]);

  const fetchTestInfo = async () => {
    try {
      const response = await fetch(`/api/tests/${itemId}`);
      if (response.ok) {
        const testData = await response.json();
        setTestInfo({
          title: testData.title || 'Test',
          description: testData.description?.en || testData.description?.mn || '',
          price: testData.price || 0,
          thumbnailUrl: testData.thumbnailUrl,
          testType: testData.testType,
          questionCount: testData.questionCount,
          duration: testData.duration,
          takenCount: testData.takenCount
        });
      }
    } catch (error) {
      console.error('Failed to fetch test info:', error);
    }
  };

  const generateQRCode = async () => {
    console.log('🚀 generateQRCode() called with invoiceId:', invoiceId);
    
    if (!invoiceId) {
      console.log('❌ No invoiceId, returning early');
      return;
    }

    console.log('📝 Setting payment status to loading...');
    setPaymentStatus({ status: 'loading' });

    try {
      console.log('🔍 Starting QR code generation logic...');
      
      // Check if this is a test invoice
      if (invoiceId.startsWith('TEST_INV_')) {
        console.log('Test invoice detected, using mock QR data');
        
        // For test invoices, create mock QR data directly
        const mockQrData = {
          invoice_id: invoiceId,
          qr_image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRFU1QgUVJDb2RlPC90ZXh0Pjwvc3ZnPg==',
          qr_text: `https://test.qpay.mn/pay/${invoiceId}`,
          deeplink: `https://test.qpay.mn/pay/${invoiceId}`,
          web_url: `https://test.qpay.mn/pay/${invoiceId}`,
          deeplink_url: `https://test.qpay.mn/pay/${invoiceId}`,
          amount: 1000,
          testMode: true
        };

        setPaymentStatus({
          status: 'qr_generated',
          qrData: mockQrData
        });

        toast.success('Test QR Code loaded successfully!');
        startPaymentCheck(invoiceId);
        return;
      }

            // For course payments, use QR data from URL parameters
      // For test payments, try to get existing invoice details with regular credentials
      if (itemType === 'course') {
        console.log('Course payment detected, checking URL parameters for QR data');
        
        // Try to get QR data from URL parameters first
        if (qrDataParam) {
          try {
            const qrData = JSON.parse(decodeURIComponent(qrDataParam));
            console.log('QR data from URL parameters:', qrData);
            
            setPaymentStatus({
              status: 'qr_generated',
              qrData: qrData
            });

            toast.success('Course QR Code loaded successfully!');
            startPaymentCheck(invoiceId);
            return;
          } catch (error) {
            console.error('Failed to parse QR data from URL parameters:', error);
            // Continue to fallback
          }
        }
        
        // Fallback: try to get QR data from sessionStorage
        if (typeof window !== 'undefined') {
          const storedQRData = sessionStorage.getItem(`qrData_${invoiceId}`);
          if (storedQRData) {
            try {
              const qrData = JSON.parse(storedQRData);
              console.log('QR data from sessionStorage:', qrData);
              
              setPaymentStatus({
                status: 'qr_generated',
                qrData: qrData
              });

              toast.success('Course QR Code loaded successfully!');
              startPaymentCheck(invoiceId);
              
              // Clean up sessionStorage after using the data
              sessionStorage.removeItem(`qrData_${invoiceId}`);
              return;
            } catch (error) {
              console.error('Failed to parse QR data from sessionStorage:', error);
              // Continue to fallback
            }
          }
        }
        
        // Final fallback: create a new course invoice
        console.log('No QR data found, creating new course invoice');
        
        // Get the actual course price from the URL parameters or use a reasonable default
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('itemId');
        const itemType = urlParams.get('itemType');
        
        // Try to get the course price from the course API
        let coursePrice = 12; // Default fallback price
        if (itemId && itemType === 'course') {
          try {
            const courseResponse = await fetch(`/api/courses/${itemId}`);
            if (courseResponse.ok) {
              const courseData = await courseResponse.json();
              coursePrice = courseData.price || 12;
              console.log('Retrieved course price from API:', coursePrice);
            }
          } catch (error) {
            console.error('Failed to get course price:', error);
          }
        }
        
        const newCourseInvoiceResponse = await fetch('/api/public/create-course-invoice-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: coursePrice, // Use actual course price instead of hardcoded 1000
            description: 'Course Payment',
            receiverCode: 'JAVZAN_B'
          }),
        });

        const newCourseInvoiceData = await newCourseInvoiceResponse.json();

        if (!newCourseInvoiceResponse.ok) {
          throw new Error(newCourseInvoiceData.error || 'Failed to create new course invoice');
        }

        // Use the new course invoice data with QR information
        if (newCourseInvoiceData.qr_image) {
          setPaymentStatus({
            status: 'qr_generated',
            qrData: newCourseInvoiceData
          });

          toast.success('Course QR Code loaded successfully!');
          startPaymentCheck(newCourseInvoiceData.invoice_id);
          return;
        } else {
          throw new Error('Failed to generate QR code for course payment');
        }
      }

      // For test payments, try to get QR data from sessionStorage first
      if (typeof window !== 'undefined') {
        console.log('🔍 Checking sessionStorage for test payment...');
        console.log('Looking for key:', `qrData_${invoiceId}`);
        console.log('Current itemType:', itemType);
        
        const storedQRData = sessionStorage.getItem(`qrData_${invoiceId}`);
        if (storedQRData) {
          try {
            const qrData = JSON.parse(storedQRData);
            console.log('✅ QR data found in sessionStorage:', qrData);
            console.log('Setting payment status to qr_generated...');
            
            setPaymentStatus({
              status: 'qr_generated',
              qrData: qrData
            });
            
            console.log('🎯 setPaymentStatus called with qr_generated status');
            console.log('QR Data being set:', qrData);
            console.log('Stack trace:', new Error().stack);
            console.log('Payment status set, showing success toast...');
            toast.success('Test QR Code loaded successfully!');
            
            console.log('Starting payment check...');
            startPaymentCheck(invoiceId);
            
            console.log('Cleaning up sessionStorage...');
            sessionStorage.removeItem(`qrData_${invoiceId}`);
            console.log('✅ Returning early, should not reach fallback');
            return;
          } catch (error) {
            console.error('❌ Failed to parse QR data from sessionStorage:', error);
            // Continue to fallback
          }
        } else {
          console.log('❌ No QR data found in sessionStorage for key:', `qrData_${invoiceId}`);
        }
      } else {
        console.log('❌ Window not available, skipping sessionStorage check');
      }
      
      // Fallback: create a new test invoice
      console.log('No QR data found in sessionStorage, creating new test invoice');
      toast.info('Creating new payment invoice...');
      
      const response = await fetch('/api/public/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 12, // More reasonable default amount for tests
          description: 'Test Payment',
          receiverCode: 'PSYCHOMETRICS',
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

      toast.success('Test QR Code loaded successfully!');
      startPaymentCheck(data.invoice_id || invoiceId);

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get QR code data';
      setPaymentStatus({ status: 'failed', error: errorMessage });
      toast.error(errorMessage);
    }
  };

  const startPaymentCheck = (invoiceId: string) => {
    if (checkInterval) {
      clearInterval(checkInterval);
    }

    // Start monitoring
    setIsMonitoring(true);
    setTimeLeft(600); // Reset timer to 10 minutes
    console.log('🔄 Payment monitoring started for invoice:', invoiceId);
    
    // Add a flag to track if component is still mounted
    let isMounted = true;

    const pollOnce = async () => {
      if (!isMounted) return;
      try {
        const apiEndpoint = itemType === 'course' 
          ? '/api/public/payment/course-check-v2'
          : '/api/public/payment/check';
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          if (data.payment && data.payment.count > 0) {
            const payment = data.payment.rows[0];
            console.log('Payment found:', payment);
            clearInterval(intervalRef);
            setCheckInterval(null);
            handlePaymentSuccess(payment, invoiceId);
          }
        }
      } catch (error) {
        console.error('Payment check error:', error);
      }
    };

    // Immediate first check
    pollOnce();

    // Scheduled checks
    const intervalRef = setInterval(async () => {
      // Check if component is still mounted before making the request
      if (!isMounted) {
        clearInterval(intervalRef);
        return;
      }
      
      console.log('🔍 Checking payment status for invoice:', invoiceId);
      try {
        // Use course-specific API for course payments, regular API for test payments
        const apiEndpoint = itemType === 'course' 
          ? '/api/public/payment/course-check-v2'  // Use V2 with course credentials
          : '/api/public/payment/check';           // Use regular API for tests
        
        const response = await fetch(apiEndpoint, {
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
            
            clearInterval(intervalRef);
            setCheckInterval(null);
            
            // Handle successful payment
            handlePaymentSuccess(payment, invoiceId);
          }
        }
      } catch (error) {
        console.error('Payment check error:', error);
        // Don't stop monitoring on network errors, just log them
      }
    }, 8000); // Check every ~8 seconds

    setCheckInterval(intervalRef);
    
    // Return cleanup function
    return () => {
      isMounted = false;
    };
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
        
        // Handle already purchased case
        if (purchaseData.alreadyPurchased) {
          toast.success(`You already have access to ${itemType === 'test' ? 'the test' : 'the course'}!`);
        } else {
          toast.success(`Payment successful! You now have access to ${itemType === 'test' ? 'the test' : 'the course'}`);
          
          // Show success message with unique code if it's a test
          if (itemType === 'test' && purchaseData.uniqueCode) {
            toast.success(`Your unique access code: ${purchaseData.uniqueCode}`);
          }
        }
        
        // Redirect based on item type
        setTimeout(() => {
          if (itemType === 'test') {
            // For tests, redirect to the test-embed page
            console.log('Payment successful, redirecting to test:', `/test-embed/${itemId}`);
            router.push(`/test-embed/${itemId}`);
          } else {
            // For courses, redirect back to the original page
            router.push(returnTo);
          }
        }, 3000);
      } else {
        let serverError: any = null;
        try {
          serverError = await purchaseResponse.json();
        } catch {}
        const serverMessage = serverError?.error || serverError?.message;
        const statusText = purchaseResponse.statusText || '';
        const composed = serverMessage ? `Failed to record purchase: ${serverMessage}` : `Failed to record purchase${statusText ? ` (${statusText})` : ''}`;
        throw new Error(composed);
      }
    } catch (error) {
      console.error('Error recording purchase:', error);
      const msg = (error as Error)?.message || 'Payment successful but failed to record purchase.';
      toast.error(msg);
    }
  };

  const manuallyCheckPayment = async () => {
    if (!invoiceId) return;

    setCheckingPayment(true);
    setLastCheckTime(new Date().toLocaleTimeString());

    try {
      // Use course-specific API for course payments, regular API for test payments
      const apiEndpoint = itemType === 'course' 
        ? '/api/public/payment/course-check-v2'  // Use V2 with course credentials
        : '/api/public/payment/check';           // Use regular API for tests
      
      console.log('Using payment check API:', apiEndpoint, 'for itemType:', itemType);
      
      const response = await fetch(apiEndpoint, {
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
          
          // Handle successful payment
          handlePaymentSuccess(payment, invoiceId);
        } else {
          setLastError('Payment processing. Please wait for the callback to complete or try again in a moment.');
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

  const simulatePaymentCallback = async () => {
    if (!invoiceId) {
      toast.error('No invoice ID to simulate payment for.');
      return;
    }

    try {
      const response = await fetch('/api/public/payment/simulate-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Simulated payment callback successful!');
        console.log('Simulated payment callback successful for invoice:', invoiceId);
        // Optionally, you might want to manually check payment status after a delay
        // to simulate the real-world scenario where the app might check multiple times.
        // For now, we'll just show a success toast.
      } else {
        toast.error(data.error || 'Failed to simulate payment callback.');
        console.error('Simulated payment callback failed:', data.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to simulate payment callback.');
      console.error('Simulated payment callback error:', error);
    }
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
        <div className="max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Test Payment</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Complete your payment to access the test
            </p>
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm">
              <Shield className="w-4 h-4" />
              <span>SSL Encrypted • Secure Payment Gateway</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            

            {/* QR Code Payment */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-blue-600" />
                  Payment QR Code
                </CardTitle>
                <CardDescription>
                  Scan the QR code with your QPay app to complete payment
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Debug Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Debug:</strong> Status: {paymentStatus.status}, 
                    QR Data: {paymentStatus.qrData ? 'Present' : 'Missing'}, 
                    Amount: {paymentStatus.qrData?.amount}
                  </p>
                </div>
                
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
                    {/* Debug Info */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <strong>QR Display Active:</strong> Status: {paymentStatus.status}, 
                        QR Data: {paymentStatus.qrData ? 'Present' : 'Missing'}, 
                        Amount: {paymentStatus.qrData?.amount}
                      </p>
                    </div>
                    {/* QR Code */}
                    <div className="text-center">
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

                    {/* Mobile Payment Methods */}
                    {isMobile && (
                      <MobilePaymentMethods 
                        invoiceId={invoiceId!}
                        amount={paymentStatus.qrData.total_amount || paymentStatus.qrData.gross_amount || paymentStatus.qrData.amount || 0}
                        qrText={paymentStatus.qrData.qr_text}
                        onPaymentMethodSelect={(method) => {
                          console.log('Payment method selected:', method.name);
                          toast.info(`Opening ${method.name}...`);
                        }}
                        onPaymentCompleted={() => {
                          console.log('User returned from payment app, checking payment status...');
                          manuallyCheckPayment();
                        }}
                      />
                    )}

                    {/* Payment Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
                        <Smartphone className="h-4 w-4" />
                        <span className="font-medium">How to Pay</span>
                      </div>
                      <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>1. Open your QPay mobile app</li>
                        <li>2. Tap the QR scanner</li>
                        <li>3. Scan the QR code above</li>
                        <li>4. Complete the payment in your app</li>
                      </ol>
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
                        Open in Browser
                      </Button>
                    </div>

                    {/* Callback Simulate Button - For Testing */}
                    <div className="border-t pt-4">
                      <Button 
                        onClick={() => simulatePaymentCallback()}
                        className="w-full"
                        variant="secondary"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Simulate Payment Success (Testing)
                      </Button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Use this button to test the payment flow without making real payments
                      </p>
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
                        Last check: {lastCheckTime || 'Never'}
                      </p>
                      
                      <div className="flex gap-2">
                        {!isMonitoring ? (
                          <Button 
                            onClick={() => startPaymentCheck(invoiceId!)}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                          >
                            Start Monitoring
                          </Button>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {paymentStatus.status === 'failed' && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {paymentStatus.error || 'Failed to generate QR code. Please try again.'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Success State */}
                {paymentStatus.status === 'paid' && (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Payment successful! Redirecting to test...
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
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