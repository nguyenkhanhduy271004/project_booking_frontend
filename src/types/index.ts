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
  id: number;
  username: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthday: string | null;
  email: string;
  phone: string;
  type: 'SYSTEM_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'GUEST';
  status: 'NONE' | 'ACTIVE' | 'INACTIVE';
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface UserCreationRequest {
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthday: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  type: 'ADMIN' | 'MANAGER' | 'STAFF' | 'GUEST';
  hotelId?: number;
}
export interface UserUpdateRequest {
  id: number;
  firstName?: string;
  lastName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthday?: string;
  email?: string;
  phone?: string;
  type?: 'ADMIN' | 'MANAGER' | 'STAFF' | 'GUEST';
  status?: 'NONE' | 'ACTIVE' | 'INACTIVE';
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
  typeRoom: 'STANDARD' | 'SUITE' | 'CONFERENCE' | 'DELUXE';
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
  typeRoom: 'STANDARD' | 'SUITE' | 'CONFERENCE' | 'DELUXE';
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
  paymentType: 'CASH' | 'MOMO' | 'VNPAY';
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  notes: string;
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
  paymentType: 'CASH' | 'MOMO' | 'VNPAY';
  notes?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
}
export interface Voucher {
  id: number;
  code: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  hotelId: number;
  hotelName: string;
  createdAt: string;
  updatedAt: string;
}
export interface VoucherCreateRequest {
  code: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
  hotelId: number;
}
export interface VoucherUpdateRequest {
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
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
export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  paymentType: 'CASH' | 'MOMO' | 'VNPAY';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}
export interface DashboardOverview {
  userRole: string;
  canAccessAllData: boolean;
  message: string;
}
export interface DashboardStatistics {
  totalHotels?: number;
  totalRooms?: number;
  totalBookings?: number;
  totalUsers?: number;
  managedHotels?: number;
  managedRooms?: number;
  hotelBookings?: number;
  workingHotels?: number;
  workingRooms?: number;
  scope: 'SYSTEM_WIDE' | 'MANAGER_HOTELS' | 'STAFF_HOTELS';
}
export interface LoginRequest {
  username: string;
  password: string;
}
export interface LoginResponse {
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
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  password: string;
  rePassword: string;
}
export type UserType = 'SYSTEM_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'GUEST';
export type UserStatus = 'NONE' | 'ACTIVE' | 'INACTIVE';
export type BookingStatus = 'PENDING' | 'PAYING' | 'CONFIRMED' | 'CHECKIN' | 'CHECKOUT' | 'CANCELLED' | 'EXPIRED' | 'COMPLETED';
export type PaymentType = 'CASH' | 'MOMO' | 'VNPAY';
export type RoomType = 'STANDARD' | 'SUITE' | 'CONFERENCE' | 'DELUXE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type VoucherStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type VoucherType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export interface Voucher {
  id: number;
  voucherCode: string;
  voucherName: string;
  quantity: number;
  percentDiscount: number;
  priceCondition: number;
  expiredDate: string;
  status: VoucherStatus;
  deleted: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  hotelId?: number;
  hotelName?: string;
}
export interface VoucherCreateRequest {
  hotelId?: number;
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
export interface BookingRequest {
  hotelId: number;
  roomIds: number[];
  checkInDate: string;
  checkOutDate: string;
  paymentType: PaymentType;
  notes?: string;
  voucherId?: number;
}
export interface BookingResponse {
  id: number;
  bookingCode: string;
  hotelId: number;
  hotelName: string;
  rooms: {
    id: number;
    typeRoom: string;
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
export type BookingStatus = 'PENDING' | 'PAYING' | 'CONFIRMED' | 'CHECKIN' | 'CHECKOUT' | 'CANCELLED' | 'EXPIRED' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentType = 'CARD' | 'WALLET' | 'BANK_TRANSFER';
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