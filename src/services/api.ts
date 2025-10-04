import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from '../types';
import axios from 'axios';
import { toastError } from '../utils/toast';
import { useAuthStore } from '../store/authStore';
const api: AxiosInstance = axios.create({
  baseURL: 'https://api.duychien.shop',
  timeout: 0, // no timeout
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    
    let token = null;
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.accessToken || parsed.accessToken;
      } catch (error) {
        
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.data instanceof FormData) {
      if (config.headers['Content-Type'] === 'multipart/form-data') {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as any;
    const tryRefreshAndRetry = async () => {
      originalRequest._retry = true;
      
      // Get refresh token from auth storage
      const authStorageRaw = localStorage.getItem('auth-storage');
      let refreshToken = null;
      
      if (authStorageRaw) {
        try {
          const authStorage = JSON.parse(authStorageRaw);
          refreshToken = authStorage.state?.refreshToken || authStorage.refreshToken;
        } catch (e) {
          
        }
      }
      
      const wasAuthenticated = authStorageRaw;
      
      if (refreshToken) {
        try {
          const { data } = await axios.post('https://api.duychien.shop/api/auth/refreshToken', { refreshToken });
          
          if (authStorageRaw) {
            try {
              const authStorage = JSON.parse(authStorageRaw);
              if (authStorage && authStorage.state) {
                authStorage.state.accessToken = data.accessToken;
                authStorage.state.refreshToken = data.refreshToken;
                localStorage.setItem('auth-storage', JSON.stringify(authStorage));
              } else {
                authStorage.accessToken = data.accessToken;
                authStorage.refreshToken = data.refreshToken;
                localStorage.setItem('auth-storage', JSON.stringify(authStorage));
              }
            } catch (e) {
              
            }
          }

          try {
            const { setTokens } = useAuthStore.getState();
            if (setTokens) {
              setTokens(data.accessToken, data.refreshToken);
            }
          } catch (e) {
            
          }
          
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          
        }
      }
      
      localStorage.removeItem('auth-storage');
      if (wasAuthenticated) {
        window.location.href = '/login';
      }
    };
    const status = error.response?.status;
    const responseMessage = (error.response?.data?.message || '').toLowerCase();
    if (!originalRequest._retry && (status === 401 || (status === 403 && (responseMessage.includes('jwt expired') || responseMessage.includes('expired'))))) {
      return tryRefreshAndRetry();
    }

    try {
      const data = error.response?.data;
      const failureStatus = typeof data?.status === 'number' ? data.status : status;
      const baseMessage = data?.message || error.message || 'Có lỗi xảy ra khi gọi API';
      let details = '';
      if (data?.errors) {
        if (typeof data.errors === 'string') {
          details = `: ${data.errors}`;
        } else if (Array.isArray(data.errors)) {
          details = `: ${data.errors.join(', ')}`;
        } else {
          try {
            details = `: ${JSON.stringify(data.errors)}`;
          } catch (_) {
            
          }
        }
      }
      if (!(failureStatus === 401 && originalRequest?._retry)) {
        toastError(`${baseMessage}${details}`);
      }
    } catch (_) {
      toastError('Có lỗi xảy ra khi gọi API');
    }
    return Promise.reject(error);
  }
);
export const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.get(url, config).then(response => response.data),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.post(url, data, config).then(response => response.data),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.put(url, data, config).then(response => response.data),
  delete: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.delete(url, data ? { ...config, data } : config).then(response => response.data),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.patch(url, data, config).then(response => response.data),
};
export default api;