import { apiClient } from './api';
import type { ApiResponse, PageResponse, User, UserCreationRequest, UserUpdateRequest } from '../types';

export interface UserInfo {
  id: number;
  username: string;
  fullName: string;
  gender: string;
  birthday: string;
  email: string;
  phone: string;
  type: string;
  status: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOtpPayload {
  otp: number;
  username: string;
}

export interface ResetPasswordPayload {
  password: string;
  repeatPassword: string;
}

export interface GetAllUsersParams {
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
  deleted?: boolean;
}

export const userService = {
  getUserInfo: (): Promise<ApiResponse<UserInfo>> =>
    apiClient.get('/api/v1/users/info'),

  getUserDetail: (userId: number): Promise<ApiResponse<User>> =>
    apiClient.get(`/api/v1/users/${userId}`),
  
  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<void>> =>
    apiClient.put('/api/v1/users/change-password', data),
  
  activeAccount: (username: string): Promise<ApiResponse<void>> =>
    apiClient.post(`/api/v1/users/active-account/${encodeURIComponent(username)}`),
  
  verifyEmail: (username: string): Promise<ApiResponse<void>> =>
    apiClient.post(`/api/v1/users/verify-mail/${encodeURIComponent(username)}`),
  
  verifyOtp: (payload: VerifyOtpPayload): Promise<ApiResponse<void>> =>
    apiClient.post('/api/v1/users/verify-otp', payload),
  
  resetPassword: (username: string, data: ResetPasswordPayload): Promise<ApiResponse<void>> =>
    apiClient.post(`/api/v1/users/reset-password/${encodeURIComponent(username)}`, data),
  
  // Updated method name and parameters
  getAllUsers: (params: GetAllUsersParams = {}): Promise<ApiResponse<PageResponse<User>>> => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.deleted !== undefined) queryParams.append('deleted', params.deleted.toString());
    
    return apiClient.get(`/api/v1/users?${queryParams.toString()}`);
  },
  
  getUserList: (params: {
    page?: number;
    size?: number;
    sort?: string;
  } = {}): Promise<ApiResponse<PageResponse<UserInfo>>> =>
    apiClient.get('/api/v1/users', { params }),

  // Additional methods for UserManagement
  createUser: (data: UserCreationRequest): Promise<ApiResponse<User>> =>
    apiClient.post('/api/v1/users', data),

  updateUser: (id: number, data: Partial<UserUpdateRequest>): Promise<ApiResponse<User>> =>
    apiClient.put('/api/v1/users', { ...data, id }),

  deleteUsers: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.delete('/api/v1/users/ids', { data: ids }),

  deleteUserPermanently: (id: number): Promise<ApiResponse<void>> =>
    apiClient.delete(`/api/v1/users/${id}/permanent`),

  deleteUsersPermanently: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.delete('/api/v1/users/permanent', { data: ids }),

  restoreUsers: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.put('/api/v1/users/restore', ids),

  restoreUser: (id: number): Promise<ApiResponse<void>> =>
    apiClient.put(`/api/v1/users/${id}/restore`),

  // For activating/deactivating users (using update endpoint)
  activateUser: (id: number): Promise<ApiResponse<void>> =>
    apiClient.put('/api/v1/users', { id, status: 'ACTIVE' }),

  deactivateUser: (id: number): Promise<ApiResponse<void>> =>
    apiClient.put('/api/v1/users', { id, status: 'INACTIVE' }),
};