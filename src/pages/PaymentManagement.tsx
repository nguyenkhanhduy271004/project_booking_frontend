import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Typography,
  Row,
  Col,
} from 'antd';
import type { Payment } from '../types';
const { Title, Text } = Typography;
const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchPayments();
  }, []);
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const mockPayments: Payment[] = [
        {
          id: 1,
          bookingId: 1,
          amount: 1500000,
          paymentType: 'MOMO',
          status: 'SUCCESS',
          transactionId: 'MOMO_123456789',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
      ];
      setPayments(mockPayments);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Mã đặt phòng',
      dataIndex: 'bookingId',
      key: 'bookingId',
      render: (id: number) => <Text code>#{id}</Text>,
    },
  ];
  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý thanh toán
            </Title>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
};
export default PaymentManagement;