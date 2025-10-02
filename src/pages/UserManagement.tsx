import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Tag,
  Row,
  Col,
  Typography,
  Card,
  Tooltip,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useRestoreUser,
} from '../hooks/useUsers';
import { hotelService } from '../services/hotelService';
import { useQuery } from '@tanstack/react-query';
import type { User, UserCreationRequest, UserUpdateRequest } from '../types';
import { getRoleDisplayName, getStatusDisplayName, getStatusColor } from '../utils/helpers';

const { Title } = Typography;
const { Option } = Select;

const UserManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const selectedRole = Form.useWatch('type', form);

  const { data: usersData, isLoading } = useUsers({
        page: pagination.current - 1,
        size: pagination.pageSize,
    keyword: searchText || undefined,
        deleted: showDeleted,
      });

  const { data: hotels } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => hotelService.getAllHotels({ page: 0, size: 100 }),
    select: (data) => data.data.items,
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const restoreUserMutation = useRestoreUser();

  const handleCreate = () => {
        setEditingUser(null);
    setModalVisible(true);
        form.resetFields();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalVisible(true);
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      birthday: user.birthday,
      username: user.username,
      email: user.email,
      phone: user.phone,
      type: user.type,
      status: user.status,
      address: user.address,
    });
  };

  useEffect(() => {
    if (selectedRole !== 'STAFF') {
      form.setFieldValue('hotelId', undefined);
    }
  }, [selectedRole, form]);

  const handleViewDetail = (user: User) => {
    setViewingUser(user);
    setIsDetailModalVisible(true);
  };

  const handleDelete = (userId: number) => {
    deleteUserMutation.mutate(userId);
  };

  const handleRestore = (userId: number) => {
    restoreUserMutation.mutate(userId);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        const updateData: Partial<UserUpdateRequest> = {
          firstName: values.firstName,
          lastName: values.lastName,
          gender: values.gender,
          birthday: values.birthday,
          email: values.email,
          phone: values.phone,
          type: values.type,
          status: values.status,
        };
        if (values.address) {
          (updateData as any).address = values.address;
        }
        updateUserMutation.mutate({ id: editingUser.id, data: updateData });
      } else {
        const createData: UserCreationRequest = {
          firstName: values.firstName,
          lastName: values.lastName,
          gender: values.gender,
          birthday: values.birthday,
          username: values.username,
          password: values.password,
          email: values.email,
          phone: values.phone,
          type: values.type,
          hotelId: values.hotelId,
        };
        createUserMutation.mutate(createData);
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };


  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Tên đầy đủ',
      key: 'fullName',
      render: (record: User) => `${record.firstName || ''} ${record.lastName || ''}`.trim() || record.fullName,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Vai trò',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getRoleDisplayName(type),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusDisplayName(status)}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {!showDeleted && (
            <>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
            <Popconfirm
                title="Bạn có chắc chắn muốn xóa người dùng này?"
                onConfirm={() => handleDelete(record.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Tooltip title="Xóa">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                  />
              </Tooltip>
            </Popconfirm>
            </>
          )}
          {showDeleted && (
            <Popconfirm
              title="Bạn có chắc chắn muốn khôi phục người dùng này?"
              onConfirm={() => handleRestore(record.id)}
              okText="Khôi phục"
              cancelText="Hủy"
            >
              <Tooltip title="Khôi phục">
                <Button
                  type="text"
                  icon={<UndoOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Quản lý người dùng</Title>
            <Space>
            <Input.Search
                placeholder="Tìm kiếm người dùng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              />
              <Button
              type={showDeleted ? 'default' : 'primary'}
              onClick={() => setShowDeleted(!showDeleted)}
              >
              {showDeleted ? 'Hiển thị người dùng hoạt động' : 'Hiển thị người dùng đã xóa'}
              </Button>
            {!showDeleted && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Thêm người dùng
              </Button>
            )}
            </Space>
        </div>

        <Table
          columns={columns}
          dataSource={usersData?.items || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: usersData?.totalElements || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || prev.pageSize,
              }));
            },
          }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Họ"
                rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
              >
                <Select>
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="type"
                label="Vai trò"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
              >
                <Select>
                  <Option value="ADMIN">Quản trị viên</Option>
                  <Option value="MANAGER">Quản lý</Option>
                  <Option value="STAFF">Nhân viên</Option>
                  <Option value="GUEST">Khách hàng</Option>
                </Select>
              </Form.Item>
            </Col>
            {editingUser && (
              <Col span={8}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                  <Select>
                    <Option value="NONE">Chưa xác định</Option>
                    <Option value="ACTIVE">Hoạt động</Option>
                    <Option value="INACTIVE">Không hoạt động</Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Form.Item
            name="birthday"
            label="Ngày sinh"
            rules={[
              { required: !editingUser, message: 'Ngày sinh là bắt buộc!' },
              { pattern: /^\d{4}-\d{2}-\d{2}$/, message: 'Ngày sinh phải có định dạng yyyy-MM-dd!' }
            ]}
          >
            <Input placeholder="yyyy-MM-dd" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: !editingUser, message: 'Vui lòng nhập tên đăng nhập!' },
                  { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
                  { max: 50, message: 'Tên đăng nhập không được quá 50 ký tự!' }
                ]}
              >
                <Input disabled={!!editingUser} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^\d{10,15}$/, message: 'Số điện thoại phải có 10-15 chữ số!' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            {!editingUser && (
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: 'Mật khẩu không được để trống!' },
                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                    { max: 20, message: 'Mật khẩu không được quá 20 ký tự!' },
                    { 
                      pattern: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,20}$/, 
                      message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt!' 
                    }
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
            )}
          </Row>

          {!editingUser && selectedRole === 'STAFF' && (
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="hotelId"
                  label="Khách sạn"
                  rules={[{ required: true, message: 'Vui lòng chọn khách sạn cho nhân viên!' }]}
                >
                  <Select placeholder="Chọn khách sạn">
                    {hotels?.map(hotel => (
                      <Option key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={editingUser ? [] : [{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createUserMutation.isPending || updateUserMutation.isPending}>
                {editingUser ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết người dùng"
        open={detailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {viewingUser && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{viewingUser.id}</Descriptions.Item>
            <Descriptions.Item label="Tên đầy đủ">
              {`${viewingUser.firstName || ''} ${viewingUser.lastName || ''}`.trim() || viewingUser.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Tên đăng nhập">{viewingUser.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{viewingUser.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{viewingUser.phone}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {viewingUser.gender === 'MALE' ? 'Nam' : viewingUser.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">{viewingUser.birthday}</Descriptions.Item>
            <Descriptions.Item label="Vai trò">{getRoleDisplayName(viewingUser.type)}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(viewingUser.status)}>
                {getStatusDisplayName(viewingUser.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{viewingUser.address || 'Không có'}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{viewingUser.createdAt}</Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">{viewingUser.updatedAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;