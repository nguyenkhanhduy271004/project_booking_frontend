import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Layout,
  Card,
  Result,
  Button,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Tag,
  Spin,
  Alert,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  PhoneOutlined,
  MailOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { paymentService } from '../services/paymentService';
const { Content } = Layout;
const { Title, Text } = Typography;
const PaymentResultPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status'); // 'success' or 'failure' (fallback)
  const resultCode = searchParams.get('resultCode'); // MoMo: '0' success
  const orderId = searchParams.get('orderId') || searchParams.get('orderId');
  const [loading, setLoading] = useState(true);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  useEffect(() => {
    const run = async () => {
      try {
        // If MoMo redirected here with its params, forward them to backend for verification
        if (resultCode !== null) {
          const paramsObj: Record<string, string> = {};
          for (const [k, v] of searchParams.entries()) {
            paramsObj[k] = v;
          }
          const resp = await paymentService.handleMomoReturn(paramsObj);
          setVerifiedSuccess(resp.status === 200 && (resp.data?.success === true || resultCode === '0'));
          setVerifyMessage(resp.data?.message || resp.data?.error || null);
        } else if (status) {
          setVerifiedSuccess(status === 'success');
        }
      } catch (e: any) {
        setVerifiedSuccess(false);
        setVerifyMessage(e?.response?.data?.message || 'Không thể xác minh giao dịch.');
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleGoHome = () => {
    navigate('/');
  };
  const handleViewBookings = () => {
    navigate('/my-bookings');
  };
  const handleRetryPayment = () => {
    navigate('/my-bookings');
  };
  const handleContactSupport = () => {
    window.open('tel:1900000000');
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
  if (verifiedSuccess) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Content className="max-w-4xl mx-auto px-6 py-8">
          <Card className="rounded-xl shadow-lg border-none">
            <Result
              status="success"
              title="Thanh toán thành công!"
              subTitle={`Đơn hàng ${orderId || ''} đã được thanh toán thành công. ${verifyMessage || ''}`}
              icon={<CheckCircleOutlined className="text-green-500" />}
              extra={[
                <Space key="actions" size="large" className="flex justify-center">
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<FileTextOutlined />}
                    onClick={handleViewBookings}
                    className="bg-blue-600 hover:bg-blue-700 px-8"
                  >
                    Xem booking của tôi
                  </Button>
                  <Button 
                    size="large"
                    icon={<HomeOutlined />}
                    onClick={handleGoHome}
                    className="px-8"
                  >
                    Về trang chủ
                  </Button>
                </Space>
              ]}
            />
            <Divider />
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <Row gutter={[24, 16]}>
                <Col span={24}>
                  <Title level={4} className="text-green-800 mb-4">
                    <CheckCircleOutlined className="mr-2" />
                    Thông tin thanh toán
                  </Title>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="space-y-2">
                    <Text strong>Mã đơn hàng:</Text>
                    <br />
                    <Text code className="text-blue-600 text-lg">{orderId}</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="space-y-2">
                    <Text strong>Thời gian thanh toán:</Text>
                    <br />
                    <Text className="text-gray-700">
                      <ClockCircleOutlined className="mr-1" />
                      {dayjs().format('DD/MM/YYYY HH:mm:ss')}
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="space-y-2">
                    <Text strong>Phương thức thanh toán:</Text>
                    <br />
                    <Tag color="blue" className="text-sm px-3 py-1">
                      Chuyển khoản ngân hàng / Ví điện tử
                    </Tag>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="space-y-2">
                    <Text strong>Trạng thái:</Text>
                    <br />
                    <Tag color="green" className="text-sm px-3 py-1">
                      Thanh toán thành công
                    </Tag>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <Title level={4} className="text-blue-800 mb-4">
                Các bước tiếp theo
              </Title>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircleOutlined className="text-green-500 mt-1 mr-3" />
                  <div>
                    <Text strong>Email xác nhận</Text>
                    <br />
                    <Text className="text-gray-600">
                      Chúng tôi đã gửi email xác nhận booking đến địa chỉ email của bạn
                    </Text>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleOutlined className="text-green-500 mt-1 mr-3" />
                  <div>
                    <Text strong>Thông tin check-in</Text>
                    <br />
                    <Text className="text-gray-600">
                      Vui lòng mang theo CMND/CCCD và email xác nhận khi check-in
                    </Text>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleOutlined className="text-green-500 mt-1 mr-3" />
                  <div>
                    <Text strong>Hỗ trợ 24/7</Text>
                    <br />
                    <Text className="text-gray-600">
                      Liên hệ hotline 1900-xxxx nếu cần hỗ trợ hoặc thay đổi booking
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="max-w-4xl mx-auto px-6 py-8">
        <Card className="rounded-xl shadow-lg border-none">
          <Result
            status="error"
            title="Thanh toán thất bại!"
            subTitle={`Đơn hàng ${orderId || ''} chưa được thanh toán thành công. ${verifyMessage || 'Vui lòng thử lại hoặc liên hệ hỗ trợ.'}`}
            icon={<CloseCircleOutlined className="text-red-500" />}
            extra={[
              <Space key="actions" size="large" className="flex justify-center">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={handleRetryPayment}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  Thử lại thanh toán
                </Button>
                <Button 
                  size="large"
                  icon={<HomeOutlined />}
                  onClick={handleGoHome}
                  className="px-8"
                >
                  Về trang chủ
                </Button>
              </Space>
            ]}
          />
          <Divider />
          <Alert
            message="Thanh toán không thành công"
            description="Giao dịch của bạn đã bị hủy hoặc không thể xử lý. Booking của bạn vẫn được giữ và bạn có thể thử thanh toán lại."
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            className="mb-6"
          />
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Title level={4} className="text-red-800 mb-4">
                  <CloseCircleOutlined className="mr-2" />
                  Chi tiết giao dịch
                </Title>
              </Col>
              <Col xs={24} sm={12}>
                <div className="space-y-2">
                  <Text strong>Mã đơn hàng:</Text>
                  <br />
                  <Text code className="text-blue-600 text-lg">{orderId}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="space-y-2">
                  <Text strong>Thời gian thử thanh toán:</Text>
                  <br />
                  <Text className="text-gray-700">
                    {dayjs().format('DD/MM/YYYY HH:mm:ss')}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="space-y-2">
                  <Text strong>Phương thức thanh toán:</Text>
                  <br />
                  <Tag color="blue" className="text-sm px-3 py-1">
                    Chuyển khoản ngân hàng / Ví điện tử
                  </Tag>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="space-y-2">
                  <Text strong>Trạng thái:</Text>
                  <br />
                  <Tag color="red" className="text-sm px-3 py-1">
                    Thanh toán thất bại
                  </Tag>
                </div>
              </Col>
            </Row>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <Title level={4} className="text-yellow-800 mb-4">
              Nguyên nhân có thể và cách khắc phục
            </Title>
            <div className="space-y-4">
              <div>
                <Text strong className="text-yellow-800">• Tài khoản không đủ số dư</Text>
                <br />
                <Text className="text-gray-600 ml-4">
                  Vui lòng kiểm tra số dư trong tài khoản và nạp thêm tiền nếu cần
                </Text>
              </div>
              <div>
                <Text strong className="text-yellow-800">• Kết nối mạng không ổn định</Text>
                <br />
                <Text className="text-gray-600 ml-4">
                  Kiểm tra kết nối internet và thử lại sau vài phút
                </Text>
              </div>
              <div>
                <Text strong className="text-yellow-800">• Phiên giao dịch hết hạn</Text>
                <br />
                <Text className="text-gray-600 ml-4">
                  Thời gian thanh toán đã quá hạn, vui lòng tạo giao dịch mới
                </Text>
              </div>
              <div>
                <Text strong className="text-yellow-800">• Lỗi từ cổng thanh toán</Text>
                <br />
                <Text className="text-gray-600 ml-4">
                  Hệ thống thanh toán tạm thời gián đoạn, vui lòng thử lại sau
                </Text>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <Title level={4} className="text-blue-800 mb-4">
              Cần hỗ trợ?
            </Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div className="flex items-center p-4 bg-white rounded-lg border">
                  <PhoneOutlined className="text-blue-500 text-xl mr-3" />
                  <div>
                    <Text strong>Hotline 24/7</Text>
                    <br />
                    <Text className="text-blue-600">1900-xxxx</Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="flex items-center p-4 bg-white rounded-lg border">
                  <MailOutlined className="text-blue-500 text-xl mr-3" />
                  <div>
                    <Text strong>Email hỗ trợ</Text>
                    <br />
                    <Text className="text-blue-600">support@bookinghotel.com</Text>
                  </div>
                </div>
              </Col>
            </Row>
            <div className="mt-4 text-center">
              <Button 
                type="primary" 
                size="large"
                icon={<PhoneOutlined />}
                onClick={handleContactSupport}
                className="bg-green-600 hover:bg-green-700"
              >
                Gọi ngay hỗ trợ
              </Button>
            </div>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};
export default PaymentResultPage;