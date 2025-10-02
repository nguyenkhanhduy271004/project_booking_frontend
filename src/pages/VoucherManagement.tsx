import React, { useState, useEffect, useMemo } from 'react';
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
  Tag,
  Card,
  Typography,
  Row,
  Col,
  Tooltip,
  InputNumber,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { voucherService } from '../services/voucherService';
import { hotelService } from '../services/hotelService';
import { useAuthStore } from '../store/authStore';
import type { Voucher, VoucherCreateRequest, VoucherUpdateRequest, Hotel, VoucherStatus } from '../types';
import dayjs from 'dayjs';
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const VoucherManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
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
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [viewingVoucher, setViewingVoucher] = useState<Voucher | null>(null);
  const [form] = Form.useForm();
  const isManager = user?.userType === 'MANAGER';
  useEffect(() => {
    fetchVouchers();
    fetchHotels();
  }, [pagination.current, pagination.pageSize, searchText, statusFilter]);
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await voucherService.getAllVouchers({
        page: pagination.current - 1,
        size: pagination.pageSize,
      });
      if (response.status === 200) {
        setVouchers(response.data.items);
        setPagination(prev => ({
          ...prev,
          total: response.data.totalElements,
        }));
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể tải danh sách voucher');
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
  const handleCreateVoucher = async (values: VoucherCreateRequest) => {
    try {
      const payload: VoucherCreateRequest = { ...values };
      if (isManager) {
        delete (payload as any).hotelId;
      }
      const response = await voucherService.createVoucher(payload);
      if (response.status === 201) {
        message.success('Tạo voucher thành công!');
        setIsModalVisible(false);
        form.resetFields();
        fetchVouchers();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Tạo voucher thất bại');
    }
  };
  const handleUpdateVoucher = async (values: VoucherUpdateRequest) => {
    if (!editingVoucher) return;
    try {
      const response = await voucherService.updateVoucher(editingVoucher.id, values);
      if (response.status === 200) {
        message.success('Cập nhật voucher thành công!');
        setIsModalVisible(false);
        setEditingVoucher(null);
        form.resetFields();
        fetchVouchers();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Cập nhật voucher thất bại');
    }
  };
  const handleDeleteVoucher = async (id: number) => {
    try {
      await voucherService.deleteVoucher(id);
      message.success('Xóa voucher thành công!');
      fetchVouchers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xóa voucher thất bại');
    }
  };
  const handleViewDetail = (voucher: Voucher) => {
    setViewingVoucher(voucher);
    setIsDetailModalVisible(true);
  };
  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    form.setFieldsValue({
      hotelId: voucher.hotelId,
      voucherCode: voucher.voucherCode,
      voucherName: voucher.voucherName,
      quantity: voucher.quantity,
      percentDiscount: voucher.percentDiscount,
      priceCondition: voucher.priceCondition,
      expiredDate: dayjs(voucher.expiredDate),
      status: voucher.status,
    });
    setIsModalVisible(true);
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingVoucher(null);
    form.resetFields();
  };
  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
    setViewingVoucher(null);
  };
  const getStatusColor = (status: VoucherStatus) => {
    const colorMap: Record<VoucherStatus, string> = {
      ACTIVE: 'green',
      INACTIVE: 'orange',
      EXPIRED: 'red',
    };
    return colorMap[status];
  };
  const getStatusName = (status: VoucherStatus) => {
    const nameMap: Record<VoucherStatus, string> = {
      ACTIVE: 'Hoạt động',
      INACTIVE: 'Không hoạt động',
      EXPIRED: 'Hết hạn',
    };
    return nameMap[status];
  };
  const columns = [
    {
      title: 'Mã voucher',
      dataIndex: 'voucherCode',
      key: 'voucherCode',
      width: 120,
      render: (code: string) => <Text code>{code}</Text>,
    },
    {
      title: 'Tên voucher',
      dataIndex: 'voucherName',
      key: 'voucherName',
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (name: string) => (
        <Tooltip placement="topLeft" title={name}>
          <span style={{ 
            display: 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '230px'
          }}>
            {name}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Giá trị',
      dataIndex: 'percentDiscount',
      key: 'percentDiscount',
      width: 100,
      render: (value: number) => (
        <Text strong>
          {`${value || 0}%`}
        </Text>
      ),
    },
    {
      title: 'Khách sạn',
      dataIndex: 'hotelName',
      key: 'hotelName',
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: (name: string) => (
        <Tooltip placement="topLeft" title={name || 'Chưa có thông tin'}>
          <span style={{ 
            display: 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '160px'
          }}>
            {name || 'Chưa có thông tin'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: VoucherStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusName(status)}
        </Tag>
      ),
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expiredDate',
      key: 'expiredDate',
      width: 100,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Voucher) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa voucher này?"
            onConfirm={() => handleDeleteVoucher(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const managerHotelIds = useMemo(() => {
    if (!isManager || !user) return null; // Added null check for user
    return hotels.filter(h => h.managerId === user.id).map(h => h.id);
  }, [isManager, user?.id, hotels]); // Updated dependency array to use optional chaining
  const filteredVouchers = vouchers.filter(voucher => {
    if (isManager && managerHotelIds && managerHotelIds.length > 0) {
      if (!managerHotelIds.includes((voucher as any).hotelId as any)) return false;
    }
    if (statusFilter && voucher.status !== statusFilter) return false;
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        voucher.voucherCode.toLowerCase().includes(searchLower) ||
        voucher.voucherName.toLowerCase().includes(searchLower) ||
        (voucher.hotelName && voucher.hotelName.toLowerCase().includes(searchLower))
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
              Quản lý voucher
            </Title>
          </Col>
          <Col>
            <Space>
              <Input.Search
                placeholder="Tìm kiếm voucher..."
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
                <Option value="ACTIVE">Hoạt động</Option>
                <Option value="INACTIVE">Không hoạt động</Option>
                <Option value="EXPIRED">Hết hạn</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchVouchers}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Thêm voucher
              </Button>
            </Space>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={filteredVouchers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 950 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} voucher`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || 10,
              }));
            },
          }}
        />
      </Card>
      <Modal
        title={editingVoucher ? 'Chỉnh sửa voucher' : 'Thêm voucher mới'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            if (editingVoucher) {
              await handleUpdateVoucher(values);
            } else {
              await handleCreateVoucher(values);
            }
          }}
        >
          {!isManager && (
            <Form.Item
              name="hotelId"
              label="Khách sạn"
              rules={[{ required: true, message: 'Vui lòng chọn khách sạn!' }]}
            >
              <Select placeholder="Chọn khách sạn" showSearch optionFilterProp="children">
                {hotels.map(hotel => (
                  <Option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="voucherCode"
                label="Mã voucher"
                rules={[{ required: true, message: 'Vui lòng nhập mã voucher!' }]}
              >
                <Input placeholder="VD: SUMMER2025" disabled={!!editingVoucher} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="voucherName"
                label="Tên voucher"
                rules={[{ required: true, message: 'Vui lòng nhập tên voucher!' }]}
              >
                <Input placeholder="VD: Giảm giá mùa hè 2025" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="100"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="percentDiscount"
                label="Phần trăm giảm giá (%)"
                rules={[{ required: true, message: 'Vui lòng nhập phần trăm giảm giá!' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="20"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priceCondition"
                label="Điều kiện giá tối thiểu (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập điều kiện giá!' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value ? Number(value.replace(/[^\d]/g, '')) as any : 0}
                  placeholder="500000"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expiredDate"
                label="Ngày hết hạn"
                rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn!' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="YYYY-MM-DD"
                  placeholder="2025-12-31"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                initialValue="ACTIVE"
              >
                <Select>
                  <Option value="ACTIVE">Hoạt động</Option>
                  <Option value="INACTIVE">Không hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalClose}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingVoucher ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      {}
      <Modal
        title="Chi tiết voucher"
        open={isDetailModalVisible}
        onCancel={handleDetailModalClose}
        footer={[
          <Button key="close" onClick={handleDetailModalClose}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {viewingVoucher && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="Thông tin cơ bản">
                  <p><strong>Mã voucher:</strong> <Text code>{viewingVoucher.voucherCode}</Text></p>
                  <p><strong>Tên voucher:</strong> {viewingVoucher.voucherName}</p>
                  <p><strong>Khách sạn:</strong> {viewingVoucher.hotelName || 'Chưa có thông tin'}</p>
                  <p><strong>Trạng thái:</strong> 
                    <Tag color={getStatusColor(viewingVoucher.status)} style={{ marginLeft: 8 }}>
                      {getStatusName(viewingVoucher.status)}
                    </Tag>
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Điều kiện giảm giá">
                  <p><strong>Loại giảm giá:</strong> 
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      Phần trăm
                    </Tag>
                  </p>
                  <p><strong>Giá trị giảm:</strong> 
                    <Text strong style={{ marginLeft: 8 }}>
                      {`${viewingVoucher.percentDiscount || 0}%`}
                    </Text>
                  </p>
                  <p><strong>Điều kiện giá tối thiểu:</strong> {(viewingVoucher.priceCondition || 0).toLocaleString('vi-VN')} VNĐ</p>
                  <p><strong>Số lượng:</strong> {viewingVoucher.quantity || 0}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Thời gian">
                  <p><strong>Ngày hết hạn:</strong> {dayjs(viewingVoucher.expiredDate).format('DD/MM/YYYY')}</p>
                  <p><strong>Ngày tạo:</strong> {dayjs(viewingVoucher.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                  {viewingVoucher.updatedAt && (
                    <p><strong>Cập nhật lần cuối:</strong> {dayjs(viewingVoucher.updatedAt).format('DD/MM/YYYY HH:mm')}</p>
                  )}
                  {viewingVoucher.deletedAt && (
                    <p><strong>Ngày xóa:</strong> {dayjs(viewingVoucher.deletedAt).format('DD/MM/YYYY HH:mm')}</p>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Trạng thái">
                  <p><strong>Số lượng ban đầu:</strong> {viewingVoucher.quantity}</p>
                  <p><strong>Trạng thái xóa:</strong> 
                    <Tag color={viewingVoucher.deletedAt ? 'red' : 'green'} style={{ marginLeft: 8 }}>
                      {viewingVoucher.deletedAt ? 'Đã xóa' : 'Hoạt động'}
                    </Tag>
                  </p>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default VoucherManagement;