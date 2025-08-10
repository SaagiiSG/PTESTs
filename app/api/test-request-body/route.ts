import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Test Request Body Endpoint ===');
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Try to read the request body
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('Request body parsed successfully:', requestBody);
    } catch (error) {
      console.log('Error parsing request body:', error);
      requestBody = null;
    }
    
    // Try to read as text
    let requestText;
    try {
      requestText = await request.text();
      console.log('Request body as text:', requestText);
    } catch (error) {
      console.log('Error reading request as text:', error);
      requestText = null;
    }
    
    return NextResponse.json({
      success: true,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: requestBody,
      bodyText: requestText,
      hasBody: !!requestBody || !!requestText,
    });
  } catch (error) {
    console.error('Error in test-request-body:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
