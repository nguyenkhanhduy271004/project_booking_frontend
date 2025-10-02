import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Empty,
  Tooltip,
  Popconfirm,
  Divider,
  Dropdown,
  Form,
  Input,
  Rate,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  HomeOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { bookingService } from '../services/bookingService';
import { paymentService, type PaymentRequest } from '../services/paymentService';
import { useAuthStore } from '../store/authStore';
import { evaluationService } from '../services/evaluationService';
import type { BookingResponse, BookingStatus } from '../types';
const { Content } = Layout;
const { Title, Text } = Typography;
const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useAuthStore();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cancelLoading, setCancelLoading] = useState<number | null>(null);
  const [paymentLoading, setPaymentLoading] = useState<number | null>(null);
  const [evaluateModalVisible, setEvaluateModalVisible] = useState(false);
  const [evaluateRoomId, setEvaluateRoomId] = useState<number | null>(null);
  const [evaluateSubmitting, setEvaluateSubmitting] = useState(false);
  const [form] = Form.useForm();
  useEffect(() => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để xem danh sách booking');
      navigate('/login');
      return;
    }
    fetchMyBookings();
  }, [isAuthenticated, navigate]);
  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      
      // Debug token
      const token = getToken();
      console.log('Current token from authStore:', token ? 'Token exists' : 'No token');
      console.log('Auth storage in localStorage:', localStorage.getItem('auth-storage'));
      
      const response = await bookingService.getMyBookings({
        page: 0,
        size: 50,
        sort: 'createdAt'
      });
      if (response.status === 200) {
        const bookingList = response.data.items || [];
        setBookings(bookingList);
        if (bookingList.length === 0) {
          message.info('Bạn chưa có booking nào');
        }
      } else {
        message.error('Không thể tải danh sách booking');
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        message.error('Có lỗi xảy ra khi tải danh sách booking');
      }
    } finally {
      setLoading(false);
    }
  };
  const handleCancelBooking = async (bookingId: number) => {
    try {
      setCancelLoading(bookingId);
      const response = await bookingService.cancelBooking(bookingId);
      if (response.status === 204 || response.status === 200) {
        message.success('Hủy booking thành công');
        fetchMyBookings();
      } else {
        message.error('Không thể hủy booking');
      }
    } catch (error: any) {
      console.error('Error canceling booking:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        message.error('Không thể hủy booking này. Có thể đã quá thời hạn hủy.');
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy booking');
      } else {
        message.error('Có lỗi xảy ra khi hủy booking');
      }
    } finally {
      setCancelLoading(null);
    }
  };
  const handleViewDetail = (booking: BookingResponse) => {
    console.log('Opening detail modal for booking:', booking);
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };
  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedBooking(null);
  };

  const handlePayment = async (booking: BookingResponse, paymentMethod: 'MOMO' | 'VNPAY') => {
    try {
      setPaymentLoading(booking.id);
      
      const paymentRequest: PaymentRequest = {
        bookingId: booking.id,
        paymentMethod: paymentMethod
      };

      const response = await paymentService.retryPayment(paymentRequest);
      
      if (response.data.success && response.data.paymentUrl) {
        message.success(`Đang chuyển hướng đến ${paymentMethod}...`);
        // Chuyển hướng đến trang thanh toán
        window.location.href = response.data.paymentUrl;
      } else {
        message.error(response.data.error || 'Không thể tạo liên kết thanh toán');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      message.error('Có lỗi xảy ra khi tạo liên kết thanh toán');
    } finally {
      setPaymentLoading(null);
    }
  };

  const openEvaluateModal = (roomId: number) => {
    setEvaluateRoomId(roomId);
    form.resetFields();
    setEvaluateModalVisible(true);
  };

  const submitEvaluation = async () => {
    if (!selectedBooking || !evaluateRoomId) return;
    try {
      const values = await form.validateFields();
      setEvaluateSubmitting(true);
      const resp = await evaluationService.createEvaluation({
        starRating: values.rating,
        message: values.comment || '',
        roomId: evaluateRoomId,
      });
      if (resp.status === 200 || resp.status === 201) {
        message.success(resp.message || 'Gửi đánh giá thành công');
        setEvaluateModalVisible(false);
        setEvaluateRoomId(null);
      } else {
        message.error(resp.message || 'Gửi đánh giá thất bại');
      }
    } catch (e: any) {
      if (!e?.errorFields) {
        const data = e?.response?.data;
        const msg = (data && (data.message || data.error)) || (typeof data === 'string' ? data : '') || e?.message || 'Gửi đánh giá thất bại';
        message.error(msg);
      }
    } finally {
      setEvaluateSubmitting(false);
    }
  };

  const canPayBooking = (booking: BookingResponse) => {
    return booking.status === 'PENDING' || booking.status === 'PAYING' || booking.status === 'CONFIRMED';
  };
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'PAYING': return 'purple';
      case 'CONFIRMED': return 'green';
      case 'CHECKIN': return 'cyan';
      case 'CHECKOUT': return 'blue';
      case 'CANCELLED': return 'red';
      case 'EXPIRED': return 'gray';
      case 'COMPLETED': return 'green';
      default: return 'gray';
    }
  };
  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'PAYING': return 'Đang thanh toán';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'CHECKIN': return 'Đã check-in';
      case 'CHECKOUT': return 'Đã check-out';
      case 'CANCELLED': return 'Đã hủy';
      case 'EXPIRED': return 'Đã hết hạn';
      case 'COMPLETED': return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };
  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'CARD': return 'Thẻ tín dụng';
      case 'WALLET': return 'Ví điện tử';
      case 'BANK_TRANSFER': return 'Chuyển khoản';
      default: return 'Không xác định';
    }
  };
  const canCancelBooking = (booking: BookingResponse) => {
    return booking.status === 'PENDING';
  };
  const columns = [
    {
      title: 'Mã booking',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      width: 150,
      render: (code: string) => (
        <Text code className="font-semibold text-blue-600">{code}</Text>
      ),
    },
    {
      title: 'Khách sạn',
      dataIndex: 'hotelName',
      key: 'hotelName',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (name: string) => (
        <Tooltip title={name}>
          <Text strong>{name}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Số phòng',
      key: 'roomCount',
      width: 100,
      render: (_: any, record: BookingResponse) => (
        <Tag color="blue">{record.rooms?.length || 0} phòng</Tag>
      ),
    },
    {
      title: 'Ngày lưu trú',
      key: 'dates',
      width: 180,
      render: (_: any, record: BookingResponse) => (
        <div>
          <div className="flex items-center mb-1">
            <CalendarOutlined className="text-green-500 mr-1" />
            <Text className="text-sm">{dayjs(record.checkInDate).format('DD/MM/YYYY')}</Text>
          </div>
          <div className="flex items-center">
            <CalendarOutlined className="text-red-500 mr-1" />
            <Text className="text-sm">{dayjs(record.checkOutDate).format('DD/MM/YYYY')}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (amount: number) => (
        <Text strong className="text-lg text-green-600">
          {amount?.toLocaleString('vi-VN')}đ
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: BookingStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <Text className="text-sm">{dayjs(date).format('DD/MM/YYYY')}</Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_: any, record: BookingResponse) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          
          {canPayBooking(record) && (
            <Tooltip title="Thanh toán">
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'momo',
                      label: 'Thanh toán MoMo',
                      icon: <CreditCardOutlined />,
                      onClick: () => handlePayment(record, 'MOMO'),
                    },
                    {
                      key: 'vnpay',
                      label: 'Thanh toán VNPay',
                      icon: <DollarOutlined />,
                      onClick: () => handlePayment(record, 'VNPAY'),
                    },
                  ],
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<CreditCardOutlined />}
                  loading={paymentLoading === record.id}
                  className="text-green-600 hover:text-green-800"
                />
              </Dropdown>
            </Tooltip>
          )}

          {canCancelBooking(record) && (
            <Popconfirm
              title="Hủy booking"
              description="Bạn có chắc chắn muốn hủy booking này?"
              onConfirm={() => handleCancelBooking(record.id)}
              okText="Có"
              cancelText="Không"
              okType="danger"
            >
              <Tooltip title="Hủy booking">
                <Button
                  type="text"
                  danger
                  icon={<CloseCircleOutlined />}
                  loading={cancelLoading === record.id}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];
  if (!isAuthenticated) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Content className="flex justify-center items-center">
          <Card className="text-center p-8">
            <ExclamationCircleOutlined className="text-4xl text-orange-500 mb-4" />
            <Title level={3}>Yêu cầu đăng nhập</Title>
            <Text>Vui lòng đăng nhập để xem danh sách booking của bạn</Text>
            <br />
            <Button type="primary" className="mt-4" onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          </Card>
        </Content>
      </Layout>
    );
  }
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
            className="mb-4 text-gray-600 hover:text-blue-600"
          >
            Quay lại trang chủ
          </Button>
          <Title level={2} className="mb-2">
            Danh sách booking của tôi
          </Title>
          <Text type="secondary">
            Quản lý tất cả các booking của bạn tại đây
          </Text>
        </div>
        <Card className="rounded-xl shadow-lg border-none">
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="id"
            loading={loading}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Bạn chưa có booking nào"
                >
                  <Button type="primary" onClick={() => navigate('/')}>
                    Đặt phòng ngay
                  </Button>
                </Empty>
              )
            }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} booking`,
              pageSizeOptions: ['10', '20', '50'],
              defaultPageSize: 10,
            }}
          />
        </Card>
        {}
        <Modal
          title="Chi tiết booking"
          open={detailModalVisible}
          onCancel={handleCloseDetailModal}
          footer={[
            <Button key="close" onClick={handleCloseDetailModal}>
              Đóng
            </Button>,
            selectedBooking && canCancelBooking(selectedBooking) && (
              <Popconfirm
                key="cancel"
                title="Hủy booking"
                description="Bạn có chắc chắn muốn hủy booking này?"
                onConfirm={() => {
                  handleCancelBooking(selectedBooking.id);
                  handleCloseDetailModal();
                }}
                okText="Có"
                cancelText="Không"
                okType="danger"
              >
                <Button 
                  danger
                  loading={cancelLoading === selectedBooking?.id}
                >
                  Hủy booking
                </Button>
              </Popconfirm>
            )
          ]}
          width={800}
        >
          {selectedBooking && (
            <div className="space-y-6">
              {}
              <div>
                <Title level={4} className="mb-4">Thông tin booking</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Mã booking:</Text>
                    <br />
                    <Text code className="text-blue-600">{selectedBooking.bookingCode}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Ngày đặt:</Text>
                    <br />
                    <Text>{dayjs(selectedBooking.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Trạng thái:</Text>
                    <br />
                    <Tag color={getStatusColor(selectedBooking.status)}>
                      {getStatusText(selectedBooking.status)}
                    </Tag>
                  </Col>
                  <Col span={12}>
                    <Text strong>Phương thức thanh toán:</Text>
                    <br />
                    <Tag color="blue">
                      {getPaymentTypeText(selectedBooking.paymentType)}
                    </Tag>
                  </Col>
                </Row>
              </div>
              <Divider />
              {}
              <div>
                <Title level={4} className="mb-4">Thông tin khách sạn</Title>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Text strong>Tên khách sạn:</Text>
                    <br />
                    <Text className="text-lg">{selectedBooking.hotelName}</Text>
                  </Col>
                </Row>
              </div>
              <Divider />
              {}
              <div>
                <Title level={4} className="mb-4">Thông tin phòng ({selectedBooking.rooms?.length} phòng)</Title>
                <Row gutter={[16, 16]}>
                  {selectedBooking.rooms?.map((room) => (
                    <Col span={24} key={room.id}>
                      <Card size="small" className="mb-3">
                        <Row gutter={[16, 16]} align="middle">
                          <Col span={6}>
                            {room.imageUrls && room.imageUrls.length > 0 ? (
                              <img
                                src={room.imageUrls[0]}
                                alt={`Phòng ${room.id}`}
                                className="w-full h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-16 bg-gray-200 rounded flex items-center justify-center">
                                <HomeOutlined className="text-gray-400" />
                              </div>
                            )}
                          </Col>
                          <Col span={18}>
                            <div>
                              <Text strong>Phòng #{room.id}</Text>
                              <br />
                              <Text>Loại: {room.typeRoom}</Text>
                              <br />
                              <Text>Sức chứa: {room.capacity} người</Text>
                              <br />
                              <Text strong className="text-green-600">
                                {room.pricePerNight?.toLocaleString('vi-VN')}đ/đêm
                              </Text>
                              {selectedBooking.status === 'COMPLETED' && (
                                <div className="mt-2">
                                  <Button type="link" onClick={() => openEvaluateModal(room.id)}>
                                    Đánh giá phòng này
                                  </Button>
                                </div>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
              <Divider />
              {}
              <div>
                <Title level={4} className="mb-4">Thông tin lưu trú</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Check-in:</Text>
                    <br />
                    <div className="flex items-center">
                      <CalendarOutlined className="text-green-500 mr-2" />
                      <Text className="text-lg">{dayjs(selectedBooking.checkInDate).format('DD/MM/YYYY')}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text strong>Check-out:</Text>
                    <br />
                    <div className="flex items-center">
                      <CalendarOutlined className="text-red-500 mr-2" />
                      <Text className="text-lg">{dayjs(selectedBooking.checkOutDate).format('DD/MM/YYYY')}</Text>
                    </div>
                  </Col>
                </Row>
              </div>
              <Divider />
              {}
              <div>
                <Title level={4} className="mb-4">Thông tin thanh toán</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Tổng tiền:</Text>
                    <br />
                    <Text className="text-2xl font-bold text-green-600">
                      {selectedBooking.totalPrice?.toLocaleString('vi-VN')}đ
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Phương thức thanh toán:</Text>
                    <br />
                    <Tag color="blue">{getPaymentTypeText(selectedBooking.paymentType)}</Tag>
                  </Col>
                </Row>
              </div>
              {}
              {selectedBooking.notes && (
                <>
                  <Divider />
                  <div>
                    <Title level={4} className="mb-4">Ghi chú</Title>
                    <Text>{selectedBooking.notes}</Text>
                  </div>
                </>
              )}
            </div>
          )}
        </Modal>
        <Modal
          title="Đánh giá phòng"
          open={evaluateModalVisible}
          onCancel={() => setEvaluateModalVisible(false)}
          onOk={submitEvaluation}
          confirmLoading={evaluateSubmitting}
          okText="Gửi đánh giá"
        >
          <Form form={form} layout="vertical" initialValues={{ rating: 5 }}>
            <Form.Item name="rating" label="Đánh giá" rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}>
              <Rate allowHalf />
            </Form.Item>
            <Form.Item name="comment" label="Nhận xét">
              <Input.TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn" />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};
export default MyBookingsPage;