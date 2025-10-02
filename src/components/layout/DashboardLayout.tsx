import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Space } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  HomeOutlined,
  BookOutlined,
  GiftOutlined,
  StarOutlined,
  CreditCardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => console.log('Profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => console.log('Settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];
  // Menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Tổng quan',
      },
    ];
    
    if (user?.userType === 'SYSTEM_ADMIN' || user?.userType === 'ADMIN') {
      baseItems.push({
        key: '/dashboard/users',
        icon: <UserOutlined />,
        label: 'Quản lý người dùng',
      });
    }
    if (['SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'].includes(user?.userType || '')) {
      baseItems.push(
        {
          key: '/dashboard/rooms',
          icon: <HomeOutlined />,
          label: 'Quản lý phòng',
        },
        {
          key: '/dashboard/vouchers',
          icon: <GiftOutlined />,
          label: 'Quản lý voucher',
        }
      );
    }
    if (['SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'].includes(user?.userType || '')) {
      baseItems.push(
        {
          key: '/dashboard/bookings',
          icon: <BookOutlined />,
          label: 'Quản lý đặt phòng',
        },
      )
    }
    if (['SYSTEM_ADMIN', 'ADMIN'].includes(user?.userType || '')) {
      baseItems.push(
        {
          key: '/dashboard/users',
          icon: <UserOutlined />,
          label: 'Quản lý người dùng',
        },
        {
          key: '/dashboard/hotels',
          icon: <HomeOutlined />,
          label: 'Quản lý khách sạn',
        },
        {
          key: '/dashboard/evaluations',
          icon: <StarOutlined />,
          label: 'Quản lý đánh giá',
        },
        {
          key: '/dashboard/payments',
          icon: <CreditCardOutlined />,
          label: 'Quản lý thanh toán',
        }
      );
    }
    return baseItems;
  };
  const getRoleDisplayName = (userType: string) => {
    const roleMap: Record<string, string> = {
      SYSTEM_ADMIN: 'Quản trị viên hệ thống',
      ADMIN: 'Quản trị viên',
      MANAGER: 'Quản lý',
      STAFF: 'Nhân viên',
      GUEST: 'Khách hàng',
    };
    return roleMap[userType] || userType;
  };
  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="sidebar"
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200 mb-4">
          <Text
            strong
            className={`${collapsed ? 'text-base' : 'text-xl'} text-primary-500`}
          >
            {collapsed ? 'BD' : 'Booking Dashboard'}
          </Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={({ key }) => navigate(key)}
          className="border-none"
        />
      </Sider>
      <Layout>
        <Header className="header px-6 flex items-center justify-between">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-base w-16 h-16"
          />
          <Space>
            <Text type="secondary">
              Xin chào, <Text strong>{user?.fullName}</Text>
            </Text>
            <Text type="secondary" className="text-xs">
              ({getRoleDisplayName(user?.userType || '')})
            </Text>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Avatar
                className="bg-primary-500 cursor-pointer"
                icon={<UserOutlined />}
              />
            </Dropdown>
          </Space>
        </Header>
        <Content className="m-6 p-6 bg-white rounded-lg min-h-[calc(100vh-112px)] overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
export default DashboardLayout;