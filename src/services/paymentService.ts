import { apiClient } from './api';
import type { ApiResponse } from '../types';

interface PaymentRequest {
  bookingId: number;
  paymentMethod: 'MOMO' | 'VNPAY' | 'CASH';
  bankCode?: string;
}

interface PaymentResponse {
  success: boolean;
  paymentMethod: string;
  paymentUrl?: string;
  qrCode?: string;
  orderId?: string;
  bookingId: number;
  message?: string;
  error?: string;
}

export const paymentService = {
  // Process payment (new unified method)
  processPayment: (request: PaymentRequest): Promise<ApiResponse<PaymentResponse>> => {
    const params = new URLSearchParams();
    params.append('bookingId', request.bookingId.toString());
    params.append('paymentMethod', request.paymentMethod);
    if (request.bankCode) {
      params.append('bankCode', request.bankCode);
    }
    
    return apiClient.post('/api/payment/process', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  // Retry payment for existing booking
  retryPayment: (request: PaymentRequest): Promise<ApiResponse<PaymentResponse>> => {
    const params = new URLSearchParams();
    params.append('bookingId', request.bookingId.toString());
    params.append('paymentMethod', request.paymentMethod);
    if (request.bankCode) {
      params.append('bankCode', request.bankCode);
    }
    
    return apiClient.post('/api/payment/retry', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  // Create Momo QR (legacy method - keep for backward compatibility)
  createMomoQR: (bookingId: number): Promise<ApiResponse<any>> =>
    apiClient.get(`/api/payment/momo?bookingId=${bookingId}`),

  // Create VNPay payment (legacy method - keep for backward compatibility)
  createVnPayPayment: (bookingId: string, bankCode?: string): Promise<ApiResponse<any>> =>
    apiClient.get('/api/payment/vnpay', { 
      params: { 
        bookingId, 
        bankCode: bankCode || '' 
      } 
    }),

  // Handle VNPay return
  handleVnPayReturn: (params: any): Promise<ApiResponse<any>> =>
    apiClient.get('/api/payment/vnpay-return', { params }),

  // Handle MoMo return (frontend redirect -> backend verification)
  handleMomoReturn: (params: any): Promise<ApiResponse<any>> =>
    apiClient.get('/api/payment/momo-return', { params }),

  // Handle Momo IPN
  handleMomoIpn: (params: any): Promise<ApiResponse<any>> =>
    apiClient.post('/api/payment/momo-ipn', params),
};

export type { PaymentRequest, PaymentResponse };