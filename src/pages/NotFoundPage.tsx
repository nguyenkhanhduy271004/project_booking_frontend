import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn tìm kiếm không tồn tại hoặc bạn không có quyền truy cập."
        extra={
          <Button type="primary" onClick={() => navigate('/login')}>
            Quay về trang đăng nhập
          </Button>
        }
      />
    </div>
  );
};
export default NotFoundPage;