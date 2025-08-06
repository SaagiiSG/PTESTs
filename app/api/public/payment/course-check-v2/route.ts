import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();
    
    console.log('Course payment check V2 request for invoice:', invoiceId);
    
    // Check if this is a test invoice - but first check if we have real payment data
    if (invoiceId && invoiceId.startsWith('TEST_INV_')) {
      console.log('Test course invoice detected, checking for real payment data first');
      
      // First check our stored payment data (from callback) even for test invoices
      const { getPaymentStatus } = await import('../../../../../lib/payment-storage');
      const storedPayment = await getPaymentStatus(invoiceId);
      
      if (storedPayment && storedPayment.payment_status === 'PAID' && storedPayment.service_type === 'course') {
        console.log('Found stored course payment data for test invoice:', storedPayment);
        return NextResponse.json({
          success: true,
          payment: {
            count: 1,
            rows: [storedPayment]
          }
        });
      }
      
      // If no real payment data, simulate test payment after delay
      const invoiceTimestamp = parseInt(invoiceId.replace('TEST_INV_', ''));
      const timeSinceCreation = Date.now() - invoiceTimestamp;
      
      // Simulate payment completion after 30 seconds
      if (timeSinceCreation > 30000) {
        return NextResponse.json({
          success: true,
          payment: {
            count: 1,
            rows: [{
              payment_id: `TEST_COURSE_PAY_${Date.now()}`,
              payment_date: new Date().toISOString(),
              payment_status: 'PAID',
              payment_fee: 0,
              payment_amount: 1000,
              payment_currency: 'MNT',
              payment_wallet: 'TEST_COURSE_WALLET',
              payment_name: 'Test Course Payment',
              payment_description: 'Test course payment for development',
              qr_code: invoiceId,
              paid_by: 'P2P',
              object_type: 'INVOICE',
              object_id: invoiceId,
              service_type: 'course'
            }]
          }
        });
      } else {
        // Payment still pending
        return NextResponse.json({
          success: true,
          payment: {
            count: 0,
            rows: []
          }
        });
      }
    }
    
    // For real course invoices, check with QPay Course service and our stored payment data
    try {
      console.log('Checking real QPay Course payment with course credentials for invoice:', invoiceId);
      
      // First check our stored payment data (from callback)
      const { getPaymentStatus } = await import('../../../../../lib/payment-storage');
      const storedPayment = await getPaymentStatus(invoiceId);
      
      if (storedPayment && storedPayment.payment_status === 'PAID') {
        console.log('Found stored payment data for course:', storedPayment);
        return NextResponse.json({
          success: true,
          payment: {
            count: 1,
            rows: [storedPayment]
          }
        });
      }
      
      // Only if no callback data exists, then check with QPay Course API as fallback
      console.log('No callback data found, checking with QPay Course API with course credentials as fallback');
      
      // Use course credentials for API check
      const qpayCourseClientSecret = process.env.QPAY_COURSE_CLIENT_SECRET;
      const qpayCourseClientId = process.env.QPAY_COURSE_CLIENT_ID;
      
      if (!qpayCourseClientId || !qpayCourseClientSecret) {
        console.log('Course credentials not available, returning empty result');
        return NextResponse.json({
          success: true,
          payment: {
            count: 0,
            rows: []
          }
        });
      }
      
      // Authenticate with course credentials
      const baseUrl = process.env.QPAY_COURSE_BASE_URL || 'https://merchant.qpay.mn/v2';
      const cleanBaseUrl = baseUrl.includes('/auth/token') ? baseUrl.replace('/auth/token', '') : baseUrl;
      const basicAuth = Buffer.from(`${qpayCourseClientId}:${qpayCourseClientSecret}`).toString('base64');
      
      const authResponse = await fetch(`${cleanBaseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
        }),
      });

      if (!authResponse.ok) {
        console.log('Course QPay authentication failed, trying with regular credentials as fallback');
        
        // Try with regular credentials as fallback
        const regularClientId = process.env.QPAY_CLIENT_ID;
        const regularClientSecret = process.env.QPAY_CLIENT_SECRET;
        
        if (!regularClientId || !regularClientSecret) {
          console.log('No regular credentials available, returning empty result');
          return NextResponse.json({
            success: true,
            payment: {
              count: 0,
              rows: []
            }
          });
        }
        
        const regularBasicAuth = Buffer.from(`${regularClientId}:${regularClientSecret}`).toString('base64');
        
        const regularAuthResponse = await fetch(`${cleanBaseUrl}/auth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${regularBasicAuth}`,
          },
          body: JSON.stringify({
            grant_type: 'client_credentials',
          }),
        });

        if (!regularAuthResponse.ok) {
          console.log('Regular QPay authentication also failed, returning empty result');
          return NextResponse.json({
            success: true,
            payment: {
              count: 0,
              rows: []
            }
          });
        }
        
        const regularAuthData = await regularAuthResponse.json();
        console.log('Using regular credentials as fallback for course payment check');
        
        // Use regular credentials for payment check
        const paymentCheckData = {
          object_type: 'INVOICE',
          object_id: invoiceId,
          offset: {
            page_number: 1,
            page_limit: 100
          }
        };
        
        const paymentResponse = await fetch(`${cleanBaseUrl}/payment/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${regularAuthData.access_token}`,
          },
          body: JSON.stringify(paymentCheckData),
        });

        if (paymentResponse.ok) {
          const qpayResult = await paymentResponse.json();
          console.log('QPay Course API check result with regular credentials (fallback):', qpayResult);
          
          if (qpayResult && qpayResult.rows && qpayResult.rows.length > 0) {
            console.log('Found course payment via QPay API with regular credentials (fallback):', qpayResult.rows[0]);
            
            // Store the payment data from API check for future use
            const { storePaymentStatus } = await import('../../../../../lib/payment-storage');
            await storePaymentStatus(invoiceId, qpayResult.rows[0]);
            
            return NextResponse.json({
              success: true,
              payment: qpayResult
            });
          }
          
          // Check if this was a SYSTEM_BUSY response (empty rows but no error)
          if (qpayResult && qpayResult.rows && qpayResult.rows.length === 0) {
            console.log('QPay system busy or no course payment found for invoice:', invoiceId);
            return NextResponse.json({
              success: true,
              payment: {
                count: 0,
                rows: []
              }
            });
          }
        } else {
          console.log('QPay API check with regular credentials also failed');
        }
        
        // No payment found with regular credentials either
        console.log('No course payment found for invoice (tried both course and regular credentials):', invoiceId);
        return NextResponse.json({
          success: true,
          payment: {
            count: 0,
            rows: []
          }
        });
      }

      const authData = await authResponse.json();
      
      // Check payment with course credentials
      const paymentCheckData = {
        object_type: 'INVOICE',
        object_id: invoiceId,
        offset: {
          page_number: 1,
          page_limit: 100
        }
      };
      
      const paymentResponse = await fetch(`${cleanBaseUrl}/payment/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.access_token}`,
        },
        body: JSON.stringify(paymentCheckData),
      });

      if (paymentResponse.ok) {
        const qpayResult = await paymentResponse.json();
        console.log('QPay Course API check result with course credentials:', qpayResult);
        
        if (qpayResult && qpayResult.rows && qpayResult.rows.length > 0) {
          console.log('Found course payment via QPay Course API with course credentials:', qpayResult.rows[0]);
          
          // Store the payment data from API check for future use
          const { storePaymentStatus } = await import('../../../../../lib/payment-storage');
          await storePaymentStatus(invoiceId, qpayResult.rows[0]);
          
          return NextResponse.json({
            success: true,
            payment: qpayResult
          });
        }
        
        // Check if this was a SYSTEM_BUSY response (empty rows but no error)
        if (qpayResult && qpayResult.rows && qpayResult.rows.length === 0) {
          console.log('QPay Course system busy or no payment found for invoice:', invoiceId);
          return NextResponse.json({
            success: true,
            payment: {
              count: 0,
              rows: []
            }
          });
        }
      } else {
        const errorText = await paymentResponse.text();
        console.log('QPay Course API check failed with course credentials. Status:', paymentResponse.status, 'Error:', errorText);
      }
      
      // No payment found
      console.log('No course payment found for invoice:', invoiceId);
      return NextResponse.json({
        success: true,
        payment: {
          count: 0,
          rows: []
        }
      });
      
    } catch (qpayError: any) {
      console.error('QPay Course payment check with course credentials failed:', qpayError);
      
      // Return empty result if QPay Course check fails
      return NextResponse.json({
        success: true,
        payment: {
          count: 0,
          rows: []
        }
      });
    }
    
  } catch (error: any) {
    console.error('Course payment check V2 error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check course payment status'
    }, { status: 500 });
  }
} 