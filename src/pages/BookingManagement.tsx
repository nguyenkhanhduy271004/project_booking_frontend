import React, { useMemo, useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Tooltip,
  DatePicker,
  InputNumber,
  Badge,
  Tabs,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { bookingService } from '../services/bookingService';
import { hotelService } from '../services/hotelService';
import { useAuthStore } from '../store/authStore';
import type { 
  BookingResponse, 
  Hotel, 
  BookingStatus, 
  PaymentType 
} from '../types';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const BookingManagement: React.FC = () => {
  const { user } = useAuthStore();
  const isStaff = user?.userType === 'STAFF';
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  // Removed users fetching to avoid calling user list API from booking management
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingResponse | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('active');
  const [deletedBookings, setDeletedBookings] = useState<BookingResponse[]>([]);
  const [deletedPagination, setDeletedPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [form] = Form.useForm();
  useEffect(() => {
    if (activeTab === 'active') {
      fetchBookings();
    } else {
      fetchDeletedBookings();
    }
    fetchHotels();
  }, [pagination.current, pagination.pageSize, searchText, statusFilter, activeTab]);

  useEffect(() => {
    if (activeTab === 'deleted') {
      fetchDeletedBookings();
    }
  }, [deletedPagination.current, deletedPagination.pageSize, activeTab]);
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAllBookings({
        page: pagination.current - 1,
        size: pagination.pageSize,
        deleted: false, // Chỉ lấy booking chưa bị xóa
      });
      if (response.status === 200) {
        setBookings(response.data.items);
        setPagination(prev => ({
          ...prev,
          total: response.data.totalElements,
        }));
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAllBookings({
        page: deletedPagination.current - 1,
        size: deletedPagination.pageSize,
        deleted: true, // Chỉ lấy booking đã bị xóa
      });
      if (response.status === 200) {
        setDeletedBookings(response.data.items);
        setDeletedPagination(prev => ({
          ...prev,
          total: response.data.totalElements,
        }));
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể tải danh sách đặt phòng đã xóa');
    } finally {
      setLoading(false);
    }
  };
  const fetchHotels = async () => {
    try {
      const response = await hotelService.getAllHotels({ page: 0, size: 1000 });
      if (response.status === 200) {
        setHotels(response.data.items);
      }
    } catch (error: any) {
      console.error('Error fetching hotels:', error);
    }
  };
  // Removed fetchUsers: no user list retrieval in BookingManagement
  const handleCreateBooking = async (values: any) => {
    try {
      // Convert roomIds from string to array
      const processedValues = {
        ...values,
        roomIds: typeof values.roomIds === 'string' 
          ? values.roomIds.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id))
          : values.roomIds,
        checkInDate: values.checkInDate?.format('YYYY-MM-DD'),
        checkOutDate: values.checkOutDate?.format('YYYY-MM-DD'),
      };
      
      console.log('BookingManagement - Original values:', values);
      console.log('BookingManagement - Processed values:', processedValues);
      console.log('BookingManagement - Booking data type check:', {
        guestId: typeof processedValues.guestId,
        hotelId: typeof processedValues.hotelId,
        roomIds: Array.isArray(processedValues.roomIds),
        checkInDate: typeof processedValues.checkInDate,
        checkOutDate: typeof processedValues.checkOutDate,
        totalPrice: typeof processedValues.totalPrice,
        paymentType: typeof processedValues.paymentType,
        notes: typeof processedValues.notes,
        status: typeof processedValues.status,
        voucherId: processedValues.voucherId ? typeof processedValues.voucherId : 'undefined'
      });
      const response = await bookingService.createBooking(processedValues);
      if (response.status === 201) {
        message.success('Tạo đặt phòng thành công!');
        setIsModalVisible(false);
        form.resetFields();
        fetchBookings();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Tạo đặt phòng thất bại');
    }
  };
  const handleUpdateBooking = async (values: any) => {
    if (!editingBooking) return;
    try {
      // Convert roomIds from string to array
      const processedValues = {
        ...values,
        roomIds: typeof values.roomIds === 'string' 
          ? values.roomIds.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id))
          : values.roomIds,
        checkInDate: values.checkInDate?.format('YYYY-MM-DD'),
        checkOutDate: values.checkOutDate?.format('YYYY-MM-DD'),
      };
      
      console.log('BookingManagement Update - Original values:', values);
      console.log('BookingManagement Update - Processed values:', processedValues);
      const response = await bookingService.updateBooking(editingBooking.id, processedValues);
      if (response.status === 200) {
        message.success('Cập nhật đặt phòng thành công!');
        setIsModalVisible(false);
        setEditingBooking(null);
        form.resetFields();
        fetchBookings();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Cập nhật đặt phòng thất bại');
    }
  };
  const handleDeleteSelected = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một đặt phòng để xóa');
      return;
    }
    try {
      await bookingService.deleteBookings(selectedRowKeys as number[]);
      message.success('Xóa đặt phòng đã chọn thành công');
      setSelectedRowKeys([]);
      fetchBookings();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xóa đặt phòng thất bại');
    }
  };
  const handleRestoreSelected = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một đặt phòng để khôi phục');
      return;
    }
    try {
      await bookingService.restoreBookings(selectedRowKeys as number[]);
      message.success('Khôi phục đặt phòng đã chọn thành công');
      setSelectedRowKeys([]);
      fetchDeletedBookings(); // Refresh deleted bookings list
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Khôi phục đặt phòng thất bại');
    }
  };

  const handleDeletePermanentlySelected = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một đặt phòng để xóa vĩnh viễn');
      return;
    }
    try {
      await bookingService.deleteBookingsPermanently(selectedRowKeys as number[]);
      message.success('Xóa vĩnh viễn đặt phòng đã chọn thành công');
      setSelectedRowKeys([]);
      fetchDeletedBookings(); // Refresh deleted bookings list
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xóa vĩnh viễn đặt phòng thất bại');
    }
  };

  const handleRestoreBooking = async (id: number) => {
    try {
      await bookingService.restoreBooking(id);
      message.success('Khôi phục đặt phòng thành công');
      fetchDeletedBookings(); // Refresh deleted bookings list
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Khôi phục đặt phòng thất bại');
    }
  };

  const handleDeletePermanently = async (id: number) => {
    try {
      await bookingService.deleteBookingPermanently(id);
      message.success('Xóa vĩnh viễn đặt phòng thành công');
      fetchDeletedBookings(); // Refresh deleted bookings list
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xóa vĩnh viễn đặt phòng thất bại');
    }
  };

  const handleUpdateStatus = async (bookingId: number, newStatus: BookingStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      message.success('Cập nhật trạng thái đặt phòng thành công');
      if (activeTab === 'active') {
        fetchBookings();
      } else {
        fetchDeletedBookings();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Cập nhật trạng thái đặt phòng thất bại');
    }
  };
  const handleEdit = (booking: BookingResponse) => {
    setEditingBooking(booking);
    form.setFieldsValue({
      ...booking,
      id: booking.id,
      roomIds: booking.rooms?.map(room => room.id).join(',') || '',
      checkInDate: dayjs(booking.checkInDate),
      checkOutDate: dayjs(booking.checkOutDate),
    });
    setIsModalVisible(true);
  };
  const handleViewDetail = async (bookingId: number) => {
    try {
      setDetailLoading(true);
      setIsDetailModalVisible(true);
      const response = await bookingService.getBookingById(bookingId);
      if (response.status === 200) {
        setSelectedBooking(response.data);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể tải chi tiết booking');
      setIsDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingBooking(null);
    form.resetFields();
  };
  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedBooking(null);
  };
  const handleDelete = async (bookingId: number) => {
    try {
      await bookingService.deleteBooking(bookingId);
      message.success('Xóa booking thành công');
      fetchBookings();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xóa booking thất bại');
    }
  };
  const getStatusName = (status: BookingStatus) => {
    const nameMap: Record<string, string> = {
      PENDING: 'Chờ xử lý',
      PAYING: 'Đang thanh toán',
      CONFIRMED: 'Đã xác nhận',
      CHECKIN: 'Đã check-in',
      CHECKOUT: 'Đã check-out',
      CANCELLED: 'Đã hủy',
      COMPLETED: 'Hoàn thành',
      EXPIRED: 'Đã hết hạn',
    };
    return nameMap[status] || status;
  };
  const getPaymentTypeColor = (type: PaymentType) => {
    const colorMap: Record<string, string> = {
      CARD: 'blue',
      WALLET: 'purple',
      BANK_TRANSFER: 'green',
    };
    return colorMap[type] || 'default';
  };
  const getPaymentTypeName = (type: PaymentType) => {
    const nameMap: Record<string, string> = {
      CARD: 'Thẻ tín dụng',
      WALLET: 'Ví điện tử',
      BANK_TRANSFER: 'Chuyển khoản',
    };
    return nameMap[type] || type;
  };
  const columns = [
    {
      title: 'Mã đặt phòng',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      width: 140,
      render: (code: string) => <Text code>{code}</Text>,
    },
    {
      title: 'Khách sạn',
      dataIndex: 'hotelName',
      key: 'hotelName',
      ellipsis: true,
    },
    {
      title: 'Ngày',
      key: 'dates',
      width: 180,
      render: (_: any, record: BookingResponse) => (
        <div>
          <div>{dayjs(record.checkInDate).format('DD/MM/YYYY')}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            đến {dayjs(record.checkOutDate).format('DD/MM/YYYY')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 140,
      render: (price: number) => (
        <Text strong className="text-green-600" style={{ whiteSpace: 'nowrap' }}>
          {price.toLocaleString('vi-VN')} VNĐ
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: BookingStatus, record: BookingResponse) => (
        <div className="flex flex-col gap-1">
          <Badge
            status={
              ['CONFIRMED', 'CHECKIN', 'COMPLETED'].includes(status) ? 'success' : 
              ['CANCELLED', 'EXPIRED'].includes(status) ? 'error' : 
              status === 'CHECKOUT' ? 'default' : 'warning'
            }
            text={getStatusName(status)}
          />
          <Select
            size="small"
            value={status}
            style={{ width: '100%' }}
            onChange={(newStatus: BookingStatus) => handleUpdateStatus(record.id, newStatus)}
            placeholder="Cập nhật trạng thái"
          >
            <Option value="PENDING">Chờ xử lý</Option>
            <Option value="PAYING">Đang thanh toán</Option>
            <Option value="CONFIRMED">Đã xác nhận</Option>
            <Option value="CHECKIN">Đã check-in</Option>
            <Option value="CHECKOUT">Đã check-out</Option>
            <Option value="COMPLETED">Hoàn thành</Option>
            <Option value="CANCELLED">Đã hủy</Option>
            <Option value="EXPIRED">Đã hết hạn</Option>
          </Select>
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: BookingResponse) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const deletedColumns = [
    {
      title: 'Mã đặt phòng',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      width: 140,
      render: (code: string) => <Text code>{code}</Text>,
    },
    {
      title: 'Khách sạn',
      dataIndex: 'hotelName',
      key: 'hotelName',
      ellipsis: true,
    },
    {
      title: 'Ngày',
      key: 'dates',
      width: 180,
      render: (_: any, record: BookingResponse) => (
        <div>
          <div>{dayjs(record.checkInDate).format('DD/MM/YYYY')}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            đến {dayjs(record.checkOutDate).format('DD/MM/YYYY')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 140,
      render: (price: number) => (
        <Text strong className="text-green-600" style={{ whiteSpace: 'nowrap' }}>
          {price.toLocaleString('vi-VN')} VNĐ
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: BookingStatus) => (
        <Badge
          status="error"
          text={
            <span style={{ color: '#ff4d4f' }}>
              Đã xóa ({getStatusName(status)})
            </span>
          }
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: BookingResponse) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.id)}
            />
          </Tooltip>
          <Tooltip title="Khôi phục">
            <Popconfirm
              title="Bạn có chắc chắn muốn khôi phục?"
              onConfirm={() => handleRestoreBooking(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="text"
                size="small"
                icon={<UndoOutlined />}
                className="text-green-600"
              />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Xóa vĩnh viễn">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa vĩnh viễn?"
              description="Hành động này không thể hoàn tác!"
              onConfirm={() => handleDeletePermanently(record.id)}
              okText="Có"
              cancelText="Không"
              okType="danger"
              icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const managerHotelIds = useMemo(() => {
    if (user?.userType !== 'MANAGER') return null;
    return hotels.filter(h => (h as any).managerId === (user as any)?.id).map(h => h.id);
  }, [user, hotels]);
  const filteredBookings = bookings.filter(booking => {
    if (user?.userType === 'MANAGER' && managerHotelIds && managerHotelIds.length > 0) {
      if (!managerHotelIds.includes((booking as any).hotelId as any)) return false;
    }
    if (statusFilter && booking.status !== statusFilter) return false;
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        booking.bookingCode.toLowerCase().includes(searchLower) ||
        booking.hotelName.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý đặt phòng
            </Title>
          </Col>
          <Col>
            <Space>
              <Input.Search
                placeholder="Tìm kiếm đặt phòng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
              />
              <Select
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                allowClear
              >
                <Option value="PENDING">Chờ xác nhận</Option>
                <Option value="CONFIRMED">Đã xác nhận</Option>
                <Option value="CHECKIN">Đã check-in</Option>
                <Option value="CHECKOUT">Đã check-out</Option>
                <Option value="CANCELLED">Đã hủy</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => activeTab === 'active' ? fetchBookings() : fetchDeletedBookings()}
                loading={loading}
              >
                Làm mới
              </Button>
              {!isStaff && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalVisible(true)}
                >
                  Thêm đặt phòng
                </Button>
              )}
            </Space>
          </Col>
        </Row>
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'active',
              label: `Đang hoạt động (${pagination.total})`,
              children: (
                <>
                  {!isStaff && (
                    <div style={{ marginBottom: 12 }}>
                      <Space>
                        <Popconfirm
                          title="Xóa các đặt phòng đã chọn?"
                          onConfirm={handleDeleteSelected}
                          okText="Có"
                          cancelText="Không"
                        >
                          <Button danger disabled={selectedRowKeys.length === 0}>
                            Xóa đã chọn ({selectedRowKeys.length})
                          </Button>
                        </Popconfirm>
                        <Button onClick={() => { setSelectedRowKeys([]); }}>Bỏ chọn</Button>
                      </Space>
                    </div>
                  )}
                  <Table
                    columns={columns}
                    dataSource={filteredBookings}
                    rowKey="id"
                    loading={loading}
                    rowSelection={isStaff ? undefined : {
                      selectedRowKeys,
                      onChange: (keys) => setSelectedRowKeys(keys),
                    }}
                    pagination={{
                      current: pagination.current,
                      pageSize: pagination.pageSize,
                      total: pagination.total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} đặt phòng`,
                      onChange: (page, pageSize) => {
                        setPagination(prev => ({
                          ...prev,
                          current: page,
                          pageSize: pageSize || 10,
                        }));
                      },
                    }}
                  />
                </>
              ),
            },
            ...(!isStaff ? [{
              key: 'deleted',
              label: `Đã xóa (${deletedPagination.total})`,
              children: (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <Space>
                      <Popconfirm
                        title="Khôi phục các đặt phòng đã chọn?"
                        onConfirm={handleRestoreSelected}
                        okText="Có"
                        cancelText="Không"
                      >
                        <Button 
                          icon={<UndoOutlined />}
                          disabled={selectedRowKeys.length === 0}
                          className="text-green-600"
                        >
                          Khôi phục đã chọn ({selectedRowKeys.length})
                        </Button>
                      </Popconfirm>
                      <Popconfirm
                        title="Xóa vĩnh viễn các đặt phòng đã chọn?"
                        description="Hành động này không thể hoàn tác!"
                        onConfirm={handleDeletePermanentlySelected}
                        okText="Có"
                        cancelText="Không"
                        okType="danger"
                        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                      >
                        <Button 
                          danger
                          icon={<DeleteOutlined />}
                          disabled={selectedRowKeys.length === 0}
                        >
                          Xóa vĩnh viễn đã chọn ({selectedRowKeys.length})
                        </Button>
                      </Popconfirm>
                      <Button onClick={() => { setSelectedRowKeys([]); }}>Bỏ chọn</Button>
                    </Space>
                  </div>
                  <Table
                    columns={deletedColumns}
                    dataSource={deletedBookings}
                    rowKey="id"
                    loading={loading}
                    rowSelection={{
                      selectedRowKeys,
                      onChange: (keys) => setSelectedRowKeys(keys),
                    }}
                    pagination={{
                      current: deletedPagination.current,
                      pageSize: deletedPagination.pageSize,
                      total: deletedPagination.total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} đặt phòng đã xóa`,
                      onChange: (page, pageSize) => {
                        setDeletedPagination(prev => ({
                          ...prev,
                          current: page,
                          pageSize: pageSize || 10,
                        }));
                      },
                    }}
                  />
                </>
              ),
            }] : [])]
          }
        />
      </Card>
      {!isStaff && (
      <Modal
        title={editingBooking ? 'Chỉnh sửa đặt phòng' : 'Thêm đặt phòng mới'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingBooking ? handleUpdateBooking : handleCreateBooking}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="guestId"
                label="ID khách hàng"
                rules={[{ required: true, message: 'Vui lòng nhập ID khách hàng!' }]}
              >
                <Input placeholder="Nhập ID khách hàng" disabled={!!editingBooking} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hotelId"
                label="Khách sạn"
                rules={[{ required: true, message: 'Vui lòng chọn khách sạn!' }]}
              >
                <Select placeholder="Chọn khách sạn">
                  {hotels.map(hotel => (
                    <Option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="roomIds"
            label="ID phòng (cách nhau bằng dấu phẩy)"
            rules={[{ required: true, message: 'Vui lòng nhập ID phòng!' }]}
          >
            <Input placeholder="Ví dụ: 1,2,3" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="checkInDate"
                label="Ngày check-in"
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày check-in!' },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (value.isBefore(dayjs().startOf('day'))) {
                        return Promise.reject(new Error('Ngày check-in phải từ hôm nay trở đi'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && dayjs(current).isBefore(dayjs().startOf('day'))}
                  placeholder="Chọn ngày check-in"
                  onChange={() => {
                    // Clear checkout date if it's before new checkin date
                    const checkOutDate = form.getFieldValue('checkOutDate');
                    const checkInDate = form.getFieldValue('checkInDate');
                    if (checkOutDate && checkInDate && dayjs(checkOutDate).isSameOrBefore(dayjs(checkInDate))) {
                      form.setFieldValue('checkOutDate', null);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="checkOutDate"
                label="Ngày check-out"
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày check-out!' },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const checkInDate = form.getFieldValue('checkInDate');
                      
                      // Check if checkout date is in the future
                      if (value.isBefore(dayjs().startOf('day'))) {
                        return Promise.reject(new Error('Ngày check-out phải từ hôm nay trở đi'));
                      }
                      
                      // Check if checkout date is after checkin date
                      if (checkInDate && value.isSameOrBefore(checkInDate)) {
                        return Promise.reject(new Error('Ngày check-out phải sau ngày check-in'));
                      }
                      
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  disabledDate={(current) => {
                    const checkInDate = form.getFieldValue('checkInDate');
                    if (!current) return false;
                    
                    // Convert current to dayjs if it's not already
                    const currentDay = dayjs(current);
                    
                    // Disable dates before today
                    if (currentDay.isBefore(dayjs().startOf('day'))) return true;
                    
                    // Disable dates before or equal to check-in date
                    if (checkInDate && currentDay.isSameOrBefore(checkInDate)) return true;
                    
                    return false;
                  }}
                  placeholder="Chọn ngày check-out"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="totalPrice"
                label="Tổng tiền (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập tổng tiền!' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentType"
                label="Phương thức thanh toán"
                rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
              >
                <Select>
                  <Option value="CASH">Tiền mặt</Option>
                  <Option value="MOMO">Momo</Option>
                  <Option value="VNPAY">VNPay</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Option value="PENDING">Chờ xác nhận</Option>
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="CHECKED_IN">Đã check-in</Option>
              <Option value="CHECKED_OUT">Đã check-out</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="CANCELLED">Đã hủy</Option>
              <Option value="EXPIRED">Đã hết hạn</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalClose}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingBooking ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      )}
      <Modal
        title={
          <div className="flex items-center">
            <EyeOutlined className="mr-2" />
            Chi tiết đặt phòng
          </div>
        }
        open={isDetailModalVisible}
        onCancel={handleDetailModalClose}
        footer={[
          <Button key="close" onClick={handleDetailModalClose}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {detailLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : selectedBooking ? (
          <div className="space-y-4">
            <Card title="Thông tin đặt phòng" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Mã đặt phòng: </Text>
                  <Text code>{selectedBooking.bookingCode}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Trạng thái: </Text>
                  <Badge
                    status={
                      ['CONFIRMED', 'CHECKIN', 'COMPLETED'].includes(selectedBooking.status) ? 'success' : 
                      ['CANCELLED', 'EXPIRED'].includes(selectedBooking.status) ? 'error' : 
                      selectedBooking.status === 'CHECKOUT' ? 'default' : 'warning'
                    }
                    text={getStatusName(selectedBooking.status)}
                  />
                </Col>
                <Col span={12}>
                  <Text strong>Ngày check-in: </Text>
                  <Text>{dayjs(selectedBooking.checkInDate).format('DD/MM/YYYY')}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Ngày check-out: </Text>
                  <Text>{dayjs(selectedBooking.checkOutDate).format('DD/MM/YYYY')}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Tổng tiền: </Text>
                  <Text strong className="text-green-600">
                    {selectedBooking.totalPrice?.toLocaleString('vi-VN')} VNĐ
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Phương thức thanh toán: </Text>
                  <Tag color={getPaymentTypeColor(selectedBooking.paymentType)}>
                    {getPaymentTypeName(selectedBooking.paymentType)}
                  </Tag>
                </Col>
                <Col span={24}>
                  <Text strong>Ngày tạo: </Text>
                  <Text>{dayjs(selectedBooking.createdAt).format('DD/MM/YYYY HH:mm:ss')}</Text>
                </Col>
                {selectedBooking.notes && (
                  <Col span={24}>
                    <Text strong>Ghi chú: </Text>
                    <Text>{selectedBooking.notes}</Text>
                  </Col>
                )}
              </Row>
            </Card>
            <Card title="Thông tin khách sạn" size="small">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Text strong>Tên khách sạn: </Text>
                  <Text>{selectedBooking.hotelName}</Text>
                </Col>
              </Row>
            </Card>
            <Card title="Thông tin phòng" size="small">
              <div className="space-y-4">
                {selectedBooking.rooms?.map((room, index) => (
                  <div key={index} className="border rounded p-4 bg-gray-50">
                    <Row gutter={[16, 8]}>
                      <Col span={12}>
                        <Text strong>Phòng ID: </Text>
                        <Text>{room.id}</Text>
                      </Col>
                      <Col span={12}>
                        <Text strong>Loại phòng: </Text>
                        <Tag color="blue">{room.typeRoom}</Tag>
                      </Col>
                      <Col span={12}>
                        <Text strong>Sức chứa: </Text>
                        <Text>{room.capacity} người</Text>
                      </Col>
                      <Col span={12}>
                        <Text strong>Giá/đêm: </Text>
                        <Text strong className="text-green-600">
                          {room.pricePerNight?.toLocaleString('vi-VN')} VNĐ
                        </Text>
                      </Col>
                      <Col span={12}>
                        <Text strong>Trạng thái: </Text>
                        <Tag color={room.available ? 'green' : 'red'}>
                          {room.available ? 'Có sẵn' : 'Không có sẵn'}
                        </Tag>
                      </Col>
                      {room.imageUrls && room.imageUrls.length > 0 && (
                        <Col span={24}>
                          <Text strong>Hình ảnh: </Text>
                          <div className="flex gap-2 mt-2">
                            {room.imageUrls.slice(0, 3).map((url, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={url}
                                alt={`Room ${room.id} image ${imgIndex + 1}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ))}
                            {room.imageUrls.length > 3 && (
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-sm">
                                +{room.imageUrls.length - 3}
                              </div>
                            )}
                          </div>
                        </Col>
                      )}
                    </Row>
                  </div>
                )) || <Text>Không có thông tin phòng</Text>}
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <Text type="secondary">Không có dữ liệu</Text>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default BookingManagement;