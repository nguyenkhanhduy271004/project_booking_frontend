import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Divider,
  Steps,
  Spin,
  Space,
  Tag,
  message,
} from 'antd';
import { useToast } from '../components/Toast';
import {
  ArrowLeftOutlined,
  UserOutlined,
  HomeOutlined,
  CreditCardOutlined,
  WalletOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { hotelService } from '../services/hotelService';
import { roomService } from '../services/roomService';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { voucherService } from '../services/voucherService';
import { useAuthStore } from '../store/authStore';
import type { Hotel, Voucher } from '../types';

// Define PaymentType locally to match the UI
type PaymentType = 'CARD' | 'WALLET' | 'BANK_TRANSFER';

// Define BookingRequest locally to match backend
interface BookingRequest {
  guestId: number;
  hotelId: number;
  roomIds: number[];
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  paymentType: 'CARD' | 'WALLET' | 'BANK_TRANSFER';
  notes?: string;
  voucherId?: number;
}
const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;
interface BookingPageProps {}
const BookingPage: React.FC<BookingPageProps> = () => {
  const { showToast } = useToast();
  console.log('BookingPage component rendered/re-rendered');
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const { isAuthenticated } = useAuthStore();
  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>('BANK_TRANSFER');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [isInitialRoomSelectionSet, setIsInitialRoomSelectionSet] = useState(false);
  const [bookingTimer, setBookingTimer] = useState<number | null>(null);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  // Get booking data from location state (preferred) or URL params (fallback)
  const { checkInDate, checkOutDate, preSelectedRooms } = useMemo(() => {
    // First try to get from location state
    const state = location.state as any;
    if (state && state.checkInDate) {
      return {
        checkInDate: state.checkInDate,
        checkOutDate: state.checkOutDate,
        guests: state.guests?.toString(),
        preSelectedRooms: state.selectedRooms || []
      };
    }
    
    // Fallback to URL params for backward compatibility
    const queryParams = new URLSearchParams(location.search);
    return {
      checkInDate: queryParams.get('checkIn'),
      checkOutDate: queryParams.get('checkOut'),
      preSelectedRooms: queryParams.get('rooms')?.split(',').map(Number) || []
    };
  }, [location.search, location.state]);
  useEffect(() => {
    console.log('BookingPage useEffect - hotelId:', hotelId);
    if (hotelId) {
      const hotelIdNum = parseInt(hotelId);
      console.log('Parsing hotelId to number:', hotelIdNum);
      if (isNaN(hotelIdNum)) {
        console.error('Invalid hotelId:', hotelId);
        showToast('ID khách sạn không hợp lệ', 'error');
        navigate('/');
        return;
      }
      fetchHotelData(hotelIdNum);
      fetchVouchers(hotelIdNum);
    } else {
      console.error('No hotelId found in URL params');
      showToast('Không tìm thấy ID khách sạn', 'error');
      navigate('/');
    }
  }, [hotelId]);

  // Clear location state after initial load to prevent stale data on refresh
  useEffect(() => {
    if (location.state && checkInDate) {
      // Replace current history entry without state to clean up
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [location.state, checkInDate]);

  // Watch form dates to recalculate totals based on nights
  const watchCheckInDate = Form.useWatch('checkInDate', form);
  const watchCheckOutDate = Form.useWatch('checkOutDate', form);
  useEffect(() => {
    console.log('useEffect for preSelectedRooms triggered:', { 
      preSelectedRooms, 
      roomsLength: rooms.length, 
      currentSelected: selectedRooms,
      isInitialRoomSelectionSet
    });
    // Only set from URL once, when rooms are first loaded and we haven't set initial selection yet
    if (!isInitialRoomSelectionSet && rooms.length > 0) {
      if (preSelectedRooms.length > 0) {
        // Only set selected rooms if the room IDs exist in the fetched rooms
        const validRoomIds = preSelectedRooms.filter((roomId: number) => 
          rooms.some(room => room.id === roomId)
        );
        console.log('Valid room IDs from URL:', validRoomIds);
        if (validRoomIds.length > 0) {
          setSelectedRooms(validRoomIds);
          console.log('Setting selected rooms from URL (one time only):', validRoomIds);
        } else {
          console.log('No valid room IDs from URL');
        }
      } else {
        console.log('No preSelectedRooms from URL');
      }
      // Always mark as set once rooms are loaded, regardless of URL params
      setIsInitialRoomSelectionSet(true);
    }
  }, [rooms, preSelectedRooms, isInitialRoomSelectionSet]); // Include flag in dependencies
  useEffect(() => {
    calculateTotal();
  }, [selectedRooms, rooms, voucherDiscount, watchCheckInDate, watchCheckOutDate]);

  // Auto-remove unavailable rooms from selection when rooms data changes
  useEffect(() => {
    if (rooms.length > 0) {
      const availableRoomIds = rooms.filter(room => room.available !== false).map(room => room.id);
      const invalidSelections = selectedRooms.filter(roomId => !availableRoomIds.includes(roomId));
      
      if (invalidSelections.length > 0) {
        setSelectedRooms(prev => prev.filter(roomId => availableRoomIds.includes(roomId)));
        showToast(`Đã loại bỏ ${invalidSelections.length} phòng không có sẵn khỏi danh sách đã chọn`, 'warning');
      }
    }
  }, [rooms]); // Only depend on rooms, not selectedRooms to avoid infinite loop

  // Cleanup timer khi component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Handle page unload - no room status updates
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (currentStep === 1 && selectedRooms.length > 0) {
        // Show confirmation dialog
        event.preventDefault();
        event.returnValue = 'Bạn đang trong quá trình đặt phòng. Nếu thoát, phòng sẽ được thả cho người khác đặt.';
        return event.returnValue;
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && currentStep === 1 && selectedRooms.length > 0) {
        // Release rooms when page becomes hidden (user switches tab/minimizes)
        await releaseRooms(selectedRooms);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Final cleanup - no room status updates on unmount
    };
  }, [currentStep, selectedRooms]);
  const fetchHotelData = async (id: number) => {
    try {
      console.log('fetchHotelData called with id:', id);
      setLoading(true);
      
      // Get hotel info first
      const hotelResponse = await hotelService.getHotelById(id).catch(err => {
        console.error('Error fetching hotel:', err);
        showToast('Không thể tải thông tin khách sạn', 'error');
        return { status: 500, data: null };
      });
      
      if (hotelResponse.status !== 200 || !hotelResponse.data) {
        console.error('Hotel API failed:', hotelResponse);
        showToast('Khách sạn không tồn tại hoặc không thể truy cập', 'error');
        navigate('/');
        return;
      }
      
      console.log('Setting hotel data:', hotelResponse.data);
      setHotel(hotelResponse.data);
      
      // Get available rooms based on check-in/check-out dates
      let roomsResponse;
      if (checkInDate && checkOutDate) {
        // If we have dates, get only available rooms
        roomsResponse = await roomService.getAvailableRooms({
          hotelId: id,
          checkIn: checkInDate,
          checkOut: checkOutDate
        }).catch(err => {
          console.error('Error fetching available rooms:', err);
          showToast('Không thể tải danh sách phòng có sẵn', 'error');
          return { status: 500, data: [] };
        });
      } else {
        // If no dates, get all rooms (for backward compatibility)
        roomsResponse = await hotelService.getHotelRooms(id).catch(err => {
          console.error('Error fetching rooms:', err);
          showToast('Không thể tải danh sách phòng', 'error');
          return { status: 500, data: [] };
        });
      }
      
      console.log('Rooms API response:', roomsResponse);
      
      if (roomsResponse.status === 200 && roomsResponse.data) {
        console.log('Setting rooms data:', roomsResponse.data);
        setRooms(roomsResponse.data);
        if (roomsResponse.data.length === 0) {
          if (checkInDate && checkOutDate) {
            showToast('Không có phòng nào có sẵn cho thời gian đã chọn', 'warning');
          } else {
            showToast('Khách sạn này hiện không có phòng nào', 'warning');
          }
        }
      } else {
        console.error('Rooms API failed:', roomsResponse);
        showToast('Không thể tải danh sách phòng', 'error');
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching hotel data:', error);
      showToast('Có lỗi xảy ra khi tải thông tin khách sạn. Vui lòng thử lại sau.', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };
  const fetchVouchers = async (hotelId: number) => {
    try {
      console.log('Fetching vouchers for hotel:', hotelId);
      const response = await voucherService.getVouchersByHotelId(hotelId);
      console.log('Vouchers response:', response);
      if (response.status === 200) {
        // Check if response.data is an array or has items property
        let vouchers = Array.isArray(response.data) ? response.data : (response.data as any)?.items || [];
        // Filter only active vouchers
        const activeVouchers = vouchers.filter((v: Voucher) => v.status === 'ACTIVE');
        console.log('Active vouchers found:', activeVouchers);
        setAvailableVouchers(activeVouchers);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      // Don't show error message to user, just log it
      setAvailableVouchers([]);
    }
  };
  const calculateTotal = () => {
    const selectedRoomData = rooms.filter(room => selectedRooms.includes(room.id));
    // Determine number of nights based on currently selected dates in the form
    let nights = 1;
    try {
      if (watchCheckInDate && watchCheckOutDate) {
        const diffDays = dayjs(watchCheckOutDate).diff(dayjs(watchCheckInDate), 'day');
        nights = Math.max(1, diffDays);
      }
    } catch (_e) {
      nights = 1;
    }
    const subtotal = selectedRoomData.reduce((sum, room) => sum + (room.pricePerNight || 0) * nights, 0);
    const total = Math.max(0, subtotal - voucherDiscount);
    setTotalAmount(total);
  };

  const startBookingTimer = () => {
    // 10 phút = 10 * 60 = 600 giây
    const BOOKING_TIME_LIMIT = 10 * 60;
    setBookingTimer(BOOKING_TIME_LIMIT);

    const interval = setInterval(() => {
      setBookingTimer((prevTime) => {
        if (prevTime === null || prevTime <= 1) {
          clearInterval(interval);
          // Hết thời gian - reset (server sẽ tự giải phóng sau 10 phút)
          message.warning('Thời gian giữ phòng đã hết! Vui lòng đặt lại.');
          setSelectedRooms([]);
          setCurrentStep(0);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    setTimerInterval(interval);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const stopBookingTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setBookingTimer(null);
  };

  // Hold rooms when user starts booking process (server holds for 10 minutes)
  const holdRooms = async (roomIds: number[]): Promise<boolean> => {
    if (roomIds.length === 0) return false;
    try {
      const resp = await roomService.holdRooms(roomIds);
      if (resp.status === 200) {
        console.log('Rooms held successfully:', roomIds);
        return true;
      }
      console.error('Hold rooms failed:', resp);
      showToast('Không thể giữ phòng. Vui lòng thử lại.', 'error');
      return false;
    } catch (error: any) {
      console.error('Failed to hold rooms:', error);
      const msg = error.response?.data?.message || 'Không thể giữ phòng. Vui lòng thử lại.';
      showToast(msg, 'error');
      return false;
    }
  };

  // Release rooms when user exits or timer expires (no-op)
  const releaseRooms = async (roomIds: number[]) => {
    if (roomIds.length === 0) return;
    
    try {
      console.log('Skipping releaseRooms API call. Intended rooms:', roomIds);
    } catch (error: any) {
      console.error('releaseRooms no-op error (ignored):', error);
    }
  };
  const handleRoomSelection = useCallback((roomId: number, selected: boolean) => {
    // Check if user is authenticated before allowing room selection
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để đặt phòng');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    // Check if room is available before allowing selection
    const room = rooms.find(r => r.id === roomId);
    if (room && room.available === false) {
      message.warning('Phòng này đã được đặt, không thể chọn!');
      return;
    }

    console.log('Room selection changed:', { roomId, selected, currentSelected: selectedRooms });
    if (selected) {
      setSelectedRooms(prev => {
        const newSelected = [...prev, roomId];
        console.log('Adding room, new selected:', newSelected);
        return newSelected;
      });
    } else {
      setSelectedRooms(prev => {
        const newSelected = prev.filter(id => id !== roomId);
        console.log('Removing room, new selected:', newSelected);
        return newSelected;
      });
    }
  }, [selectedRooms, rooms, isAuthenticated, navigate, location.pathname, location.search]); // Add dependencies
  const handleVoucherApply = (voucherCode: string) => {
    if (!voucherCode) {
      // Clear voucher
      setSelectedVoucher(null);
      setVoucherDiscount(0);
      return;
    }
    const voucher = availableVouchers.find(v => v.voucherCode === voucherCode);
    if (voucher) {
      const subtotal = rooms.filter(room => selectedRooms.includes(room.id))
        .reduce((sum, room) => sum + room.pricePerNight, 0);
      if (subtotal >= voucher.priceCondition) {
        const discount = Math.min(subtotal * voucher.percentDiscount / 100, subtotal);
        setSelectedVoucher(voucher);
        setVoucherDiscount(discount);
        showToast(`Áp dụng voucher "${voucher.voucherName}" thành công! Giảm ${discount.toLocaleString('vi-VN')}đ`, 'success');
      } else {
        message.warning(`Đơn hàng phải từ ${voucher.priceCondition.toLocaleString('vi-VN')}đ để sử dụng voucher này`);
        setSelectedVoucher(null);
        setVoucherDiscount(0);
      }
    } else {
      showToast('Voucher không hợp lệ', 'error');
      setSelectedVoucher(null);
      setVoucherDiscount(0);
    }
  };
  const handleNext = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để tiếp tục đặt phòng');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    if (currentStep === 0 && selectedRooms.length === 0) {
      message.warning('Vui lòng chọn ít nhất một phòng');
      return;
    }
    
    // Debug log before moving to next step
    console.log('Moving to next step. Current state:', {
      currentStep,
      selectedRooms,
      totalAmount,
      rooms: rooms.length
    });
    
    // Recalculate total before moving to next step to ensure it's preserved
    calculateTotal();
    
    // Khi chuyển từ step 0 sang step 1: giữ phòng và khởi động timer
    if (currentStep === 0) {
      const ok = await holdRooms(selectedRooms);
      if (!ok) return; // stop flow if cannot hold
      startBookingTimer();
    }
    
    setCurrentStep(prev => prev + 1);
  };
  const handlePrev = async () => {
    // Nếu quay lại từ step 1 về step 0, dừng timer và thả phòng
    if (currentStep === 1) {
      stopBookingTimer();
      await releaseRooms(selectedRooms);
    }
    setCurrentStep(prev => prev - 1);
  };
  const handleBookingSubmit = async (values: any) => {
    // Check authentication before submitting booking
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để đặt phòng');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    if (!hotel?.id) {
      showToast('Không tìm thấy thông tin khách sạn', 'error');
      return;
    }
    
    // Validate required fields
    if (!values.checkInDate || !values.checkOutDate) {
      showToast('Vui lòng chọn đầy đủ ngày nhận phòng và ngày trả phòng', 'error');
      return;
    }
    
    if (selectedRooms.length === 0) {
      showToast('Vui lòng chọn ít nhất một phòng', 'error');
      return;
    }
    
    if (!selectedPaymentType) {
      showToast('Vui lòng chọn phương thức thanh toán', 'error');
      return;
    }
    
    // Validate voucher if selected
    if (selectedVoucher) {
      const voucherExpiry = dayjs(selectedVoucher.expiredDate);
      if (voucherExpiry.isBefore(dayjs())) {
        showToast('Voucher đã hết hạn. Vui lòng chọn voucher khác hoặc bỏ chọn voucher.', 'error');
        return;
      }
      
      if (selectedVoucher.minOrderValue && totalAmount < selectedVoucher.minOrderValue) {
        showToast(`Đơn hàng phải có giá trị tối thiểu ${selectedVoucher.minOrderValue.toLocaleString()} VNĐ để sử dụng voucher này`, 'error');
        return;
      }
    }
    try {
      setSubmitLoading(true);
      // Map frontend PaymentType to backend PaymentType enum
      const backendPaymentType = selectedPaymentType === 'CARD' ? 'CARD' as const : 
                                selectedPaymentType === 'WALLET' ? 'WALLET' as const : 'BANK_TRANSFER' as const;
      
      const bookingData: BookingRequest = {
        guestId: 0, // Will be set by backend from authenticated user token
        hotelId: hotel.id,
        roomIds: selectedRooms,
        checkInDate: values.checkInDate.format('YYYY-MM-DD'),
        checkOutDate: values.checkOutDate.format('YYYY-MM-DD'),
        totalPrice: totalAmount,
        paymentType: backendPaymentType,
        notes: values.specialRequests,
        ...(selectedVoucher && { voucherId: selectedVoucher.id }),
      };
      console.log('Booking data to send:', bookingData);
      console.log('Booking data type check:', {
        guestId: typeof bookingData.guestId,
        hotelId: typeof bookingData.hotelId,
        roomIds: Array.isArray(bookingData.roomIds),
        checkInDate: typeof bookingData.checkInDate,
        checkOutDate: typeof bookingData.checkOutDate,
        totalPrice: typeof bookingData.totalPrice,
        paymentType: typeof bookingData.paymentType,
        notes: typeof bookingData.notes,
        voucherId: bookingData.voucherId ? typeof bookingData.voucherId : 'undefined'
      });
      const response = await bookingService.createBooking(bookingData as any);
      if (response.status === 201 && response.data.length > 0) {
        const booking = response.data[0];
        setBookingResult(booking);
        
        // Dừng timer khi booking thành công - phòng đã được đặt chính thức
        stopBookingTimer();
        // Không cần thả phòng vì đã booking thành công
        
            // Nếu chọn thanh toán online (CARD/VNPAY hoặc BANK_TRANSFER/MOMO), redirect đến payment
            if (selectedPaymentType === 'CARD' || selectedPaymentType === 'BANK_TRANSFER') {
              try {
                let paymentResponse;
                
                if (selectedPaymentType === 'CARD') {
                  // CARD → VNPay
                  paymentResponse = await paymentService.createVnPayPayment(booking.id.toString());
                } else {
                  // BANK_TRANSFER → MoMo
                  paymentResponse = await paymentService.createMomoQR(booking.id);
                }
                
                console.log('Payment response:', paymentResponse);
                
                if (paymentResponse.data && paymentResponse.data.success) {
                  showToast('Đặt phòng thành công! Đang chuyển hướng đến trang thanh toán...', 'success');
                  
                  // Store payment response for potential QR display
                  setPaymentResponse(paymentResponse.data);
                  
                  // For MoMo, show QR code instead of redirecting
                  if (selectedPaymentType === 'BANK_TRANSFER') {
                    // Show QR code for MoMo payment
                    setCurrentStep(2);
                    showToast('Đặt phòng thành công! Vui lòng quét QR code để thanh toán.', 'success');
                    return;
                  } else if (selectedPaymentType === 'CARD' && paymentResponse.data.paymentUrl) {
                    // Redirect to VNPay payment URL
                    window.location.href = paymentResponse.data.paymentUrl;
                    return;
                  } else {
                    showToast('Không thể tạo liên kết thanh toán. Vui lòng thử lại.', 'error');
                  }
                } else {
                  showToast('Không thể tạo liên kết thanh toán. Vui lòng thử lại.', 'error');
                }
              } catch (paymentError) {
                console.error('Payment error:', paymentError);
                showToast('Có lỗi xảy ra khi tạo liên kết thanh toán', 'error');
                // Vẫn chuyển sang step 2 để user có thể thử lại
                setCurrentStep(2);
                showToast('Đặt phòng thành công! Bạn có thể thanh toán sau.', 'success');
                return;
              }
            }
        
        setCurrentStep(2);
        showToast('Đặt phòng thành công!', 'success');
      } else {
        showToast('Không thể tạo booking. Vui lòng thử lại.', 'error');
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      
      // Handle specific error messages from API
      if (error.response?.status === 400) {
        const apiMessage = error.response?.data?.message;
        const fieldErrors = error.response?.data?.errors || {};
        const formFieldErrors: any[] = [];
        if (fieldErrors.checkInDate) {
          formFieldErrors.push({ name: 'checkInDate', errors: [fieldErrors.checkInDate] });
        }
        if (fieldErrors.checkOutDate) {
          formFieldErrors.push({ name: 'checkOutDate', errors: [fieldErrors.checkOutDate] });
        }
        if (formFieldErrors.length > 0) {
          form.setFields(formFieldErrors);
        }
        // Collect other non-field messages
        const otherMessages: string[] = [];
        Object.keys(fieldErrors).forEach((k) => {
          if (k !== 'checkInDate' && k !== 'checkOutDate' && fieldErrors[k]) {
            otherMessages.push(String(fieldErrors[k]));
          }
        });
        const combinedMessage = [apiMessage, ...otherMessages].filter(Boolean).join('\n');
        showToast(combinedMessage || 'Thông tin đặt phòng không hợp lệ. Vui lòng kiểm tra lại.', 'error');
      } else if (error.response?.data?.message) {
        showToast(error.response.data.message, 'error');
      } else if (error.response?.status === 401) {
        showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
        navigate('/login');
      } else if (error.response?.status === 400) {
        // For 400 errors, try to get message from response data
        const errorMessage = error.response?.data?.message || 'Thông tin đặt phòng không hợp lệ. Vui lòng kiểm tra lại.';
        showToast(errorMessage, 'error');
      } else if (error.response?.status === 409) {
        showToast('Phòng đã được đặt bởi khách khác. Vui lòng chọn phòng khác.', 'error');
      } else {
        showToast('Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại sau.', 'error');
      }
    } finally {
      setSubmitLoading(false);
    }
  };
  const handlePayment = async (paymentType: PaymentType) => {
    if (!bookingResult) return;
    try {
      setSubmitLoading(true);
      // Map UI payment type to backend payment method
      const method = paymentType === 'WALLET' ? 'MOMO' : paymentType === 'CARD' ? 'VNPAY' : 'CASH';

      const resp = await paymentService.processPayment({
        bookingId: bookingResult.id,
        paymentMethod: method as 'MOMO' | 'VNPAY' | 'CASH',
      });

      if (resp.status === 200 && resp.data.success) {
        // If have paymentUrl, redirect user to gateway
        if (resp.data.paymentUrl) {
          window.location.href = resp.data.paymentUrl;
          return;
        }
        // If CASH or no redirect needed
        showToast(resp.data.message || 'Đã xác nhận đặt phòng. Thanh toán sẽ thực hiện tại khách sạn.', 'success');
        setCurrentStep(2);
      } else {
        showToast(resp.data.error || 'Không thể xử lý thanh toán. Vui lòng thử lại.', 'error');
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      if (error.response?.data?.error) {
        showToast(`Lỗi thanh toán: ${error.response.data.error}`, 'error');
      } else if (error.response?.data?.message) {
        showToast(`Lỗi thanh toán: ${error.response.data.message}`, 'error');
      } else if (error.response?.status === 401) {
        showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
        navigate('/login');
      } else {
        showToast('Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại sau.', 'error');
      }
    } finally {
      setSubmitLoading(false);
    }
  };
  const getPaymentIcon = (type: PaymentType) => {
    switch (type) {
      case 'CARD':
        return <CreditCardOutlined className="text-2xl" />;
      case 'WALLET':
        return <WalletOutlined className="text-2xl" />;
      case 'BANK_TRANSFER':
        return <BankOutlined className="text-2xl" />;
      default:
        return <CreditCardOutlined className="text-2xl" />;
    }
  };
  const getPaymentName = (type: PaymentType) => {
    switch (type) {
      case 'CARD':
        return 'VNPay (Thẻ/Internet Banking)';
      case 'WALLET':
        return 'MoMo (Ví điện tử)';
      case 'BANK_TRANSFER':
        return 'Thanh toán tiền mặt tại khách sạn';
      default:
        return 'Không xác định';
    }
  };
  const steps = [
    {
      title: 'Chọn phòng',
      icon: <HomeOutlined />,
    },
    {
      title: 'Thông tin đặt phòng',
      icon: <CreditCardOutlined />,
    },
    {
      title: 'Hoàn thành',
      icon: <CheckCircleOutlined />,
    },
  ];
  if (loading) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Content className="flex justify-center items-center">
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!hotel) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Content className="flex flex-col justify-center items-center py-20">
          <Title level={3}>Không tìm thấy khách sạn</Title>
          <Text className="mb-4 text-gray-600">
            Khách sạn không tồn tại hoặc đã bị gỡ bỏ
          </Text>
          <Button type="primary" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="max-w-7xl mx-auto px-6 py-8">
        {}
        <div className="mb-6">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-600 hover:text-blue-600"
          >
            Quay lại
          </Button>
          <Title level={2} className="mb-4">
            Đặt phòng - {hotel?.name || 'Loading...'}
          </Title>
          
          <Steps current={currentStep} className="mb-8">
            {steps.map((step, index) => (
              <Step key={index} title={step.title} icon={step.icon} />
            ))}
          </Steps>
        </div>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {}
            {currentStep === 0 && (
              <Card title="Chọn phòng" className="mb-6 rounded-xl shadow-lg border-none">
                {}
                <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
                  <strong>Debug Info:</strong> Selected Rooms: [{selectedRooms.join(', ')}] | 
                  Total Rooms: {rooms.length} | 
                  Initial Set: {isInitialRoomSelectionSet ? 'Yes' : 'No'}
                  <br />
                  <button 
                    onClick={() => {
                      console.log('Current state:', { selectedRooms, rooms: rooms.length, isInitialRoomSelectionSet });
                      setSelectedRooms([]);
                    }}
                    className="mt-2 px-2 py-1 bg-red-200 rounded text-xs"
                  >
                    Clear Selection (Test)
                  </button>
                </div>
                <Row gutter={[16, 16]} className="room-cards-container">
                  {rooms.map((room) => (
                    <Col xs={24} sm={12} md={8} key={room.id} className="room-card-col">
                      <Card
                        hoverable={room.available !== false}
                        className={`rounded-lg transition-all duration-300 h-full flex flex-col ${
                          room.available === false
                            ? 'opacity-75 bg-gray-50 border-gray-300'
                            : selectedRooms.includes(room.id) 
                              ? 'ring-2 ring-blue-500 shadow-lg' 
                              : 'hover:shadow-md'
                        }`}
                        cover={
                          room.listImageUrl && room.listImageUrl.length > 0 ? (
                            <div className="h-32 overflow-hidden">
                              <img
                                src={room.listImageUrl[0]}
                                alt={`Phòng ${room.id}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-32 bg-gray-200 flex items-center justify-center">
                              <HomeOutlined className="text-2xl text-gray-400" />
                            </div>
                          )
                        }
                        actions={[
                          <Button
                            key="select"
                            type={selectedRooms.includes(room.id) ? 'primary' : 'default'}
                            onClick={() => handleRoomSelection(room.id, !selectedRooms.includes(room.id))}
                            disabled={room.available === false}
                            className="w-full"
                          >
                            {room.available === false 
                              ? 'Đã đặt' 
                              : !isAuthenticated
                                ? 'Đăng nhập để chọn'
                                : selectedRooms.includes(room.id) 
                                  ? 'Đã chọn' 
                                  : 'Chọn phòng'
                            }
                          </Button>
                        ]}
                      >
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <Title level={5} className="mb-2">Phòng #{room.id}</Title>
                            <div className="space-y-1">
                              <Text className="block">Loại: {room.typeRoom}</Text>
                              <Text className="block">Sức chứa: {room.capacity} người</Text>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            <Text strong className="text-blue-600 text-lg block">
                              {room.pricePerNight?.toLocaleString('vi-VN')}đ/đêm
                            </Text>
                            <div>
                              {room.available ? (
                                <Tag color="green">Có sẵn</Tag>
                              ) : (
                                <Tag color="red">Đã đặt</Tag>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}
            {}
            {currentStep === 1 && (
              <Card title="Thông tin đặt phòng" className="mb-6 rounded-xl shadow-lg border-none">
                {/* Timer warning */}
                {bookingTimer !== null && bookingTimer > 0 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ClockCircleOutlined className="text-red-500 mr-2" />
                        <Text className="text-red-700">
                          <strong>Thời gian giữ phòng:</strong> {formatTime(bookingTimer)}
                        </Text>
                      </div>
                      <Text className="text-sm text-gray-600">
                        Vui lòng hoàn thành trong thời gian này
                      </Text>
                    </div>
                  </div>
                )}
                
                {!isAuthenticated && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UserOutlined className="text-blue-500 mr-2" />
                        <Text className="text-blue-700">
                          <strong>Cần đăng nhập:</strong> Vui lòng đăng nhập để chọn phòng và đặt phòng.
                        </Text>
                      </div>
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => navigate('/login', { state: { from: location.pathname + location.search } })}
                      >
                        Đăng nhập
                      </Button>
                    </div>
                  </div>
                )}
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleBookingSubmit}
                  initialValues={{
                    checkInDate: checkInDate ? dayjs(checkInDate) : dayjs().add(1, 'day'),
                    checkOutDate: checkOutDate ? dayjs(checkOutDate) : dayjs().add(2, 'day'),
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="checkInDate"
                        label="Ngày nhận phòng"
                        rules={[
                          { required: true, message: 'Vui lòng chọn ngày nhận phòng' },
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              if (value.isBefore(dayjs().add(1, 'day').startOf('day'))) {
                                return Promise.reject(new Error('Ngày nhận phòng phải từ ngày mai trở đi'));
                              }
                              
                              // Check if booking period exceeds 30 days
                              const checkOutDate = form.getFieldValue('checkOutDate');
                              if (
                                checkOutDate &&
                                dayjs(checkOutDate).diff(value, 'day') > 30
                              ) {
                                return Promise.reject(new Error('Thời gian đặt phòng không được vượt quá 30 ngày'));
                              }
                              
                              return Promise.resolve();
                            }
                          }
                        ]}
                      >
                        <DatePicker 
                          size="large" 
                          className="w-full"
                          format="DD/MM/YYYY"
                          disabledDate={(current) => current && dayjs(current).isBefore(dayjs().add(1, 'day').startOf('day'))}
                          placeholder="Chọn ngày nhận phòng"
                          onChange={() => {
                            // Clear checkout date if it's before new checkin date
                            const checkOutDate = form.getFieldValue('checkOutDate');
                            const checkInDate = form.getFieldValue('checkInDate');
                            if (
                              checkOutDate &&
                              checkInDate &&
                              dayjs(checkOutDate).startOf('day').valueOf() <=
                                dayjs(checkInDate).startOf('day').valueOf()
                            ) {
                              form.setFieldValue('checkOutDate', null);
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="checkOutDate"
                        label="Ngày trả phòng"
                        rules={[
                          { required: true, message: 'Vui lòng chọn ngày trả phòng' },
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              const checkInDate = form.getFieldValue('checkInDate');
                              
                              // Check if checkout date is in the future
                              if (value.isBefore(dayjs().add(1, 'day').startOf('day'))) {
                                return Promise.reject(new Error('Ngày trả phòng phải từ ngày mai trở đi'));
                              }
                              
                              // Check if checkout date is after checkin date
                              if (
                                checkInDate &&
                                dayjs(value).startOf('day').valueOf() <=
                                  dayjs(checkInDate).startOf('day').valueOf()
                              ) {
                                return Promise.reject(new Error('Ngày trả phòng phải sau ngày nhận phòng'));
                              }
                              
                              // Check if booking period exceeds 30 days
                              if (
                                checkInDate &&
                                dayjs(value).diff(dayjs(checkInDate), 'day') > 30
                              ) {
                                return Promise.reject(new Error('Thời gian đặt phòng không được vượt quá 30 ngày'));
                              }
                              
                              return Promise.resolve();
                            }
                          }
                        ]}
                      >
                        <DatePicker 
                          size="large" 
                          className="w-full"
                          format="DD/MM/YYYY"
                          disabledDate={(current) => {
                            const checkInDate = form.getFieldValue('checkInDate');
                            if (!current) return false;
                            
                            // Convert current to dayjs if it's not already
                            const currentDay = dayjs(current);
                            
                            // Disable dates before tomorrow
                            if (currentDay.isBefore(dayjs().add(1, 'day').startOf('day'))) return true;
                            
                            // Disable dates before or equal to check-in date
                            if (
                              checkInDate &&
                              currentDay.startOf('day').valueOf() <=
                                dayjs(checkInDate).startOf('day').valueOf()
                            )
                              return true;
                            
                            return false;
                          }}
                          placeholder="Chọn ngày trả phòng"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="specialRequests" label="Yêu cầu đặc biệt">
                    <TextArea rows={4} placeholder="Nhập yêu cầu đặc biệt (nếu có)" />
                  </Form.Item>
                  {}
                  <Card 
                    size="small" 
                    title="Phương thức thanh toán" 
                    className="mb-4 border-blue-200"
                  >
                    <Row gutter={[16, 16]}>
                      {(['CARD', 'WALLET', 'BANK_TRANSFER'] as const).map((type) => (
                        <Col xs={24} sm={8} key={type}>
                          <Card
                            hoverable
                            className={`text-center cursor-pointer transition-all duration-300 ${
                              selectedPaymentType === type 
                                ? 'ring-2 ring-blue-500 shadow-lg' 
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => setSelectedPaymentType(type)}
                            bodyStyle={{ 
                              padding: '16px',
                              height: '120px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            <div className="text-blue-500 mb-2">
                              {getPaymentIcon(type)}
                            </div>
                            <Text strong className="text-sm text-center leading-tight">
                              {getPaymentName(type)}
                            </Text>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                  {}
                  {availableVouchers.length > 0 ? (
                    <Card 
                      size="small" 
                      title={
                        <div className="flex items-center">
                          <GiftOutlined className="text-orange-500 mr-2" />
                          <span>Voucher khuyến mãi</span>
                          <Tag color="orange" className="ml-2">{availableVouchers.length} voucher</Tag>
                        </div>
                      } 
                      className="mb-4 border-orange-200"
                    >
                      <Form.Item name="voucherCode" label="Chọn voucher">
                        <Select
                          placeholder="Chọn voucher để giảm giá"
                          allowClear
                          onChange={handleVoucherApply}
                          size="large"
                        >
                          {availableVouchers.map(voucher => (
                            <Option key={voucher.id} value={voucher.voucherCode}>
                              <div className="py-2">
                                <div className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <Text strong className="text-gray-800">{voucher.voucherName}</Text>
                                    <br />
                                    <Text className="text-xs text-gray-500">
                                      Mã: {voucher.voucherCode} • 
                                      Áp dụng cho đơn từ {voucher.priceCondition?.toLocaleString('vi-VN')}đ
                                    </Text>
                                  </div>
                                  <div className="ml-3">
                                    <Tag color="red" className="font-bold">
                                      -{voucher.percentDiscount}%
                                    </Tag>
                                  </div>
                                </div>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      {voucherDiscount > 0 && selectedVoucher && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <CheckCircleOutlined className="text-green-500 mr-2" />
                              <Text className="text-green-700">
                                Voucher "{selectedVoucher.voucherName}" đã được áp dụng
                              </Text>
                            </div>
                            <Text strong className="text-green-600">
                              -{voucherDiscount.toLocaleString('vi-VN')}đ
                            </Text>
                          </div>
                        </div>
                      )}
                    </Card>
                  ) : (
                    <Card 
                      size="small" 
                      className="mb-4 border-gray-200"
                    >
                      <div className="text-center py-4">
                        <GiftOutlined className="text-gray-300 text-2xl mb-2" />
                        <Text type="secondary">Khách sạn này hiện không có voucher khuyến mãi</Text>
                      </div>
                    </Card>
                  )}
                </Form>
              </Card>
            )}
            {}
            {currentStep === 2 && bookingResult && (
              <Card title="Đặt phòng thành công" className="mb-6 rounded-xl shadow-lg border-none">
                <div className="text-center py-8">
                  <div className="mb-6">
                    <CheckCircleOutlined className="text-green-500 text-6xl mb-4" />
                    <Title level={2} className="text-green-600 mb-2">
                      Đặt phòng thành công!
                    </Title>
                    <Text className="text-gray-600 text-lg">
                      Mã đặt phòng: <Text code className="text-blue-600 text-xl font-bold">{bookingResult.bookingCode}</Text>
                    </Text>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <Title level={4} className="text-green-800 mb-4">Thông tin đặt phòng</Title>
                    <Row gutter={[16, 16]} className="text-left">
                      <Col span={12}>
                        <Text strong>Khách sạn:</Text>
                        <br />
                        <Text>{hotel?.name}</Text>
                      </Col>
                      <Col span={12}>
                        <Text strong>Phương thức thanh toán:</Text>
                        <br />
                        <Text>{getPaymentName(selectedPaymentType)}</Text>
                      </Col>
                      <Col span={12}>
                        <Text strong>Check-in:</Text>
                        <br />
                        <Text>{form.getFieldValue('checkInDate')?.format('DD/MM/YYYY')}</Text>
                      </Col>
                      <Col span={12}>
                        <Text strong>Check-out:</Text>
                        <br />
                        <Text>{form.getFieldValue('checkOutDate')?.format('DD/MM/YYYY')}</Text>
                      </Col>
                      <Col span={24}>
                        <Text strong>Tổng tiền:</Text>
                        <br />
                        <Text className="text-2xl font-bold text-green-600">
                          {totalAmount.toLocaleString('vi-VN')}đ
                        </Text>
                      </Col>
                    </Row>
                  </div>
                  <div className="space-y-4">
                    {/* Nếu booking chưa thanh toán và không phải CASH, hiện nút thanh toán */}
                    {bookingResult && selectedPaymentType !== 'BANK_TRANSFER' && (
                      <div className="space-y-2">
                        <Button
                          type="primary"
                          size="large"
                          loading={submitLoading}
                          onClick={() => handlePayment(selectedPaymentType)}
                          className="bg-green-600 hover:bg-green-700 w-full"
                          icon={selectedPaymentType === 'WALLET' ? <WalletOutlined /> : <CreditCardOutlined />}
                        >
                          Thanh toán ngay ({getPaymentName(selectedPaymentType)})
                        </Button>
                        <Text className="block text-center text-gray-500 text-sm">
                          Hoặc bạn có thể thanh toán sau từ trang "Booking của tôi"
                        </Text>
                      </div>
                    )}
                    
                    {/* Payment QR Code Display */}
                    {paymentResponse && paymentResponse.qrCode && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <Title level={4} className="text-blue-800 mb-4 text-center">
                          Thanh toán qua MoMo
                        </Title>
                        <div className="text-center">
                          <Text className="text-blue-700 mb-4 block">
                            Quét mã QR bằng ứng dụng MoMo để thanh toán
                          </Text>
                          <div className="bg-white p-4 rounded-lg inline-block">
                            <div className="text-xs text-gray-500 mb-2">QR Code:</div>
                            <div className="font-mono text-xs break-all max-w-xs">
                              {paymentResponse.qrCode}
                            </div>
                          </div>
                          <div className="mt-4">
                            <Text strong className="text-blue-600">
                              Order ID: {paymentResponse.orderId}
                            </Text>
                          </div>
                          <div className="mt-2">
                            <Button 
                              type="primary" 
                              onClick={() => window.location.href = paymentResponse.paymentUrl}
                              className="mr-2"
                            >
                              Mở MoMo App
                            </Button>
                            <Button 
                              onClick={() => setPaymentResponse(null)}
                            >
                              Đóng
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => navigate('/my-bookings')}
                      className="bg-blue-600 hover:bg-blue-700 mr-4"
                    >
                      Xem booking của tôi
                    </Button>
                    <Button
                      size="large"
                      onClick={() => navigate('/')}
                    >
                      Về trang chủ
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </Col>
          {}
          <Col xs={24} lg={8}>
            <Card title="Tóm tắt đặt phòng" className="sticky top-4 rounded-xl shadow-lg border-none">
              {hotel && (
                <div className="mb-4">
                  <Title level={5}>{hotel.name}</Title>
                  <Text type="secondary" className="block">
                    {hotel.addressDetail}, {hotel.district}
                  </Text>
                </div>
              )}
              <Divider />
              {selectedRooms.length > 0 && (
                <div className="mb-4">
                  <Title level={5}>Phòng đã chọn:</Title>
                  {rooms
                    .filter(room => selectedRooms.includes(room.id))
                    .map(room => (
                      <div key={room.id} className="flex justify-between items-center mb-2">
                        <Text>Phòng #{room.id} ({room.typeRoom})</Text>
                        <Text strong>{room.pricePerNight?.toLocaleString('vi-VN')}đ</Text>
                      </div>
                    ))}
                </div>
              )}
              <Divider />
              {/* Timer hiển thị */}
              {bookingTimer !== null && bookingTimer > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <ClockCircleOutlined className="text-red-500" />
                    <Text strong className="text-red-600">
                      Thời gian giữ phòng còn lại:
                    </Text>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mt-1">
                    {formatTime(bookingTimer)}
                  </div>
                  <Text className="text-sm text-gray-600">
                    Vui lòng hoàn thành đặt phòng trong thời gian này
                  </Text>
                </div>
              )}

              {/* Debug info */}
              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <strong>Debug:</strong> Step: {currentStep} | Selected: [{selectedRooms.join(', ')}] | Total: {totalAmount}đ | Rooms: {rooms.length}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Tạm tính:</Text>
                  <Text>{(totalAmount + voucherDiscount).toLocaleString('vi-VN')}đ</Text>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <Text>Giảm giá:</Text>
                    <Text>-{voucherDiscount.toLocaleString('vi-VN')}đ</Text>
                  </div>
                )}
                <Divider />
                <div className="flex justify-between">
                  <Text strong className="text-lg">Tổng cộng:</Text>
                  <Text strong className="text-lg text-blue-600">
                    {totalAmount.toLocaleString('vi-VN')}đ
                  </Text>
                </div>
              </div>
              <Divider />
              <div className="space-y-3">
                {currentStep === 0 && (
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleNext}
                    disabled={selectedRooms.length === 0}
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 border-none font-semibold hover:from-blue-600 hover:to-cyan-500"
                  >
                    Tiếp tục
                  </Button>
                )}
                {currentStep === 1 && (
                  <Space direction="vertical" className="w-full">
                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={submitLoading}
                      onClick={() => form.submit()}
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 border-none font-semibold hover:from-blue-600 hover:to-cyan-500"
                    >
                      Xác nhận đặt phòng
                    </Button>
                    <Button size="large" block onClick={handlePrev}>
                      Quay lại
                    </Button>
                  </Space>
                )}
                {currentStep === 2 && (
                  <Space direction="vertical" className="w-full">
                    <Button 
                      type="primary"
                      size="large" 
                      block 
                      onClick={() => navigate('/my-bookings')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Xem booking của tôi
                    </Button>
                    <Button size="large" block onClick={() => navigate('/')}>
                      Về trang chủ
                    </Button>
                  </Space>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};
export default BookingPage;