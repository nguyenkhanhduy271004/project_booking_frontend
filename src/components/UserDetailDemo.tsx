import React from 'react';
import { Card, Row, Col, Tag, Typography, Descriptions } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Dữ liệu mẫu từ JSON bạn cung cấp
const sampleUser = {
  "id": 1,
  "username": "admin",
  "fullName": "Nguyễn Duy",
  "gender": "MALE",
  "birthday": null,
  "email": "kuy2710@gmail.com",
  "phone": "0903525012",
  "type": "ADMIN",
  "status": "ACTIVE"
};

const UserDetailDemo: React.FC = () => {
  const getRoleColor = (userType: string) => {
    const colorMap: Record<string, string> = {
      SYSTEM_ADMIN: 'red',
      ADMIN: 'orange',
      MANAGER: 'blue',
      STAFF: 'green',
      GUEST: 'default',
    };
    return colorMap[userType] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      NONE: 'default',
      ACTIVE: 'green',
      INACTIVE: 'orange',
    };
    return colorMap[status] || 'default';
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'MALE': return 'Nam';
      case 'FEMALE': return 'Nữ';
      case 'OTHER': return 'Khác';
      default: return gender;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'INACTIVE': return 'Không hoạt động';
      case 'NONE': return 'Chưa xác định';
      default: return status;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Demo Giao diện Chi tiết User</Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Hiển thị dữ liệu JSON mẫu với các enum UserStatus và UserType
      </Text>

      <Card>
        <Row gutter={[24, 24]}>
          {/* Thông tin cơ bản */}
          <Col span={24}>
            <div style={{ marginBottom: '24px' }}>
              <Title level={3} style={{ margin: 0 }}>{sampleUser.fullName}</Title>
              <Text type="secondary">@{sampleUser.username}</Text>
              <div style={{ marginTop: '8px' }}>
                <Tag color={getRoleColor(sampleUser.type)} style={{ marginRight: '8px' }}>
                  {sampleUser.type}
                </Tag>
                <Tag color={getStatusColor(sampleUser.status)}>
                  {getStatusText(sampleUser.status)}
                </Tag>
              </div>
            </div>
          </Col>

          {/* Thông tin chi tiết */}
          <Col span={24}>
            <Descriptions title="Thông tin chi tiết" bordered column={2}>
              <Descriptions.Item label="ID">
                <Text code>{sampleUser.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tên đăng nhập">
                {sampleUser.username}
              </Descriptions.Item>
              <Descriptions.Item label="Họ và tên">
                {sampleUser.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {sampleUser.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {sampleUser.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {getGenderText(sampleUser.gender)}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag color={getRoleColor(sampleUser.type)}>
                  {sampleUser.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(sampleUser.status)}>
                  {getStatusText(sampleUser.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {sampleUser.birthday ? dayjs(sampleUser.birthday).format('DD/MM/YYYY') : 'Chưa cập nhật'}
              </Descriptions.Item>
            </Descriptions>
          </Col>

          {/* Các enum được hỗ trợ */}
          <Col span={24}>
            <Card title="Các enum được hỗ trợ" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text strong>UserType:</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Tag color="red" style={{ margin: '2px' }}>SYSTEM_ADMIN</Tag>
                      <Tag color="orange" style={{ margin: '2px' }}>ADMIN</Tag>
                      <Tag color="blue" style={{ margin: '2px' }}>MANAGER</Tag>
                      <Tag color="green" style={{ margin: '2px' }}>STAFF</Tag>
                      <Tag color="default" style={{ margin: '2px' }}>GUEST</Tag>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text strong>UserStatus:</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Tag color="default" style={{ margin: '2px' }}>NONE</Tag>
                      <Tag color="green" style={{ margin: '2px' }}>ACTIVE</Tag>
                      <Tag color="orange" style={{ margin: '2px' }}>INACTIVE</Tag>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default UserDetailDemo;
