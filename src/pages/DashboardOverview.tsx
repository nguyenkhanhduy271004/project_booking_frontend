import React, { Suspense } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, Space, Button } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  DollarOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import {
  useDashboardOverview,
  useDashboardStatistics,
  useBookingTrends,
  useTopHotels,
  useRoomTypeDistribution,
} from '../hooks/useDashboard';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { getRoleDisplayName, getRoomTypeDisplayName } from '../utils/helpers';

const { Title, Text } = Typography;

const LoadingSpinner = () => (
  <div className="text-center py-12">
    <Spin size="large" />
    <div className="mt-4">
      <Text type="secondary">Đang tải dữ liệu...</Text>
    </div>
  </div>
);

const StatCard = ({ title, value, prefix, valueStyle, formatter }: any) => (
  <Card className="stat-card">
    <Statistic
      title={title}
      value={value}
      prefix={prefix}
      valueStyle={valueStyle}
      formatter={formatter}
    />
  </Card>
);

const ChartCard = ({ title, extra, children }: any) => (
  <Card title={title} extra={extra} className="chart-container">
    <ResponsiveContainer width="100%" height={300}>
      {children}
    </ResponsiveContainer>
  </Card>
);

const QuickStatsCard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();


  const quickNavigationItems = [
    {
      title: 'Quản lý người dùng',
      icon: <UserOutlined className="text-purple-500" />,
      path: '/dashboard/users',
      roles: ['SYSTEM_ADMIN', 'ADMIN'],
    },
    {
      title: 'Quản lý khách sạn',
      icon: <HomeOutlined className="text-blue-500" />,
      path: '/dashboard/hotels',
      roles: ['SYSTEM_ADMIN', 'ADMIN'],
    },
    {
      title: 'Quản lý phòng',
      icon: <HomeOutlined className="text-green-500" />,
      path: '/dashboard/rooms',
      roles: ['SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'],
    },
    {
      title: 'Quản lý đặt phòng',
      icon: <BookOutlined className="text-orange-500" />,
      path: '/dashboard/bookings',
      roles: ['SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'],
    },
    {
      title: 'Quản lý voucher',
      icon: <DollarOutlined className="text-green-600" />,
      path: '/dashboard/vouchers',
      roles: ['SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'],
    },
  ];

    return (
    <Card title="Điều hướng nhanh" className="chart-container">
      <Space direction="vertical" size="large" className="w-full">
        <div>
          <Text type="secondary">Xin chào, </Text>
          <Text strong>{user?.fullName}</Text>
          <Text type="secondary" className="ml-2">
            ({getRoleDisplayName(user?.userType || '')})
          </Text>
        </div>
        <Row gutter={[12, 12]}>
          {quickNavigationItems
            .filter(item => !item.roles || item.roles.includes(user?.userType || ''))
            .map((item, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  className="text-center cursor-pointer h-full"
                  onClick={() => navigate(item.path)}
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <Text strong>{item.title}</Text>
                </Card>
              </Col>
            ))}
        </Row>
          </Space>
    </Card>
  );
};

