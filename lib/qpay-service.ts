import axios from 'axios';

// QPay API Configuration
const QPAY_BASE_URL = 'https://merchant.qpay.mn/v2';

// QPay Credentials - Test System
const QPAY_TEST_CONFIG = {
  client_id: process.env.QPAY_TEST_CLIENT_ID || 'PSYCHOMETRICS',
  client_secret: process.env.QPAY_TEST_CLIENT_SECRET || 'iIxpGxUu',
  invoice_code: process.env.QPAY_TEST_INVOICE_CODE || 'PSYCHOMETRICS_INVOICE',
  callback_url: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000/api/test-payment/callback'
    : (process.env.QPAY_CALLBACK_URL || 'https://setgelsudlal-git-main-saagiisgs-projects.vercel.app/api/test-payment/callback')
};

// QPay Credentials - Course System
const QPAY_COURSE_CONFIG = {
  client_id: process.env.QPAY_COURSE_CLIENT_ID || 'JAVZAN_B',
  client_secret: process.env.QPAY_COURSE_CLIENT_SECRET || 'fGJp4FEz',
  invoice_code: process.env.QPAY_COURSE_INVOICE_CODE || 'JAVZAN_B_INVOICE',
  callback_url: process.env.QPAY_COURSE_CALLBACK_URL || 'https://setgelsudlal-git-main-saagiisgs-projects.vercel.app/api/course-payment/callback'
};

// Types
export interface QPayTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface QPayInvoiceRequest {
  invoice_code: string;
  sender_invoice_no: string;
  invoice_receiver_code: string;
  invoice_description: string;
  amount: number;
  callback_url: string;
  lines: Array<{
    line_description: string;
    line_quantity: number;
    line_unit_price: number;
    amount: number;
  }>;
}

export interface QPayInvoiceResponse {
  invoice_id: string;
  qr_image: string;
  qr_text: string;
  deeplink: string;
  urls: {
    web: string;
    deeplink: string;
  };
}

export interface QPayPaymentCheckRequest {
  object_type: 'INVOICE';
  object_id: string;
}

export interface QPayPaymentResponse {
  payment_id: string;
  payment_date: string;
  payment_status: 'NEW' | 'FAILED' | 'PAID' | 'REFUNDED';
  payment_fee: number;
  payment_amount: number;
  payment_currency: string;
  payment_wallet: string;
  payment_name: string;
  payment_description: string;
  qr_code: string;
  paid_by: 'P2P' | 'CARD';
  object_type: string;
  object_id: string;
}

export interface QPayPaymentCheckResponse {
  count: number;
  rows: QPayPaymentResponse[];
}

export interface QPayRefundRequest {
  payment_id: string;
  amount: number;
}

export interface QPayPaymentListRequest {
  start_date: string;
  end_date: string;
}

// QPay Service Class
class QPayService {
  private config: typeof QPAY_TEST_CONFIG | typeof QPAY_COURSE_CONFIG;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(type: 'test' | 'course') {
    this.config = type === 'test' ? QPAY_TEST_CONFIG : QPAY_COURSE_CONFIG;
    
    // Debug: Log configuration
    console.log(`QPay ${type} config:`, {
      client_id: this.config.client_id,
      client_secret: this.config.client_secret ? '***' : 'NOT_SET',
      invoice_code: this.config.invoice_code,
      callback_url: this.config.callback_url
    });
  }

  // 1. Get Access Token
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    // Check if we have a refresh token
    if (this.refreshToken) {
      try {
        const newToken = await this.refreshAccessToken();
        return newToken;
      } catch (error) {
        console.log('Refresh token failed, getting new token');
      }
    }

    // Get new token
    try {
      console.log('Getting new QPay access token...');
      
      // Use Basic Auth method (this is what works with your credentials)
      const basicAuth = Buffer.from(`${this.config.client_id}:${this.config.client_secret}`).toString('base64');
      
      const response = await axios.post(`${QPAY_BASE_URL}/auth/token`, {
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        }
      });

      const data: QPayTokenResponse = response.data;
      
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Expire 1 minute early
      
