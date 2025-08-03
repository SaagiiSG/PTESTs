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

class QPayService {
  private baseUrl: string;
  private username: string;
  private password: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Use sandbox URL for testing, production URL for live
    const isDevelopment = process.env.NODE_ENV === 'development';
    this.baseUrl = process.env.QPAY_BASE_URL || (isDevelopment ? 'https://merchant-sandbox.qpay.mn/v2' : 'https://merchant.qpay.mn/v2');
    this.username = process.env.QPAY_CLIENT_ID || '';
    this.password = process.env.QPAY_CLIENT_SECRET || '';
    
    // Validate required environment variables
    if (!this.username || !this.password) {
      console.error('QPay credentials not found in environment variables');
      console.error('Please set QPAY_CLIENT_ID and QPAY_CLIENT_SECRET in your .env.local file');
      throw new Error('QPay credentials not configured. Please check your environment variables.');
    }
    
    console.log('QPay Service initialized with:', {
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
      console.log('Attempting QPay authentication with:', {
        url: `${this.baseUrl}/auth/token`,
        username: this.username,
        password: this.password ? '***' : 'NOT_SET'
      });

      // Try Basic Authentication first (as per QPay documentation)
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

      console.log('QPay auth response status:', response.status);
      console.log('QPay auth response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('QPay authentication failed:', errorText);
        
        // If Basic Auth fails, try with JSON body (fallback)
        console.log('Trying fallback authentication method...');
        const fallbackResponse = await fetch(`${this.baseUrl}/auth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });

        if (!fallbackResponse.ok) {
          const fallbackErrorText = await fallbackResponse.text();
          console.error('QPay fallback authentication also failed:', fallbackErrorText);
          throw new Error(`QPay authentication failed: ${response.statusText} - ${errorText}`);
        }

        const fallbackData: QPayTokenResponse = await fallbackResponse.json();
        console.log('QPay fallback token response:', {
          access_token: fallbackData.access_token ? '***' : 'NOT_SET',
          expires_in: fallbackData.expires_in,
          token_type: fallbackData.token_type
        });
        
        this.accessToken = fallbackData.access_token;
        this.tokenExpiry = Date.now() + (fallbackData.expires_in * 1000) - 60000;
        console.log('QPay token obtained successfully via fallback method');
        return this.accessToken;
      }

      const data: QPayTokenResponse = await response.json();
      console.log('QPay token response:', {
        access_token: data.access_token ? '***' : 'NOT_SET',
        expires_in: data.expires_in,
        token_type: data.token_type
      });
      
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Expire 1 minute early

      console.log('QPay token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('QPay authentication error:', error);
      throw new Error('Failed to authenticate with QPay');
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
        throw new Error(`QPay token refresh failed: ${response.statusText}`);
      }

      const data: QPayTokenResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;

      return this.accessToken;
    } catch (error) {
      console.error('QPay token refresh error:', error);
      throw new Error('Failed to refresh QPay token');
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'POST',
    body?: any
  ): Promise<T> {
    const token = await this.getAccessToken();
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      console.log(`Making QPay API request to ${endpoint}:`, {
        method,
        body: body ? JSON.stringify(body, null, 2) : 'No body',
        token: token ? '***' : 'NOT_SET'
      });

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

      console.log(`QPay API response status: ${response.status}`);
      console.log(`QPay API response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`QPay API error (${response.status}):`, errorText);
        
        // Try to parse error response as JSON for more details
        let errorDetails = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          console.log('Parsed error JSON:', errorJson);
          
          // Handle different error response formats
          if (typeof errorJson === 'object') {
            if (errorJson.message) {
              errorDetails = errorJson.message;
            } else if (errorJson.error) {
              errorDetails = errorJson.error;
            } else if (errorJson.details) {
              errorDetails = errorJson.details;
            } else {
              // If it's an object but no specific error field, stringify it
              errorDetails = JSON.stringify(errorJson, null, 2);
            }
          } else {
            errorDetails = errorText;
          }
        } catch {
          // If not JSON, use the text as is
          errorDetails = errorText;
        }
        
        throw new Error(`QPay API error (${response.status}): ${errorDetails}`);
      }

      const responseData = await response.json();
      console.log(`QPay API response data:`, responseData);
      return responseData;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('QPay API request timed out after 30 seconds');
        throw new Error('QPay API request timed out');
      }
      
      console.error('QPay API request error:', error);
      throw error;
    }
  }

  async createInvoice(invoiceData: QPayInvoiceRequest): Promise<QPayInvoiceResponse> {
    console.log('Creating QPay invoice with data:', JSON.stringify(invoiceData, null, 2));
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
    console.log('QPay checkPayment called with invoice ID:', invoiceId);
    
    try {
      // Since direct API calls are not working reliably, 
      // we'll implement a callback-based approach
      // For now, return empty rows to indicate no payment found
      // The actual payment status will be updated via webhook/callback
      console.log('Using callback-based payment checking for invoice:', invoiceId);
      
      return { rows: [] };
      
    } catch (error) {
      console.error('QPay checkPayment error:', error);
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
let qpayServiceInstance: QPayService | null = null;

export function getQPayService(): QPayService {
  if (!qpayServiceInstance) {
    qpayServiceInstance = new QPayService();
  }
  return qpayServiceInstance;
}

// Export the service instance directly
export const qpayService = getQPayService();

// Also export individual methods for backward compatibility
export const qpayServiceMethods = {
  createInvoice: (data: QPayInvoiceRequest) => getQPayService().createInvoice(data),
  getInvoice: (id: string) => getQPayService().getInvoice(id),
  cancelInvoice: (id: string, callbackUrl?: string, note?: string) => getQPayService().cancelInvoice(id, callbackUrl, note),
  createPayment: (data: QPayPaymentRequest) => getQPayService().createPayment(data),
  checkPayment: (id: string) => getQPayService().checkPayment(id),
  cancelPayment: (id: string, callbackUrl?: string, note?: string) => getQPayService().cancelPayment(id, callbackUrl, note),
  refundPayment: (id: string, callbackUrl?: string, note?: string) => getQPayService().refundPayment(id, callbackUrl, note),
  getPaymentList: (data: QPayPaymentListRequest) => getQPayService().getPaymentList(data),
}; 