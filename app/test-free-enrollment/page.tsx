'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentOptionsModal from '@/components/PaymentOptionsModal';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function TestFreeEnrollmentPage() {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = (paymentData: any, uniqueCode?: string) => {
    console.log('Enrollment successful:', paymentData);
    if (uniqueCode) {
      toast.success(`Free test enrolled! Your unique code: ${uniqueCode}`);
    } else {
      toast.success('Free test enrolled successfully!');
    }
  };

  const handleError = (error: string) => {
    console.error('Enrollment error:', error);
    toast.error(`Enrollment failed: ${error}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Free Test Enrollment Test</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Free Enrollment Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This page tests the free test enrollment functionality. Click the button below to test enrolling in a free test.
            </p>
            
            <div className="space-y-4">
              <div>
                <strong>Test Details:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Test ID: 688c75c1a2543bde0884458f</li>
                  <li>Title: Free Enrollment Test - Demo</li>
                  <li>Price: 0 MNT (Free)</li>
                  <li>Type: Demo Test for Enrollment Testing</li>
                </ul>
              </div>
              
              <div>
                <strong>Current User:</strong>
                <p className="mt-1">
                  {session?.user ? (
                    <span className="text-green-600">
                      ✅ Logged in as: {session.user.name} ({session.user.id})
                    </span>
                  ) : (
                    <span className="text-red-600">❌ Not logged in</span>
                  )}
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowModal(true)}
              disabled={!session?.user}
              className="mt-4"
            >
              Test Free Enrollment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected Behavior</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "Test Free Enrollment" button</li>
              <li>Payment modal should open with "Enroll in Free Test" title</li>
              <li>Modal should show free enrollment UI (not payment methods)</li>
              <li>Click "Enroll for Free" button</li>
              <li>Should create purchase record in database</li>
              <li>Should show success message</li>
              <li>Should redirect to test page</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <PaymentOptionsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        itemId="688c75c1a2543bde0884458f"
        itemType="test"
        itemTitle="Free Enrollment Test - Demo"
        itemDescription="This is a free enrollment test. Use this test to verify the free enrollment system is working correctly."
        price={0}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
} 