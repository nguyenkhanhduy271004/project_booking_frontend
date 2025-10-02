import React from 'react';
import { Card, Typography } from 'antd';
import {
  CreditCardOutlined,
  WalletOutlined,
  BankOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import type { PaymentType } from '../types';
const { Text } = Typography;
interface PaymentMethodCardProps {
  type: PaymentType;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}
const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  type,
  selected,
  onClick,
  disabled = false,
}) => {
  const getPaymentInfo = (paymentType: PaymentType) => {
    switch (paymentType) {
      case 'CARD':
        return {
          icon: <CreditCardOutlined className="text-3xl" />,
          title: 'Thẻ tín dụng/ghi nợ',
          description: 'Visa, Mastercard, JCB',
          color: '#1890ff',
          gradient: 'from-blue-500 to-blue-600',
        };
      case 'WALLET':
        return {
          icon: <WalletOutlined className="text-3xl" />,
          title: 'Ví điện tử MoMo',
          description: 'Thanh toán qua QR Code',
          color: '#d946ef',
          gradient: 'from-pink-500 to-purple-600',
        };
      case 'BANK_TRANSFER':
        return {
          icon: <BankOutlined className="text-3xl" />,
          title: 'Chuyển khoản ngân hàng',
          description: 'VNPay, Internet Banking',
          color: '#059669',
          gradient: 'from-green-500 to-green-600',
        };
      default:
        return {
          icon: <CreditCardOutlined className="text-3xl" />,
          title: 'Không xác định',
          description: '',
          color: '#6b7280',
          gradient: 'from-gray-500 to-gray-600',
        };
    }
  };
  const paymentInfo = getPaymentInfo(type);
  return (
    <Card
      hoverable={!disabled}
      className={`
        cursor-pointer transition-all duration-300 transform hover:scale-105
        ${selected 
          ? `ring-2 ring-offset-2 shadow-lg bg-gradient-to-br ${paymentInfo.gradient} text-white` 
          : 'hover:shadow-md bg-white'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={disabled ? undefined : onClick}
      bodyStyle={{ 
        padding: '24px', 
        textAlign: 'center',
        background: selected ? 'transparent' : 'white',
      }}
    >
      <div className="space-y-3">
        <div 
          className={`
            inline-flex items-center justify-center w-16 h-16 rounded-full mb-3
            ${selected 
              ? 'bg-white/20 text-white' 
              : `bg-${paymentInfo.color}/10`
            }
          `}
          style={{ 
            color: selected ? 'white' : paymentInfo.color,
            backgroundColor: selected ? 'rgba(255,255,255,0.2)' : `${paymentInfo.color}15`,
          }}
        >
          {paymentInfo.icon}
        </div>
        <div>
          <Text 
            strong 
            className={`block text-base mb-1 ${selected ? 'text-white' : 'text-gray-800'}`}
          >
            {paymentInfo.title}
          </Text>
          <Text 
            className={`text-sm ${selected ? 'text-white/80' : 'text-gray-500'}`}
          >
            {paymentInfo.description}
          </Text>
        </div>
        {}
        {type === 'WALLET' && (
          <div className="flex justify-center mt-2">
            <QrcodeOutlined className={`text-lg ${selected ? 'text-white' : 'text-pink-500'}`} />
          </div>
        )}
        {type === 'CARD' && (
          <div className="flex justify-center space-x-2 mt-2">
            <div className={`w-8 h-5 rounded text-xs flex items-center justify-center font-bold ${
              selected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
            }`}>
              VISA
            </div>
            <div className={`w-8 h-5 rounded text-xs flex items-center justify-center font-bold ${
              selected ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
            }`}>
              MC
            </div>
          </div>
        )}
        {selected && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
export default PaymentMethodCard;