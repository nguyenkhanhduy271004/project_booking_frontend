import { apiClient } from './api';
import type { Room, RoomDTO, PageResponse, ApiResponse } from '../types';
export const roomService = {
  // Get all rooms
  getAllRooms: (params: {
    page?: number;
    size?: number;
    sort?: string;
    deleted?: boolean;
  } = {}): Promise<ApiResponse<PageResponse<Room>>> =>
    apiClient.get('/api/v1/rooms', { params }),
  // Get room by ID
  getRoomById: (id: number): Promise<ApiResponse<Room>> =>
    apiClient.get(`/api/v1/rooms/${id}`),
  // Create room (ADMIN only)
  createRoom: (roomData: RoomDTO, images?: File[]): Promise<ApiResponse<Room>> => {
    const formData = new FormData();
    // Append room data as JSON blob with proper content type
    const roomBlob = new Blob([JSON.stringify(roomData)], {
      type: 'application/json'
    });
    formData.append('room', roomBlob, 'room.json');
    console.log('Creating room with data:', roomData);
    console.log('Images to upload:', images);
    // Append each image file - Spring Boot expects all files with same key name
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        console.log(`Adding image ${index}:`, image.name, image.size, image.type);
        // Don't specify filename, let Spring Boot handle it
        formData.append('images', image);
      });
    } else {
      console.log('No images to upload');
    }
    // Debug FormData content
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }
    return apiClient.post('/api/v1/rooms', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // Update room without images (ADMIN, MANAGER only)
  updateRoomDataOnly: (id: number, roomData: RoomDTO): Promise<ApiResponse<Room>> => {
    const formData = new FormData();
    // Append room data as JSON blob with proper content type
    const roomBlob = new Blob([JSON.stringify(roomData)], {
      type: 'application/json'
    });
    formData.append('room', roomBlob, 'room.json');
    // No images or keepImages needed for data-only update
    
    return apiClient.put(`/api/v1/rooms/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // Update room (ADMIN, MANAGER only)
  updateRoom: (id: number, roomData: RoomDTO, newImages?: File[], keepImages?: string[]): Promise<ApiResponse<Room>> => {
    const formData = new FormData();
    // Append room data as JSON blob with proper content type
    const roomBlob = new Blob([JSON.stringify(roomData)], {
      type: 'application/json'
    });
    formData.append('room', roomBlob, 'room.json');
    // Append new images
    if (newImages && newImages.length > 0) {
      newImages.forEach((image, index) => {
        console.log(`Adding new image ${index}:`, image.name, image.size, image.type);
        formData.append('images', image);
      });
    }
    // Gửi danh sách ảnh cũ cần giữ lại
    if (keepImages && keepImages.length > 0) {
      formData.append('keepImages', JSON.stringify(keepImages));
    }
    return apiClient.put(`/api/v1/rooms/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // Delete room (SYSTEM_ADMIN only)
  deleteRoom: (id: number): Promise<ApiResponse<void>> =>
    apiClient.delete(`/api/v1/rooms/${id}`),
  // Delete multiple rooms (SYSTEM_ADMIN only)
  deleteRooms: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.delete('/api/v1/rooms/ids', ids),
  // Restore room (SYSTEM_ADMIN only)
  restoreRoom: (id: number): Promise<ApiResponse<void>> =>
    apiClient.put(`/api/v1/rooms/${id}/restore`),
  // Restore multiple rooms (SYSTEM_ADMIN only)
  restoreRooms: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.put('/api/v1/rooms/restore', ids),
  // Permanently delete room (SYSTEM_ADMIN only)
  deleteRoomPermanently: (id: number): Promise<ApiResponse<void>> =>
    apiClient.delete(`/api/v1/rooms/${id}/permanent`),
  // Permanently delete multiple rooms (SYSTEM_ADMIN only)
  deleteRoomsPermanently: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.delete('/api/v1/rooms/permanent', ids),
  // Check room availability
  checkRoomAvailability: (params: {
    roomId: number;
    checkIn: string;
    checkOut: string;
  }): Promise<ApiResponse<{ available: boolean }>> =>
    apiClient.get('/api/v1/rooms/availability', { params }),
  // Get available rooms
  getAvailableRooms: (params: {
    hotelId: number;
    checkIn: string;
    checkOut: string;
  }): Promise<ApiResponse<Room[]>> =>
    apiClient.get('/api/v1/rooms/available', { params }),
  // Get unavailable dates for a room
  getUnavailableDates: (id: number, params: {
    from: string;
    to: string;
  }): Promise<ApiResponse<string[]>> =>
    apiClient.get(`/api/v1/rooms/${id}/unavailable-dates`, { params }),
  // Get room bookings (ADMIN, MANAGER, STAFF only)
  getRoomBookings: (roomId: number, params: {
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  } = {}): Promise<ApiResponse<PageResponse<any>>> =>
    apiClient.get(`/api/v1/rooms/${roomId}/bookings`, { params }),
  
  // Hold rooms for a limited period (e.g., 10 minutes) when starting booking
  holdRooms: (roomIds: number[]): Promise<ApiResponse<void>> =>
    apiClient.put('/api/v1/rooms/hold', roomIds),
};