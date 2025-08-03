'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TestPaymentPage() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testQPayConnection = async () => {
    setIsTesting(true);
    setError('');
    setTestResult(null);

    try {
      console.log('Testing QPay connection...');
      const response = await fetch('/api/test-qpay-simple');
      const data = await response.json();

      console.log('QPay test response:', data);

      if (response.ok && data.success) {
        setTestResult(data);
        toast.success('QPay connection test successful!');
      } else {
        setError(data.error || 'QPay test failed');
        toast.error(`QPay test failed: ${data.error}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Network error occurred';
      setError(errorMessage);
      toast.error(`Test failed: ${errorMessage}`);
      console.error('QPay test error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  const testPaymentFlow = async () => {
    setIsTesting(true);
    setError('');
    setTestResult(null);

    try {
      console.log('Testing payment flow...');
      
      // Test creating an invoice
      const response = await fetch('/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1000,
          description: 'Test payment for debugging',
          receiverCode: 'JAVZAN_B',
        }),
      });

      const data = await response.json();
      console.log('Payment flow test response:', data);

      if (response.ok && data.success) {
        setTestResult(data);
        toast.success('Payment flow test successful!');
      } else {
        setError(data.error || 'Payment flow test failed');
        toast.error(`Payment flow test failed: ${data.error}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Network error occurred';
      setError(errorMessage);
      toast.error(`Test failed: ${errorMessage}`);
      console.error('Payment flow test error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Payment System Test
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Test the payment system to identify issues
            </p>
          </div>

          <div className="space-y-6">
            {/* Test Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Tests
                </CardTitle>
                <CardDescription>
                  Run these tests to check if the payment system is working correctly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button 
                    onClick={testQPayConnection}
                    disabled={isTesting}
                    className="flex-1"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Test QPay Connection
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={testPaymentFlow}
                    disabled={isTesting}
                    variant="outline"
                    className="flex-1"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Test Payment Flow
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Result */}
            {testResult && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="w-5 h-5" />
                    Test Successful
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 p-4 rounded-lg overflow-auto">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Environment Info */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Information</CardTitle>
                <CardDescription>
                  Current environment and configuration details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Environment:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {process.env.NODE_ENV || 'development'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">QPay Base URL:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      https://merchant.qpay.mn/v2
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">QPay Client ID:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      JAVZAN_B
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 