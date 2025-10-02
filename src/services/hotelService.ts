import { apiClient } from './api';
import type { Hotel, HotelDTO, PageResponse, ApiResponse } from '../types';
export const hotelService = {
  getAllHotels: (params: {
    page?: number;
    size?: number;
    sort?: string;
    deleted?: boolean;
  } = {}): Promise<ApiResponse<PageResponse<Hotel>>> =>
    apiClient.get('/api/v1/hotels', { params }),
  getFeaturedHotels: (params: {
    page?: number;
    size?: number;
    sort?: string;
  } = {}): Promise<ApiResponse<PageResponse<Hotel>>> =>
    apiClient.get('/api/v1/hotels', { 
      params: { 
        ...params, 
        deleted: false  // Chỉ lấy khách sạn active
      } 
    }),
  searchHotels: (params: {
    page?: number;
    size?: number;
    sort?: string;
    hotel?: string[];
  } = {}): Promise<ApiResponse<any>> =>
    apiClient.get('/api/v1/hotels/search', { params }),
  getHotelById: (id: number): Promise<ApiResponse<Hotel>> =>
    apiClient.get(`/api/v1/hotels/${id}`),
  getHotelRooms: (id: number): Promise<ApiResponse<any[]>> =>
    apiClient.get(`/api/v1/hotels/${id}/rooms`),
  getManagers: (): Promise<ApiResponse<any[]>> =>
    apiClient.get('/api/v1/hotels/managers'),
  createHotel: (hotelData: HotelDTO, image?: File): Promise<ApiResponse<Hotel>> => {
    const formData = new FormData();
    const hotelBlob = new Blob([JSON.stringify(hotelData)], {
      type: 'application/json'
    });
    formData.append('hotel', hotelBlob);
    if (image) {
      formData.append('image', image);
    }
    return apiClient.post('/api/v1/hotels', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateHotel: (id: number, hotelData: HotelDTO, image?: File, shouldRemoveImage?: boolean): Promise<ApiResponse<Hotel>> => {
    const formData = new FormData();
    const hotelBlob = new Blob([JSON.stringify(hotelData)], {
      type: 'application/json'
    });
    formData.append('hotel', hotelBlob);
    if (image) {
      formData.append('image', image);
    }
    if (shouldRemoveImage) {
      formData.append('removeImage', 'true');
    }
    return apiClient.put(`/api/v1/hotels/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteHotel: (id: number): Promise<ApiResponse<void>> =>
    apiClient.delete(`/api/v1/hotels/${id}`),
  deleteHotels: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.delete('/api/v1/hotels/ids', ids),
  restoreHotel: (id: number): Promise<ApiResponse<void>> =>
    apiClient.put(`/api/v1/hotels/${id}/restore`),
  restoreHotels: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.put('/api/v1/hotels/restore', ids),
  deleteHotelPermanently: (id: number): Promise<ApiResponse<void>> =>
    apiClient.delete(`/api/v1/hotels/${id}/permanent`),
  deleteHotelsPermanently: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.delete('/api/v1/hotels/permanent', ids),
};