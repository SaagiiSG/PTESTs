export interface QPayTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface QPayInvoiceRequest {
  invoice_code: string;
  sender_invoice_no: string;
  sender_branch_code?: string;
  sender_branch_data?: object;
  sender_staff_code?: string;
  sender_staff_data?: object;
  sender_terminal_code?: string;
  sender_terminal_data?: object;
  invoice_receiver_code: string;
  invoice_receiver_data?: object;
  invoice_description: string;
  invoice_due_date?: string;
  enable_expiry?: boolean;
  expiry_date?: string;
  calculate_vat?: boolean;
  tax_customer_code?: string;
  line_tax_code?: string;
  amount: number;
  callback_url?: string;
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

export interface QPayPaymentRequest {
  amount: number;
  currency: string;
  merchant_id: string;
  merchant_terminal_id?: string;
  merchant_staff_id?: string;
  merchant_branch_id?: string;
  merchant_branch_code?: string;
  merchant_terminal_code?: string;
  merchant_staff_code?: string;
  object_type: 'INVOICE' | 'QR' | 'MERCHANT';
  object_id: string;
  callback_url?: string;
  note?: string;
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

export interface QPayPaymentListRequest {
  object_type: 'MERCHANT' | 'INVOICE' | 'QR';
  object_id: string;
  merchant_branch_code?: string;
  merchant_terminal_code?: string;
  merchant_staff_code?: string;
  offset?: {
    page_number: number;
    page_limit: number;
  };
}

export interface QPayRefundRequest {
  callback_url?: string;
  note?: string;
}

class QPayCourseService {
  private baseUrl: string;
  private username: string;
  private password: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Use course-specific QPay credentials
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Fix the base URL if it's pointing to auth endpoint
    let baseUrl = process.env.QPAY_COURSE_BASE_URL || (isDevelopment ? 'https://merchant-sandbox.qpay.mn/v2' : 'https://merchant.qpay.mn/v2');
    
    // If the URL contains /auth/token, remove it to get the base URL
    if (baseUrl.includes('/auth/token')) {
      baseUrl = baseUrl.replace('/auth/token', '');
    }
    
    this.baseUrl = baseUrl;
    this.username = process.env.QPAY_COURSE_CLIENT_ID || '';
    this.password = process.env.QPAY_COURSE_CLIENT_SECRET || '';
    
    // Validate required environment variables
    if (!this.username || !this.password) {
      console.error('QPay Course credentials not found in environment variables');
      console.error('Please set QPAY_COURSE_CLIENT_ID and QPAY_COURSE_CLIENT_SECRET in your .env.local file');
      throw new Error('QPay Course credentials not configured. Please check your environment variables.');
    }
    
    console.log('QPay Course Service initialized with:', {
      baseUrl: this.baseUrl,
      username: this.username,
      password: this.password ? '***' : 'NOT_SET',
      environment: process.env.NODE_ENV
    });
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('Attempting QPay Course authentication with:', {
        url: `${this.baseUrl}/auth/token`,
        username: this.username,
        password: this.password ? '***' : 'NOT_SET'
      });

      // Use Basic Auth authentication for QPay Course
      const basicAuth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
        }),
      });

      console.log('QPay Course auth response status:', response.status);
      console.log('QPay Course auth response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('QPay Course authentication failed:', errorText);
        throw new Error(`QPay Course authentication failed: ${response.statusText} - ${errorText}`);
      }

      const data: QPayTokenResponse = await response.json();
      console.log('QPay Course token response:', {
        access_token: data.access_token ? '***' : 'NOT_SET',
        expires_in: data.expires_in,
        token_type: data.token_type
      });
      
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Subtract 1 minute for safety
      console.log('QPay Course token obtained successfully');
      return this.accessToken;
    } catch (error: any) {
      console.error('QPay Course authentication error:', error);
      throw error;
    }
  }

  private async refreshToken(refreshToken: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data: QPayTokenResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
      return this.accessToken;
    } catch (error: any) {
      console.error('QPay Course token refresh error:', error);
      throw error;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'POST',
    body?: any
  ): Promise<T> {
    const token = await this.getAccessToken();
    
    // Set up timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      console.log(`QPay Course API ${method} ${endpoint} response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`QPay Course API ${method} ${endpoint} failed:`, errorText);
        throw new Error(`QPay Course API request failed: ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log(`QPay Course API response data:`, responseData);
      return responseData;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('QPay Course API request timed out after 30 seconds');
        throw new Error('QPay Course API request timed out');
      }
      
      console.error('QPay Course API request error:', error);
      throw error;
    }
  }

  async createInvoice(invoiceData: QPayInvoiceRequest): Promise<QPayInvoiceResponse> {
    console.log('Creating QPay Course invoice with data:', JSON.stringify(invoiceData, null, 2));
    return this.makeRequest<QPayInvoiceResponse>('/invoice', 'POST', invoiceData);
  }

  async getInvoice(invoiceId: string): Promise<any> {
    return this.makeRequest(`/invoice/${invoiceId}`, 'GET');
  }

  async cancelInvoice(invoiceId: string, callbackUrl?: string, note?: string): Promise<any> {
    return this.makeRequest(`/invoice/${invoiceId}`, 'DELETE', {
      callback_url: callbackUrl,
      note,
    });
  }

  async createPayment(paymentData: QPayPaymentRequest): Promise<QPayPaymentResponse> {
    return this.makeRequest<QPayPaymentResponse>('/payment', 'POST', paymentData);
  }

  async checkPayment(invoiceId: string): Promise<{ rows: QPayPaymentResponse[] }> {
    console.log('QPay Course checkPayment called with invoice ID:', invoiceId);
    
    try {
      // Use the payment list API to check for payments related to this invoice
      const paymentListData: QPayPaymentListRequest = {
        object_type: 'INVOICE',
        object_id: invoiceId,
        offset: {
          page_number: 1,
          page_limit: 100
        }
      };

      console.log('Checking payment list for invoice:', invoiceId);
      const result = await this.getPaymentList(paymentListData);
      
      console.log('Payment list result:', result);
      return result;
      
    } catch (error) {
      console.error('QPay Course checkPayment error:', error);
      throw error;
    }
  }

  async cancelPayment(paymentId: string, callbackUrl?: string, note?: string): Promise<any> {
    return this.makeRequest(`/payment/cancel/${paymentId}`, 'DELETE', {
      callback_url: callbackUrl,
      note,
    });
  }

  async refundPayment(paymentId: string, callbackUrl?: string, note?: string): Promise<any> {
    return this.makeRequest(`/payment/refund/${paymentId}`, 'DELETE', {
      callback_url: callbackUrl,
      note,
    });
  }

  async getPaymentList(listData: QPayPaymentListRequest): Promise<{ rows: QPayPaymentResponse[] }> {
    return this.makeRequest<{ rows: QPayPaymentResponse[] }>('/payment/list', 'POST', listData);
  }
}

// Lazy initialization to avoid instantiation during build
let qpayCourseServiceInstance: QPayCourseService | null = null;

export function getQPayCourseService(): QPayCourseService {
  if (!qpayCourseServiceInstance) {
    qpayCourseServiceInstance = new QPayCourseService();
  }
  return qpayCourseServiceInstance;
}

// Export the service instance directly
export const qpayCourseService = getQPayCourseService();

// Also export individual methods for backward compatibility
export const qpayCourseServiceMethods = {
  createInvoice: (data: QPayInvoiceRequest) => getQPayCourseService().createInvoice(data),
  getInvoice: (id: string) => getQPayCourseService().getInvoice(id),
  cancelInvoice: (id: string, callbackUrl?: string, note?: string) => getQPayCourseService().cancelInvoice(id, callbackUrl, note),
  createPayment: (data: QPayPaymentRequest) => getQPayCourseService().createPayment(data),
  checkPayment: (id: string) => getQPayCourseService().checkPayment(id),
  cancelPayment: (id: string, callbackUrl?: string, note?: string) => getQPayCourseService().cancelPayment(id, callbackUrl, note),
  refundPayment: (id: string, callbackUrl?: string, note?: string) => getQPayCourseService().refundPayment(id, callbackUrl, note),
  getPaymentList: (data: QPayPaymentListRequest) => getQPayCourseService().getPaymentList(data),
}; 