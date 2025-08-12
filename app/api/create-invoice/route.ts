import { NextRequest, NextResponse } from 'next/server';
import { getTestQPayService, QPayInvoiceRequest } from '@/lib/qpay-service';

export async function POST(req: NextRequest) {
  try {
    // Check if QPay credentials are properly configured FIRST
    const qpayClientSecret = process.env.QPAY_CLIENT_SECRET;
    const isTestMode = !qpayClientSecret || qpayClientSecret === 'SET' || qpayClientSecret === 'NOT_SET';

    if (isTestMode) {
      console.log('QPay credentials not properly configured, using test mode');
      
      const { amount, description, receiverCode, invoiceCode, invoiceId, regenerate } = await req.json();
      
      console.log('Create invoice request received (TEST MODE):', {
        amount,
        description,
        receiverCode,
        invoiceCode,
        invoiceId,
        regenerate
      });

      // Handle free courses (amount = 0)
      if (amount === 0) {
        return NextResponse.json({
          success: true,
          message: 'Free course - no payment required',
          isFree: true,
          amount: 0,
          description
        });
      }

      if (!amount || isNaN(amount) || amount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }

      if (!receiverCode) {
        return NextResponse.json({ error: 'Receiver code is required' }, { status: 400 });
      }
      
      // Return a mock invoice for testing
      const mockInvoiceId = `TEST_INV_${Date.now()}`;
      const mockQrText = `https://test.qpay.mn/pay/${mockInvoiceId}`;
      
      return NextResponse.json({
        success: true,
        message: 'Test mode - QPay credentials not configured',
        isTestMode: true,
        invoice_id: mockInvoiceId,
        qr_image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRFU1QgUVJDb2RlPC90ZXh0Pjwvc3ZnPg==',
        qr_text: mockQrText,
        deeplink: mockQrText,
        web_url: mockQrText,
        deeplink_url: mockQrText,
        amount: amount,
        testMode: true,
        note: 'This is a test invoice. QPay credentials need to be configured for real payments.'
      });
    }

    const { amount, description, receiverCode, invoiceCode, invoiceId, regenerate } = await req.json();
    
    console.log('Create invoice request received:', {
      amount,
      description,
      receiverCode,
      invoiceCode,
      invoiceId,
      regenerate
    });

    // Handle free courses (amount = 0)
    if (amount === 0) {
      return NextResponse.json({
        success: true,
        message: 'Free course - no payment required',
        isFree: true,
        amount: 0,
        description
      });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!receiverCode) {
      return NextResponse.json({ error: 'Receiver code is required' }, { status: 400 });
    }

    // Use the invoice code from environment variable or generate a simple one
    const envInvoiceCode = process.env.QPAY_INVOICE_CODE || 'JAVZAN_B_INVOICE';
    const timestamp = Date.now();
    // Try using just the base invoice code first, then with timestamp if needed
    const uniqueInvoiceCode = invoiceCode || envInvoiceCode;
    
    // Generate a proper sender invoice number
    const senderInvoiceNo = `SINV${timestamp}`;

    // Try different receiver codes if the first one fails
    const receiverCodes = [receiverCode, 'JAVZAN_B', 'PPNIM'];
    
    let invoice;
    let lastError;

    for (const code of receiverCodes) {
      try {
        console.log(`Trying with receiver code: ${code}`);
        
        // Create invoice data according to QPay documentation
        const invoiceData: QPayInvoiceRequest = {
          invoice_code: uniqueInvoiceCode,
          sender_invoice_no: senderInvoiceNo,
          invoice_receiver_code: code,
          invoice_description: description || 'Payment for services',
          amount: Number(amount),
          callback_url: process.env.QPAY_CALLBACK_URL || 'https://testcenter.mn/api/qpay-callback',
          calculate_vat: false,
          enable_expiry: false,
          lines: [
            {
              line_description: description || 'Payment for services',
              line_quantity: 1,
              line_unit_price: Number(amount),
              amount: Number(amount)
            }
          ]
        };

        console.log('Creating QPay invoice with data:', {
          invoice_code: invoiceData.invoice_code,
          sender_invoice_no: invoiceData.sender_invoice_no,
          invoice_receiver_code: invoiceData.invoice_receiver_code,
          invoice_description: invoiceData.invoice_description,
          amount: invoiceData.amount,
          callback_url: invoiceData.callback_url,
          calculate_vat: invoiceData.calculate_vat,
          enable_expiry: invoiceData.enable_expiry
        });

        // Create invoice using production endpoint
        console.log('Creating QPay invoice...');
        const qpayService = getTestQPayService();
        invoice = await qpayService.createInvoice(invoiceData);
        console.log('QPay invoice created successfully:', invoice.invoice_id);
        break; // Success, exit the loop
        
      } catch (error: any) {
        console.error(`QPay invoice creation failed with receiver code ${code}:`, error);
        lastError = error;
        
        // Continue to next receiver code if available
        if (code === receiverCodes[receiverCodes.length - 1]) {
          console.error('All receiver codes failed, cannot create invoice');
        }
      }
    }

    if (!invoice) {
      throw lastError || new Error('Failed to create invoice with any receiver code');
    }

    // Return QR code and payment info
    return NextResponse.json({
      success: true,
      invoice_id: invoice.invoice_id,
      qr_image: invoice.qr_image,
      qr_text: invoice.qr_text,
      deeplink: invoice.deeplink,
      web_url: invoice.urls?.web,
      deeplink_url: invoice.urls?.deeplink,
      amount: amount,
      invoice: invoice,
    });

  } catch (error: any) {
    console.error('QPay invoice creation error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create QPay invoice';
    if (error.message.includes('Bad Request')) {
      errorMessage = 'Invalid QPay request parameters. Please check your configuration.';
    } else if (error.message.includes('Unauthorized')) {
      errorMessage = 'QPay authentication failed. Please check your credentials.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'QPay request timed out. Please try again.';
    } else {
      errorMessage = error.message || 'Failed to create QPay invoice';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      success: false,
      details: error.message
    }, { status: 500 });
  }
} 