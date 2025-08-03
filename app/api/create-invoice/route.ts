import { NextRequest, NextResponse } from 'next/server';
import { qpayService, QPayInvoiceRequest } from '@/lib/qpay';

export async function POST(req: NextRequest) {
  try {
    // Check if QPay credentials are configured
    if (!process.env.QPAY_CLIENT_ID || !process.env.QPAY_CLIENT_SECRET) {
      console.error('QPay credentials not configured');
      return NextResponse.json({ 
        error: 'Payment service not configured. Please contact support.' 
      }, { status: 503 });
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
          callback_url: process.env.QPAY_CALLBACK_URL || `${req.nextUrl.origin}/api/qpay-callback`,
          calculate_vat: false,
          enable_expiry: false,
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