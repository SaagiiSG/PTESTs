'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaymentGateway from '@/components/PaymentGateway';
import { BookOpen, GraduationCap, CreditCard, Shield, Zap, CheckCircle } from 'lucide-react';

export default function PaymentDemoPage() {
  const [selectedItem, setSelectedItem] = useState<'test' | 'course' | null>(null);

  const demoItems = {
    test: {
      id: 'demo-test-001',
      title: 'Advanced JavaScript Test',
      description: 'Comprehensive test covering ES6+, async programming, and modern JavaScript patterns',
      price: 15000,
      thumbnailUrl: '/ppnim_logo.svg',
      features: ['50 Questions', '90 Minutes', 'Advanced Level', 'Certificate']
    },
    course: {
      id: 'demo-course-001',
      title: 'Full-Stack Web Development',
      description: 'Complete course covering frontend, backend, and database development',
      price: 250000,
      thumbnailUrl: '/ppnim_logo.svg',
      features: ['12 Modules', '24 Hours', 'Projects', 'Certificate']
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Payment Integration Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience our seamless payment system with QPay integration. 
            Purchase tests and courses with secure, instant payment processing.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center card-hover">
            <CardContent className="pt-6">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All payments are processed securely through QPay with encryption
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center card-hover">
            <CardContent className="pt-6">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Instant Access</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get immediate access to your purchased content after payment
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center card-hover">
            <CardContent className="pt-6">
              <CheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Purchase Protection</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Duplicate purchase protection and automatic verification
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Items */}
        <Tabs defaultValue="test" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="test" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Test Purchase
            </TabsTrigger>
            <TabsTrigger value="course" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Course Purchase
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Test Details */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    {demoItems.test.title}
                  </CardTitle>
                  <CardDescription>
                    {demoItems.test.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      ₮{demoItems.test.price.toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                      Test
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Features:</h4>
                    <ul className="space-y-1">
                      {demoItems.test.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={() => setSelectedItem('test')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Purchase Test
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Gateway */}
              <div className="flex items-start justify-center">
                {selectedItem === 'test' ? (
                  <PaymentGateway
                    itemId={demoItems.test.id}
                    itemType="test"
                    itemTitle={demoItems.test.title}
                    itemDescription={demoItems.test.description}
                    price={demoItems.test.price}
                    thumbnailUrl={demoItems.test.thumbnailUrl}
                    onSuccess={(paymentData) => {
                      console.log('Test purchase successful:', paymentData);
                    }}
                    onError={(error) => {
                      console.error('Test purchase failed:', error);
                    }}
                  />
                ) : (
                  <Card className="w-full max-w-md">
                    <CardContent className="text-center py-12">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Select an Item</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Click "Purchase Test" to see the payment gateway in action
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="course" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Course Details */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {demoItems.course.title}
                  </CardTitle>
                  <CardDescription>
                    {demoItems.course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      ₮{demoItems.course.price.toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                      Course
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Features:</h4>
                    <ul className="space-y-1">
                      {demoItems.course.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={() => setSelectedItem('course')}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Purchase Course
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Gateway */}
              <div className="flex items-start justify-center">
                {selectedItem === 'course' ? (
                  <PaymentGateway
                    itemId={demoItems.course.id}
                    itemType="course"
                    itemTitle={demoItems.course.title}
                    itemDescription={demoItems.course.description}
                    price={demoItems.course.price}
                    thumbnailUrl={demoItems.course.thumbnailUrl}
                    onSuccess={(paymentData) => {
                      console.log('Course purchase successful:', paymentData);
                    }}
                    onError={(error) => {
                      console.error('Course purchase failed:', error);
                    }}
                  />
                ) : (
                  <Card className="w-full max-w-md">
                    <CardContent className="text-center py-12">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Select an Item</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Click "Purchase Course" to see the payment gateway in action
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Reset Button */}
        {selectedItem && (
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              onClick={() => setSelectedItem(null)}
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Reset Demo
            </Button>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-3xl text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Integrate?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              This payment system is fully integrated and ready for production use. 
              Users can purchase tests and courses with secure QPay payments.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">Secure Payments</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Instant Access</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Purchase Protection</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Dark Mode Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 