import { apiClient } from './api';
import type { ApiResponse } from '../types';

export interface DashboardOverviewResponse {
  userRole: string;
  canAccessAllData: boolean;
  message: string;
  currentMonth: string;
  currentYear: string;
}

export interface DashboardStatisticsResponse {
  totalUsers: number;
  totalHotels: number;
  totalRooms: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
  newBookingsThisMonth: number;
  scope: string;
}

export interface BookingTrendResponse {
  month: string;
  year: string;
  bookings: number;
  revenue: number;
  newUsers: number;
}

export interface TopHotelResponse {
  hotelId: number;
  hotelName: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  occupancyRate: number;
}

export interface RoomTypeDistributionResponse {
  roomType: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RevenueStatisticsResponse {
  yearlyRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  averageOrderValue: number;
}

export const dashboardService = {
  getOverview: (): Promise<ApiResponse<DashboardOverviewResponse>> =>
    apiClient.get('/api/v1/dashboard/overview'),

  getStatistics: (): Promise<ApiResponse<DashboardStatisticsResponse>> =>
    apiClient.get('/api/v1/dashboard/statistics'),

  getBookingTrends: (months: number = 6): Promise<ApiResponse<BookingTrendResponse[]>> =>
    apiClient.get('/api/v1/dashboard/trends', { params: { months } }),

  getTopHotels: (limit: number = 5): Promise<ApiResponse<TopHotelResponse[]>> =>
    apiClient.get('/api/v1/dashboard/top-hotels', { params: { limit } }),

  getRoomTypeDistribution: (): Promise<ApiResponse<RoomTypeDistributionResponse[]>> =>
    apiClient.get('/api/v1/dashboard/room-distribution'),

  getRevenueStatistics: (months: number = 12): Promise<ApiResponse<RevenueStatisticsResponse>> =>
    apiClient.get('/api/v1/dashboard/revenue', { params: { months } }),
};