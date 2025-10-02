import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  DatePicker,
  Carousel,
  Rate,
  Typography,
  Space,
  Avatar,
  Divider,
  InputNumber,
  message,
  Spin,
  Tag,
  Dropdown,
  Modal,
  Form,
} from 'antd';
import {
  SearchOutlined,
  HomeOutlined,
  BankOutlined,
  BuildOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  StarFilled,
  PhoneOutlined,
  MailOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  AppleOutlined,
  AndroidOutlined,
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { hotelService } from '../services/hotelService';
import { voucherService } from '../services/voucherService';
import { userService, type UserInfo, type ChangePasswordRequest } from '../services/userService';
import { useAuthStore } from '../store/authStore';
import ChatBot from '../components/ChatBot';
import type { Hotel, Voucher } from '../types';
import dayjs, { Dayjs } from 'dayjs';
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const Homepage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([]);
  const [dealHotels, setDealHotels] = useState<Hotel[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [searchForm, setSearchForm] = useState({
    location: '',
    dateRange: null as [Dayjs, Dayjs] | null,
    guests: 2,
    rooms: 1,
  });
  const [changePasswordForm] = Form.useForm();
  useEffect(() => {
    fetchData();
    if (isAuthenticated) {
      fetchUserInfo();
    }
  }, [isAuthenticated]);
  const fetchData = async () => {
    try {
      setLoading(true);
      const hotelsResponse = await hotelService.getFeaturedHotels({ page: 0, size: 20, sort: 'starRating' }).catch(err => {
        console.error('Error fetching hotels:', err);
        message.error('Không thể tải danh sách khách sạn');
        return { status: 500, data: { items: [] } };
      });
      let vouchersResponse: { status: number; data: { items: Voucher[] } } = { status: 200, data: { items: [] } };
      if (isAuthenticated) {
        vouchersResponse = await voucherService.getAllVouchers({ page: 0, size: 10 }).catch(err => {
          console.error('Error fetching vouchers:', err);
          return { status: 500, data: { items: [] as Voucher[] } };
        });
      }
      if (hotelsResponse.status === 200 && hotelsResponse.data.items) {
        const hotels = hotelsResponse.data.items;
        setFeaturedHotels(hotels);
        setDealHotels(hotels.slice(0, 6));
        if (hotels.length === 0) {
          message.warning('Hiện tại không có khách sạn nào');
        }
      } else {
        message.error('Không thể tải danh sách khách sạn');
      }
      if (vouchersResponse.status === 200 && vouchersResponse.data.items) {
        setVouchers(vouchersResponse.data.items);
        if (isAuthenticated && vouchersResponse.data.items.length === 0) {
          message.info('Hiện tại không có voucher khuyến mãi');
        }
      } else if (isAuthenticated) {
        message.error('Không thể tải danh sách voucher');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  const fetchUserInfo = async () => {
    try {
      const response = await userService.getUserInfo();
      if (response.status === 200) {
        setUserInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };
  const handleLogout = () => {
    logout();
    setUserInfo(null);
    message.success('Đăng xuất thành công');
    window.location.reload(); // Refresh to clear any cached data
  };
  const handleChangePassword = async (values: ChangePasswordRequest) => {
    try {
      setChangePasswordLoading(true);
      const response = await userService.changePassword(values);
      if (response.status === 200) {
        message.success('Đổi mật khẩu thành công');
        setChangePasswordModalVisible(false);
        changePasswordForm.resetFields();
      } else {
        message.error('Không thể đổi mật khẩu');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        message.error('Mật khẩu cũ không đúng hoặc mật khẩu mới không hợp lệ');
      } else {
        message.error('Có lỗi xảy ra khi đổi mật khẩu');
      }
    } finally {
      setChangePasswordLoading(false);
    }
  };
  const handleSearch = () => {
    if (!searchForm.location) {
      message.warning('Vui lòng chọn địa điểm!');
      return;
    }
    if (!searchForm.dateRange) {
      message.warning('Vui lòng chọn ngày check-in và check-out!');
      return;
    }
    console.log('Search params:', searchForm);
    message.success('Đang tìm kiếm khách sạn...');
  };
  const handleViewHotelDetail = (hotel: Hotel) => {
    window.open(`/hotel/${hotel.id}`, '_blank');
  };
  const bannerSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      title: 'Giảm 30% mùa hè ☀️',
      subtitle: 'Khám phá những điểm đến tuyệt vời',
      cta: 'Đặt ngay',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      title: 'Deal 199k / đêm',
      subtitle: 'Khách sạn 4 sao giá tốt nhất',
      cta: 'Xem ngay',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      title: 'Resort cao cấp',
      subtitle: 'Trải nghiệm nghỉ dưỡng đẳng cấp',
      cta: 'Khám phá',
    },
  ];
  const getVoucherStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'INACTIVE': return 'red';
      case 'EXPIRED': return 'gray';
      default: return 'blue';
    }
  };
  const quickCategories = [
    { icon: <StarFilled />, title: 'Khách sạn', count: '2000+', color: '#1890ff' },
    { icon: <HomeOutlined />, title: 'Homestay', count: '500+', color: '#52c41a' },
    { icon: <BankOutlined />, title: 'Resort', count: '300+', color: '#fa8c16' },
    { icon: <BuildOutlined />, title: 'Villa', count: '150+', color: '#722ed1' },
    { icon: <ShopOutlined />, title: 'Căn hộ', count: '800+', color: '#eb2f96' },
  ];
  const destinations = [
    {
      name: 'Hà Nội',
      count: '2000+ khách sạn',
      image: 'https://statics.vinpearl.com/dia-diem-chup-anh-dep-o-ha-noi-1_1680675425.jpg',
    },
    {
      name: 'Đà Nẵng',
      count: '800+ khách sạn',
      image: 'https://vietluxtour.com/Upload/images/2024/khamphatrongnuoc/C%E1%BA%A7u%20R%E1%BB%93ng%20%C4%90%C3%A0%20N%E1%BA%B5ng/cau-rong-da-nang-main-min.jpg',
    },
    {
      name: 'Đà Lạt',
      count: '600+ khách sạn',
      image: 'https://nld.mediacdn.vn/291774122806476800/2024/12/2/festival-hoa-da-lat-1-17331207232341326386940.jpg',
    },
    {
      name: 'Nha Trang',
      count: '700+ khách sạn',
      image: 'https://vcdn1-vnexpress.vnecdn.net/2021/03/22/NhaTrang-KhoaTran-27-1616120145.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=9BMNnjV_o665_kwWTgfOSQ',
    },
    {
      name: 'TP. Hồ Chí Minh',
      count: '1500+ khách sạn',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Quảng Trị',
      count: '2000+ khách sạn',
      image: 'https://quangbinhtravel.vn/wp-content/uploads/2020/03/du-lich-quang-tri.jpg',
    },
  ];
  const testimonials = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Dịch vụ tuyệt vời, khách sạn sạch sẽ và đội ngũ nhân viên rất thân thiện!',
    },
    {
      id: 2,
      name: 'Trần Thị B',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Đặt phòng nhanh chóng, giá cả hợp lý. Sẽ quay lại lần sau!',
    },
    {
      id: 3,
      name: 'Lê Văn C',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Website dễ sử dụng, nhiều lựa chọn khách sạn chất lượng.',
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <HomeOutlined className="text-3xl text-blue-600" />
              <Title level={3} className="mb-0 text-blue-600 font-bold">BookingHotel</Title>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button 
                    type="text" 
                    onClick={() => window.open('/my-bookings', '_blank')}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Booking của tôi
                  </Button>
                  {user?.userType !== 'GUEST' && (
                    <Button 
                      type="text" 
                      onClick={() => window.open('/dashboard', '_blank')}
                      className="text-gray-700 hover:text-blue-600"
                    >
                      Dashboard
                    </Button>
                  )}
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'profile',
                          label: (
                            <div className="px-2 py-1">
                              <div className="font-semibold">{userInfo?.fullName || user?.fullName || 'User'}</div>
                              <div className="text-xs text-gray-500">{userInfo?.email}</div>
                            </div>
                          ),
                          disabled: true,
                        },
                        {
                          type: 'divider',
                        },
                        {
                          key: 'change-password',
                          label: 'Đổi mật khẩu',
                          icon: <LockOutlined />,
                          onClick: () => setChangePasswordModalVisible(true),
                        },
                        {
                          type: 'divider',
                        },
                        {
                          key: 'logout',
                          label: 'Đăng xuất',
                          icon: <LogoutOutlined />,
                          onClick: handleLogout,
                        },
                      ],
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button type="text" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                      <Avatar size="small" icon={<UserOutlined />} />
                      <span>{userInfo?.fullName || user?.fullName || 'User'}</span>
                      <SettingOutlined className="text-xs" />
                    </Button>
                  </Dropdown>
                </>
              ) : (
                <Button 
                  type="primary" 
                  onClick={() => window.open('/login', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Đăng nhập
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      <section className="relative h-[600px] overflow-hidden">
        <Carousel autoplay effect="fade" className="h-full">
          {bannerSlides.map(slide => (
            <div key={slide.id}>
              <div
                className="h-[600px] bg-cover bg-center flex items-center justify-center text-white text-center relative"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.image})`,
                }}
              >
                <div className="relative z-10">
                  <Title level={1} className="!text-white text-5xl mb-4 font-bold">
                    {slide.title}
                  </Title>
                  <Paragraph className="text-white text-xl mb-8 max-w-2xl">
                    {slide.subtitle}
                  </Paragraph>
                  <Button 
                    type="primary" 
                    size="large" 
                    className="rounded-full px-10 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 border-none font-semibold hover:from-blue-600 hover:to-cyan-500 transform hover:scale-105 transition-all duration-300"
                  >
                    {slide.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[95%] max-w-6xl bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-2xl z-20">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={6}>
              <div className="mb-2">
                <Text strong className="text-gray-700 text-sm">Địa điểm / Khách sạn</Text>
              </div>
              <Input
                size="large"
                placeholder="Bạn muốn đi đâu?"
                prefix={<EnvironmentOutlined className="text-blue-500" />}
                value={searchForm.location}
                onChange={(e) => setSearchForm(prev => ({ ...prev, location: e.target.value }))}
                className="rounded-lg border-gray-200 hover:border-blue-400 focus:border-blue-500"
              />
            </Col>
            <Col xs={24} md={8}>
              <div className="mb-2">
                <Text strong className="text-gray-700 text-sm">Ngày nhận - trả phòng</Text>
              </div>
              <RangePicker
                size="large"
                className="w-full rounded-lg border-gray-200 hover:border-blue-400 focus:border-blue-500"
                placeholder={['Check-in', 'Check-out']}
                format="DD/MM/YYYY"
                value={searchForm.dateRange}
                onChange={(dates) => setSearchForm(prev => ({ ...prev, dateRange: dates as [Dayjs, Dayjs] | null }))}
                disabledDate={(current) => {
                  // Disable dates before today
                  return current && current < dayjs().startOf('day');
                }}
                onCalendarChange={(dates) => {
                  // Validate dates when calendar changes
                  if (dates && dates.length === 2) {
                    const [checkIn, checkOut] = dates;
                    if (checkIn && checkOut) {
                      if (checkIn.isBefore(dayjs().startOf('day'))) {
                        message.warning('Ngày nhận phòng phải từ hôm nay trở đi');
                        return;
                      }
                      if (checkOut.isBefore(dayjs().startOf('day'))) {
                        message.warning('Ngày trả phòng phải từ hôm nay trở đi');
                        return;
                      }
                      if (checkOut.isSameOrBefore(checkIn)) {
                        message.warning('Ngày trả phòng phải sau ngày nhận phòng');
                        return;
                      }
                    }
                  }
                }}
              />
            </Col>
            <Col xs={12} md={3}>
              <div className="mb-2">
                <Text strong className="text-gray-700 text-sm">Số khách</Text>
              </div>
              <InputNumber
                size="large"
                min={1}
                max={20}
                className="w-full rounded-lg border-gray-200 hover:border-blue-400 focus:border-blue-500"
                value={searchForm.guests}
                onChange={(value) => setSearchForm(prev => ({ ...prev, guests: value || 2 }))}
              />
            </Col>
            <Col xs={12} md={3}>
              <div className="mb-2">
                <Text strong className="text-gray-700 text-sm">Số phòng</Text>
              </div>
              <InputNumber
                size="large"
                min={1}
                max={10}
                className="w-full rounded-lg border-gray-200 hover:border-blue-400 focus:border-blue-500"
                value={searchForm.rooms}
                onChange={(value) => setSearchForm(prev => ({ ...prev, rooms: value || 1 }))}
              />
            </Col>
            <Col xs={24} md={4}>
              <div className="mb-2 md:mb-0">
                <div className="h-6 md:h-7"></div>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 border-none font-bold hover:from-blue-600 hover:to-cyan-500 transform hover:scale-105 transition-all duration-300 shadow-lg"
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Title level={2} className="text-center mb-12 text-gray-800">
            Danh mục nhanh
          </Title>
          <Row gutter={[24, 24]} justify="center">
            {quickCategories.map((category, index) => (
              <Col xs={12} sm={8} md={6} lg={4} key={index}>
                <Card
                  hoverable
                  className="text-center border-none rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  bodyStyle={{ padding: 32 }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl transition-transform duration-300 hover:scale-110"
                    style={{
                      background: `${category.color}15`,
                      color: category.color,
                    }}
                  >
                    {category.icon}
                  </div>
                  <Title level={4} className="mb-2 text-gray-800">
                    {category.title}
                  </Title>
                  <Text type="secondary" className="text-gray-600">{category.count}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-6">
          <Title level={2} className="text-center mb-12 text-gray-800">
            Voucher khuyến mãi 🎫
          </Title>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Spin size="large" />
            </div>
          ) : vouchers.length > 0 ? (
            <Row gutter={[24, 24]}>
              {vouchers.slice(0, 6).map((voucher) => (
                <Col xs={24} sm={12} md={8} lg={6} key={voucher.id}>
                  <Card
                    hoverable
                    className="rounded-xl overflow-hidden border-none shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-orange-50"
                  >
                    <div className="text-center p-2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-3 mb-4">
                        <Title level={4} className="text-white mb-1 font-bold">
                          {voucher.percentDiscount}% OFF
                        </Title>
                        <Text className="text-orange-100 text-sm">
                          {voucher.voucherCode}
                        </Text>
                      </div>
                      <Title level={5} ellipsis className="mb-2 text-gray-800">
                        {voucher.voucherName}
                      </Title>
                      {voucher.hotelName && (
                        <Text type="secondary" className="block mb-2 text-gray-600 text-sm">
                          🏨 {voucher.hotelName}
                        </Text>
                      )}
                      <div className="mb-3">
                        <Text className="text-gray-600 text-xs">
                          Áp dụng cho đơn từ {voucher.priceCondition?.toLocaleString('vi-VN')}đ
                        </Text>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <Tag color={getVoucherStatusColor(voucher.status)} className="text-xs">
                          {voucher.status === 'ACTIVE' ? 'Còn hiệu lực' : 'Hết hạn'}
                        </Tag>
                        <Text className="text-gray-500 text-xs">
                          SL: {voucher.quantity}
                        </Text>
                      </div>
                      <div className="mb-3">
                        <Text className="text-red-500 text-xs">
                          HSD: {dayjs(voucher.expiredDate).format('DD/MM/YYYY')}
                        </Text>
                      </div>
                      <Button 
                        type="primary" 
                        block 
                        size="small"
                        disabled={voucher.status !== 'ACTIVE'}
                        className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 border-none font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300"
                      >
                        {voucher.status === 'ACTIVE' ? 'Sử dụng ngay' : 'Hết hạn'}
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-10">
              <Text type="secondary">Hiện tại chưa có voucher nào</Text>
            </div>
          )}
        </div>
      </section>
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <Title level={2} className="text-center mb-12 text-gray-800">
            Khách sạn nổi bật
          </Title>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {featuredHotels.slice(0, 8).map((hotel) => (
                <Col xs={24} sm={12} md={8} lg={6} key={hotel.id}>
                  <Card
                    hoverable
                    cover={
                      <div className="h-48 overflow-hidden rounded-t-xl">
                        <img
                          alt={hotel.name}
                          src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                    }
                    className="rounded-xl overflow-hidden border-none shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-full"
                    bodyStyle={{ padding: '16px', height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div className="flex-1">
                      <Title level={5} ellipsis={{ rows: 2 }} className="mb-2 text-gray-800 min-h-[3rem] leading-6">
                        {hotel.name}
                      </Title>
                      <Text type="secondary" className="block mb-2 text-gray-600 text-sm" ellipsis>
                        <EnvironmentOutlined className="text-blue-500 mr-1" /> 
                        {hotel.addressDetail ? `${hotel.addressDetail}, ${hotel.district}` : hotel.district}
                      </Text>
                      {hotel.services && hotel.services.length > 0 && (
                        <div className="mb-2 min-h-[1.5rem]">
                          <Text className="text-gray-500 text-xs" ellipsis>
                            {hotel.services.slice(0, 2).join(' • ')}
                            {hotel.services.length > 2 && '...'}
                          </Text>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Rate disabled defaultValue={hotel.starRating || 4} className="text-sm" />
                          <Text className="text-gray-500 text-xs ml-1">
                            ({hotel.starRating || 4}.0)
                          </Text>
                        </div>
                        <Text strong className="text-blue-600 text-base">
                          {hotel.totalRooms} phòng
                        </Text>
                      </div>
                      <Button 
                        type="primary" 
                        block 
                        className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 border-none font-semibold hover:from-blue-600 hover:to-cyan-500 transform hover:scale-105 transition-all duration-300"
                        onClick={() => handleViewHotelDetail(hotel)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Title level={2} className="text-center mb-12 text-gray-800">
            Khám phá theo địa điểm
          </Title>
          <Row gutter={[24, 24]}>
            {destinations.map((destination, index) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={4} key={index}>
                <Card
                  hoverable
                  cover={
                    <div className="relative h-48 overflow-hidden">
                      <img
                        alt={destination.name}
                        src={destination.image}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <Title level={4} className="!text-white mb-1 font-bold">
                          {destination.name}
                        </Title>
                        <Text className="text-white/80 text-sm">
                          {destination.count}
                        </Text>
                      </div>
                    </div>
                  }
                  className="rounded-xl overflow-hidden border-none shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  bodyStyle={{ padding: 0 }}
                />
              </Col>
            ))}
          </Row>
        </div>
      </section>
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <Title level={2} className="text-center mb-12 text-gray-800">
            Deal hot trong ngày 🔥
          </Title>
          <Carousel
            slidesToShow={4}
            slidesToScroll={1}
            autoplay
            responsive={[
              { breakpoint: 1024, settings: { slidesToShow: 3 } },
              { breakpoint: 768, settings: { slidesToShow: 2 } },
              { breakpoint: 480, settings: { slidesToShow: 1 } },
            ]}
          >
            {dealHotels.map((hotel, index) => (
              <div key={hotel.id} className="px-3">
                <Card
                  hoverable
                  cover={
                    <div className="relative h-48 overflow-hidden">
                      <img
                        alt={hotel.name}
                        src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                        -{20 + (index * 5)}%
                      </div>
                    </div>
                  }
                  className="rounded-xl overflow-hidden border-none shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-full"
                  bodyStyle={{ padding: '16px', height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div className="flex-1">
                    <Title level={5} ellipsis={{ rows: 2 }} className="text-gray-800 mb-2 min-h-[3rem] leading-6">
                      {hotel.name}
                    </Title>
                    <Text type="secondary" className="block mb-3 text-gray-600 text-sm" ellipsis>
                      <EnvironmentOutlined className="text-blue-500 mr-1" /> 
                      {hotel.addressDetail ? `${hotel.addressDetail}, ${hotel.district}` : hotel.district}
                    </Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <Text delete className="text-gray-400 text-xs leading-none">1.2M</Text>
                      <Text strong className="text-red-500 text-base leading-tight">
                        {Math.floor(1200000 * (100 - 20 - (index * 5)) / 100 / 1000)}k/đêm
                      </Text>
                    </div>
                    <Button 
                      type="primary" 
                      size="small"
                      className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 border-none font-semibold hover:from-blue-600 hover:to-cyan-500 ml-2"
                      onClick={() => handleViewHotelDetail(hotel)}
                    >
                      Chi tiết
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </Carousel>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Title level={2} className="text-center mb-12 text-gray-800">
            Khách hàng nói gì về chúng tôi
          </Title>
          <Carousel autoplay className="testimonial-carousel">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id}>
                <div className="text-center px-5">
                  <Avatar 
                    size={80} 
                    src={testimonial.avatar} 
                    className="mb-6 border-4 border-blue-100 hover:border-blue-300 transition-all duration-300" 
                  />
                  <Rate disabled defaultValue={testimonial.rating} className="mb-4 text-yellow-400" />
                  <Paragraph className="text-lg italic mb-6 text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    "{testimonial.comment}"
                  </Paragraph>
                  <Title level={5} className="mb-0 text-gray-800 font-semibold">
                    {testimonial.name}
                  </Title>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Title level={2} className="text-white mb-4 font-bold">
            Tải ứng dụng để nhận ưu đãi độc quyền
          </Title>
          <Paragraph className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Đặt phòng nhanh chóng, nhận thông báo deal hot và tích điểm thưởng
          </Paragraph>
          <Space size="large" className="flex-wrap justify-center">
            <Button
              size="large"
              className="bg-white/20 border-white/30 text-white rounded-full px-8 h-12 hover:bg-white/30 hover:border-white/50 transform hover:-translate-y-1 transition-all duration-300 font-semibold"
              icon={<AppleOutlined />}
            >
              App Store
            </Button>
            <Button
              size="large"
              className="bg-white/20 border-white/30 text-white rounded-full px-8 h-12 hover:bg-white/30 hover:border-white/50 transform hover:-translate-y-1 transition-all duration-300 font-semibold"
              icon={<AndroidOutlined />}
            >
              Google Play
            </Button>
          </Space>
        </div>
      </section>
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <Row gutter={[48, 32]}>
            <Col xs={24} sm={12} md={6}>
              <Title level={4} className="text-white mb-6 font-bold">
                BookingPro
              </Title>
              <Paragraph className="text-gray-300 mb-6 leading-relaxed">
                Nền tảng đặt phòng khách sạn hàng đầu Việt Nam. 
                Cam kết mang đến trải nghiệm tốt nhất cho khách hàng.
              </Paragraph>
              <Space size="large">
                <FacebookOutlined className="text-xl text-blue-500 hover:text-blue-400 cursor-pointer transform hover:scale-110 transition-all duration-300" />
                <InstagramOutlined className="text-xl text-pink-500 hover:text-pink-400 cursor-pointer transform hover:scale-110 transition-all duration-300" />
                <TwitterOutlined className="text-xl text-cyan-500 hover:text-cyan-400 cursor-pointer transform hover:scale-110 transition-all duration-300" />
              </Space>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Title level={5} className="text-white mb-6 font-semibold">
                Dịch vụ
              </Title>
              <div className="text-gray-300 space-y-3">
                <p className="hover:text-blue-400 cursor-pointer transition-colors duration-300">Đặt phòng khách sạn</p>
                <p className="hover:text-blue-400 cursor-pointer transition-colors duration-300">Đặt phòng homestay</p>
                <p className="hover:text-blue-400 cursor-pointer transition-colors duration-300">Đặt phòng resort</p>
                <p className="hover:text-blue-400 cursor-pointer transition-colors duration-300">Cho thuê villa</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Title level={5} className="text-white mb-6 font-semibold">
                Hỗ trợ
              </Title>
              <div className="text-gray-300 space-y-3">
                <p className="hover:text-blue-400 cursor-pointer transition-colors duration-300">Trung tâm trợ giúp</p>
                <p className="hover:text-blue-400 cursor-pointer transition-colors duration-300">Chính sách bảo mật</p>
                <p className="hover:text-blue-400 cursor-pointer transition-colors duration-300">Điều khoản sử dụng</p>
                <p className="hover:text-blue-400 cursor-pointer transition-colors duration-300">Câu hỏi thường gặp</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Title level={5} className="text-white mb-6 font-semibold">
                Liên hệ
              </Title>
              <div className="text-gray-300 space-y-3">
                <p className="flex items-center hover:text-blue-400 transition-colors duration-300">
                  <PhoneOutlined className="mr-2 text-blue-500" /> 1900 1234
                </p>
                <p className="flex items-center hover:text-blue-400 transition-colors duration-300">
                  <MailOutlined className="mr-2 text-blue-500" /> support@bookingpro.vn
                </p>
                <p className="flex items-start hover:text-blue-400 transition-colors duration-300">
                  <EnvironmentOutlined className="mr-2 text-blue-500 mt-1" /> 123 Đường ABC, Quận 1, TP.HCM
                </p>
              </div>
            </Col>
          </Row>
          <Divider className="border-gray-700 my-10" />
          <div className="text-center text-gray-400">
            © 2025 BookingPro. All rights reserved.
          </div>
        </div>
      </footer>
      <Modal
        title="Đổi mật khẩu"
        open={changePasswordModalVisible}
        onCancel={() => {
          setChangePasswordModalVisible(false);
          changePasswordForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={changePasswordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          className="mt-4"
        >
          <Form.Item
            name="oldPassword"
            label="Mật khẩu hiện tại"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password 
              size="large" 
              placeholder="Nhập mật khẩu hiện tại"
              prefix={<LockOutlined />}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password 
              size="large" 
              placeholder="Nhập mật khẩu mới"
              prefix={<LockOutlined />}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password 
              size="large" 
              placeholder="Xác nhận mật khẩu mới"
              prefix={<LockOutlined />}
            />
          </Form.Item>
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              size="large"
              onClick={() => {
                setChangePasswordModalVisible(false);
                changePasswordForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              size="large"
              htmlType="submit"
              loading={changePasswordLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Đổi mật khẩu
            </Button>
          </div>
        </Form>
      </Modal>
      <ChatBot />
    </div>
  );
};
export default Homepage;