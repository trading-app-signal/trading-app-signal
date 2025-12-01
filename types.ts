
export type SignalType = 'LONG' | 'SHORT';

export interface Signal {
  id: string;
  asset: string;
  type: SignalType;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3?: number;
  timestamp: number;
  status: 'ACTIVE' | 'HIT_TP' | 'HIT_SL' | 'CLOSED' | 'BREAK_EVEN';
  notes?: string;
  author: string;
  imageUrl?: string; // For the initial trade setup screenshot
  resultImage?: string; // For the trade result/outcome screenshot
}

export interface TradeIdea {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  author: string;
  timestamp: number;
  likes: number;
}

export interface User {
  id: string;
  role: 'STUDENT' | 'TEACHER';
  name: string;
}

export interface MarketData {
  time: string;
  value: number;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  isMe: boolean;
  avatarColor: string;
  image?: string; // New field for chat images
}

export interface PerformanceMetric {
  period: 'WEEK' | 'MONTH';
  label: string;
  winRate: number;
  totalPips: number;
  trades: number;
}

export interface PrivateConversation {
  id: string;
  studentId: string;
  studentName: string;
  lastMessage: string;
  lastTimestamp: number;
  unreadCount: number;
  messages: ChatMessage[];
}
