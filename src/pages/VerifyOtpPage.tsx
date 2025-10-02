import React, { useState } from 'react';
import { Card, Typography, Form, Input, Button, message } from 'antd';
import { NumberOutlined, MailOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';

const { Title, Text } = Typography;

const VerifyOtpPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = { otp: Number(values.otp), username: values.username };
      const resp = await userService.verifyOtp(payload);
      if (resp.status === 200) {
        message.success(resp.message || 'Xác thực OTP thành công');
      } else {
        message.error(resp.message || 'Xác thực OTP thất bại');
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data && (data.message || data.error)) || (typeof data === 'string' ? data : '') || e?.message || 'Xác thực OTP thất bại';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <Card className="w-full max-w-md shadow-2xl rounded-xl">
        <div className="text-center mb-8">
          <Title level={3}>Xác thực OTP</Title>
          <Text type="secondary">Nhập OTP đã gửi đến email và tên đăng nhập</Text>
        </div>
        <Form layout="vertical" size="large" onFinish={onFinish}>
          <Form.Item name="username" label="Tên đăng nhập (email)" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập (email)' }]}> 
            <Input prefix={<MailOutlined />} placeholder="Email" className="rounded-lg" />
          </Form.Item>
          <Form.Item name="otp" label="Mã OTP" rules={[{ required: true, message: 'Vui lòng nhập OTP' }]}> 
            <Input prefix={<NumberOutlined />} placeholder="Mã OTP" className="rounded-lg" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full h-12 rounded-lg text-base font-medium">
              Xác thực
            </Button>
          </Form.Item>
        </Form>
        <Text type="secondary" className="text-xs">OTP có thể hết hạn theo thời gian cấu hình.</Text>
      </Card>
    </div>
  );
};

export default VerifyOtpPage;


