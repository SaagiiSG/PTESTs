import { NextRequest, NextResponse } from 'next/server';

interface PaymentMethod {
  name: string;
  description: string;
  logo: string;
  link: string;
}

interface QPayPaymentMethodsResponse {
  count: number;
  rows: PaymentMethod[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;
    
    console.log('Fetching payment methods for invoice:', invoiceId);

    // For now, return mock payment methods based on the logs you showed
    // In production, this would call QPay's API to get real payment methods
    const mockPaymentMethods: QPayPaymentMethodsResponse = {
      count: 2,
      rows: [
        {
          name: 'Arig bank',
          description: 'Ариг банк',
          logo: 'https://qpay.mn/q/logo/arig.png',
          link: `arig://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'Monpay',
          description: 'Мон Пэй',
          logo: 'https://qpay.mn/q/logo/monpay.png',
          link: `Monpay://q?qPay_QRcode=${invoiceId}`
        }
      ]
    };

    // TODO: In production, replace with actual QPay API call
    // const response = await fetch(`https://merchant.qpay.mn/v2/payment/methods/${invoiceId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // const paymentMethods = await response.json();

    return NextResponse.json({
      success: true,
      paymentMethods: mockPaymentMethods
    });

  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch payment methods',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
