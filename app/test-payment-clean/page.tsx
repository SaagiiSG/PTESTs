'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function TestPaymentCleanPage() {
  const [amount, setAmount] = useState('10');
  const [description, setDescription] = useState('Test Payment - Clean System');
  const [invoiceId, setInvoiceId] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [qrText, setQrText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);

  const createInvoice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-payment/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(amount),
          description,
          receiverCode: 'PSYCHOMETRICS'
        })
      });

      const data = await response.json();

      if (data.success) {
        setInvoiceId(data.invoice_id);
        setQrImage(data.qr_image);
        setQrText(data.qr_text);
        toast.success('Invoice created successfully!');
      } else {
        toast.error(data.error || 'Failed to create invoice');
      }
    } catch (error) {
      toast.error('Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPayment = async () => {
    if (!invoiceId) {
      toast.error('No invoice ID to check');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/test-payment/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId })
      });

      const data = await response.json();

      if (data.success) {
        setPaymentStatus(data.payment);
        if (data.payment.count > 0) {
          toast.success('Payment found!');
        } else {
          toast.info('No payment found yet');
        }
      } else {
        toast.error(data.error || 'Failed to check payment');
      }
    } catch (error) {
      toast.error('Failed to check payment');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateCallback = async () => {
    if (!invoiceId) {
      toast.error('No invoice ID to simulate callback');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/test-payment/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: `TEST_${Date.now()}`,
          payment_status: 'PAID',
          payment_amount: parseInt(amount),
          payment_date: new Date().toISOString(),
          object_id: invoiceId,
          object_type: 'INVOICE',
          payment_currency: 'MNT',
          payment_wallet: 'QPay',
          paid_by: 'P2P'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Callback simulated successfully!');
        // Check payment immediately after callback
        setTimeout(checkPayment, 1000);
      } else {
        toast.error(data.error || 'Failed to simulate callback');
      }
    } catch (error) {
      toast.error('Failed to simulate callback');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test Payment System - Clean Implementation</CardTitle>
          <CardDescription>
            Testing the new clean QPay implementation following official documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Creation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Create Invoice</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (MNT)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Test Payment"
                />
              </div>
            </div>
            <Button onClick={createInvoice} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>

          {/* Invoice Details */}
          {invoiceId && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">2. Invoice Details</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Invoice ID:</strong> {invoiceId}</p>
                {qrImage && (
                  <div className="mt-4">
                    <p><strong>QR Code:</strong></p>
                    <img src={qrImage} alt="QR Code" className="w-48 h-48 mx-auto" />
                  </div>
                )}
                {qrText && (
                  <div className="mt-4">
                    <p><strong>QR Text:</strong></p>
                    <p className="text-sm break-all bg-white p-2 rounded">{qrText}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Actions */}
          {invoiceId && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">3. Payment Actions</h3>
              <div className="flex gap-4">
                <Button onClick={checkPayment} disabled={isLoading}>
                  {isLoading ? 'Checking...' : 'Check Payment'}
                </Button>
                <Button onClick={simulateCallback} disabled={isLoading} variant="outline">
                  {isLoading ? 'Simulating...' : 'Simulate Callback'}
                </Button>
              </div>
            </div>
          )}

          {/* Payment Status */}
          {paymentStatus && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">4. Payment Status</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Count:</strong> {paymentStatus.count}</p>
                {paymentStatus.rows && paymentStatus.rows.length > 0 ? (
                  <div className="mt-4">
                    <p><strong>Payment Details:</strong></p>
                    <pre className="text-sm bg-white p-2 rounded overflow-auto">
                      {JSON.stringify(paymentStatus.rows[0], null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-600">No payment found</p>
                )}
              </div>
            </div>
          )}

          {/* System Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">5. System Information</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <strong>✅ Clean Implementation:</strong> Following QPay official documentation
              </p>
              <p className="text-sm">
                <strong>✅ Separate Systems:</strong> Test and Course payments use different credentials
              </p>
              <p className="text-sm">
                <strong>✅ Proper Authentication:</strong> Token-based auth with refresh
              </p>
              <p className="text-sm">
                <strong>✅ Callback Support:</strong> Instant payment verification
              </p>
              <p className="text-sm">
                <strong>✅ Error Handling:</strong> Graceful error management
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 