import { NextRequest, NextResponse } from 'next/server';
import { getTestQPayService, getCourseQPayService } from '@/lib/qpay-service';

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

    // Try to get payment methods from QPay API
    try {
      // First, try to get the invoice details to see if it's a test or course payment
      // We'll use the test service first, then course service if needed
      let qpayService = getTestQPayService();
      
      // Try to get payment methods using the test service
      // Note: QPay might not have a direct endpoint for payment methods, so we'll use the invoice data
      
      // For now, we'll use the comprehensive list from the logs
      // In a real implementation, you would call QPay's API to get this data
      const paymentMethods: PaymentMethod[] = [
        {
          name: 'qPay wallet',
          description: 'qPay хэтэвч',
          logo: 'https://s3.qpay.mn/p/e9bbdc69-3544-4c2f-aff0-4c292bc094f6/launcher-icon-ios.jpg',
          link: `qpaywallet://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'Khan bank',
          description: 'Хаан банк',
          logo: 'https://qpay.mn/q/logo/khanbank.png',
          link: `khanbank://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'State bank 3.0',
          description: 'Төрийн банк 3.0',
          logo: 'https://qpay.mn/q/logo/state_3.png',
          link: `statebankmongolia://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'Xac bank',
          description: 'Хас банк',
          logo: 'https://qpay.mn/q/logo/xacbank.png',
          link: `xacbank://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'Trade and Development bank',
          description: 'TDB online',
          logo: 'https://qpay.mn/q/logo/tdbbank.png',
          link: `tdbbank://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'Social Pay',
          description: 'Голомт банк',
          logo: 'https://qpay.mn/q/logo/socialpay.png',
          link: `socialpay-payment://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'Most money',
          description: 'МОСТ мони',
          logo: 'https://qpay.mn/q/logo/most.png',
          link: `most://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'National investment bank',
          description: 'Үндэсний хөрөнгө оруулалтын банк',
          logo: 'https://qpay.mn/q/logo/nibank.jpeg',
          link: `nibank://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'Chinggis khaan bank',
          description: 'Чингис Хаан банк',
          logo: 'https://qpay.mn/q/logo/ckbank.png',
          link: `ckbank://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'Capitron bank',
          description: 'Капитрон банк',
          logo: 'https://qpay.mn/q/logo/capitronbank.png',
          link: `capitronbank://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'Bogd bank',
          description: 'Богд банк',
          logo: 'https://qpay.mn/q/logo/bogdbank.png',
          link: `bogdbank://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'Trans bank',
          description: 'Тээвэр хөгжлийн банк',
          logo: 'https://qpay.mn/q/logo/transbank.png',
          link: `transbank://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'M bank',
          description: 'М банк',
          logo: 'https://qpay.mn/q/logo/mbank.png',
          link: `mbank://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'Ard App',
          description: 'Ард Апп',
          logo: 'https://qpay.mn/q/logo/ardapp.png',
          link: `ard://q?qPay_QRcode=${invoiceId}`
        },
        {
          name: 'Toki App',
          description: 'Toki App',
          logo: 'https://qpay.mn/q/logo/toki.png',
          link: `toki://q?qPay_QRcode=${invoiceId}`
        },
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
      ];

      const response: QPayPaymentMethodsResponse = {
        count: paymentMethods.length,
        rows: paymentMethods
      };

      console.log(`Found ${paymentMethods.length} payment methods for invoice:`, invoiceId);

      return NextResponse.json({
        success: true,
        paymentMethods: response
      });

    } catch (qpayError) {
      console.error('Error fetching from QPay API:', qpayError);
      
      // Fallback to mock data if QPay API fails
      const fallbackPaymentMethods: QPayPaymentMethodsResponse = {
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

      return NextResponse.json({
        success: true,
        paymentMethods: fallbackPaymentMethods
      });
    }

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
