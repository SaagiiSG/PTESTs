import { NextRequest, NextResponse } from 'next/server';
import { getQPayCourseService, QPayInvoiceRequest } from '@/lib/qpay-course';

export async function POST(req: NextRequest) {
  try {
    // Check if QPay Course credentials are properly configured
    const qpayCourseClientSecret = process.env.QPAY_COURSE_CLIENT_SECRET || process.env.QPAY_CLIENT_SECRET;
    const qpayCourseClientId = process.env.QPAY_COURSE_CLIENT_ID || process.env.QPAY_CLIENT_ID;
    
    console.log('Public create course invoice endpoint - QPay Course client secret:', qpayCourseClientSecret ? 'SET' : 'NOT_SET');
    console.log('Public create course invoice endpoint - QPay Course client ID:', qpayCourseClientId);

    const requestBody = await req.json();
    console.log('Received course invoice request body:', requestBody);
    
    const { amount, description, receiverCode, invoiceCode, invoiceId, regenerate } = requestBody;
    
    console.log('Parsed course invoice values:', {
      amount,
      amountType: typeof amount,
      description,
      receiverCode,
      invoiceCode,
      invoiceId,
      regenerate
    });

    // Handle free courses (amount = 0)
    if (amount === 0) {
      console.log('Free course detected (amount = 0)');
      return NextResponse.json({
        success: true,
        message: 'Free course - no payment required',
        isFree: true,
        amount: 0,
        description
      });
    }

    // Validate amount - convert to number if it's a string, provide fallback if missing
    let numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // If amount is missing or invalid, use a default amount
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      console.log('Invalid amount detected, using fallback:', { 
        originalAmount: amount, 
        amountType: typeof amount, 
        numericAmount,
        isNaN: isNaN(numericAmount) 
      });
      numericAmount = 1000; // Default amount
    }

    if (!receiverCode) {
      return NextResponse.json({ error: 'Receiver code is required' }, { status: 400 });
    }

    // Use QPay Course service for course purchases
    try {
      console.log('Testing QPay Course service...');
      
      // Test authentication first
      console.log('Testing QPay Course authentication...');
      const qpayCourseService = getQPayCourseService();
      const token = await qpayCourseService['getAccessToken']();
      console.log('QPay Course authentication successful, token obtained');
      
      // Test creating a course invoice
      console.log('Testing QPay Course invoice creation...');
      const envCourseInvoiceCode = process.env.QPAY_COURSE_INVOICE_CODE || process.env.QPAY_INVOICE_CODE || 'PSYCHOMETRICS_INVOICE';
      const courseInvoiceData: QPayInvoiceRequest = {
        invoice_code: envCourseInvoiceCode,
        sender_invoice_no: `COURSE_INV${Date.now()}`,
        invoice_receiver_code: receiverCode,
        invoice_description: description,
        amount: numericAmount,
        callback_url: `${process.env.NEXTAUTH_URL || 'https://setgelsudlal-git-main-saagiisgs-projects.vercel.app'}/api/qpay-course-callback`,
        calculate_vat: false,
        enable_expiry: false,
      };
      
      console.log('Creating course invoice with data:', courseInvoiceData);
      const invoice = await qpayCourseService.createInvoice(courseInvoiceData);
      
      console.log('QPay Course invoice creation successful:', {
        invoice_id: invoice.invoice_id,
        qr_image: invoice.qr_image ? 'Generated' : 'Not generated',
        qr_text: invoice.qr_text ? 'Generated' : 'Not generated'
      });
      
      return NextResponse.json({
        success: true,
        message: 'Course QPay invoice created successfully',
        isTestMode: false,
        invoice_id: invoice.invoice_id,
        qr_image: invoice.qr_image,
        qr_text: invoice.qr_text,
        deeplink: invoice.urls?.deeplink || invoice.qr_text,
        web_url: invoice.urls?.web || invoice.qr_text,
        deeplink_url: invoice.urls?.deeplink || invoice.qr_text,
        amount: numericAmount,
        testMode: false,
        note: 'Course QPay payment - scan QR code to pay',
        serviceType: 'course'
      });
      
    } catch (error: any) {
      console.error('QPay Course invoice creation failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Return error response
      return NextResponse.json({ 
        error: 'Failed to create course payment invoice',
        details: error.message,
        success: false
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Public create course invoice error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create course QPay invoice';
    if (error.message.includes('Bad Request')) {
      errorMessage = 'Invalid course QPay request parameters. Please check your configuration.';
    } else if (error.message.includes('Unauthorized')) {
      errorMessage = 'Course QPay authentication failed. Please check your credentials.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Course QPay request timed out. Please try again.';
    } else {
      errorMessage = error.message || 'Failed to create course QPay invoice';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      success: false,
      details: error.message
    }, { status: 500 });
  }
} 