const StatisticsSection = () => {
  const { data: statistics, isLoading } = useDashboardStatistics();

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col key="hotels" xs={24} sm={12} lg={6}>
          <StatCard
              title="Tổng khách sạn"
            value={statistics?.totalHotels || 0}
            prefix={<HomeOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
        </Col>
        <Col key="rooms" xs={24} sm={12} lg={6}>
          <StatCard
              title="Tổng phòng"
            value={statistics?.totalRooms || 0}
              prefix={<HomeOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
        </Col>
        <Col key="bookings" xs={24} sm={12} lg={6}>
          <StatCard
              title="Tổng đặt phòng"
            value={statistics?.totalBookings || 0}
              prefix={<BookOutlined className="text-yellow-500" />}
              valueStyle={{ color: '#faad14' }}
            />
        </Col>
        <Col key="users" xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng người dùng"
            value={statistics?.totalUsers || 0}
            prefix={<UserOutlined className="text-purple-500" />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="mt-4">
        <Col key="revenue" xs={24} sm={12} lg={6}>
          <StatCard
              title="Doanh thu tháng"
            value={statistics?.monthlyRevenue || 0}
              prefix={<DollarOutlined className="text-red-500" />}
              valueStyle={{ color: '#f5222d' }}
            formatter={(value: any) => `${Number(value).toLocaleString('vi-VN')} VNĐ`}
          />
        </Col>
        <Col key="activeBookings" xs={24} sm={12} lg={6}>
          <StatCard
            title="Đặt phòng hoạt động"
            value={statistics?.activeBookings || 0}
            prefix={<BookOutlined className="text-blue-500" />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col key="newUsers" xs={24} sm={12} lg={6}>
          <StatCard
            title="Người dùng mới tháng"
            value={statistics?.newUsersThisMonth || 0}
            prefix={<UserOutlined className="text-orange-500" />}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Col>
        <Col key="newBookings" xs={24} sm={12} lg={6}>
          <StatCard
            title="Đặt phòng mới tháng"
            value={statistics?.newBookingsThisMonth || 0}
            prefix={<BookOutlined className="text-purple-500" />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
      </Row>
    </>
  );
};

const ChartsSection = () => {
  const { data: bookingTrends, isLoading: trendsLoading } = useBookingTrends(6);
  const { data: roomDistribution, isLoading: roomLoading } = useRoomTypeDistribution();
  const { data: topHotels, isLoading: hotelsLoading } = useTopHotels(5);

  if (trendsLoading || roomLoading || hotelsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Row gutter={[16, 16]} className="mb-6">
        <Col key="chart-trend" xs={24} lg={16}>
          <ChartCard title="Xu hướng đặt phòng và doanh thu" extra={<TrophyOutlined />}>
            <LineChart data={bookingTrends?.map(trend => ({
              month: `T${trend.month}`,
              bookings: trend.bookings,
              revenue: trend.revenue
            })) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'bookings' ? value : `${Number(value).toLocaleString('vi-VN')} VNĐ`,
                    name === 'bookings' ? 'Số đặt phòng' : 'Doanh thu'
                  ]}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name="bookings"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#52c41a"
                  strokeWidth={2}
                  name="revenue"
                />
              </LineChart>
          </ChartCard>
        </Col>
        <Col key="chart-pie" xs={24} lg={8}>
          <ChartCard title="Phân bố loại phòng">
              <PieChart>
                <Pie
                data={roomDistribution?.map(dist => ({
                  name: getRoomTypeDisplayName(dist.roomType),
                  value: dist.count,
                  color: dist.color
                })) || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                {roomDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
          </ChartCard>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col key="top-hotels" xs={24} lg={12}>
          <ChartCard title="Top khách sạn có nhiều đặt phòng nhất">
            <BarChart data={topHotels?.map(hotel => ({
              name: hotel.hotelName,
              bookings: hotel.totalBookings
            })) || []} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => [value, 'Số đặt phòng']} />
                <Bar dataKey="bookings" fill="#1890ff" />
              </BarChart>
          </ChartCard>
        </Col>
        <Col key="quick-stats" xs={24} lg={12}>
          <QuickStatsCard />
        </Col>
      </Row>
    </>
  );
};

const DashboardOverview: React.FC = () => {
  const { data: overview, isLoading, error } = useDashboardOverview();

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center py-12">
        <Text type="danger">Không thể tải dữ liệu dashboard</Text>
        <br />
        <Button type="primary" onClick={() => window.location.reload()} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>Dashboard</Title>
        {overview && (
          <Text type="secondary">
            {overview.message} - {overview.currentMonth} {overview.currentYear}
          </Text>
        )}
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <StatisticsSection />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <ChartsSection />
      </Suspense>
    </div>
  );
};

export default DashboardOverview;