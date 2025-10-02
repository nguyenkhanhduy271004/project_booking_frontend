import { useQuery } from '@tanstack/react-query';
import { dashboardService, type DashboardOverviewResponse, type BookingTrendResponse, type TopHotelResponse, type RoomTypeDistributionResponse } from '../services/dashboardService';
import type { DashboardStatistics } from '../types';

export const useDashboardOverview = () => {
  return useQuery<DashboardOverviewResponse>({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await dashboardService.getOverview();
      if (response.status !== 200 || !response.data) {
        throw new Error('Failed to fetch dashboard overview');
      }
      return response.data;
    },
  });
};

export const useDashboardStatistics = () => {
  return useQuery<DashboardStatistics, Error>({
    queryKey: ['dashboardStatistics'],
    queryFn: async () => {
      const response = await dashboardService.getStatistics();
      if (response.status !== 200 || !response.data) {
        throw new Error('Failed to fetch dashboard statistics');
      }
      // Transform the scope property to match the expected union type
      const transformedData: DashboardStatistics = {
        ...response.data,
        scope: response.data.scope as 'SYSTEM_WIDE' | 'MANAGER_HOTELS' | 'STAFF_HOTELS',
      };
      return transformedData;
    },
  });
};

export const useBookingTrends = (months: number = 6) => {
  return useQuery<BookingTrendResponse[]>({
    queryKey: ['dashboard', 'trends', months],
    queryFn: async () => {
      const response = await dashboardService.getBookingTrends(months);
      if (response.status !== 200 || !response.data) {
        throw new Error('Failed to fetch booking trends');
      }
      return response.data;
    },
  });
};

export const useTopHotels = (limit: number = 5) => {
  return useQuery<TopHotelResponse[]>({
    queryKey: ['dashboard', 'topHotels', limit],
    queryFn: async () => {
      const response = await dashboardService.getTopHotels(limit);
      if (response.status !== 200 || !response.data) {
        throw new Error('Failed to fetch top hotels');
      }
      return response.data;
    },
  });
};

export const useRoomTypeDistribution = () => {
  return useQuery<RoomTypeDistributionResponse[]>({
    queryKey: ['dashboard', 'roomDistribution'],
    queryFn: async () => {
      const response = await dashboardService.getRoomTypeDistribution();
      if (response.status !== 200 || !response.data) {
        throw new Error('Failed to fetch room type distribution');
      }
      return response.data;
    },
  });
};
