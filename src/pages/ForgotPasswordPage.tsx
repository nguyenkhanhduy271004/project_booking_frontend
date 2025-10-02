import React, { useEffect, useState } from 'react';
import { Card, Typography, Steps, Form, Input, Button, message, Space, Tooltip } from 'antd';
import { MailOutlined, NumberOutlined, LockOutlined, UserOutlined, ReloadOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);

  useEffect(() => {
    if (otpSecondsLeft <= 0) return;
    const timer = setInterval(() => setOtpSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [otpSecondsLeft]);

  const onVerifyMail = async (values: any) => {
    setLoading(true);
    try {
      setUsername(values.username);
      const resp = await userService.verifyEmail(values.username);
      if (resp.status === 200) {
        message.success(resp.message || 'Đã gửi email chứa OTP. Vui lòng kiểm tra email.');
        setCurrent(1);
        setOtpSecondsLeft(300);
      } else {
        message.error(resp.message || 'Gửi email thất bại');
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data && (data.message || data.error)) || (typeof data === 'string' ? data : '') || e?.message || 'Gửi email thất bại';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (values: any) => {
    setLoading(true);
    try {
      const resp = await userService.verifyOtp({ otp: Number(values.otp), username: username || values.username });
      if (resp.status === 200) {
        message.success(resp.message || 'Xác thực OTP thành công');
        setCurrent(2);
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

  const onResetPassword = async (values: any) => {
    setLoading(true);
    try {
      const targetUsername = username || values.username;
      const resp = await userService.resetPassword(targetUsername, { password: values.password, repeatPassword: values.repeatPassword });
      if (resp.status === 200) {
        message.success(resp.message || 'Đặt lại mật khẩu thành công');
        setTimeout(() => navigate('/login'), 800);
      } else {
        message.error(resp.message || 'Đặt lại mật khẩu thất bại');
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data && (data.message || data.error)) || (typeof data === 'string' ? data : '') || e?.message || 'Đặt lại mật khẩu thất bại';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <Card className="w-full max-w-xl shadow-2xl rounded-xl">
        <div className="text-center mb-8">
          <Title level={3}>Quên mật khẩu</Title>
          <Text type="secondary">Làm theo các bước để đặt lại mật khẩu</Text>
        </div>
        <Steps current={current} items={[{ title: 'Xác thực email' }, { title: 'Nhập OTP' }, { title: 'Mật khẩu mới' }]} className="mb-8" />
        {current === 0 && (
          <Form layout="vertical" size="large" onFinish={onVerifyMail} initialValues={{ username }}>
            <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}>
              <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" className="rounded-lg" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="w-full h-12 rounded-lg text-base font-medium">
                Gửi email xác thực
              </Button>
            </Form.Item>
          </Form>
        )}
        {current === 1 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <Space size="small">
                <ClockCircleOutlined />
                <Text type="secondary">Thời gian còn lại: {Math.floor(otpSecondsLeft / 60)}:{String(otpSecondsLeft % 60).padStart(2, '0')}</Text>
              </Space>
              <Tooltip title={otpSecondsLeft > 0 ? 'Hết thời gian mới có thể gửi lại' : 'Gửi lại OTP'}>
                <Button
                  type="link"
                  icon={<ReloadOutlined />}
                  disabled={otpSecondsLeft > 0}
                  onClick={async () => {
                    if (!username) {
                      message.warning('Vui lòng nhập tên đăng nhập ở bước trước');
                      return;
                    }
                    try {
                      setLoading(true);
                      const resp = await userService.verifyEmail(username);
                      if (resp.status === 200) {
                        message.success(resp.message || 'Đã gửi lại OTP');
                        setOtpSecondsLeft(300);
                      } else {
                        message.error(resp.message || 'Gửi lại OTP thất bại');
                      }
                    } catch (e: any) {
                      const data = e?.response?.data;
                      const msg = (data && (data.message || data.error)) || (typeof data === 'string' ? data : '') || e?.message || 'Gửi lại OTP thất bại';
                      message.error(msg);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >Gửi lại</Button>
              </Tooltip>
            </div>
            <Form layout="vertical" size="large" onFinish={onVerifyOtp} initialValues={{ username }}>
              <Form.Item name="username" label="Tên đăng nhập (email)" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập (email)' }]}> 
                <Input prefix={<MailOutlined />} placeholder="Email" className="rounded-lg" />
              </Form.Item>
              <Form.Item name="otp" label="Mã OTP" rules={[{ required: true, message: 'Vui lòng nhập OTP' }]}> 
                <Input prefix={<NumberOutlined />} placeholder="Mã OTP" className="rounded-lg" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} className="w-full h-12 rounded-lg text-base font-medium" disabled={otpSecondsLeft === 0}>
                  Xác thực OTP
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
        {current === 2 && (
          <Form layout="vertical" size="large" onFinish={onResetPassword} initialValues={{ username }}>
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
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;


