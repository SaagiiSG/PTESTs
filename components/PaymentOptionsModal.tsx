'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Smartphone, 
  QrCode, 
  Shield, 
  Zap, 
  CheckCircle, 
  Lock,
  X,
  ArrowRight,
  Star,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PaymentOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: 'test' | 'course';
  itemTitle: string;
  itemDescription?: string;
  price: number;
  thumbnailUrl?: string;
  onSuccess?: (paymentData: any, uniqueCode?: string) => void;
  onError?: (error: string) => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  isAvailable: boolean;
  comingSoon?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'qpay',
    name: 'QPay',
    description: 'Pay securely with QPay mobile app',
    icon: QrCode,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    isAvailable: true
  },
  {
    id: 'card',
    name: 'Credit Card',
    description: 'Pay with Visa, Mastercard, or other cards',
    icon: CreditCard,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    isAvailable: false,
    comingSoon: true
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'Direct bank transfer payment',
    icon: Smartphone,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    isAvailable: false,
    comingSoon: true
  }
];

export default function PaymentOptionsModal({
  isOpen,
  onClose,
  itemId,
  itemType,
  itemTitle,
  itemDescription,
  price,
  thumbnailUrl,
  onSuccess,
  onError
}: PaymentOptionsModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentMethodSelect = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method?.isAvailable) {
      toast.info('This payment method is coming soon!');
      return;
    }
    setSelectedMethod(methodId);
  };

  const handleQPayPayment = async () => {
    if (!session?.user?.id) {
      toast.error('Please log in to make a purchase');
      return;
    }

    setIsProcessing(true);

    try {
      // Handle free items
      if (!price || price === 0 || price === null || price === undefined) {
        console.log('Processing free enrollment for:', { itemId, itemType, userId: session.user.id });
        
        // For free items, directly mark as purchased
        const purchaseResponse = await fetch('/api/public/purchase-free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId,
            itemType,
            amount: 0,
            paymentMethod: 'free'
          }),
        });

        console.log('Free purchase response status:', purchaseResponse.status);
        
        if (purchaseResponse.ok) {
          const responseData = await purchaseResponse.json();
          console.log('Free purchase response data:', responseData);
          
          // Call onSuccess with the response data and unique code if available
          onSuccess?.(responseData, responseData.uniqueCode);
          toast.success('Free item purchased successfully!');
          
          // For free tests, redirect directly to the test start page
          if (itemType === 'test') {
            console.log('Redirecting to test start page:', `/test-embed/${itemId}`);
            router.push(`/test-embed/${itemId}`);
          } else if (itemType === 'course') {
            // For courses, redirect to the course page
            console.log('Redirecting to course page:', `/Course/${itemId}`);
            router.push(`/Course/${itemId}`);
          }
          
          onClose();
          return;
        } else {
          const errorData = await purchaseResponse.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Free purchase failed:', errorData);
          throw new Error(errorData.message || 'Failed to purchase free item');
        }
      }

      // Create payment invoice for paid items using PUBLIC API route
      console.log('Creating payment invoice with:', { price, itemType, itemTitle, itemId });
      
      const requestBody = {
        amount: price || 0,
        description: `${itemType === 'test' ? 'Test' : 'Course'} Purchase: ${itemTitle}`,
        receiverCode: itemType === 'course' ? 'JAVZAN_B' : 'PSYCHOMETRICS', // Use appropriate receiver code
        metadata: {
          itemId,
          itemType,
          userId: session.user.id,
          itemTitle
        }
      };
      
      console.log('Request body:', requestBody);
      
      // Use course-specific API for courses, regular API for tests
      const apiEndpoint = itemType === 'course' 
        ? '/api/public/create-course-invoice-v2'  // Use V2 with course credentials
        : '/api/public/create-invoice';           // Use regular API for tests
      
      console.log('Using API endpoint:', apiEndpoint, 'for itemType:', itemType);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment invoice');
      }

      // For course payments, pass QR data as URL parameters
      if (itemType === 'course') {
        // Pass essential QR data as URL parameters for course payments
        const qrDataParam = encodeURIComponent(JSON.stringify({
          invoice_id: data.invoice_id,
          qr_image: data.qr_image,
          qr_text: data.qr_text,
          deeplink: data.deeplink,
          web_url: data.web_url,
          deeplink_url: data.deeplink_url,
          amount: data.amount,
          testMode: data.testMode || false
        }));
        
        router.push(`/payment/qpay?invoiceId=${data.invoice_id}&itemId=${itemId}&itemType=${itemType}&returnTo=${encodeURIComponent(window.location.pathname)}&qrData=${qrDataParam}`);
      } else {
        // For test payments, use sessionStorage
        const qrData = {
          invoice_id: data.invoice_id,
          qr_image: data.qr_image,
          qr_text: data.qr_text,
          deeplink: data.deeplink,
          web_url: data.web_url,
          deeplink_url: data.deeplink_url,
          amount: data.amount,
          testMode: data.testMode || false
        };
        
        // Store QR data in sessionStorage for the payment page to access
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`qrData_${data.invoice_id}`, JSON.stringify(qrData));
          console.log('QR data stored in sessionStorage for invoice:', data.invoice_id);
        }
        
        router.push(`/payment/qpay?invoiceId=${data.invoice_id}&itemId=${itemId}&itemType=${itemType}&returnTo=${encodeURIComponent(window.location.pathname)}`);
      }
      
      onClose();

    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.message || 'Failed to initiate payment';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    switch (selectedMethod) {
      case 'qpay':
        await handleQPayPayment();
        break;
      default:
        toast.info('This payment method is coming soon!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {(!price || price === 0) ? (
              <Gift className="w-6 h-6 text-green-600" />
            ) : (
              <Lock className="w-6 h-6 text-blue-600" />
            )}
            {(!price || price === 0) ? 'Enroll in Free' : 'Purchase'} {itemType === 'test' ? 'Test' : 'Course'}
          </DialogTitle>
          <DialogDescription>
            {(!price || price === 0)
              ? 'This is a free course. Click enroll to get instant access!'
              : 'Choose your preferred payment method to unlock access'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Preview */}
          <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {thumbnailUrl && (
                  <img 
                    src={thumbnailUrl} 
                    alt={itemTitle}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{itemTitle}</h3>
                  {itemDescription && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{itemDescription}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                      {itemType === 'test' ? 'Test' : 'Course'}
                    </Badge>
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                      ₮{price.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          {price === 0 ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Free Course Enrollment
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This course is completely free. Click the button below to enroll instantly!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Select Payment Method</h3>
              
              <div className="grid gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  
                  return (
                    <Card 
                      key={method.id}
                      className={`cursor-pointer transition-all duration-200 border-2 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${!method.isAvailable ? 'opacity-60' : ''}`}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${method.bgColor} flex items-center justify-center`}>
                              <Icon className={`w-5 h-5 ${method.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">{method.name}</h4>
                              {method.comingSoon && (
                                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{method.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                          {method.comingSoon && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          )}

          {/* Security Notice - Only for paid courses */}
          {price > 0 && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Secure Payment</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      All payments are processed securely. You'll receive immediate access after successful payment.
                      {itemType === 'test' && ' For tests, you\'ll also receive a unique access code.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            {price === 0 ? (
              <Button 
                onClick={handleQPayPayment}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enrolling...
                  </>
                ) : (
                  <>
                    Enroll for Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ₮{price.toLocaleString()}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 