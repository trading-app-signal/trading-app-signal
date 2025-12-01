
import React, { useState, useMemo } from 'react';
import { User, Signal, PrivateConversation, ChatMessage, TradeIdea } from './types';
import SignalCard from './components/SignalCard';
import AddSignalModal from './components/AddSignalModal';
import DailySummary from './components/DailySummary';
import CommunityView from './components/CommunityView';
import ResultsView from './components/ResultsView';
import PrivateChatView from './components/PrivateChatView';
import TradeIdeasView from './components/TradeIdeasView';
import { Bell, Plus, UserCircle, Settings, Wallet, Zap, Clock, MessageCircle, BarChart2, Mail, Lightbulb, X } from 'lucide-react';

// Combined mock data for a single source of truth
const INITIAL_SIGNALS: Signal[] = [
  {
    id: 'sig_001',
    asset: 'XAUUSD',
    type: 'SHORT',
    entryPrice: 2360.50,
    stopLoss: 2375.00,
    takeProfit1: 2345.00,
    takeProfit2: 2330.00,
    timestamp: Date.now() - 3600000,
    status: 'ACTIVE',
    notes: 'Resistance rejection at daily high. Gold showing weakness.',
    author: 'Alex (Mentor)'
  },
  {
    id: 'sig_002',
    asset: 'XAUUSD',
    type: 'LONG',
    entryPrice: 2310.00,
    stopLoss: 2295.00,
    takeProfit1: 2330.00,
    takeProfit2: 2350.00,
    timestamp: Date.now() - 7200000,
    status: 'HIT_TP',
    notes: 'Breakout from bullish flag pattern on 4H.',
    author: 'Alex (Mentor)',
    resultImage: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800&h=500'
  },
  {
    id: 'sig_hist_01',
    asset: 'XAUUSD',
    type: 'LONG',
    entryPrice: 2250.00,
    stopLoss: 2240.00,
    takeProfit1: 2270.00,
    takeProfit2: 2290.00,
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
    status: 'CLOSED',
    notes: 'Classic retest of the weekly support zone.',
    author: 'Alex (Mentor)',
    imageUrl: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800&h=500' 
  },
  {
    id: 'sig_hist_02',
    asset: 'XAUUSD',
    type: 'SHORT',
    entryPrice: 2300.50,
    stopLoss: 2315.00,
    takeProfit1: 2280.00,
    takeProfit2: 2260.00,
    timestamp: Date.now() - 86400000 * 2 - 3600000, // 2 days ago, slightly earlier
    status: 'HIT_SL',
    notes: 'News event caused a spike invalidating the setup.',
    author: 'Sarah (Analyst)',
    resultImage: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&q=80&w=800&h=500'
  },
  {
    id: 'sig_hist_03',
    asset: 'XAUUSD',
    type: 'LONG',
    entryPrice: 2280.00,
    stopLoss: 2270.00,
    takeProfit1: 2300.00,
    takeProfit2: 2310.00,
    timestamp: Date.now() - 86400000 * 3, // 3 days ago
    status: 'HIT_TP',
    notes: 'Quick scalp on the M15 timeframe.',
    author: 'Alex (Mentor)'
  }
];

const INITIAL_CONVERSATIONS: PrivateConversation[] = [
  {
    id: 'conv_1',
    studentId: 'u2',
    studentName: 'Jason (Student)',
    lastMessage: 'Can you explain the SL placement?',
    lastTimestamp: Date.now() - 3600000,
    unreadCount: 1,
    messages: [
       { id: 'm1', user: 'Jason (Student)', text: 'Hi Alex, regarding the XAUUSD short...', timestamp: Date.now() - 3605000, isMe: false, avatarColor: 'bg-blue-500' },
       { id: 'm2', user: 'Jason (Student)', text: 'Can you explain the SL placement?', timestamp: Date.now() - 3600000, isMe: false, avatarColor: 'bg-blue-500' }
    ]
  },
  {
    id: 'conv_2',
    studentId: 'u1', // The current mock user ID
    studentName: 'Me',
    lastMessage: 'Thanks for the update!',
    lastTimestamp: Date.now() - 86400000,
    unreadCount: 0,
    messages: [
      { id: 'm1', user: 'Alex (Mentor)', text: 'Welcome to the inner circle.', timestamp: Date.now() - 90000000, isMe: false, avatarColor: 'bg-brand-accent' },
      { id: 'm2', user: 'Me', text: 'Thanks for the update!', timestamp: Date.now() - 86400000, isMe: true, avatarColor: 'bg-gray-500' }
    ]
  }
];

