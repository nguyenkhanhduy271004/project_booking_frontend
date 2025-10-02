import { apiClient } from './api';
export interface ChatRequest {
  question: string;
}
export interface HotelRecommendation {
  id: number;
  name: string;
  district: string;
  province: string;
  minPrice: number;
  star: number;
  url: string;
}
export interface ChatResponse {
  question: string;
  results: HotelRecommendation[];
  total: number;
  timestamp: string;
  processingTime: string;
}
export const chatService = {
  askQuestion: async (question: string): Promise<ChatResponse> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('Chat request timeout after 10 seconds');
      controller.abort();
    }, 10000); // 10 second timeout
    
    try {
      console.log('Sending chat request:', question);
      const response = await apiClient.post('/api/ai-chat/ask', 
        { question }, 
        { 
          signal: controller.signal,
          timeout: 10000 
        }
      );
      clearTimeout(timeoutId);
      console.log('Chat response received:', response.data);
      
      // API trả về đúng format mới
      if (response.data && response.data.results) {
        return {
          question: response.data.question || question,
          results: response.data.results || [],
          total: response.data.total || 0,
          timestamp: response.data.timestamp || new Date().toISOString(),
          processingTime: response.data.processingTime || '0ms'
        };
      } else {
        return generateQuickFallbackResponse(question);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Chat service error:', error);
      
      // Handle different types of cancellation errors
      if (error.name === 'AbortError' || 
          error.code === 'ECONNABORTED' || 
          error.code === 'ERR_CANCELED' ||
          error.message === 'canceled') {
        console.log('Request was canceled, returning fallback response');
        return generateQuickFallbackResponse(question);
      }
      
      // Handle network errors
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        console.log('Network error, returning fallback response');
        return generateQuickFallbackResponse(question);
      }
      
      // Handle server errors
      if (error.response?.status >= 500) {
        console.log('Server error, returning fallback response');
        return generateQuickFallbackResponse(question);
      }
      
      throw error;
    }
  },
};
function generateQuickFallbackResponse(question: string): ChatResponse {
  const isHotelQuery = /khách sạn|hotel|resort|phòng|đặt/i.test(question);
  const location = extractLocationFromQuestion(question);
  let results: HotelRecommendation[] = [];
  
  if (isHotelQuery && location) {
    results = generateMockHotels(location);
  } else if (isHotelQuery) {
    results = [
      {
        id: 1,
        name: "Khách sạn gợi ý",
        district: "Trung tâm",
        province: "Việt Nam",
        minPrice: 500000,
        star: 4,
        url: "http://localhost:5173/hotel/1"
      }
    ];
  }
  
  return {
    question,
    results,
    total: results.length,
    timestamp: new Date().toISOString(),
    processingTime: '<500ms'
  };
}
function extractLocationFromQuestion(question: string): string | null {
  const lowerQuestion = question.toLowerCase();
  if (lowerQuestion.includes('quảng trị')) return 'Quảng Trị';
  if (lowerQuestion.includes('hà nội')) return 'Hà Nội';
  if (lowerQuestion.includes('đà nẵng')) return 'Đà Nẵng';
  if (lowerQuestion.includes('nha trang')) return 'Nha Trang';
  if (lowerQuestion.includes('hcm') || lowerQuestion.includes('hồ chí minh')) return 'TP.HCM';
  if (lowerQuestion.includes('đà lạt')) return 'Đà Lạt';
  return null;
}
function generateMockHotels(location: string): HotelRecommendation[] {
  const hotelTemplates = [
    { name: 'Mường Thanh Hotel', star: 4, id: 4, price: 800000 },
    { name: 'Khách sạn Ngọc Phúc', star: 3, id: 5, price: 600000 },
    { name: 'Green Hotel', star: 4, id: 6, price: 900000 },
  ];
  return hotelTemplates.map((template) => ({
    id: template.id,
    name: `${template.name} ${location}`,
    district: location,
    province: getProvinceFromLocation(location),
    minPrice: template.price,
    star: template.star,
    url: `http://localhost:5173/hotel/${template.id}`
  }));
}

function getProvinceFromLocation(location: string): string {
  const locationMap: { [key: string]: string } = {
    'Quảng Trị': 'Quảng Trị',
    'Hà Nội': 'Hà Nội', 
    'Đà Nẵng': 'Đà Nẵng',
    'Nha Trang': 'Khánh Hòa',
    'TP.HCM': 'Thành Phố Hồ Chí Minh',
    'Đà Lạt': 'Lâm Đồng'
  };
  return locationMap[location] || location;
}