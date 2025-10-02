import { useQuery } from '@tanstack/react-query';
import { dashboardService, type DashboardStatisticsResponse, type DashboardOverviewResponse, type BookingTrendResponse, type TopHotelResponse, type RoomTypeDistributionResponse } from '../services/dashboardService';

export const useDashboardOverview = () => {
  return useQuery<DashboardOverviewResponse>({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardService.getOverview(),
    select: (data) => data.data,
  });
};

export const useDashboardStatistics = () => {
  return useQuery<DashboardStatisticsResponse>({
    queryKey: ['dashboard', 'statistics'],
    queryFn: () => dashboardService.getStatistics(),
    select: (data) => data.data,
  });
};

export const useBookingTrends = (months: number = 6) => {
  return useQuery<BookingTrendResponse[]>({
    queryKey: ['dashboard', 'trends', months],
    queryFn: () => dashboardService.getBookingTrends(months),
    select: (data) => data.data,
  });
};

export const useTopHotels = (limit: number = 5) => {
  return useQuery<TopHotelResponse[]>({
    queryKey: ['dashboard', 'topHotels', limit],
    queryFn: () => dashboardService.getTopHotels(limit),
    select: (data) => data.data,
  });
};

export const useRoomTypeDistribution = () => {
  return useQuery<RoomTypeDistributionResponse[]>({
    queryKey: ['dashboard', 'roomDistribution'],
    queryFn: () => dashboardService.getRoomTypeDistribution(),
    select: (data) => data.data,
  });
};