const INITIAL_IDEAS: TradeIdea[] = [
  {
    id: 'idea_1',
    title: 'XAUUSD Weekly Outlook',
    description: 'Gold is currently sitting at a major support level on the weekly timeframe. We are looking for a rejection here to push price back towards 2400. \n\nKey levels to watch: 2300, 2280.',
    imageUrl: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800&h=500',
    author: 'Alex (Mentor)',
    timestamp: Date.now() - 86400000,
    likes: 42
  },
  {
    id: 'idea_2',
    title: 'DXY Correlation Alert',
    description: 'The US Dollar Index is showing weakness, which usually correlates with strength in Gold. Keep an eye on the DXY open tomorrow.',
    author: 'Alex (Mentor)',
    timestamp: Date.now() - 172800000,
    likes: 28
  }
];

type ViewState = 'HOME' | 'HISTORY' | 'COMMUNITY' | 'RESULTS' | 'INBOX' | 'TRADE_IDEAS';

const App: React.FC = () => {
  const [user, setUser] = useState<User>({ id: 'u1', name: 'Student', role: 'STUDENT' });
  const [signals, setSignals] = useState<Signal[]>(INITIAL_SIGNALS);
  const [conversations, setConversations] = useState<PrivateConversation[]>(INITIAL_CONVERSATIONS);
  const [tradeIdeas, setTradeIdeas] = useState<TradeIdea[]>(INITIAL_IDEAS);
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<{message: string, visible: boolean}>({ message: '', visible: false });
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Filtered lists
  const activeSignals = signals.filter(s => s.status === 'ACTIVE');
  const pastSignals = signals.filter(s => s.status !== 'ACTIVE');

  // Group history by date
  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: Signal[] } = {};
    
    // Sort all past signals by timestamp desc first
    const sortedHistory = [...pastSignals].sort((a, b) => b.timestamp - a.timestamp);

    sortedHistory.forEach(signal => {
      const dateKey = new Date(signal.timestamp).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }); // e.g., 01/02/2025
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(signal);
    });
    
    // Return array of groups sorted by the timestamp of the first item (newest date first)
    return Object.entries(groups).map(([date, groupSignals]) => ({
      date,
      signals: groupSignals,
      timestamp: groupSignals[0].timestamp
    })).sort((a, b) => b.timestamp - a.timestamp);
    
  }, [pastSignals]);

  // Calculate today's signals count
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todaysSignalCount = signals.filter(s => s.timestamp >= startOfToday.getTime()).length;

  // Logic for notification badges
  const totalUnread = conversations.reduce((acc, curr) => acc + curr.unreadCount, 0);

  // Simulate pushing a notification
  const showNotification = (msg: string) => {
    setNotification({ message: msg, visible: true });
    
    // Play sound effect (optional/browser policy dependent, simplified here)
    // const audio = new Audio('/notification.mp3'); audio.play().catch(e => {});

    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 4000);
  };

  const handleAddSignal = (newSignalData: Omit<Signal, 'id' | 'timestamp' | 'status' | 'author'>) => {
    const newSignal: Signal = {
      ...newSignalData,
      id: `sig_${Date.now()}`,
      timestamp: Date.now(),
      status: 'ACTIVE',
      author: user.name
    };
    setSignals([newSignal, ...signals]);
    showNotification(`🔔 New Signal Alert: ${newSignal.asset} ${newSignal.type}`);
  };

  const handleSignalStatusChange = (id: string, newStatus: Signal['status'], resultImage?: string) => {
    setSignals(prevSignals => 
      prevSignals.map(sig => sig.id === id ? { 
        ...sig, 
        status: newStatus,
        resultImage: resultImage || sig.resultImage 
      } : sig)
    );
    showNotification(`Trade Update: ${newStatus.replace('_', ' ')}`);
  };

  const handlePostIdea = (newIdeaData: Omit<TradeIdea, 'id' | 'timestamp' | 'likes' | 'author'>) => {
    const newIdea: TradeIdea = {
      ...newIdeaData,
      id: `idea_${Date.now()}`,
      timestamp: Date.now(),
      likes: 0,
      author: user.name
    };
    setTradeIdeas([newIdea, ...tradeIdeas]);
    showNotification(`💡 New Market Idea: ${newIdeaData.title}`);
  };

  const handleSendPrivateMessage = (conversationId: string, text: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: text,
          lastTimestamp: Date.now(),
          messages: [
            ...conv.messages,
            {
              id: Date.now().toString(),
              user: user.name,
              text,
              timestamp: Date.now(),
              isMe: true,
              avatarColor: 'bg-brand-accent'
            }
          ]
        };
      }
      return conv;
    }));
  };

  const handleMarkRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv));
  };

  const handleViewImage = (url: string) => {
    setLightboxImage(url);
  };

  const toggleRole = () => {
    const newRole = user.role === 'STUDENT' ? 'TEACHER' : 'STUDENT';
    setUser({ ...user, role: newRole, name: newRole === 'TEACHER' ? 'Alex (Mentor)' : 'New Student' });
    showNotification(`Switched to ${newRole === 'TEACHER' ? 'Teacher' : 'Student'} View`);
    setCurrentView('HOME');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'HOME':
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
             <DailySummary count={todaysSignalCount} />
             <div className="flex justify-between items-center mb-2">
               <h3 className="text-lg font-bold text-white">Live Signals</h3>
               <span className="text-xs text-brand-success bg-brand-success/10 px-2 py-1 rounded-full border border-brand-success/20 animate-pulse">
                 ● Live
               </span>
             </div>
             {activeSignals.length === 0 ? (
               <div className="text-center py-20 text-gray-500">
                 <p>No active signals. Relax!</p>
               </div>
             ) : (
               activeSignals.map(signal => (
                 <SignalCard 
                   key={signal.id} 
                   signal={signal} 
                   userRole={user.role} 
                   onStatusChange={handleSignalStatusChange}
                   onViewImage={handleViewImage}
                 />
               ))
             )}
          </div>
        );
      case 'HISTORY':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="flex justify-between items-center mb-2">
               <h3 className="text-lg font-bold text-white">Past Entries</h3>
               <div className="text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-full">Archive</div>
             </div>
             
             {groupedHistory.length === 0 ? (
               <div className="text-center py-20 text-gray-500">
                 <p>History is empty.</p>
               </div>
             ) : (
               groupedHistory.map((group) => (
                 <div key={group.date} className="space-y-3">
                   <div className="flex items-center gap-4 py-2">
                      <div className="h-px bg-white/10 flex-1"></div>
                      <span className="text-xs font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full">{group.date}</span>
                      <div className="h-px bg-white/10 flex-1"></div>
                   </div>
                   {group.signals.map(signal => (
                     <SignalCard key={signal.id} signal={signal} onViewImage={handleViewImage} />
                   ))}
                 </div>
               ))
             )}
          </div>
        );
      case 'COMMUNITY':
        return <div className="animate-in fade-in duration-300"><CommunityView user={user} /></div>;
      case 'RESULTS':
        return <div className="animate-in fade-in duration-300"><ResultsView signals={signals} onViewImage={handleViewImage} /></div>;
      case 'TRADE_IDEAS':
        return <div className="animate-in fade-in duration-300"><TradeIdeasView user={user} ideas={tradeIdeas} onPostIdea={handlePostIdea} /></div>;
      case 'INBOX':
        return (
          <PrivateChatView 
            user={user}
            conversations={user.role === 'TEACHER' ? conversations : conversations.filter(c => c.studentId === user.id)}
            onSendMessage={handleSendPrivateMessage}
            onMarkRead={handleMarkRead}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-brand-dark text-white font-sans selection:bg-brand-accent selection:text-white">
      
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-indigo-900/10 to-transparent"></div>
         <div className="absolute -top-[20%] left-[20%] w-[60%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
         <div className="absolute top-[40%] right-[10%] w-[40%] h-[30%] bg-purple-600/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-high px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
             <Zap size={20} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">Orbit</h1>
            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">Signals</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Role Toggle for Demo */}
           <button 
             onClick={toggleRole}
             className="hidden sm:block text-xs font-mono text-gray-500 hover:text-white transition-colors"
           >
             {user.role} VIEW
           </button>
           
           {/* Private Message Button */}
           <button 
             onClick={() => setCurrentView('INBOX')}
             className="relative p-2 text-gray-300 hover:text-white transition-colors"
           >
             <Mail size={24} fill={currentView === 'INBOX' ? "currentColor" : "none"} />
             {user.role === 'TEACHER' && totalUnread > 0 && (
               <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-accent rounded-full border-2 border-[#121217]"></span>
             )}
           </button>

           <div className="relative">
             <Bell size={24} className="text-gray-300" />
             <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#121217]"></span>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-5 pt-6 max-w-lg mx-auto">
        
        {/* Welcome Section (Only on Home) */}
        {currentView === 'HOME' && (
          <div className="mb-6 flex justify-between items-end">
             <div>
               <p className="text-gray-400 text-sm mb-1">Welcome back,</p>
               <h2 className="text-2xl font-bold text-white">{user.name.split(' ')[0]}</h2>
             </div>
             {user.role === 'TEACHER' ? (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-brand-accent hover:bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-90"
                >
                  <Plus size={24} />
                </button>
             ) : (
                <button 
                   onClick={() => setCurrentView('INBOX')}
                   className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                   <Mail size={16} /> Contact Mentor
                </button>
             )}
          </div>
        )}

        {/* Content Switcher */}
        {renderContent()}
        
      </main>

      {/* Navigation Bar (Mobile) */}
      <nav className="fixed bottom-6 left-6 right-6 z-40">
        <div className="glass h-16 rounded-[2rem] flex justify-between items-center px-4 shadow-2xl shadow-black/50 border border-white/10 max-w-lg mx-auto">
          <button 
            onClick={() => setCurrentView('HOME')}
            className={`p-3 transition-all duration-300 ${currentView === 'HOME' ? 'text-brand-accent scale-110' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Zap size={24} fill={currentView === 'HOME' ? "currentColor" : "none"} />
          </button>
          
          <button 
            onClick={() => setCurrentView('HISTORY')}
            className={`p-3 transition-all duration-300 ${currentView === 'HISTORY' ? 'text-brand-accent scale-110' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Clock size={24} />
          </button>

          <button 
            onClick={() => setCurrentView('TRADE_IDEAS')}
            className={`p-3 transition-all duration-300 ${currentView === 'TRADE_IDEAS' ? 'text-brand-accent scale-110' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Lightbulb size={24} fill={currentView === 'TRADE_IDEAS' ? "currentColor" : "none"} />
          </button>

          <button 
            onClick={() => setCurrentView('COMMUNITY')}
            className={`p-3 transition-all duration-300 ${currentView === 'COMMUNITY' ? 'text-brand-accent scale-110' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <MessageCircle size={24} fill={currentView === 'COMMUNITY' ? "currentColor" : "none"} />
          </button>

          <button 
            onClick={() => setCurrentView('RESULTS')}
            className={`p-3 transition-all duration-300 ${currentView === 'RESULTS' ? 'text-brand-accent scale-110' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <BarChart2 size={24} />
          </button>
        </div>
      </nav>

      {/* Notification Toast */}
      {notification.visible && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down w-full px-6 max-w-lg">
          <div className="glass px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-brand-accent/30 bg-black/60 backdrop-blur-xl">
             <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent shrink-0">
               <Bell size={20} />
             </div>
             <div>
               <h4 className="text-white font-bold text-sm">New Notification</h4>
               <p className="text-xs text-gray-300">{notification.message}</p>
             </div>
          </div>
        </div>
      )}

      {/* Global Image Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-50"
          >
            <X size={24} />
          </button>
          <img 
            src={lightboxImage} 
            alt="Full Screen View" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddSignalModal 
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSignal}
        />
      )}

    </div>
  );
};

export default App;
