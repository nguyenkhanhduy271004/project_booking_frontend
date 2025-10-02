import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Rate,
  Spin,
  Divider,
  message,
  Breadcrumb,
  Space,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  UserOutlined,
  StarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { hotelService } from '../services/hotelService';
import { evaluationService } from '../services/evaluationService';
import type { Hotel } from '../types';
const { Content } = Layout;
const { Title, Text } = Typography;
const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [evalModalVisible, setEvalModalVisible] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [currentEvalRoomId, setCurrentEvalRoomId] = useState<number | null>(null);
  const [evaluations, setEvaluations] = useState<Array<{ id: number; rating: number; comment: string; guestName?: string; createdAt?: string }>>([]);
  useEffect(() => {
    if (id) {
      fetchHotelDetail(parseInt(id));
    }
  }, [id]);
  const fetchHotelDetail = async (hotelId: number) => {
    try {
      setLoading(true);
      // Fetch hotel details and rooms in parallel
      const [hotelResponse, roomsResponse] = await Promise.all([
        hotelService.getHotelById(hotelId),
        hotelService.getHotelRooms(hotelId)
      ]);
      if (hotelResponse.status === 200) {
        setHotel(hotelResponse.data);
      }
      if (roomsResponse.status === 200) {
        setRooms(roomsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      message.error('Không thể tải thông tin chi tiết khách sạn');
    } finally {
      setLoading(false);
    }
  };
  const handleGoBack = () => {
    navigate('/');
  };
  const handleBookRoom = (roomId: number) => {
    // Always navigate to booking page, authentication will be checked when actually submitting the booking
    // Use state instead of URL params to hide booking details
    navigate(`/booking/${hotel?.id}`, {
      state: {
        selectedRooms: [roomId],
        checkInDate: dayjs().format('YYYY-MM-DD'),
        checkOutDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        guests: 2
      }
    });
  };

  const openEvaluations = async (roomId: number) => {
    try {
      setCurrentEvalRoomId(roomId);
      setEvalLoading(true);
      setEvalModalVisible(true);
      const resp = await evaluationService.getEvaluationsByRoomId(roomId);
      if (resp.status === 200) {
        const raw = (resp as any).data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray((raw && (raw.items || raw.data)))
            ? (raw.items || raw.data)
            : raw
              ? [raw]
              : [];
        setEvaluations(list);
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      message.error('Không thể tải đánh giá');
    } finally {
      setEvalLoading(false);
    }
  };

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
          <Button type="primary" onClick={handleGoBack}>
            Quay lại trang chủ
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
          <div className="flex items-center justify-between mb-4">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={handleGoBack}
              className="flex items-center text-gray-600 hover:text-blue-600"
            >
              Quay lại trang chủ
            </Button>
          </div>
          <Breadcrumb className="mb-4">
            <Breadcrumb.Item>
              <a onClick={handleGoBack}>Trang chủ</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Chi tiết khách sạn</Breadcrumb.Item>
            <Breadcrumb.Item>{hotel.name}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        {}
        <Card className="mb-8 rounded-xl shadow-lg border-none">
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={10}>
              <div className="h-80 rounded-xl overflow-hidden">
                <img
                  src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                  alt={hotel.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </Col>
            <Col xs={24} lg={14}>
              <div className="h-full flex flex-col justify-between">
                <div>
                  <Title level={2} className="mb-4 text-gray-800">
                    {hotel.name}
                  </Title>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <EnvironmentOutlined className="text-blue-500 mr-3 text-lg" />
                      <Text className="text-lg">
                        {hotel.addressDetail ? 
                          `${hotel.addressDetail}, ${hotel.district}` : 
                          hotel.district
                        }
                      </Text>
                    </div>
                    <div className="flex items-center">
                      <StarOutlined className="text-yellow-500 mr-3 text-lg" />
                      <Rate disabled defaultValue={hotel.starRating || 4} className="mr-3" />
                      <Text className="text-lg">({hotel.starRating || 4}.0 sao)</Text>
                    </div>
                    <div className="flex items-center">
                      <HomeOutlined className="text-blue-500 mr-3 text-lg" />
                      <Text className="text-lg">Tổng số phòng: {hotel.totalRooms}</Text>
                    </div>
                    {hotel.managedBy && (
                      <div className="flex items-center">
                        <UserOutlined className="text-blue-500 mr-3 text-lg" />
                        <Text className="text-lg">Quản lý bởi: {hotel.managedBy.fullName}</Text>
                      </div>
                    )}
                  </div>
                </div>
                {hotel.services && hotel.services.length > 0 && (
                  <div className="mt-6">
                    <Title level={4} className="mb-3">Dịch vụ tiện ích</Title>
                    <div className="flex flex-wrap gap-2">
                      {hotel.services.map((service, index) => (
                        <Tag key={index} color="blue" className="px-3 py-1 text-sm">
                          {service}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card>
        <Divider className="my-8" />
        {}
        <div>
          <div className="flex items-center justify-between mb-6">
            <Title level={3} className="mb-0">
              Danh sách phòng
            </Title>
            <Text className="text-lg text-gray-600">
              {rooms.length} phòng có sẵn
            </Text>
          </div>
          {rooms.length > 0 ? (
            <Row gutter={[24, 24]}>
              {rooms.map((room: any) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={room.id}>
                  <Card 
                    className="rounded-xl shadow-lg border-none hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    cover={
                      room.listImageUrl && room.listImageUrl.length > 0 ? (
                        <div className="h-48 overflow-hidden rounded-t-xl">
                          <img
                            src={room.listImageUrl[0]}
                            alt={`Phòng ${room.id}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-200 flex items-center justify-center rounded-t-xl">
                          <HomeOutlined className="text-4xl text-gray-400" />
                        </div>
                      )
                    }
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <Title level={5} className="mb-0">Phòng #{room.id}</Title>
                        <Tag color={room.available ? 'green' : 'red'} className="font-semibold">
                          {room.available ? 'Có sẵn' : 'Đã đặt'}
                        </Tag>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <Text className="text-gray-600">Loại phòng:</Text>
                          <Text strong>{room.typeRoom}</Text>
                        </div>
                        <div className="flex justify-between">
                          <Text className="text-gray-600">Sức chứa:</Text>
                          <Text strong>{room.capacity} người</Text>
                        </div>
                        <div className="flex justify-between items-center">
                          <Text className="text-gray-600">Giá phòng:</Text>
                          <Text strong className="text-blue-600 text-lg">
                            {room.pricePerNight?.toLocaleString('vi-VN')}đ
                          </Text>
                        </div>
                      </div>
                      {room.services && room.services.length > 0 && (
                        <div className="mb-4">
                          <Text className="text-gray-600 text-sm block mb-2">Dịch vụ:</Text>
                          <div className="flex flex-wrap gap-1">
                            {room.services.slice(0, 3).map((service: string, index: number) => (
                              <Tag key={index} color="blue">
                                {service}
                              </Tag>
                            ))}
                            {room.services.length > 3 && (
                              <Tag color="default">
                                +{room.services.length - 3} khác
                              </Tag>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="mt-2">
                        <Button type="link" onClick={() => openEvaluations(room.id)}>
                          Xem đánh giá
                        </Button>
                      </div>
                      <Button 
                        type="primary" 
                        block 
                        size="large"
                        disabled={!room.available}
                        className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 border-none font-semibold hover:from-blue-600 hover:to-cyan-500 transform hover:scale-105 transition-all duration-300"
                        onClick={() => handleBookRoom(room.id)}
                      >
                        {room.available ? 'Đặt phòng' : 'Không có sẵn'}
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card className="text-center py-16 rounded-xl shadow-lg border-none">
              <HomeOutlined className="text-6xl text-gray-300 mb-4" />
              <Title level={4} className="text-gray-500 mb-2">
                Chưa có phòng nào
              </Title>
              <Text type="secondary">
                Khách sạn này hiện chưa có phòng nào được đăng ký
              </Text>
            </Card>
          )}
        </div>
        {}
        <div className="mt-12 text-center">
          <Space size="large">
            <Button size="large" onClick={handleGoBack}>
              Quay lại trang chủ
            </Button>
            <Button 
              type="primary" 
              size="large"
              className="bg-gradient-to-r from-blue-500 to-cyan-400 border-none font-semibold hover:from-blue-600 hover:to-cyan-500 px-8"
            >
              Liên hệ khách sạn
            </Button>
          </Space>
        </div>
      </Content>
      {/* Evaluations Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <StarOutlined className="mr-2" />
            Đánh giá phòng #{currentEvalRoomId || ''}
          </div>
        }
        open={evalModalVisible}
        onCancel={() => setEvalModalVisible(false)}
        footer={null}
        width={700}
      >
        {evalLoading ? (
          <div className="flex justify-center py-6"><Spin /></div>
        ) : evaluations && evaluations.length > 0 ? (
          <div className="space-y-4">
            {evaluations.map((ev) => (
              <Card key={ev.id} size="small">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Rate disabled allowHalf value={ev.rating as any} />
                    <Typography.Text strong>{ev.guestName || 'Ẩn danh'}</Typography.Text>
                  </div>
                  {ev.createdAt && (
                    <Typography.Text type="secondary">{dayjs(ev.createdAt).format('DD/MM/YYYY')}</Typography.Text>
                  )}
                </div>
                {ev.comment && (
                  <div className="mt-2">
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      {ev.comment}
                    </Typography.Paragraph>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Typography.Text type="secondary">Chưa có đánh giá nào cho phòng này</Typography.Text>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
export default HotelDetailPage;