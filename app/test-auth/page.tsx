'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const [testResult, setTestResult] = useState<any>(null);

  const testFreeEnrollment = async () => {
    if (!session?.user?.id) {
      toast.error('No session or user ID found');
      return;
    }

    try {
      console.log('Testing free enrollment with session:', {
        userId: session.user.id,
        userName: session.user.name,
        userEmail: session.user.email
      });

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

      const result = await response.json();
      
      setTestResult({
        status: response.status,
        ok: response.ok,
        data: result
      });

      if (response.ok) {
        toast.success('Free enrollment test successful!');
      } else {
        toast.error(`Test failed: ${result.message}`);
      }

    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test failed with error');
      setTestResult({
        error: error.message
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Authentication Test</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Status:</strong> {status}
              </div>
              
              {session ? (
                <div>
                  <strong>Session Data:</strong>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-red-600">No session found</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Free Enrollment Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testFreeEnrollment}
              disabled={!session?.user?.id}
              className="mb-4"
            >
              Test Free Enrollment API
            </Button>
            
            {testResult && (
              <div>
                <strong>Test Result:</strong>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>User ID:</strong> {session?.user?.id || 'Not available'}</div>
              <div><strong>User Name:</strong> {session?.user?.name || 'Not available'}</div>
              <div><strong>User Email:</strong> {session?.user?.email || 'Not available'}</div>
              <div><strong>Session Status:</strong> {status}</div>
              <div><strong>Has Session:</strong> {session ? 'Yes' : 'No'}</div>
              <div><strong>Has User:</strong> {session?.user ? 'Yes' : 'No'}</div>
              <div><strong>Has User ID:</strong> {session?.user?.id ? 'Yes' : 'No'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 