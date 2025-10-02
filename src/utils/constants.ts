export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refreshToken',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    VERIFY_OTP: '/api/auth/verify-otp',
  },
  USERS: {
    LIST: '/api/v1/users',
    DETAIL: '/api/v1/users',
    CREATE: '/api/v1/users',
    UPDATE: '/api/v1/users',
    DELETE: '/api/v1/users',
    RESTORE: '/api/v1/users',
  },
  DASHBOARD: {
    OVERVIEW: '/api/v1/dashboard/overview',
    STATISTICS: '/api/v1/dashboard/statistics',
    TRENDS: '/api/v1/dashboard/trends',
    TOP_HOTELS: '/api/v1/dashboard/top-hotels',
    ROOM_DISTRIBUTION: '/api/v1/dashboard/room-distribution',
    REVENUE: '/api/v1/dashboard/revenue',
  },
  HOTELS: {
    LIST: '/api/v1/hotels',
    DETAIL: '/api/v1/hotels',
    CREATE: '/api/v1/hotels',
    UPDATE: '/api/v1/hotels',
    DELETE: '/api/v1/hotels',
  },
  ROOMS: {
    LIST: '/api/v1/rooms',
    DETAIL: '/api/v1/rooms',
    CREATE: '/api/v1/rooms',
    UPDATE: '/api/v1/rooms',
    DELETE: '/api/v1/rooms',
  },
  BOOKINGS: {
    LIST: '/api/v1/bookings',
    DETAIL: '/api/v1/bookings',
    CREATE: '/api/v1/bookings',
    UPDATE: '/api/v1/bookings',
    DELETE: '/api/v1/bookings',
  },
} as const;

export const USER_ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  GUEST: 'GUEST',
} as const;

export const USER_STATUS = {
  NONE: 'NONE',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export const USER_GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const ROOM_TYPE = {
  STANDARD: 'STANDARD',
  SUITE: 'SUITE',
  CONFERENCE: 'CONFERENCE',
  DELUXE: 'DELUXE',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
} as const;

export const COLORS = {
  PRIMARY: '#1890ff',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#f5222d',
  INFO: '#13c2c2',
} as const;
