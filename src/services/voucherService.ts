import { apiClient } from './api';
import type { Voucher, VoucherCreateRequest, VoucherUpdateRequest, PageResponse, ApiResponse } from '../types';
export const voucherService = {
  // Get all vouchers
  getAllVouchers: (params: {
    page?: number;
    size?: number;
    sort?: string;
  } = {}): Promise<ApiResponse<PageResponse<Voucher>>> =>
    apiClient.get('/api/v1/vouchers', { params }),
  // Get voucher by ID
  getVoucherById: (id: number): Promise<ApiResponse<Voucher>> =>
    apiClient.get(`/api/v1/vouchers/${id}`),
  // Get vouchers by hotel ID
  getVouchersByHotelId: (hotelId: number): Promise<ApiResponse<Voucher[]>> =>
    apiClient.get(`/api/v1/vouchers/hotel/${hotelId}`),
  // Create voucher
  createVoucher: (voucherData: VoucherCreateRequest): Promise<ApiResponse<void>> =>
    apiClient.post('/api/v1/vouchers', voucherData),
  // Update voucher
  updateVoucher: (id: number, voucherData: VoucherUpdateRequest): Promise<ApiResponse<void>> =>
    apiClient.put(`/api/v1/vouchers/${id}`, voucherData),
  // Delete voucher
  deleteVoucher: (id: number): Promise<ApiResponse<void>> =>
    apiClient.delete(`/api/v1/vouchers/${id}`),
  // Delete multiple vouchers (SYSTEM_ADMIN only)
  deleteVouchers: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.delete('/api/v1/vouchers/ids', { data: ids }),
  // Restore voucher (if supported)
  restoreVoucher: (id: number): Promise<ApiResponse<void>> =>
    apiClient.put(`/api/v1/vouchers/${id}/restore`),
  // Restore multiple vouchers (if supported)
  restoreVouchers: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.put('/api/v1/vouchers/restore', ids),
};