      console.log('QPay access token obtained successfully');
      return this.accessToken;
      
    } catch (error: any) {
      console.error('Failed to get QPay access token:', error.response?.data || error.message);
      throw new Error(`QPay authentication failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // 2. Refresh Token
  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      console.log('Refreshing QPay access token...');
      
      const response = await axios.post(`${QPAY_BASE_URL}/auth/refresh`, {
        refresh_token: this.refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data: QPayTokenResponse = response.data;
      
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
      
      console.log('QPay access token refreshed successfully');
      return this.accessToken;
      
    } catch (error: any) {
      console.error('Failed to refresh QPay access token:', error.response?.data || error.message);
      // Clear invalid tokens
      this.accessToken = null;
      this.refreshToken = null;
      throw new Error(`QPay token refresh failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // 3. Create Invoice
  async createInvoice(invoiceData: Omit<QPayInvoiceRequest, 'invoice_code' | 'callback_url'>): Promise<QPayInvoiceResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
      const requestData: QPayInvoiceRequest = {
        ...invoiceData,
        invoice_code: this.config.invoice_code,
        callback_url: this.config.callback_url
      };

      console.log('Creating QPay invoice:', JSON.stringify(requestData, null, 2));
      console.log('Callback URL being sent to QPay:', this.config.callback_url);
      console.log('Invoice code being sent to QPay:', this.config.invoice_code);
      
      const response = await axios.post(`${QPAY_BASE_URL}/invoice`, requestData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('QPay invoice created successfully:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('Failed to create QPay invoice - Full error:', error);
      console.error('Error response data:', error.response?.data);
      
      let errorMessage = 'Unknown error';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.toString) {
        errorMessage = error.toString();
      } else {
        errorMessage = JSON.stringify(error);
      }
      
      console.error('Final error message:', errorMessage);
      throw new Error(`QPay invoice creation failed: ${errorMessage}`);
    }
  }

  // 4. Check Payment Status
  async checkPayment(invoiceId: string): Promise<QPayPaymentCheckResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
      const requestData: QPayPaymentCheckRequest = {
        object_type: 'INVOICE',
        object_id: invoiceId
      };

      console.log('Checking QPay payment for invoice:', invoiceId);
      
      const response = await axios.post(`${QPAY_BASE_URL}/payment/check`, requestData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('QPay payment check result:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('Failed to check QPay payment:', error.response?.data || error.message);
      throw new Error(`QPay payment check failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // 5. Cancel Invoice
  async cancelInvoice(invoiceId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      console.log('Cancelling QPay invoice:', invoiceId);
      
      const response = await axios.post(`${QPAY_BASE_URL}/invoice/cancel`, {
        invoice_id: invoiceId
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('QPay invoice cancelled successfully:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('Failed to cancel QPay invoice:', error.response?.data || error.message);
      throw new Error(`QPay invoice cancellation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // 6. Refund Payment
  async refundPayment(paymentId: string, amount: number): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      const requestData: QPayRefundRequest = {
        payment_id: paymentId,
        amount: amount
      };

      console.log('Refunding QPay payment:', requestData);
      
      const response = await axios.post(`${QPAY_BASE_URL}/payment/refund`, requestData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('QPay payment refunded successfully:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('Failed to refund QPay payment:', error.response?.data || error.message);
      throw new Error(`QPay payment refund failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // 7. List Payments
  async listPayments(startDate: string, endDate: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      const requestData: QPayPaymentListRequest = {
        start_date: startDate,
        end_date: endDate
      };

      console.log('Listing QPay payments:', requestData);
      
      const response = await axios.post(`${QPAY_BASE_URL}/payment/list`, requestData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('QPay payments listed successfully:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('Failed to list QPay payments:', error.response?.data || error.message);
      throw new Error(`QPay payment listing failed: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Service instances
let testQPayService: QPayService | null = null;
let courseQPayService: QPayService | null = null;

// Factory functions
export function getTestQPayService(): QPayService {
  if (!testQPayService) {
    testQPayService = new QPayService('test');
  }
  return testQPayService;
}

export function getCourseQPayService(): QPayService {
  if (!courseQPayService) {
    courseQPayService = new QPayService('course');
  }
  return courseQPayService;
}

 