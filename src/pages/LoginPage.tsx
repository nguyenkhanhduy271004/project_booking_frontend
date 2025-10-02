import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import type { LoginRequest } from '../types';
const { Title, Text } = Typography;
const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, setError, clearError } = useAuthStore();
  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    clearError();
    try {
      const payload: LoginRequest = {
        ...values,
        username: (values.username || '').trim(),
      };
      const response = await authService.login(payload);
      if (response.status === 200) {
        login(response.data);
        message.success('Đăng nhập thành công!');
        
        // Redirect dựa trên userType
        if (response.data.userType === 'GUEST') {
          navigate('/');
        } else {
          navigate('/dashboard');
        }
      } else {
        message.error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <Card className="w-full max-w-md shadow-2xl rounded-xl">
        <div className="text-center mb-8">
          <Title level={2} className="text-primary-500 mb-2">
            Booking Dashboard
          </Title>
          <Text type="secondary">
            Đăng nhập để quản lý hệ thống
          </Text>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Tên đăng nhập"
              className="rounded-lg"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              className="rounded-lg"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 rounded-lg text-base font-medium"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center mt-6">
          <Space direction="horizontal" size="middle" className="w-full flex justify-between">
            <Text>
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </Text>
            <Text>
              Quên mật khẩu? <Link to="/forgot-password">Khôi phục tại đây</Link>
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};
export default LoginPage;