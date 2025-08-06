import { NextRequest, NextResponse } from 'next/server';
import { getQPayService } from '@/lib/qpay';

export async function POST(req: NextRequest) {
  try {
    // Check if QPay Course credentials are properly configured
    const qpayCourseClientSecret = process.env.QPAY_COURSE_CLIENT_SECRET;
    const qpayCourseClientId = process.env.QPAY_COURSE_CLIENT_ID;
    
    console.log('Public create course invoice V2 endpoint - QPay Course client secret:', qpayCourseClientSecret ? 'SET' : 'NOT_SET');
    console.log('Public create course invoice V2 endpoint - QPay Course client ID:', qpayCourseClientId);

    const requestBody = await req.json();
    console.log('Received course invoice V2 request body:', requestBody);
    
    const { amount, description, receiverCode, invoiceCode, invoiceId, regenerate } = requestBody;
    
    console.log('Parsed course invoice V2 values:', {
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

    // Use QPay Course service for course purchases with course credentials
    try {
      console.log('Testing QPay Course service with course credentials...');
      
      // Test authentication first with course credentials
      console.log('Testing QPay Course authentication with course credentials...');
      
      // Create a temporary QPay service with course credentials
      const baseUrl = process.env.QPAY_COURSE_BASE_URL || 'https://merchant.qpay.mn/v2';
      const cleanBaseUrl = baseUrl.includes('/auth/token') ? baseUrl.replace('/auth/token', '') : baseUrl;
      const username = qpayCourseClientId;
      const password = qpayCourseClientSecret;
      
      if (!username || !password) {
        throw new Error('Course QPay credentials not configured');
      }
      
      console.log('Using course credentials:', { username, password: password ? '***' : 'NOT_SET' });
      
      // Test authentication
      const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
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
        const errorText = await authResponse.text();
        throw new Error(`Course QPay authentication failed: ${authResponse.statusText} - ${errorText}`);
      }

      const authData = await authResponse.json();
      console.log('Course QPay authentication successful, token obtained');
      
      // Test creating a course invoice with course credentials
      console.log('Testing QPay Course invoice creation with course credentials...');
      const envCourseInvoiceCode = process.env.QPAY_COURSE_INVOICE_CODE || 'PSYCHOMETRICS_COURSE_INVOICE';
      
      const courseInvoiceData = {
        invoice_code: envCourseInvoiceCode,
        sender_invoice_no: `COURSE_INV${Date.now()}`,
        invoice_receiver_code: receiverCode,
        invoice_description: description,
        amount: numericAmount,
        callback_url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : (process.env.NEXTAUTH_URL || 'https://setgelsudlal-git-main-saagiisgs-projects.vercel.app')}/api/qpay-course-callback`,
        calculate_vat: false,
        enable_expiry: false,
      };
      
      console.log('Creating course invoice with course credentials:', courseInvoiceData);
      
      // Create invoice using course credentials
      const invoiceResponse = await fetch(`${cleanBaseUrl}/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.access_token}`,
        },
        body: JSON.stringify(courseInvoiceData),
      });

      if (!invoiceResponse.ok) {
        const errorText = await invoiceResponse.text();
        throw new Error(`Course QPay invoice creation failed: ${invoiceResponse.statusText} - ${errorText}`);
      }

      const invoice = await invoiceResponse.json();
      
      console.log('QPay Course invoice creation successful with course credentials:', {
        invoice_id: invoice.invoice_id,
        qr_image: invoice.qr_image ? 'Generated' : 'Not generated',
        qr_text: invoice.qr_text ? 'Generated' : 'Not generated'
      });
      
      return NextResponse.json({
        success: true,
        message: 'Course QPay invoice created successfully with course credentials',
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
        serviceType: 'course',
        usingCourseCredentials: true
      });
      
    } catch (error: any) {
      console.error('QPay Course invoice creation failed with course credentials:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Return error response
      return NextResponse.json({ 
        error: 'Failed to create course payment invoice with course credentials',
        details: error.message,
        success: false
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Public create course invoice V2 error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create course QPay invoice with course credentials';
    if (error.message.includes('Bad Request')) {
      errorMessage = 'Invalid course QPay request parameters. Please check your configuration.';
    } else if (error.message.includes('Unauthorized')) {
      errorMessage = 'Course QPay authentication failed. Please check your course credentials.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Course QPay request timed out. Please try again.';
    } else {
      errorMessage = error.message || 'Failed to create course QPay invoice with course credentials';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      success: false,
      details: error.message
    }, { status: 500 });
  }
} 