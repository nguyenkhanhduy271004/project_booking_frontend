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
  Upload,
  Tag,
  Tooltip,
  InputNumber,
  Badge,
  Spin,
  Image,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UndoOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { Room, RoomDTO, Hotel, RoomType } from '../types';
import { roomService } from '../services/roomService';
import { hotelService } from '../services/hotelService';
import { useAuthStore } from '../store/authStore';
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const RoomManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [uploadFileList, setUploadFileList] = useState<any[]>([]);
  const [form] = Form.useForm();
  useEffect(() => {
    fetchRooms();
    fetchHotels();
  }, [pagination.current, pagination.pageSize, searchText, showDeleted]);
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomService.getAllRooms({
        page: pagination.current - 1,
        size: pagination.pageSize,
        deleted: showDeleted,
      });
      if (response.status === 200) {
        setRooms(response.data.items);
        setPagination(prev => ({
          ...prev,
          total: response.data.totalElements,
        }));
      }
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      message.error('Không thể tải danh sách phòng');
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
      message.error('Không thể tải danh sách khách sạn');
    }
  };
  const handleCreateRoom = async (values: RoomDTO & { images?: any }) => {
    try {
      setSubmitLoading(true);
      const { images, ...roomData } = values;
      // Extract actual files from uploadFileList state instead of form values
      const imageFiles: File[] = [];
      console.log('Upload file list from state:', uploadFileList);
      if (uploadFileList && uploadFileList.length > 0) {
        uploadFileList.forEach((fileItem: any, index: number) => {
          console.log(`FileItem ${index}:`, fileItem);
          console.log(`FileItem ${index} keys:`, Object.keys(fileItem));
          if (fileItem.originFileObj) {
            console.log(`Adding originFileObj for item ${index}:`, fileItem.originFileObj);
            imageFiles.push(fileItem.originFileObj);
          } else if (fileItem instanceof File) {
            console.log(`Adding File for item ${index}:`, fileItem);
            imageFiles.push(fileItem);
          } else {
            console.log(`Unknown file format for item ${index}:`, fileItem);
          }
        });
      } else {
        console.log('No images found in uploadFileList');
      }
      console.log('Room data:', roomData);
      console.log('Price per night:', roomData.pricePerNight, typeof roomData.pricePerNight);
      console.log('Final image files:', imageFiles);
      console.log('Image files count:', imageFiles.length);
      const response = await roomService.createRoom(roomData, imageFiles);
      if (response.status === 201) {
        message.success('Tạo phòng thành công!');
        setIsModalVisible(false);
        setUploadFileList([]); // Clear upload file list
        form.resetFields();
        fetchRooms();
      }
    } catch (error: any) {
      console.error('Error creating room:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo phòng';
      message.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };
  const handleUpdateRoom = async (values: RoomDTO & { images?: any }) => {
    if (!editingRoom) return;
    try {
      setSubmitLoading(true);
      const { images, ...roomData } = values;
      console.log('Current images to keep:', currentImages);
      console.log('Upload file list (new images):', uploadFileList);
      // Check if user made any image changes
      const originalImageCount = editingRoom.listImageUrl?.length || 0;
      const currentImageCount = currentImages.length;
      const newImageCount = uploadFileList?.length || 0;
      const hasImageChanges = 
        currentImageCount !== originalImageCount || // Deleted some old images
        newImageCount > 0; // Added new images
      console.log('Original images:', originalImageCount);
      console.log('Current images (after deletion):', currentImageCount);
      console.log('New images:', newImageCount);
      console.log('Has image changes:', hasImageChanges);
      let response;
      if (!hasImageChanges) {
        // No image changes, update room data only
        console.log('No image changes, updating room data only');
        response = await roomService.updateRoomDataOnly(editingRoom.id, roomData);
      } else {
        // Has image changes - need to handle properly
        // Extract new files from uploadFileList
        const newImageFiles: File[] = [];
        if (uploadFileList && uploadFileList.length > 0) {
          uploadFileList.forEach((fileItem: any, index: number) => {
            console.log(`New FileItem ${index}:`, fileItem);
            if (fileItem.originFileObj) {
              console.log(`Adding new originFileObj for item ${index}:`, fileItem.originFileObj);
              newImageFiles.push(fileItem.originFileObj);
            } else if (fileItem instanceof File) {
              console.log(`Adding new File for item ${index}:`, fileItem);
              newImageFiles.push(fileItem);
            }
          });
        }
        console.log('New image files to upload:', newImageFiles);
        console.log('Old images to keep:', currentImages);
        // Send new images + keep images info to backend
        response = await roomService.updateRoom(editingRoom.id, roomData, newImageFiles, currentImages);
      }
      if (response.status === 200) {
        message.success('Cập nhật phòng thành công!');
        setIsModalVisible(false);
        setEditingRoom(null);
        setCurrentImages([]);
        setUploadFileList([]); // Clear upload file list
        form.resetFields();
        fetchRooms();
      }
    } catch (error: any) {
      console.error('Error updating room:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật phòng';
      message.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };
  const handleDeleteRoom = async (id: number, isDeleted: boolean = false) => {
    try {
      if (isDeleted) {
        await roomService.deleteRoomPermanently(id);
        message.success('Xóa vĩnh viễn phòng thành công!');
      } else {
        await roomService.deleteRoom(id);
        message.success('Xóa phòng thành công!');
      }
      fetchRooms();
    } catch (error: any) {
      console.error('Error deleting room:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa phòng';
      message.error(errorMessage);
    }
  };
  const handleDeleteRooms = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một phòng để xóa');
      return;
    }
    try {
      if (showDeleted) {
        await roomService.deleteRoomsPermanently(selectedRowKeys);
        message.success('Xóa vĩnh viễn các phòng thành công!');
      } else {
        await roomService.deleteRooms(selectedRowKeys);
        message.success('Xóa các phòng thành công!');
      }
      setSelectedRowKeys([]);
      fetchRooms();
    } catch (error: any) {
      console.error('Error deleting rooms:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa phòng';
      message.error(errorMessage);
    }
  };
  const handleRestoreRoom = async (id: number) => {
    try {
      await roomService.restoreRoom(id);
      message.success('Khôi phục phòng thành công!');
      fetchRooms();
    } catch (error: any) {
      console.error('Error restoring room:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi khôi phục phòng';
      message.error(errorMessage);
    }
  };
  const handleRestoreRooms = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một phòng để khôi phục');
      return;
    }
    try {
      await roomService.restoreRooms(selectedRowKeys);
      message.success('Khôi phục các phòng thành công!');
      setSelectedRowKeys([]);
      fetchRooms();
    } catch (error: any) {
      console.error('Error restoring rooms:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi khôi phục phòng';
      message.error(errorMessage);
    }
  };
  const handleViewDetail = async (roomId: number) => {
    try {
      setDetailLoading(true);
      const response = await roomService.getRoomById(roomId);
      if (response.status === 200) {
        setViewingRoom(response.data);
        setIsDetailModalVisible(true);
      }
    } catch (error: any) {
      console.error('Error fetching room detail:', error);
      message.error('Không thể tải thông tin phòng');
    } finally {
      setDetailLoading(false);
    }
  };
  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setCurrentImages(room.listImageUrl || []);
    setUploadFileList([]); // Reset upload file list for new images
    form.setFieldsValue({
      ...room,
      id: room.id,
      services: room.services || [],
    });
    setIsModalVisible(true);
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingRoom(null);
    setCurrentImages([]);
    setUploadFileList([]); // Clear upload file list
    form.resetFields();
  };
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'listImageUrl',
      key: 'listImageUrl',
      width: 80,
      render: (listImageUrl: string[]) => (
        <Image
          width={50}
          height={35}
          src={listImageUrl && listImageUrl.length > 0 ? listImageUrl[0] : '/placeholder-room.jpg'}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
        />
      ),
    },
    {
      title: 'Số phòng',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      width: 120,
      ellipsis: false,
    },
    {
      title: 'Loại phòng',
      dataIndex: 'typeRoom',
      key: 'typeRoom',
      width: 150,
      ellipsis: false,
      render: (typeRoom: RoomType) => {
        const getTypeRoomColor = (type: RoomType) => {
          switch (type) {
            case 'STANDARD': return 'blue';
            case 'SUITE': return 'purple';
            case 'CONFERENCE': return 'green';
            case 'DELUXE': return 'gold';
            default: return 'default';
          }
        };
        const getTypeRoomLabel = (type: RoomType) => {
          switch (type) {
            case 'STANDARD': return 'Tiêu chuẩn';
            case 'SUITE': return 'Suite';
            case 'CONFERENCE': return 'Hội nghị';
            case 'DELUXE': return 'Deluxe';
            default: return type;
          }
        };
        return (
          <Tag color={getTypeRoomColor(typeRoom)}>
            {getTypeRoomLabel(typeRoom)}
          </Tag>
        );
      },
    },
    {
      title: 'Khách sạn',
      dataIndex: 'hotelName',
      key: 'hotelName',
      width: 200,
      ellipsis: false,
    },
    {
      title: 'Giá/đêm',
      dataIndex: 'pricePerNight',
      key: 'pricePerNight',
      width: 150,
      ellipsis: false,
      render: (pricePerNight: number) => `${pricePerNight.toLocaleString('vi-VN')} VNĐ`,
      sorter: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'available',
      key: 'available',
      width: 120,
      ellipsis: false,
      render: (available: boolean) => (
        <Badge
          status={available ? 'success' : 'error'}
          text={available ? 'Có sẵn' : 'Đã đặt'}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Room) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              loading={detailLoading}
              onClick={() => handleViewDetail(record.id)}
            />
          </Tooltip>
          {!showDeleted && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}
          {showDeleted ? (
            <>
              <Popconfirm
                title="Khôi phục phòng này?"
                onConfirm={() => handleRestoreRoom(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Tooltip title="Khôi phục">
                  <Button type="text" icon={<UndoOutlined />} />
                </Tooltip>
              </Popconfirm>
              <Popconfirm
                title="Xóa vĩnh viễn phòng này? Hành động này không thể hoàn tác!"
                onConfirm={() => handleDeleteRoom(record.id, true)}
                okText="Có"
                cancelText="Không"
              >
                <Tooltip title="Xóa vĩnh viễn">
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            </>
          ) : (
            <Popconfirm
              title="Xóa phòng này?"
              onConfirm={() => handleDeleteRoom(record.id, false)}
              okText="Có"
              cancelText="Không"
            >
              <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
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
              Quản lý phòng
            </Title>
          </Col>
          <Col>
            <Space>
              <Input.Search
                placeholder="Tìm kiếm phòng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
              />
              <Button
                type={showDeleted ? 'default' : 'primary'}
                onClick={() => setShowDeleted(!showDeleted)}
              >
                {showDeleted ? 'Hiển thị phòng hoạt động' : 'Hiển thị phòng đã xóa'}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRooms}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Thêm phòng
              </Button>
              <Popconfirm
                title="Xóa các phòng đã chọn?"
                onConfirm={handleDeleteRooms}
                okText="Có"
                cancelText="Không"
              >
                <Button icon={<DeleteOutlined />} danger disabled={selectedRowKeys.length === 0}>
                  Xóa đã chọn
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Khôi phục các phòng đã chọn?"
                onConfirm={handleRestoreRooms}
                okText="Có"
                cancelText="Không"
              >
                <Button icon={<UndoOutlined />} disabled={selectedRowKeys.length === 0}>
                  Khôi phục đã chọn
                </Button>
              </Popconfirm>
            </Space>
          </Col>
        </Row>
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: (selectedKeys: React.Key[]) => setSelectedRowKeys(selectedKeys as number[]),
          }}
          columns={columns}
          dataSource={rooms}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} phòng`,
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
        title={editingRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
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
            onFinish={editingRoom ? handleUpdateRoom : handleCreateRoom}
          >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="typeRoom"
                label="Loại phòng"
                rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
              >
                <Select>
                  <Option value="STANDARD">Phòng tiêu chuẩn</Option>
                  <Option value="SUITE">Suite</Option>
                  <Option value="CONFERENCE">Phòng hội nghị</Option>
                  <Option value="DELUXE">Deluxe</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="capacity"
                label="Sức chứa"
                rules={[{ required: true, message: 'Vui lòng nhập sức chứa!' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="available"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                initialValue={true}
              >
                <Select>
                  <Option value={true}>Có sẵn</Option>
                  <Option value={false}>Đã đặt</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item
                name="pricePerNight"
                label="Giá phòng/đêm (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá phòng!' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value ? Number(value.replace(/[^\d]/g, '')) : 0 as any}
                  placeholder="Nhập giá phòng (VD: 500000)"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: false, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="services"
            label="Dịch vụ phòng"
          >
            <Select
              mode="multiple"
              placeholder="Chọn dịch vụ"
              options={[
                { label: 'WiFi miễn phí', value: 'WiFi miễn phí' },
                { label: 'Điều hòa không khí', value: 'Điều hòa không khí' },
                { label: 'TV LCD/LED', value: 'TV LCD/LED' },
                { label: 'Tủ lạnh mini', value: 'Tủ lạnh mini' },
                { label: 'Bồn tắm', value: 'Bồn tắm' },
                { label: 'Vòi sen', value: 'Vòi sen' },
                { label: 'Ban công', value: 'Ban công' },
                { label: 'Két an toàn', value: 'Két an toàn' },
                { label: 'Minibar', value: 'Minibar' },
                { label: 'Dịch vụ phòng 24/7', value: 'Dịch vụ phòng 24/7' },
                { label: 'Máy sấy tóc', value: 'Máy sấy tóc' },
                { label: 'Bàn làm việc', value: 'Bàn làm việc' },
                { label: 'Ghế sofa', value: 'Ghế sofa' },
                { label: 'Máy pha cà phê', value: 'Máy pha cà phê' },
              ]}
            />
          </Form.Item>
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>Hình ảnh:</div>
            <div>
              {editingRoom && currentImages.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>Ảnh hiện tại:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentImages.map((imageUrl, index) => (
                      <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                        <Image
                          width={120}
                          height={80}
                          src={imageUrl}
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
                            top: 2,
                            right: 2,
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #ff4d4f',
                            minWidth: 'auto',
                            width: 24,
                            height: 24,
                          }}
                          onClick={() => {
                            const newImages = [...currentImages];
                            newImages.splice(index, 1);
                            setCurrentImages(newImages);
                          }}
                          title="Xóa ảnh này"
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                    Bạn có thể xóa ảnh cũ hoặc thêm ảnh mới bên dưới
                  </div>
                </div>
              )}
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                {editingRoom ? 'Thêm ảnh mới (tùy chọn):' : 'Tải lên ảnh:'}
              </div>
              <Upload
                listType="picture-card"
                multiple
                fileList={uploadFileList}
                beforeUpload={(file) => {
                  console.log('beforeUpload called with file:', file);
                  return false; // Prevent auto upload
                }}
                onChange={(info) => {
                  console.log('Upload onChange:', info);
                  console.log('Upload fileList:', info.fileList);
                  setUploadFileList(info.fileList);
                }}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>
                    {editingRoom ? 'Thêm ảnh' : 'Upload'}
                  </div>
                </div>
              </Upload>
            </div>
          </div>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalClose}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {editingRoom ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
          </Form>
        </Spin>
      </Modal>
      {}
      <Modal
        title="Chi tiết phòng"
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
          {viewingRoom && (
            <div>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Card size="small" title="Thông tin cơ bản">
                    <div style={{ marginBottom: 8 }}>
                      <strong>Số phòng:</strong> {viewingRoom.id}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Loại phòng:</strong> 
                      <Tag color={
                        viewingRoom.typeRoom === 'STANDARD' ? 'blue' : 
                        viewingRoom.typeRoom === 'SUITE' ? 'purple' : 
                        viewingRoom.typeRoom === 'CONFERENCE' ? 'green' : 'gold'
                      } style={{ marginLeft: 8 }}>
                        {viewingRoom.typeRoom === 'STANDARD' ? 'Tiêu chuẩn' :
                         viewingRoom.typeRoom === 'SUITE' ? 'Suite' :
                         viewingRoom.typeRoom === 'CONFERENCE' ? 'Hội nghị' : 'Deluxe'}
                      </Tag>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Khách sạn:</strong> {viewingRoom.hotelName}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Giá/đêm:</strong> {viewingRoom.pricePerNight.toLocaleString('vi-VN')} VNĐ
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Sức chứa:</strong> {viewingRoom.capacity} người
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Trạng thái:</strong>
                      <Badge
                        status={viewingRoom.available ? 'success' : 'error'}
                        text={viewingRoom.available ? 'Có sẵn' : 'Đã đặt'}
                        style={{ marginLeft: 8 }}
                      />
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Thông tin khác">
                    <div style={{ marginBottom: 8 }}>
                      <strong>Người tạo:</strong> {viewingRoom.createdByUser}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Người cập nhật:</strong> {viewingRoom.updatedByUser || 'Chưa có'}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Ngày tạo:</strong> {new Date(viewingRoom.createdAt).toLocaleString('vi-VN')}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Ngày cập nhật:</strong> {new Date(viewingRoom.updatedAt).toLocaleString('vi-VN')}
                    </div>
                  </Card>
                  <Card size="small" title="Dịch vụ phòng" style={{ marginTop: 16 }}>
                    <div>
                      {viewingRoom.services && viewingRoom.services.length > 0 ? (
                        viewingRoom.services.map((service, index) => (
                          <Tag key={index} color="blue" style={{ marginBottom: 8, marginRight: 8 }}>
                            {service}
                          </Tag>
                        ))
                      ) : (
                        <div style={{ color: '#999' }}>Không có dịch vụ nào</div>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
              <Row gutter={[24, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Card size="small" title={`Hình ảnh phòng (${viewingRoom.listImageUrl?.length || 0} ảnh)`}>
                    {viewingRoom.listImageUrl && viewingRoom.listImageUrl.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {viewingRoom.listImageUrl.map((image, index) => (
                          <Image
                            key={index}
                            width={150}
                            height={100}
                            src={image}
                            style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #d9d9d9' }}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                          />
                        ))}
                      </div>
                    ) : (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '40px 0', 
                        color: '#999',
                        background: '#f5f5f5',
                        borderRadius: 8,
                        border: '1px dashed #d9d9d9'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📷</div>
                        <div>Phòng này chưa có hình ảnh</div>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          )}
          {!viewingRoom && !detailLoading && (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <p>Không có dữ liệu để hiển thị</p>
            </div>
          )}
        </Spin>
      </Modal>
    </div>
  );
};
export default RoomManagement;