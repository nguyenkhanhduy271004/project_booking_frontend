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
  Tag,
  Card,
  Typography,
  Row,
  Col,
  Upload,
  Image,
  Tooltip,
  Spin,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  RestOutlined,
  SearchOutlined,
  ReloadOutlined,
  UploadOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { Hotel, HotelDTO, User } from '../types';
import dayjs from 'dayjs';
import { hotelService } from '../services/hotelService';
import { useAuthStore } from '../store/authStore';
const { Title } = Typography;
const { Option } = Select;
const HotelManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<string>('active');
  const [deletedHotels, setDeletedHotels] = useState<Hotel[]>([]);
  const [deletedPagination, setDeletedPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [viewingHotel, setViewingHotel] = useState<Hotel | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();
  useEffect(() => {
    if (activeTab === 'active') {
      fetchHotels();
    } else {
      fetchDeletedHotels();
    }
    fetchManagers();
  }, [pagination.current, pagination.pageSize, searchText, activeTab]);

  useEffect(() => {
    if (activeTab === 'deleted') {
      fetchDeletedHotels();
    }
  }, [deletedPagination.current, deletedPagination.pageSize, activeTab]);
  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelService.getAllHotels({
        page: pagination.current - 1,
        size: pagination.pageSize,
        deleted: false, // Chỉ lấy hotel chưa bị xóa
      });
      if (response.status === 200) {
        setHotels(response.data.items);
        setPagination(prev => ({
          ...prev,
          total: response.data.totalElements,
        }));
      }
    } catch (error: any) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelService.getAllHotels({
        page: deletedPagination.current - 1,
        size: deletedPagination.pageSize,
        deleted: true, // Chỉ lấy hotel đã bị xóa
      });
      if (response.status === 200) {
        setDeletedHotels(response.data.items);
        setDeletedPagination(prev => ({
          ...prev,
          total: response.data.totalElements,
        }));
      }
    } catch (error: any) {
      console.error('Error fetching deleted hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await hotelService.getManagers();
      if (response.status === 200) {
        console.log('Managers data:', response.data); // Debug log
        setManagers(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching managers:', error);
    }
  };
  const handleCreateHotel = async (values: HotelDTO & { image?: File }) => {
    try {
      setSubmitLoading(true);
      const { image, ...hotelData } = values;
      // Convert string to number for numeric fields
      const processedData = {
        ...hotelData,
        totalRooms: Number(hotelData.totalRooms),
        starRating: hotelData.starRating ? Number(hotelData.starRating) : undefined
      };
      const response = await hotelService.createHotel(processedData, image);
      if (response.status === 201) {
        message.success('Tạo khách sạn thành công!');
        setIsModalVisible(false);
        form.resetFields();
        fetchHotels();
      }
    } catch (error: any) {
      console.error('Error creating hotel:', error);
    } finally {
      setSubmitLoading(false);
    }
  };
  const handleUpdateHotel = async (values: HotelDTO & { image?: File }) => {
    if (!editingHotel) return;
    try {
      setSubmitLoading(true);
      const { image, ...hotelData } = values;
      // Convert string to number for numeric fields
      const processedData = {
        ...hotelData,
        totalRooms: Number(hotelData.totalRooms),
        starRating: hotelData.starRating ? Number(hotelData.starRating) : undefined
      };
      // Nếu người dùng xóa ảnh hiện tại (currentImageUrl = '') và không upload ảnh mới
      // thì gửi một flag để backend xóa ảnh
      const shouldRemoveImage = !currentImageUrl && !image;
      const response = await hotelService.updateHotel(
        editingHotel.id, 
        processedData, 
        image,
        shouldRemoveImage
      );
      if (response.status === 200) {
        message.success('Cập nhật khách sạn thành công!');
        setIsModalVisible(false);
        setEditingHotel(null);
        setCurrentImageUrl('');
        form.resetFields();
        fetchHotels();
      }
    } catch (error: any) {
      console.error('Error updating hotel:', error);
    } finally {
      setSubmitLoading(false);
    }
  };
  const handleDeleteHotel = async (id: number) => {
    try {
      await hotelService.deleteHotel(id);
      message.success('Xóa khách sạn thành công!');
      fetchHotels();
    } catch (error: any) {
      console.error('Error deleting hotel:', error);
    }
  };

  const handleDeletePermanently = async (id: number) => {
    try {
      await hotelService.deleteHotelPermanently(id);
      message.success('Xóa vĩnh viễn khách sạn thành công!');
      fetchDeletedHotels();
    } catch (error: any) {
      console.error('Error deleting hotel permanently:', error);
    }
  };

  const handleRestoreHotel = async (id: number) => {
    try {
      await hotelService.restoreHotel(id);
      message.success('Khôi phục khách sạn thành công!');
      fetchDeletedHotels();
    } catch (error: any) {
      console.error('Error restoring hotel:', error);
    }
  };
  const handleDeleteHotels = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một khách sạn để xóa');
      return;
    }
    try {
      await hotelService.deleteHotels(selectedRowKeys);
      message.success('Xóa các khách sạn thành công!');
      setSelectedRowKeys([]);
      fetchHotels();
    } catch (error: any) {
      console.error('Error deleting hotels:', error);
    }
  };

  const handleDeletePermanentlySelected = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một khách sạn để xóa vĩnh viễn');
      return;
    }
    try {
      await hotelService.deleteHotelsPermanently(selectedRowKeys);
      message.success('Xóa vĩnh viễn các khách sạn thành công!');
      setSelectedRowKeys([]);
      fetchDeletedHotels();
    } catch (error: any) {
      console.error('Error deleting hotels permanently:', error);
    }
  };

  const handleRestoreSelected = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một khách sạn để khôi phục');
      return;
    }
    try {
      await hotelService.restoreHotels(selectedRowKeys);
      message.success('Khôi phục các khách sạn thành công!');
      setSelectedRowKeys([]);
      fetchDeletedHotels();
    } catch (error: any) {
      console.error('Error restoring hotels:', error);
    }
  };
  const handleRestoreHotels = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một khách sạn để khôi phục');
      return;
    }
    try {
      await hotelService.restoreHotels(selectedRowKeys);
      message.success('Khôi phục các khách sạn thành công!');
      setSelectedRowKeys([]);
      fetchHotels();
    } catch (error: any) {
      console.error('Error restoring hotels:', error);
    }
  };
  const handleViewDetail = async (hotelId: number) => {
    try {
      setDetailLoading(true);
      const response = await hotelService.getHotelById(hotelId);
      if (response.status === 200) {
        setViewingHotel(response.data);
        setIsDetailModalVisible(true);
      }
    } catch (error: any) {
      console.error('Error fetching hotel detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };
  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setCurrentImageUrl(hotel.imageUrl || '');
    form.setFieldsValue({
      ...hotel,
      id: hotel.id,
    });
    setIsModalVisible(true);
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingHotel(null);
    setCurrentImageUrl('');
    form.resetFields();
  };
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (imageUrl: string) => (
        <Image
          width={50}
          height={35}
          src={imageUrl || '/placeholder-hotel.jpg'}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
        />
      ),
    },
    {
      title: 'Tên khách sạn',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      ellipsis: true,
    },
    {
      title: 'Quận/Huyện',
      dataIndex: 'district',
      key: 'district',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'starRating',
      key: 'starRating',
      width: 80,
      render: (starRating: number) => (
        <Tag color={starRating >= 4 ? 'green' : starRating >= 3 ? 'orange' : 'red'}>
          {starRating}⭐
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      render: () => (
        <Tag color="green">
          Hoạt động
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Hotel) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              loading={detailLoading}
              onClick={() => handleViewDetail(record.id)}
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
            title="Xóa khách sạn này?"
            onConfirm={() => handleDeleteHotel(record.id)}
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

  const deletedColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Tên khách sạn',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string) => (
        <span style={{ fontWeight: 500 }}>{name}</span>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Quận/Huyện',
      dataIndex: 'district',
      key: 'district',
      width: 120,
    },
    {
      title: 'Tỉnh/Thành phố',
      dataIndex: 'province',
      key: 'province',
      width: 130,
    },
    {
      title: 'Số sao',
      dataIndex: 'starRating',
      key: 'starRating',
      width: 100,
      render: (starRating: number) => (
        <Tag color={starRating >= 4 ? 'green' : starRating >= 3 ? 'orange' : 'red'}>
          {starRating}⭐
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      render: () => (
        <Tag color="red">
          Đã xóa
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Hotel) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              loading={detailLoading}
              onClick={() => handleViewDetail(record.id)}
            />
          </Tooltip>
          <Tooltip title="Khôi phục">
            <Popconfirm
              title="Bạn có chắc chắn muốn khôi phục?"
              onConfirm={() => handleRestoreHotel(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="text"
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
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý khách sạn
            </Title>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Tìm kiếm khách sạn..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => activeTab === 'active' ? fetchHotels() : fetchDeletedHotels()}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Thêm khách sạn
              </Button>
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
                  <div style={{ marginBottom: 12 }}>
                    <Space>
                      <Popconfirm
                        title="Xóa các khách sạn đã chọn?"
                        onConfirm={handleDeleteHotels}
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
                  <Table
                    rowSelection={{
                      selectedRowKeys,
                      onChange: (selectedKeys: React.Key[]) => setSelectedRowKeys(selectedKeys as number[]),
                    }}
                    columns={columns}
                    dataSource={user?.userType === 'MANAGER' ? hotels.filter(h => (h as any).managerId === (user as any)?.id) : hotels}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 800 }}
                    pagination={{
                      current: pagination.current,
                      pageSize: pagination.pageSize,
                      total: pagination.total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} khách sạn`,
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
            {
              key: 'deleted',
              label: `Đã xóa (${deletedPagination.total})`,
              children: (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <Space>
                      <Popconfirm
                        title="Khôi phục các khách sạn đã chọn?"
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
                        title="Xóa vĩnh viễn các khách sạn đã chọn?"
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
                    rowSelection={{
                      selectedRowKeys,
                      onChange: (selectedKeys: React.Key[]) => setSelectedRowKeys(selectedKeys as number[]),
                    }}
                    columns={deletedColumns}
                    dataSource={user?.userType === 'MANAGER' ? deletedHotels.filter(h => (h as any).managerId === (user as any)?.id) : deletedHotels}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 800 }}
                    pagination={{
                      current: deletedPagination.current,
                      pageSize: deletedPagination.pageSize,
                      total: deletedPagination.total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} khách sạn đã xóa`,
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
            },
          ]}
        />
      </Card>
      <Modal
        title={editingHotel ? 'Chỉnh sửa khách sạn' : 'Thêm khách sạn mới'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        confirmLoading={submitLoading}
      >
        <Spin spinning={submitLoading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={editingHotel ? handleUpdateHotel : handleCreateHotel}
          >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên khách sạn"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên khách sạn!' },
                  { max: 100, message: 'Tên khách sạn không được quá 100 ký tự!' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="district"
                label="Quận/Huyện"
                rules={[
                  { required: true, message: 'Vui lòng nhập quận/huyện!' },
                  { max: 50, message: 'Quận/huyện không được quá 50 ký tự!' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="addressDetail"
            label="Địa chỉ chi tiết"
            rules={[
              { required: true, message: 'Vui lòng nhập địa chỉ chi tiết!' },
              { max: 255, message: 'Địa chỉ chi tiết không được quá 255 ký tự!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="totalRooms"
                label="Tổng số phòng"
                rules={[
                  { required: true, message: 'Vui lòng nhập tổng số phòng!' },
                  { 
                    validator: (_, value) => {
                      const num = Number(value);
                      if (!value) {
                        return Promise.reject(new Error('Vui lòng nhập tổng số phòng!'));
                      }
                      if (isNaN(num) || num < 1) {
                        return Promise.reject(new Error('Tổng số phòng phải ít nhất là 1!'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="starRating"
                label="Đánh giá sao (tùy chọn)"
                rules={[
                  { 
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.resolve(); // Optional field
                      }
                      const num = Number(value);
                      if (isNaN(num) || num < 0 || num > 5) {
                        return Promise.reject(new Error('Đánh giá sao phải từ 0 đến 5!'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input type="number" step={0.1} min={0} max={5} placeholder="0-5" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="managerId"
                label="Quản lý"
                rules={[{ required: true, message: 'Vui lòng chọn quản lý!' }]}
              >
                <Select placeholder="Chọn quản lý">
                  {managers.map(manager => (
                    <Option key={manager.id} value={manager.id}>
                      {manager.fullName} ({manager.username})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="services"
            label="Dịch vụ"
            rules={[
              { required: true, message: 'Vui lòng chọn ít nhất một dịch vụ!' },
              { type: 'array', min: 1, message: 'Phải chọn ít nhất một dịch vụ!' }
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn các dịch vụ khách sạn"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={[
                // Dịch vụ cơ bản
                { label: 'WiFi miễn phí', value: 'WiFi miễn phí' },
                { label: 'Điều hòa không khí', value: 'Điều hòa không khí' },
                { label: 'Hệ thống sưởi', value: 'Hệ thống sưởi' },
                { label: 'Phòng không hút thuốc', value: 'Phòng không hút thuốc' },
                { label: 'Thang máy', value: 'Thang máy' },
                { label: 'Lễ tân 24/7', value: 'Lễ tân 24/7' },
                // Ăn uống
                { label: 'Bao gồm bữa sáng', value: 'Bao gồm bữa sáng' },
                { label: 'Nhà hàng', value: 'Nhà hàng' },
                { label: 'Dịch vụ phòng', value: 'Dịch vụ phòng' },
                { label: 'Quầy bar', value: 'Quầy bar' },
                { label: 'Quán cà phê', value: 'Quán cà phê' },
                { label: 'Tủ lạnh mini', value: 'Tủ lạnh mini' },
                // Giải trí & Thể thao
                { label: 'Hồ bơi', value: 'Hồ bơi' },
                { label: 'Phòng tập gym', value: 'Phòng tập gym' },
                { label: 'Spa & Chăm sóc sức khỏe', value: 'Spa & Chăm sóc sức khỏe' },
                { label: 'Phòng xông hơi', value: 'Phòng xông hơi' },
                { label: 'Bồn tắm nước nóng', value: 'Bồn tắm nước nóng' },
                { label: 'Sân tennis', value: 'Sân tennis' },
                { label: 'Sân golf', value: 'Sân golf' },
                { label: 'Phòng trò chơi', value: 'Phòng trò chơi' },
                { label: 'Karaoke', value: 'Karaoke' },
                // Dịch vụ kinh doanh
                { label: 'Trung tâm kinh doanh', value: 'Trung tâm kinh doanh' },
                { label: 'Phòng họp', value: 'Phòng họp' },
                { label: 'Hội nghị truyền hình', value: 'Hội nghị truyền hình' },
                { label: 'Phòng tiệc', value: 'Phòng tiệc' },
                { label: 'Không gian sự kiện', value: 'Không gian sự kiện' },
                // Giao thông
                { label: 'Bãi đậu xe miễn phí', value: 'Bãi đậu xe miễn phí' },
                { label: 'Dịch vụ đậu xe', value: 'Dịch vụ đậu xe' },
                { label: 'Đưa đón sân bay', value: 'Đưa đón sân bay' },
                { label: 'Cho thuê xe hơi', value: 'Cho thuê xe hơi' },
                { label: 'Cho thuê xe đạp', value: 'Cho thuê xe đạp' },
                // Dịch vụ cá nhân
                { label: 'Dịch vụ giặt ủi', value: 'Dịch vụ giặt ủi' },
                { label: 'Giặt khô', value: 'Giặt khô' },
                { label: 'Dịch vụ tư vấn', value: 'Dịch vụ tư vấn' },
                { label: 'Dịch vụ trông trẻ', value: 'Dịch vụ trông trẻ' },
                { label: 'Thân thiện với thú cưng', value: 'Thân thiện với thú cưng' },
                { label: 'Gửi hành lý', value: 'Gửi hành lý' },
                // Tiện ích phòng
                { label: 'TV cáp/Vệ tinh', value: 'TV cáp/Vệ tinh' },
                { label: 'Két sắt trong phòng', value: 'Két sắt trong phòng' },
                { label: 'Máy sấy tóc', value: 'Máy sấy tóc' },
                { label: 'Bàn ủi', value: 'Bàn ủi' },
                { label: 'Ban công/Sân thượng', value: 'Ban công/Sân thượng' },
                { label: 'Bếp nhỏ', value: 'Bếp nhỏ' },
                // An ninh & An toàn
                { label: 'Bảo vệ 24/7', value: 'Bảo vệ 24/7' },
                { label: 'Camera giám sát', value: 'Camera giám sát' },
                { label: 'Hệ thống chống cháy', value: 'Hệ thống chống cháy' },
                { label: 'Lối thoát hiểm', value: 'Lối thoát hiểm' },
                // Dịch vụ đặc biệt
                { label: 'Tiện nghi cho người khuyết tật', value: 'Tiện nghi cho người khuyết tật' },
                { label: 'Phòng gia đình', value: 'Phòng gia đình' },
                { label: 'Phòng tân hôn', value: 'Phòng tân hôn' },
                { label: 'Phòng VIP', value: 'Phòng VIP' },
                { label: 'Khu vườn', value: 'Khu vườn' },
                { label: 'Gần bãi biển', value: 'Gần bãi biển' },
                { label: 'View núi', value: 'View núi' },
                { label: 'View thành phố', value: 'View thành phố' },
                { label: 'View biển', value: 'View biển' }
              ]}
            />
          </Form.Item>
          <Form.Item
            name="image"
            label="Hình ảnh"
            valuePropName="file"
            getValueFromEvent={(e) => e?.file}
          >
            <div>
              {editingHotel && currentImageUrl && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>Ảnh hiện tại:</div>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Image
                      width={200}
                      height={120}
                      src={currentImageUrl}
                      style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #d9d9d9' }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                    />
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #ff4d4f'
                      }}
                      onClick={() => setCurrentImageUrl('')}
                      title="Xóa ảnh hiện tại"
                    />
                  </div>
                  <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                    Bạn có thể giữ ảnh hiện tại hoặc tải lên ảnh mới bên dưới
                  </div>
                </div>
              )}
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                {editingHotel ? 'Tải lên ảnh mới (tùy chọn):' : 'Tải lên ảnh:'}
              </div>
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
                showUploadList={{
                  showPreviewIcon: false,
                  showRemoveIcon: true,
                }}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>
                    {editingHotel ? 'Chọn ảnh mới' : 'Upload'}
                  </div>
                </div>
              </Upload>
            </div>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalClose}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {editingHotel ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
          </Form>
        </Spin>
      </Modal>
      {}
      <Modal
        title="Chi tiết khách sạn"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        <Spin spinning={detailLoading}>
          {viewingHotel && (
            <div>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Card size="small" title="Thông tin cơ bản">
                  <div style={{ marginBottom: 8 }}>
                    <strong>Tên khách sạn:</strong> {viewingHotel.name}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Quận/Huyện:</strong> {viewingHotel.district}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Địa chỉ chi tiết:</strong> {viewingHotel.addressDetail}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Tổng số phòng:</strong> {viewingHotel.totalRooms}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Đánh giá sao:</strong> 
                    <Tag color={viewingHotel.starRating >= 4 ? 'green' : viewingHotel.starRating >= 3 ? 'orange' : 'red'} style={{ marginLeft: 8 }}>
                      {viewingHotel.starRating}/5
                    </Tag>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Thông tin quản lý">
                  {viewingHotel.managedBy && (
                    <>
                      <div style={{ marginBottom: 8 }}>
                        <strong>Tên quản lý:</strong> {viewingHotel.managedBy.fullName}
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <strong>Username:</strong> {viewingHotel.managedBy.username}
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <strong>Email:</strong> {viewingHotel.managedBy.email}
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <strong>Số điện thoại:</strong> {viewingHotel.managedBy.phone}
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <strong>Giới tính:</strong> {viewingHotel.managedBy.gender === 'MALE' ? 'Nam' : 'Nữ'}
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <strong>Ngày sinh:</strong> {dayjs(viewingHotel.managedBy.birthday).format('DD/MM/YYYY')}
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <strong>Trạng thái:</strong> 
                        <Tag color={viewingHotel.managedBy.status === 'ACTIVE' ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                          {viewingHotel.managedBy.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                        </Tag>
                      </div>
                    </>
                  )}
                </Card>
              </Col>
            </Row>
            <Row gutter={[24, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card size="small" title="Hình ảnh khách sạn">
                  <Image
                    width="100%"
                    height={200}
                    src={viewingHotel.imageUrl || '/placeholder-hotel.jpg'}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Dịch vụ khách sạn">
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {viewingHotel.services && viewingHotel.services.length > 0 ? (
                      <div>
                        {viewingHotel.services.map((service, index) => (
                          <Tag key={index} color="blue" style={{ marginBottom: 8, marginRight: 8 }}>
                            {service}
                          </Tag>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#999' }}>Không có dịch vụ nào được thiết lập</div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
            </div>
          )}
          {!viewingHotel && !detailLoading && (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <p>Không có dữ liệu để hiển thị</p>
            </div>
          )}
        </Spin>
      </Modal>
    </div>
  );
};
export default HotelManagement;