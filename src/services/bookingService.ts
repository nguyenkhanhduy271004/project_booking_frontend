import { apiClient } from './api';
import type { 
  BookingRequest, 
  BookingResponse, 
  BookingStatus,
  PaymentType,
  PageResponse, 
  ApiResponse 
} from '../types';
export const bookingService = {
  createBooking: (bookingData: BookingRequest): Promise<ApiResponse<BookingResponse[]>> =>
    apiClient.post('/api/v1/bookings', bookingData),
  getAllBookings: (params: {
    page?: number;
    size?: number;
    sort?: string;
    deleted?: boolean;
  } = {}): Promise<ApiResponse<PageResponse<BookingResponse>>> =>
    apiClient.get('/api/v1/bookings', { params }),
  getBookingById: (id: number): Promise<ApiResponse<BookingResponse>> =>
    apiClient.get(`/api/v1/bookings/${id}`),
  updateBooking: (id: number, bookingData: BookingRequest): Promise<ApiResponse<BookingResponse>> =>
    apiClient.put(`/api/v1/bookings/${id}`, bookingData),
  deleteBooking: (id: number): Promise<ApiResponse<void>> =>
    apiClient.delete(`/api/v1/bookings/${id}`),
  deleteBookings: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.delete('/api/v1/bookings/ids', ids),
  restoreBooking: (id: number): Promise<ApiResponse<void>> =>
    apiClient.put(`/api/v1/bookings/${id}/restore`),
  restoreBookings: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.put('/api/v1/bookings/restore', ids),
  deleteBookingPermanently: (id: number): Promise<ApiResponse<void>> =>
    apiClient.delete(`/api/v1/bookings/${id}/permanent`),

  deleteBookingsPermanently: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.delete('/api/v1/bookings/permanent', ids),
  getMyBookings: (params: {
    page?: number;
    size?: number;
    sort?: string;
  } = {}): Promise<ApiResponse<PageResponse<BookingResponse>>> =>
    apiClient.get('/api/v1/bookings/my-bookings', { params }),
  getMyBookingById: (id: number): Promise<ApiResponse<BookingResponse>> =>
    apiClient.get(`/api/v1/bookings/my-bookings/${id}`),
  cancelBooking: (id: number): Promise<ApiResponse<void>> =>
    apiClient.put(`/api/v1/bookings/${id}/cancel`),
  
  // Update booking status
  updateBookingStatus: (id: number, status: BookingStatus): Promise<ApiResponse<void>> =>
    apiClient.put(`/api/v1/bookings/${id}/status?status=${status}`),
};
export const paymentService = {
  createMomoPayment: (bookingId: number): Promise<ApiResponse<{ paymentUrl: string; qrCode: string }>> =>
    apiClient.get(`/api/payment/momo?bookingId=${bookingId}`),
  createVnPayPayment: (bookingId: number): Promise<ApiResponse<{ paymentUrl: string }>> =>
    apiClient.get('/api/payment/vnpay', {
      params: {
        bookingId,
        amount: 0,
        bankCode: '',
      }
    }),
  handleVnPayCallback: (params: Record<string, string>): Promise<ApiResponse<void>> =>
    apiClient.get('/api/payment/vnpay-return', { params }),
  handleMomoCallback: (params: Record<string, string>): Promise<ApiResponse<void>> =>
    apiClient.post('/api/payment/momo-ipn', params),
};