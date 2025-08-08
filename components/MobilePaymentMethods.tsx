'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Smartphone, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethod {
  name: string;
  description: string;
  logo: string;
  link: string;
}

interface MobilePaymentMethodsProps {
  invoiceId: string;
  amount: number;
  onPaymentMethodSelect?: (method: PaymentMethod) => void;
}

export default function MobilePaymentMethods({ 
  invoiceId, 
  amount, 
  onPaymentMethodSelect 
}: MobilePaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, [invoiceId]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payment/methods/${invoiceId}`);
      const data = await response.json();

      if (data.success && data.paymentMethods?.rows) {
        setPaymentMethods(data.paymentMethods.rows);
      } else {
        setError(data.error || 'Failed to load payment methods');
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodClick = (method: PaymentMethod) => {
    try {
      // Call the callback if provided
      if (onPaymentMethodSelect) {
        onPaymentMethodSelect(method);
      }

      // Attempt to open the deep link
      window.location.href = method.link;
      
      // Fallback: if the app doesn't open, show a message
      setTimeout(() => {
        toast.info(`If ${method.name} didn't open, please install the app from your app store`);
      }, 2000);

    } catch (error) {
      console.error('Error opening payment method:', error);
      toast.error('Failed to open payment method');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading payment methods...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={fetchPaymentMethods} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Payment Amount Display */}
      <div className="text-center mb-6">
        <div className="text-2xl font-bold text-green-600 mb-1">
          ₮{amount?.toLocaleString() || 'N/A'}
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Payment Amount</p>
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
          <Smartphone className="h-4 w-4" />
          <span className="font-medium">How to Pay</span>
        </div>
        <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>1. Tap your preferred payment method below</li>
          <li>2. Complete the payment in the app</li>
          <li>3. Return to this page for confirmation</li>
        </ol>
      </div>

      {/* Payment Method Buttons */}
      <div className="space-y-3">
        {paymentMethods.map((method, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300 dark:hover:border-blue-600"
            onClick={() => handlePaymentMethodClick(method)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Bank Logo */}
                <div className="flex-shrink-0">
                  <img 
                    src={method.logo} 
                    alt={method.name}
                    className="w-12 h-12 rounded-lg object-contain bg-white p-1 border"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Bank Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {method.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {method.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="flex-shrink-0">
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fallback Message */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Don't see your bank? You can also scan the QR code on desktop or use the web payment link.
        </p>
      </div>
    </div>
  );
}
