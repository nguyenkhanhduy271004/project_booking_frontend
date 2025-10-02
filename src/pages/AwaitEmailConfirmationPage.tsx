import React, { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Button, Space, message } from 'antd';
import { MailOutlined, ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';
import { useLocation, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const AwaitEmailConfirmationPage: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const query = useQuery();
  const username = query.get('username') || '';

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const onRetry = async () => {
    if (!username) {
      message.warning('Thiếu tên đăng nhập');
      return;
    }
    setLoading(true);
    try {
      const resp = await userService.activeAccount(username);
      if (resp.status === 200) {
        message.success(resp.message || 'Kích hoạt tài khoản thành công');
        navigate('/login');
      } else {
        message.error(resp.message || 'Kích hoạt thất bại');
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data && (data.message || data.error)) || (typeof data === 'string' ? data : '') || e?.message || 'Kích hoạt thất bại';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <Card className="w-full max-w-md shadow-2xl rounded-xl text-center">
        <Space direction="vertical" size="large" className="w-full">
          <MailOutlined style={{ fontSize: 48, color: '#1677ff' }} />
          <div>
            <Title level={3} style={{ marginBottom: 8 }}>Vui lòng xác nhận email</Title>
            <Text type="secondary">Chúng tôi đã gửi liên kết kích hoạt đến email tài khoản của bạn.</Text>
          </div>
          <Space>
            <ClockCircleOutlined />
            <Text type="secondary">Thời gian còn lại: {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</Text>
          </Space>
          <Button type="primary" icon={<ReloadOutlined />} loading={loading} onClick={onRetry} disabled={!username || secondsLeft > 0}>
            Thử kích hoạt lại
          </Button>
          <Text type="secondary" className="text-xs">Nếu liên kết đã hết hạn, hãy bấm Thử kích hoạt lại. Bạn cũng có thể kiểm tra thư mục Spam.</Text>
        </Space>
      </Card>
    </div>
  );
};

export default AwaitEmailConfirmationPage;


