import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Avatar,
  Spin,
  message,
  Tooltip,
  FloatButton,
  Drawer,
  List,
  Tag,
  Divider,
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  MessageOutlined,
  CloseOutlined,
  LinkOutlined,
  HomeOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { chatService } from '../services/chatService';
import dayjs from 'dayjs';
const { Text, Link } = Typography;
const { TextArea } = Input;
interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  processingTime?: string;
  hotelRecommendations?: HotelRecommendation[];
}
interface HotelRecommendation {
  id: number;
  name: string;
  district: string;
  province: string;
  minPrice: number;
  star: number;
  url: string;
}
interface ChatResponse {
  question: string;
  results: HotelRecommendation[];
  total: number;
  timestamp: string;
  processingTime: string;
}
const ChatBot: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Xin chào! Tôi là trợ lý AI của hệ thống đặt phòng. Tôi có thể giúp bạn tìm kiếm khách sạn, tư vấn giá cả, và trả lời các câu hỏi về dịch vụ. Bạn cần hỗ trợ gì?',
      timestamp: dayjs().format('HH:mm'),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: dayjs().format('HH:mm'),
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue('');
    setLoading(true);
    
    try {
      console.log('Sending message to chat service:', currentInput);
      const response: ChatResponse = await chatService.askQuestion(currentInput);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.total > 0 ? `Tôi tìm thấy ${response.total} khách sạn phù hợp với yêu cầu của bạn:` : 'Xin lỗi, tôi không tìm thấy khách sạn nào phù hợp với yêu cầu của bạn.',
        timestamp: dayjs().format('HH:mm'),
        processingTime: response.processingTime,
        hotelRecommendations: response.results,
      };
      setMessages(prev => [...prev, botMessage]);
      console.log('Chat response processed successfully');
      
    } catch (error: any) {
      console.error('Error in handleSendMessage:', error);
      
      // Don't show error message for canceled requests
      if (error.code === 'ERR_CANCELED' || error.message === 'canceled') {
        console.log('Request was canceled, not showing error message');
        return;
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
        timestamp: dayjs().format('HH:mm'),
      };
      setMessages(prev => [...prev, errorMessage]);
      message.error('Không thể kết nối với chatbot');
    } finally {
      setLoading(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const handleHotelClick = (hotel: HotelRecommendation) => {
    const hotelUrl = hotel.url || `http://localhost:5173/hotel/${hotel.id}`;
    window.open(hotelUrl, '_blank');
    console.log(`Opening hotel: ${hotel.name} - ${hotelUrl}`);
  };
  const renderMessage = (msg: ChatMessage) => (
    <div
      key={msg.id}
      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
        <Avatar
          size="small"
          icon={msg.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
          className={`${msg.type === 'user' ? 'ml-2' : 'mr-2'} flex-shrink-0`}
          style={{
            backgroundColor: msg.type === 'user' ? '#1890ff' : '#52c41a',
          }}
        />
        <div>
          <div
            className={`px-3 py-2 rounded-lg ${
              msg.type === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <Text
              className={msg.type === 'user' ? 'text-white' : 'text-gray-800'}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {msg.content}
            </Text>
          </div>
          {msg.hotelRecommendations && msg.hotelRecommendations.length > 0 && (
            <div className="mt-2 space-y-2">
              <Text strong className="text-blue-600">
                <HomeOutlined className="mr-1" />
                Khách sạn gợi ý (click để xem chi tiết):
              </Text>
              {msg.hotelRecommendations.map((hotel) => (
                <Card
                  key={hotel.id}
                  size="small"
                  hoverable
                  onClick={() => handleHotelClick(hotel)}
                  className="cursor-pointer mb-2"
                  bodyStyle={{ 
                    padding: '12px',
                    overflow: 'hidden',
                    wordWrap: 'break-word'
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <HomeOutlined className="text-blue-500 text-xl" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="mb-2">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1 min-w-0 pr-2">
                            <Text 
                              strong 
                              className="text-blue-600 block"
                              style={{ 
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                lineHeight: '1.4'
                              }}
                            >
                              {hotel.name}
                            </Text>
                          </div>
                          <div className="flex items-center flex-shrink-0">
                            <LinkOutlined className="text-blue-500 text-xs" />
                            <Text className="text-xs text-gray-500 ml-1">
                              /hotel/{hotel.id}
                            </Text>
                          </div>
                        </div>
                        <Text 
                          type="secondary" 
                          className="text-xs block"
                          style={{ 
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                          }}
                        >
                          📍 {hotel.district}, {hotel.province}
                        </Text>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          {hotel.star > 0 && (
                            <div className="flex items-center">
                              <StarOutlined className="text-yellow-400 text-sm" />
                              <Text className="text-sm ml-1">{hotel.star} sao</Text>
                            </div>
                          )}
                        </div>
                        {hotel.minPrice > 0 && (
                          <Tag color="green" className="text-xs flex-shrink-0">
                            {hotel.minPrice.toLocaleString()} VNĐ/đêm
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-1 flex-wrap gap-1">
            <Text type="secondary" className="text-xs flex-shrink-0">
              {msg.timestamp}
            </Text>
            {msg.processingTime && (
              <Text 
                type="secondary" 
                className={`text-xs flex-shrink-0 ${getProcessingTimeColor(msg.processingTime)}`}
                style={{ 
                  wordBreak: 'keep-all',
                  whiteSpace: 'nowrap'
                }}
              >
                ⚡ {msg.processingTime}
              </Text>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  const quickQuestions = [
    "Khách sạn 5 sao ở Hà Nội",
    "Resort gần biển Đà Nẵng", 
    "Khách sạn giá rẻ TP.HCM",
    "Homestay Đà Lạt",
    "Khách sạn có hồ bơi",
  ];
  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };
  const getProcessingTimeColor = (processingTime: string) => {
    const timeMs = parseFloat(processingTime.replace(/[^\d.]/g, ''));
    if (processingTime.includes('<') || timeMs < 1000) {
      return 'text-green-500'; // Very fast
    } else if (timeMs < 5000) {
      return 'text-blue-500'; // Fast
    } else if (timeMs < 15000) {
      return 'text-yellow-500'; // Acceptable
    } else {
      return 'text-red-500'; // Too slow
    }
  };
  return (
    <>
      <FloatButton
        icon={<MessageOutlined />}
        type="primary"
        style={{
          right: 24,
          bottom: 24,
          width: 60,
          height: 60,
        }}
        onClick={() => setVisible(true)}
        tooltip="Chat với AI"
      />
      <Drawer
        title={
          <div className="flex items-center">
            <Avatar
              icon={<RobotOutlined />}
              className="mr-2"
              style={{ backgroundColor: '#52c41a' }}
            />
            <span>Trợ lý AI</span>
            <Tag color="green" className="ml-2">
              Online
            </Tag>
          </div>
        }
        placement="right"
        onClose={() => setVisible(false)}
        open={visible}
        width={400}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setVisible(false)}
          />
        }
      >
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <Text strong className="text-sm">Câu hỏi gợi ý:</Text>
            <div className="flex flex-wrap gap-1 mt-2">
              {quickQuestions.map((question, index) => (
                <Tag
                  key={index}
                  className="cursor-pointer text-xs"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </Tag>
              ))}
            </div>
          </div>
          <Divider className="my-3" />
          <div className="flex-1 overflow-y-auto mb-4 pr-2">
            {messages.map(renderMessage)}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="flex flex-row max-w-[80%]">
                  <Avatar
                    size="small"
                    icon={<RobotOutlined />}
                    className="mr-2"
                    style={{ backgroundColor: '#52c41a' }}
                  />
                  <div className="px-3 py-2 rounded-lg bg-gray-100">
                    <Spin size="small" />
                    <Text className="ml-2 text-gray-600">Đang suy nghĩ...</Text>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t pt-3">
            <Space.Compact style={{ width: '100%' }}>
              <TextArea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                disabled={loading}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={loading}
                disabled={!inputValue.trim()}
              />
            </Space.Compact>
            <Text type="secondary" className="text-xs mt-1 block">
              Nhấn Enter để gửi, Shift+Enter để xuống dòng
            </Text>
          </div>
        </div>
      </Drawer>
    </>
  );
};
export default ChatBot;