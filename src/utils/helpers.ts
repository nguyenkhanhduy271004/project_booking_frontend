import { USER_ROLES, USER_STATUS, USER_GENDER, BOOKING_STATUS, ROOM_TYPE } from './constants';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    [USER_ROLES.SYSTEM_ADMIN]: 'Quản trị viên hệ thống',
    [USER_ROLES.ADMIN]: 'Quản trị viên',
    [USER_ROLES.MANAGER]: 'Quản lý',
    [USER_ROLES.STAFF]: 'Nhân viên',
    [USER_ROLES.GUEST]: 'Khách hàng',
  };
  return roleMap[role] || role;
};

export const getStatusDisplayName = (status: string): string => {
  const statusMap: Record<string, string> = {
    [USER_STATUS.ACTIVE]: 'Hoạt động',
    [USER_STATUS.INACTIVE]: 'Không hoạt động',
    [USER_STATUS.NONE]: 'Chưa xác định',
    [BOOKING_STATUS.PENDING]: 'Chờ xác nhận',
    [BOOKING_STATUS.CONFIRMED]: 'Đã xác nhận',
    [BOOKING_STATUS.COMPLETED]: 'Hoàn thành',
    [BOOKING_STATUS.CANCELLED]: 'Đã hủy',
  };
  return statusMap[status] || status;
};

export const getGenderDisplayName = (gender: string): string => {
  const genderMap: Record<string, string> = {
    [USER_GENDER.MALE]: 'Nam',
    [USER_GENDER.FEMALE]: 'Nữ',
    [USER_GENDER.OTHER]: 'Khác',
  };
  return genderMap[gender] || gender;
};

export const getRoomTypeDisplayName = (roomType: string): string => {
  const typeMap: Record<string, string> = {
    [ROOM_TYPE.STANDARD]: 'Phòng tiêu chuẩn',
    [ROOM_TYPE.SUITE]: 'Phòng Suite',
    [ROOM_TYPE.CONFERENCE]: 'Phòng hội nghị',
    [ROOM_TYPE.DELUXE]: 'Phòng Deluxe',
  };
  return typeMap[roomType] || roomType;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    [USER_STATUS.ACTIVE]: 'success',
    [USER_STATUS.INACTIVE]: 'error',
    [USER_STATUS.NONE]: 'default',
    [BOOKING_STATUS.PENDING]: 'processing',
    [BOOKING_STATUS.CONFIRMED]: 'success',
    [BOOKING_STATUS.COMPLETED]: 'success',
    [BOOKING_STATUS.CANCELLED]: 'error',
  };
  return colorMap[status] || 'default';
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(phone);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
};

export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
