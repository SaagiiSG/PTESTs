'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Gift, Play, CheckCircle, XCircle } from 'lucide-react';

export default function TestFreeEnrollmentPage() {
  const { data: session } = useSession();
  const [testResult, setTestResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDirectFreeEnrollment = async () => {
    if (!session?.user?.id) {
      toast.error('Please log in to test free enrollment');
      return;
    }

    setIsProcessing(true);
    setTestResult(null);

    try {
      console.log('Testing direct free enrollment...');
      
      const response = await fetch('/api/public/purchase-free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: '688c75c1a2543bde0884458f',
          itemType: 'test',
          amount: 0,
          paymentMethod: 'free'
        }),
      });

      const data = await response.json();
      console.log('Free enrollment response:', { status: response.status, data });

      setTestResult({
        status: response.status,
        ok: response.ok,
        data: data
      });

      if (response.ok) {
        if (data.alreadyPurchased) {
          toast.success('Test already purchased - enrollment working!');
        } else {
          toast.success('Free enrollment successful!');
        }
      } else {
        toast.error(`Enrollment failed: ${data.message}`);
      }

    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Enrollment failed with error');
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Free Test Enrollment Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Test the fixed free test enrollment system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600 inline-block" />
              Test Direct Free Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              This test bypasses the payment modal and directly calls the free enrollment API.
            </p>
            
            <Button 
              onClick={handleDirectFreeEnrollment}
              disabled={!session?.user?.id || isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? 'Processing...' : 'Test Direct Free Enrollment'}
            </Button>

            {testResult && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2">Test Result:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>Status:</span>
                    <span className={`font-mono ${testResult.ok ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Success:</span>
                    {testResult.ok ? (
                      <CheckCircle className="w-4 h-4 text-green-600 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 inline-block" />
                    )}
                  </div>
                  {testResult.data && (
                    <div>
                      <span>Response:</span>
                      <pre className="mt-1 text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  {testResult.error && (
                    <div className="text-red-600">
                      <span>Error:</span> {testResult.error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What Was Fixed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0 inline-block" />
                <div>
                  <h4 className="font-semibold">Free Tests No Longer Go Through Payment Modal</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Free tests are now handled directly by the test card click handler, bypassing the payment system entirely.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0 inline-block" />
                <div>
                  <h4 className="font-semibold">Direct API Call for Free Enrollment</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Free tests call the purchase-free API directly instead of going through payment flow.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0 inline-block" />
                <div>
                  <h4 className="font-semibold">Immediate Redirect to Test</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    After successful enrollment, users are immediately redirected to the test start page.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0 inline-block" />
                <div>
                  <h4 className="font-semibold">Better Error Handling</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Improved error messages and handling for already purchased tests.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected Behavior</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "Test Direct Free Enrollment" button</li>
              <li>API call should succeed (status 200)</li>
              <li>Should show success message</li>
              <li>Response should include test enrollment data</li>
              <li>No payment flow should be involved</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 