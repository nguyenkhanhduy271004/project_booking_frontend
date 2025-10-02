import React, { useState } from 'react';
import { Card, Typography, Form, Input, Button, message } from 'antd';
import { MailOutlined, UserOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';

const { Title, Text } = Typography;

const VerifyEmailPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const resp = await userService.verifyEmail(values.username);
      if (resp.status === 200) {
        message.success(resp.message || 'Đã gửi email xác thực. Vui lòng kiểm tra hộp thư.');
      } else {
        message.error(resp.message || 'Gửi email xác thực thất bại');
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data && (data.message || data.error)) || (typeof data === 'string' ? data : '') || e?.message || 'Gửi email xác thực thất bại';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <Card className="w-full max-w-md shadow-2xl rounded-xl">
        <div className="text-center mb-8">
          <Title level={3}>Xác thực email</Title>
          <Text type="secondary">Nhập tên đăng nhập để nhận email xác thực</Text>
        </div>
        <Form layout="vertical" size="large" onFinish={onFinish}>
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}>
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" className="rounded-lg" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full h-12 rounded-lg text-base font-medium">
              Gửi email xác thực
            </Button>
          </Form.Item>
        </Form>
        <Text type="secondary" className="text-xs">Sau khi nhận được email, hãy bấm vào liên kết để kích hoạt.</Text>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;


