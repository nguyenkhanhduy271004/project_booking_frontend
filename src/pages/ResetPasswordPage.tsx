import React, { useState } from 'react';
import { Card, Typography, Form, Input, Button, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ResetPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const resp = await userService.resetPassword(values.username, {
        password: values.password,
        repeatPassword: values.repeatPassword,
      });
      if (resp.status === 200) {
        message.success(resp.message || 'Đổi mật khẩu thành công');
        setTimeout(() => navigate('/login'), 800);
      } else {
        message.error(resp.message || 'Đổi mật khẩu thất bại');
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data && (data.message || data.error)) || (typeof data === 'string' ? data : '') || e?.message || 'Đổi mật khẩu thất bại';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <Card className="w-full max-w-md shadow-2xl rounded-xl">
        <div className="text-center mb-8">
          <Title level={3}>Đặt lại mật khẩu</Title>
          <Text type="secondary">Nhập tên đăng nhập và mật khẩu mới</Text>
        </div>
        <Form layout="vertical" size="large" onFinish={onFinish}>
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}>
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" className="rounded-lg" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu mới" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }, { min: 8, message: 'Tối thiểu 8 ký tự' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" className="rounded-lg" />
          </Form.Item>
          <Form.Item name="repeatPassword" label="Nhập lại mật khẩu mới" dependencies={["password"]} rules={[{ required: true, message: 'Vui lòng nhập lại mật khẩu' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) { return Promise.resolve(); } return Promise.reject(new Error('Mật khẩu nhập lại không khớp')); } })]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" className="rounded-lg" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full h-12 rounded-lg text-base font-medium">
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;


