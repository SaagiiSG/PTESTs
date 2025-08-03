import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Debugging QPay authentication...');
    
    // Check environment variables
    const envVars = {
      QPAY_CLIENT_ID: process.env.QPAY_CLIENT_ID || 'NOT_SET',
      QPAY_CLIENT_SECRET: process.env.QPAY_CLIENT_SECRET || 'NOT_SET',
      QPAY_BASE_URL: process.env.QPAY_BASE_URL || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'development'
    };

    console.log('Environment variables:', {
      ...envVars,
      QPAY_CLIENT_SECRET: envVars.QPAY_CLIENT_SECRET === 'NOT_SET' ? 'NOT_SET' : '***'
    });

    // Check if credentials are set
    if (envVars.QPAY_CLIENT_ID === 'NOT_SET' || envVars.QPAY_CLIENT_SECRET === 'NOT_SET') {
      return NextResponse.json({
        success: false,
        error: 'QPay credentials not configured',
        details: 'QPAY_CLIENT_ID or QPAY_CLIENT_SECRET is not set',
        envVars: {
          ...envVars,
          QPAY_CLIENT_SECRET: '***'
        }
      }, { status: 400 });
    }

    // Test basic authentication
    const baseUrl = envVars.QPAY_BASE_URL;
    const username = envVars.QPAY_CLIENT_ID;
    const password = envVars.QPAY_CLIENT_SECRET;

    console.log('Testing QPay authentication with:', {
      baseUrl,
      username,
      password: '***'
    });

    // Try Basic Authentication
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
    
    console.log('Making authentication request...');
    
    const response = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'QPay authentication failed',
        details: `HTTP ${response.status}: ${response.statusText}`,
        responseBody: responseText,
        envVars: {
          ...envVars,
          QPAY_CLIENT_SECRET: '***'
        }
      }, { status: 500 });
    }

    // Try to parse JSON response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON response from QPay',
        details: 'Response is not valid JSON',
        responseBody: responseText,
        envVars: {
          ...envVars,
          QPAY_CLIENT_SECRET: '***'
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'QPay authentication successful',
      accessToken: responseData.access_token ? '***' : 'NOT_SET',
      expiresIn: responseData.expires_in,
      tokenType: responseData.token_type,
      envVars: {
        ...envVars,
        QPAY_CLIENT_SECRET: '***'
      }
    });

  } catch (error: any) {
    console.error('QPay debug error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'QPay debug failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 