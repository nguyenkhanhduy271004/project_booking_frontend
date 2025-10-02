import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Select, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import type { RegisterRequest, Gender } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const payload: RegisterRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      username: values.username,
      email: values.email,
      phoneNumber: values.phoneNumber,
      gender: values.gender as Gender,
      password: values.password,
      rePassword: values.rePassword,
    };
    setLoading(true);
    try {
      const resp = await authService.register(payload);
      // Debug: inspect response shape
      // eslint-disable-next-line no-console
      console.log('Register response:', resp);
      if (resp && resp.status === 200) {
        message.success('Đăng ký thành công! Vui lòng xác nhận email để kích hoạt.');
        navigate(`/await-email?username=${encodeURIComponent(values.username)}`);
      } else {
        const fallback = 'Đăng ký thất bại';
        const apiMsg = (resp && (resp.message || (resp as any).error || (typeof (resp as any) === 'string' ? (resp as any) : ''))) || fallback;
        message.error(apiMsg);
      }
    } catch (e: any) {
      // Debug: inspect error shape
      // eslint-disable-next-line no-console
      console.error('Register error:', e?.response?.status, e?.response?.data || e);
      const data = e?.response?.data;
      const errorMessage =
        (data && (data.message || data.error || data.error_description)) ||
        (typeof data === 'string' ? data : '') ||
        e?.message ||
        'Đăng ký thất bại';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <Card className="w-full max-w-2xl shadow-2xl rounded-xl">
        <div className="text-center mb-8">
          <Title level={2} className="text-primary-500 mb-2">
            Tạo tài khoản mới
          </Title>
          <Text type="secondary">Điền thông tin bên dưới để đăng ký</Text>
        </div>
        <Form layout="vertical" size="large" onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="firstName"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }, { min: 2, message: 'Tối thiểu 2 ký tự' }, { max: 50, message: 'Tối đa 50 ký tự' }]}
              >
                <Input prefix={<IdcardOutlined />} placeholder="Tên" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="lastName"
                label="Họ"
                rules={[{ required: true, message: 'Vui lòng nhập họ' }, { min: 2, message: 'Tối thiểu 2 ký tự' }, { max: 50, message: 'Tối đa 50 ký tự' }]}
              >
                <Input prefix={<IdcardOutlined />} placeholder="Họ" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                  { min: 4, max: 20, message: '4-20 ký tự' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: 'Chỉ gồm chữ, số, gạch dưới' },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Select placeholder="Chọn giới tính" size="large" className="rounded-lg">
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[{ pattern: /^\d{10,15}$/, message: 'Chỉ gồm 10–15 chữ số' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  { min: 8, max: 20, message: '8-20 ký tự' },
                  { pattern: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?!.*\s).{8,20}$/, message: 'Gồm in hoa, thường, số, ký tự đặc biệt' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="rePassword"
                label="Nhập lại mật khẩu"
                dependencies={["password"]}
                rules={[
                  { required: true, message: 'Vui lòng nhập lại mật khẩu' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu nhập lại không khớp'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full h-12 rounded-lg text-base font-medium">
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </Form.Item>
          <div className="text-center">
            <Text type="secondary">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;


