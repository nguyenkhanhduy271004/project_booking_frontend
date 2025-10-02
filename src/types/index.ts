// Centralized type & interface definitions used across the app

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

export interface PageResponse<T = any> {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElements: number;
  items: T[];
}

export interface User {
  id: number; // Ensure 'id' is included
  username: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  gender: Gender;
  birthday: string | null;
  email: string;
  phone: string;
  type: UserType;
  status: UserStatus;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  userType: UserType; // Add this property to match the expected structure in authStore.ts
}

export interface UserCreationRequest {
  firstName: string;
  lastName: string;
  gender: Gender;
  birthday: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  type: Exclude<UserType, 'SYSTEM_ADMIN'>;
  hotelId?: number;
}

export interface UserUpdateRequest {
  id: number;
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  birthday?: string;
  email?: string;
  phone?: string;
  type?: Exclude<UserType, 'SYSTEM_ADMIN'>;
  status?: UserStatus;
}

export interface Hotel {
  id: number;
  name: string;
  district: string;
  addressDetail: string;
  totalRooms: number;
  starRating: number;
  imageUrl: string;
  managerId: number;
  managerName?: string;
  managedBy?: {
    id: number;
    username: string;
    fullName: string;
    gender: 'MALE' | 'FEMALE';
    birthday: string;
    email: string;
    phone: string;
    type: string;
    status: 'ACTIVE' | 'INACTIVE';
  };
  services: string[];
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface HotelDTO {
  id?: number;
  managerId: number;
  name: string;
  district: string;
  addressDetail: string;
  totalRooms: number;
  starRating?: number;
  imageUrl?: string;
  services: string[];
}

export interface Room {
  id: number;
  typeRoom: RoomType;
  capacity: number;
  pricePerNight: number;
  available: boolean;
  listImageUrl: string[];
  services: string[];
  hotelId: number;
  hotelName: string;
  createdAt: string;
  updatedAt: string;
  createdByUser: string;
  updatedByUser: string | null;
  roomNumber?: string;
  description?: string;
  amenities?: string[];
  images?: string[];
  isDeleted?: boolean;
}

export interface RoomDTO {
  roomNumber?: string;
  typeRoom: RoomType;
  pricePerNight: number;
  capacity: number;
  description?: string;
  amenities?: string[];
  hotelId: number;
  available?: boolean;
}

export interface Booking {
  id: number;
  bookingCode: string;
  guestId: number;
  guestName: string;
  hotelId: number;
  hotelName: string;
  roomIds: number[];
  roomNames: string[];
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  paymentType: PaymentType;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  guestId: number;
  hotelId: number;
  roomIds: number[];
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  paymentType: PaymentType;
  notes?: string;
  status?: BookingStatus;
}

export interface Voucher {
  id: number;
  code: string;
  name: string;
  description?: string;
  discountType: VoucherType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  startDate?: string;
  endDate?: string;
  status: VoucherStatus;
  hotelId: number;
  hotelName?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  voucherCode: string; // Add this property
  priceCondition: number; // Add this property
  percentDiscount: number; // Add this property
  voucherName: string; // Add this property
  expiredDate: string; // Add this property
  quantity: number; // Add this property
}

export interface VoucherCreateRequest {
  hotelId: number;
  voucherCode: string;
  voucherName: string;
  quantity: number;
  percentDiscount: number;
  priceCondition: number;
  expiredDate: string;
  status: VoucherStatus;
}

export interface VoucherUpdateRequest {
  id: number;
  voucherCode: string;
  voucherName: string;
  quantity: number;
  percentDiscount: number;
  priceCondition: number;
  expiredDate: string;
  status: VoucherStatus;
}

export interface Evaluation {
  id: number;
  rating: number;
  comment: string;
  roomId: number;
  roomName: string;
  guestId: number;
  guestName: string;
  bookingId: number;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationCreateRequest {
  roomId: number;
  message: string;
  starRating: number;
}

export interface EvaluationUpdateRequest {
  message: string;
  starRating: number;
}

export interface EvaluationRequest {
  id: number;
  evaluatorId: number;
  evaluateeId: number;
  evaluationDate: string;
  score: number;
  comments?: string;
}

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  paymentType: PaymentType;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardOverview {
  userRole: string;
  canAccessAllData: boolean;
  message: string;
}

export interface DashboardStatistics {
  totalHotels?: number; // Add this property
  totalRooms?: number; // Add this property
  totalBookings?: number; // Add this property
  totalUsers?: number; // Add this property
  monthlyRevenue?: number; // Add this property
  activeBookings?: number; // Add this property
  newUsersThisMonth?: number; // Add this property
  newBookingsThisMonth?: number; // Add this property
  message?: string; // Add this property
  currentMonth?: string; // Add this property
  currentYear?: string; // Add this property
  scope: 'SYSTEM_WIDE' | 'MANAGER_HOTELS' | 'STAFF_HOTELS';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number; // Added id property
  fullName: string;
  userType: string;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  password: string;
  rePassword: string;
}

// Reusable type aliases
export type UserType = 'SYSTEM_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'GUEST';
export type UserStatus = 'NONE' | 'ACTIVE' | 'INACTIVE';
export type BookingStatus = 'PENDING' | 'PAYING' | 'CONFIRMED' | 'CHECKIN' | 'CHECKOUT' | 'CANCELLED' | 'EXPIRED' | 'COMPLETED';
export type PaymentType = 'CASH' | 'MOMO' | 'VNPAY' | 'CARD' | 'WALLET' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'SUCCESS';
export type RoomType = 'STANDARD' | 'SUITE' | 'CONFERENCE' | 'DELUXE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type VoucherStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type VoucherType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface PaymentRequest {
  bookingId: number;
  paymentType: PaymentType;
  amount: number;
}

export interface PaymentResponse {
  id: number;
  bookingId: number;
  paymentType: PaymentType;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
  paymentUrl?: string;
  createdAt: string;
}

export interface BookingResponse {
  id: number;
  bookingCode: string;
  hotelId: number;
  hotelName: string;
  rooms: {
    id: number;
    typeRoom: RoomType | string;
    capacity: number;
    pricePerNight: number;
    available: boolean;
    imageUrls: string[];
  }[];
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: BookingStatus;
  paymentType: PaymentType;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}