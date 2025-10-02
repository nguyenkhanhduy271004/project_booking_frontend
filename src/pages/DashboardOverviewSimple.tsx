import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const DashboardOverviewSimple: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <Title level={2}>Dashboard Overview</Title>
        <p>Simple dashboard overview for testing.</p>
      </Card>
    </div>
  );
};

export default DashboardOverviewSimple;
