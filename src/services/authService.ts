import { apiClient } from './api';
import type { LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from '../types';
export const authService = {
  login: (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    apiClient.post('/api/auth/login', credentials),
  register: (userData: RegisterRequest): Promise<ApiResponse<void>> =>
    apiClient.post('/api/auth/register', userData).then((resp) => {
      // Normalize backend that returns HTTP 200 but body.status = 4xx
      const bodyStatus = (resp as any)?.status;
      if (typeof bodyStatus === 'number' && bodyStatus >= 400) {
        return Promise.reject({ response: { status: bodyStatus, data: resp } });
      }
      return resp;
    }),
  getAccessToken: (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    apiClient.post('/api/auth/accessToken', credentials),
  refreshToken: (refreshToken: string): Promise<ApiResponse<LoginResponse>> =>
    apiClient.post('/api/auth/refreshToken', refreshToken),
  logout: (): Promise<ApiResponse<void>> =>
    apiClient.post('/api/auth/logout'),
};