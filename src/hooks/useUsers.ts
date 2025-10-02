import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { User, UserCreationRequest, UserUpdateRequest } from '../types';
import { message } from 'antd';

export const useUsers = (params: { page: number; size: number; keyword?: string; deleted?: boolean } = { page: 0, size: 10 }) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getAllUsers(params),
    select: (data) => ({
      items: data.data.items,
      totalElements: data.data.totalElements,
      totalPages: data.data.totalPages,
    }),
  });
};

export const useUserDetail = (userId: number) => {
  return useQuery<User>({
    queryKey: ['users', userId],
    queryFn: () => userService.getUserDetail(userId),
    select: (data) => data.data,
    enabled: !!userId,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UserCreationRequest) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Tạo người dùng thành công');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Tạo người dùng thất bại');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserUpdateRequest> }) => 
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      message.success('Cập nhật người dùng thành công');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Cập nhật người dùng thất bại');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => userService.deleteUsers([id]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Xóa người dùng thành công');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Xóa người dùng thất bại');
    },
  });
};

export const useRestoreUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => userService.restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Khôi phục người dùng thành công');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Khôi phục người dùng thất bại');
    },
  });
};
