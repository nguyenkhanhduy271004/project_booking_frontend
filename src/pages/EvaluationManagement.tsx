import React, { useState, useEffect } from 'react';
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
  Rate,
  InputNumber,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { evaluationService } from '../services/evaluationService';
import { roomService } from '../services/roomService';
import type { Evaluation, EvaluationRequest } from '../types';
import dayjs from 'dayjs';
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const EvaluationManagement: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [form] = Form.useForm();
  useEffect(() => {
    fetchEvaluations();
    fetchRooms();
  }, [searchText, ratingFilter]);
  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      // Since there's no direct API to get all evaluations, we'll simulate with mock data
      // In real implementation, you would call evaluationService.getAllEvaluations()
      const mockEvaluations: Evaluation[] = [
        {
          id: 1,
          rating: 5,
          comment: 'Phòng rất đẹp và sạch sẽ, nhân viên phục vụ tốt',
          roomId: 1,
          roomName: 'Phòng 101',
          guestId: 1,
          guestName: 'Nguyễn Văn A',
          bookingId: 1,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: 2,
          rating: 4,
          comment: 'Phòng tốt nhưng hơi nhỏ',
          roomId: 2,
          roomName: 'Phòng 201',
          guestId: 2,
          guestName: 'Trần Thị B',
          bookingId: 2,
          createdAt: '2024-01-16T14:20:00Z',
          updatedAt: '2024-01-16T14:20:00Z',
        },
        {
          id: 3,
          rating: 3,
          comment: 'Phòng bình thường, giá cả hợp lý',
          roomId: 3,
          roomName: 'Phòng 301',
          guestId: 3,
          guestName: 'Lê Văn C',
          bookingId: 3,
          createdAt: '2024-01-17T09:15:00Z',
          updatedAt: '2024-01-17T09:15:00Z',
        },
      ];
      setEvaluations(mockEvaluations);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };
  const fetchRooms = async () => {
    try {
      const response = await roomService.getAllRooms({ page: 0, size: 1000 });
      if (response.status === 200) {
        setRooms(response.data.items);
      }
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
    }
  };
  const handleCreateEvaluation = async (values: EvaluationRequest) => {
    try {
      const response = await evaluationService.createEvaluation(values);
      if (response.status === 200) {
        message.success('Tạo đánh giá thành công!');
        setIsModalVisible(false);
        form.resetFields();
        fetchEvaluations();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Tạo đánh giá thất bại');
    }
  };
  const handleUpdateEvaluation = async (values: EvaluationRequest) => {
    if (!editingEvaluation) return;
    try {
      const response = await evaluationService.updateEvaluation(editingEvaluation.id, values);
      if (response.status === 200) {
        message.success('Cập nhật đánh giá thành công!');
        setIsModalVisible(false);
        setEditingEvaluation(null);
        form.resetFields();
        fetchEvaluations();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Cập nhật đánh giá thất bại');
    }
  };
  const handleDeleteEvaluation = async (id: number) => {
    try {
      await evaluationService.deleteEvaluation(id);
      message.success('Xóa đánh giá thành công!');
      fetchEvaluations();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xóa đánh giá thất bại');
    }
  };
  const handleEdit = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation);
    form.setFieldsValue({
      ...evaluation,
      id: evaluation.id,
    });
    setIsModalVisible(true);
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingEvaluation(null);
    form.resetFields();
  };
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'green';
    if (rating >= 3) return 'orange';
    return 'red';
  };
  const getRatingText = (rating: number) => {
    const textMap: Record<number, string> = {
      1: 'Rất tệ',
      2: 'Tệ',
      3: 'Bình thường',
      4: 'Tốt',
      5: 'Rất tốt',
    };
    return textMap[rating] || 'Không xác định';
  };
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <Space>
          <Rate disabled value={rating} />
          <Tag color={getRatingColor(rating)}>
            {rating}/5 - {getRatingText(rating)}
          </Tag>
        </Space>
      ),
      sorter: true,
    },
    {
      title: 'Bình luận',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (comment: string) => (
        <Text ellipsis={{ tooltip: comment }} style={{ maxWidth: 200 }}>
          {comment}
        </Text>
      ),
    },
    {
      title: 'Phòng',
      dataIndex: 'roomName',
      key: 'roomName',
      render: (name: string) => (
        <Space>
          <HomeOutlined />
          {name}
        </Space>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'guestName',
      key: 'guestName',
      render: (name: string) => (
        <Space>
          <UserOutlined />
          {name}
        </Space>
      ),
    },
    {
      title: 'Mã đặt phòng',
      dataIndex: 'bookingId',
      key: 'bookingId',
      render: (id: number) => <Text code>#{id}</Text>,
    },
    {
      title: 'Ngày đánh giá',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: true,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_: any, record: Evaluation) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleEdit(record)}
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
            title="Xóa đánh giá này?"
            onConfirm={() => handleDeleteEvaluation(record.id)}
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
  const filteredEvaluations = evaluations.filter(evaluation => {
    if (ratingFilter && evaluation.rating !== ratingFilter) return false;
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        evaluation.comment.toLowerCase().includes(searchLower) ||
        evaluation.guestName.toLowerCase().includes(searchLower) ||
        evaluation.roomName.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
  // Calculate statistics
  const totalEvaluations = evaluations.length;
  const averageRating = evaluations.length > 0 
    ? (evaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0) / evaluations.length).toFixed(1)
    : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: evaluations.filter(evaluation => evaluation.rating === rating).length,
    percentage: evaluations.length > 0 
      ? ((evaluations.filter(evaluation => evaluation.rating === rating).length / evaluations.length) * 100).toFixed(1)
      : 0
  }));
  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý đánh giá
            </Title>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Tìm kiếm đánh giá..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
              />
              <Select
                placeholder="Đánh giá"
                value={ratingFilter}
                onChange={setRatingFilter}
                style={{ width: 150 }}
                allowClear
              >
                <Option value={5}>5 sao</Option>
                <Option value={4}>4 sao</Option>
                <Option value={3}>3 sao</Option>
                <Option value={2}>2 sao</Option>
                <Option value={1}>1 sao</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchEvaluations}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
        {}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {totalEvaluations}
                </div>
                <div>Tổng đánh giá</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {averageRating}
                </div>
                <div>Đánh giá trung bình</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                  {evaluations.filter(evaluation => evaluation.rating >= 4).length}
                </div>
                <div>Đánh giá tích cực (4-5 sao)</div>
              </div>
            </Card>
          </Col>
        </Row>
        {}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5}>Phân bố đánh giá</Title>
          <Row gutter={[8, 8]}>
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <Col key={rating} span={4}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{count}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {rating} sao ({percentage}%)
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
        <Table
          columns={columns}
          dataSource={filteredEvaluations}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đánh giá`,
          }}
        />
      </Card>
      <Modal
        title={editingEvaluation ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá mới'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingEvaluation ? handleUpdateEvaluation : handleCreateEvaluation}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roomId"
                label="Phòng"
                rules={[{ required: true, message: 'Vui lòng chọn phòng!' }]}
              >
                <Select placeholder="Chọn phòng">
                  {rooms.map(room => (
                    <Option key={room.id} value={room.id}>
                      {room.roomNumber} - {room.hotelName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bookingId"
                label="Mã đặt phòng"
                rules={[{ required: true, message: 'Vui lòng nhập mã đặt phòng!' }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="rating"
            label="Đánh giá"
            rules={[{ required: true, message: 'Vui lòng chọn đánh giá!' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="comment"
            label="Bình luận"
            rules={[{ required: true, message: 'Vui lòng nhập bình luận!' }]}
          >
            <TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalClose}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingEvaluation ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default EvaluationManagement;