'use client';

import React, { useState } from 'react';
import QPayPayment from '@/components/QPayPayment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from 'sonner';
import { CreditCard, Smartphone, QrCode, CheckCircle, AlertTriangle } from 'lucide-react';

export default function QPayDemoPage() {
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    setPaymentHistory(prev => [{
      id: Date.now(),
      amount: paymentData.payment_amount,
      status: 'Success',
      date: new Date().toLocaleString(),
      description: paymentData.payment_description,
      paymentId: paymentData.payment_id
    }, ...prev]);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentHistory(prev => [{
      id: Date.now(),
      amount: 0,
      status: 'Failed',
      date: new Date().toLocaleString(),
      description: error,
      paymentId: 'N/A'
    }, ...prev]);
  };

  const demoScenarios = [
    {
      title: 'Test Payment',
      amount: 1000,
      description: 'Test payment for QPay integration',
      receiverCode: 'TEST_USER_001'
    },
    {
      title: 'Course Purchase',
      amount: 5000,
      description: 'Advanced JavaScript Course',
      receiverCode: 'COURSE_JS_001'
    },
    {
      title: 'Monthly Subscription',
      amount: 2500,
      description: 'Monthly test subscription',
      receiverCode: 'SUB_MONTHLY_001'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              QPay Payment System Demo
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Production-ready QPay integration with real payment processing
            </p>
            <div className="flex justify-center gap-4 mb-6">
              <Badge variant="outline" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Code Payments
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile App Integration
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Real-time Status
              </Badge>
            </div>
            
            {/* Production Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">Production Environment</span>
              </div>
              <p className="text-yellow-700 text-sm">
                This is connected to QPay production environment. All payments will be real transactions.
                Use test amounts and ensure you have the QPay mobile app installed.
              </p>
            </div>
          </div>

          <Tabs defaultValue="payment" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payment">Payment Demo</TabsTrigger>
              <TabsTrigger value="scenarios">Payment Scenarios</TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value="payment" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Component */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        Make a Payment
                      </CardTitle>
                      <CardDescription>
                        Generate a QR code to pay with QPay mobile app
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <QPayPayment
                        amount={1000}
                        description="Demo payment"
                        receiverCode="DEMO_USER_001"
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Instructions */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>How to Test</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">1. Generate QR Code</h4>
                        <p className="text-sm text-gray-600">
                          Click "Generate QR Code" to create a payment QR code
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">2. Scan with QPay App</h4>
                        <p className="text-sm text-gray-600">
                          Open QPay mobile app and scan the QR code
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">3. Complete Payment</h4>
                        <p className="text-sm text-gray-600">
                          Follow the app instructions to complete payment
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">4. Real-time Updates</h4>
                        <p className="text-sm text-gray-600">
                          Payment status updates automatically
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Production Features</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Real QPay Production API</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">QR Code Generation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Real-time Payment Status</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Mobile App Integration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Payment Callbacks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Error Handling</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>QPay Credentials</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Merchant ID:</span>
                        <span className="font-mono">JAVZAN_B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice Code:</span>
                        <span className="font-mono">JAVZAN_B_INVOICE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">API URL:</span>
                        <span className="font-mono">merchant.qpay.mn/v2</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {demoScenarios.map((scenario, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{scenario.title}</CardTitle>
                      <CardDescription>
                        {scenario.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-2xl font-bold text-green-600">
                        ₮{scenario.amount.toLocaleString()}
                      </div>
                      <QPayPayment
                        amount={scenario.amount}
                        description={scenario.description}
                        receiverCode={scenario.receiverCode}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    Recent payment attempts and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No payment history yet. Make a payment to see it here.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentHistory.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${
                              payment.status === 'Success' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <div className="font-medium">
                                {payment.description}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.date}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ₮{payment.amount.toLocaleString()}
                            </div>
                            <Badge variant={payment.status === 'Success' ? 'default' : 'destructive'}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>
              This is a production implementation of the QPay payment system. 
              All payments are real transactions processed through QPay.
            </p>
            <p className="mt-2">
              Powered by{' '}
              <a 
                href="https://developer.qpay.mn/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                QPay API
              </a>
            </p>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
} 