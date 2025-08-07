import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing QPay authentication with different environments and methods...');
    
    const testClientId = process.env.QPAY_TEST_CLIENT_ID || 'PSYCHOMETRICS';
    const testClientSecret = process.env.QPAY_TEST_CLIENT_SECRET || 'iIxpGxUu';
    
    const courseClientId = process.env.QPAY_COURSE_CLIENT_ID || 'JAVZAN_B';
    const courseClientSecret = process.env.QPAY_COURSE_CLIENT_SECRET || 'fGJp4FEz';
    
    console.log('Test credentials:', { clientId: testClientId, clientSecret: '***' });
    console.log('Course credentials:', { clientId: courseClientId, clientSecret: '***' });
    
    const results: any = {
      production_test_credentials_body: null,
      production_test_credentials_basic_auth: null,
      production_course_credentials_body: null,
      production_course_credentials_basic_auth: null,
      merchant_sandbox_test_credentials_body: null,
      merchant_sandbox_test_credentials_basic_auth: null,
      merchant_sandbox_course_credentials_body: null,
      merchant_sandbox_course_credentials_basic_auth: null
    };
    
    // Test with production environment - credentials in body
    try {
      console.log('Testing with production environment (test credentials in body)...');
      const testResponse = await axios.post('https://merchant.qpay.mn/v2/auth/token', {
        client_id: testClientId,
        client_secret: testClientSecret
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      results.production_test_credentials_body = {
        success: true,
        response: testResponse.data
      };
      console.log('Production test credentials in body worked!');
      
    } catch (error: any) {
      results.production_test_credentials_body = {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      };
      console.log('Production test credentials in body failed:', error.response?.data);
    }
    
    // Test with production environment - Basic Auth
    try {
      console.log('Testing with production environment (test credentials Basic Auth)...');
      const basicAuth = Buffer.from(`${testClientId}:${testClientSecret}`).toString('base64');
      const testResponse = await axios.post('https://merchant.qpay.mn/v2/auth/token', {
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        }
      });
      
      results.production_test_credentials_basic_auth = {
        success: true,
        response: testResponse.data
      };
      console.log('Production test credentials Basic Auth worked!');
      
    } catch (error: any) {
      results.production_test_credentials_basic_auth = {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      };
      console.log('Production test credentials Basic Auth failed:', error.response?.data);
    }
    
    // Test with production environment (course credentials in body)
    try {
      console.log('Testing with production environment (course credentials in body)...');
      const courseResponse = await axios.post('https://merchant.qpay.mn/v2/auth/token', {
        client_id: courseClientId,
        client_secret: courseClientSecret
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      results.production_course_credentials_body = {
        success: true,
        response: courseResponse.data
      };
      console.log('Production course credentials in body worked!');
      
    } catch (error: any) {
      results.production_course_credentials_body = {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      };
      console.log('Production course credentials in body failed:', error.response?.data);
    }
    
    // Test with production environment (course credentials Basic Auth)
    try {
      console.log('Testing with production environment (course credentials Basic Auth)...');
      const basicAuth = Buffer.from(`${courseClientId}:${courseClientSecret}`).toString('base64');
      const courseResponse = await axios.post('https://merchant.qpay.mn/v2/auth/token', {
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        }
      });
      
      results.production_course_credentials_basic_auth = {
        success: true,
        response: courseResponse.data
      };
      console.log('Production course credentials Basic Auth worked!');
      
    } catch (error: any) {
      results.production_course_credentials_basic_auth = {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      };
      console.log('Production course credentials Basic Auth failed:', error.response?.data);
    }
    
    // Test with merchant-sandbox environment - credentials in body
    try {
      console.log('Testing with merchant-sandbox environment (test credentials in body)...');
      const testResponse = await axios.post('https://merchant-sandbox.qpay.mn/v2/auth/token', {
        client_id: testClientId,
        client_secret: testClientSecret
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      results.merchant_sandbox_test_credentials_body = {
        success: true,
        response: testResponse.data
      };
      console.log('Merchant-sandbox test credentials in body worked!');
      
    } catch (error: any) {
      results.merchant_sandbox_test_credentials_body = {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      };
      console.log('Merchant-sandbox test credentials in body failed:', error.response?.data);
    }
    
    // Test with merchant-sandbox environment - Basic Auth
    try {
      console.log('Testing with merchant-sandbox environment (test credentials Basic Auth)...');
      const basicAuth = Buffer.from(`${testClientId}:${testClientSecret}`).toString('base64');
      const testResponse = await axios.post('https://merchant-sandbox.qpay.mn/v2/auth/token', {
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        }
      });
      
      results.merchant_sandbox_test_credentials_basic_auth = {
        success: true,
        response: testResponse.data
      };
      console.log('Merchant-sandbox test credentials Basic Auth worked!');
      
    } catch (error: any) {
      results.merchant_sandbox_test_credentials_basic_auth = {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      };
      console.log('Merchant-sandbox test credentials Basic Auth failed:', error.response?.data);
    }
    
    // Test with merchant-sandbox environment (course credentials in body)
    try {
      console.log('Testing with merchant-sandbox environment (course credentials in body)...');
      const courseResponse = await axios.post('https://merchant-sandbox.qpay.mn/v2/auth/token', {
        client_id: courseClientId,
        client_secret: courseClientSecret
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      results.merchant_sandbox_course_credentials_body = {
        success: true,
        response: courseResponse.data
      };
      console.log('Merchant-sandbox course credentials in body worked!');
      
    } catch (error: any) {
      results.merchant_sandbox_course_credentials_body = {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      };
      console.log('Merchant-sandbox course credentials in body failed:', error.response?.data);
    }
    
    // Test with merchant-sandbox environment (course credentials Basic Auth)
    try {
      console.log('Testing with merchant-sandbox environment (course credentials Basic Auth)...');
      const basicAuth = Buffer.from(`${courseClientId}:${courseClientSecret}`).toString('base64');
      const courseResponse = await axios.post('https://merchant-sandbox.qpay.mn/v2/auth/token', {
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        }
      });
      
      results.merchant_sandbox_course_credentials_basic_auth = {
        success: true,
        response: courseResponse.data
      };
      console.log('Merchant-sandbox course credentials Basic Auth worked!');
      
    } catch (error: any) {
      results.merchant_sandbox_course_credentials_basic_auth = {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      };
      console.log('Merchant-sandbox course credentials Basic Auth failed:', error.response?.data);
    }
    
    return NextResponse.json({
      success: true,
      results,
      message: 'QPay authentication test completed for all environments and methods'
    });

  } catch (error: any) {
    console.error('QPay authentication test failed:', error.response?.data || error.message);
    
    return NextResponse.json({
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    }, { status: 500 });
  }
} 