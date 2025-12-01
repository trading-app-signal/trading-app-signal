
import React, { useState, useMemo, useEffect } from 'react';
import { User, Signal, PrivateConversation, ChatMessage, TradeIdea } from './types';
import SignalCard from './components/SignalCard';
import AddSignalModal from './components/AddSignalModal';
import DailySummary from './components/DailySummary';
import CommunityView from './components/CommunityView';
import ResultsView from './components/ResultsView';
import PrivateChatView from './components/PrivateChatView';
import TradeIdeasView from './components/TradeIdeasView';
import LoginScreen from './components/LoginScreen';
import { Bell, Plus, UserCircle, Settings, Wallet, Zap, Clock, MessageCircle, BarChart2, Mail, Lightbulb, X, LogOut } from 'lucide-react';

// Generates ~40 mock signals with specific win rate logic
const generateMockSignals = (): Signal[] => {
  const signals: Signal[] = [];
  const now = new Date();
  
  // Helper for random float
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  // We need dates for "Current Month" (Nov in prompt, but let's make it dynamic for "This Month")
  // and "Previous Month" (Oct in prompt, dynamic "Last Month")
  
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const prevMonthDate = new Date(now);
  prevMonthDate.setMonth(currentMonth - 1);
  const prevMonth = prevMonthDate.getMonth();
  const prevYear = prevMonthDate.getFullYear();

  // Create 24 signals for Current Month
  // 16 Wins (67%), 5 Losses (21%), 3 BE (12%) ~= 68/22 distribution
  const currentMonthOutcomes = [
    ...Array(16).fill('HIT_TP'),
    ...Array(5).fill('HIT_SL'),
    ...Array(3).fill('BREAK_EVEN')
  ];

  // Create 16 signals for Previous Month
  // 11 Wins, 3 Losses, 2 BE
  const prevMonthOutcomes = [
    ...Array(11).fill('HIT_TP'),
    ...Array(3).fill('HIT_SL'),
    ...Array(2).fill('BREAK_EVEN')
  ];

  const createSignal = (index: number, outcome: any, month: number, year: number): Signal => {
    const isLong = Math.random() > 0.5;
    const entry = rand(2600, 2750); // Gold price range
    const dist = rand(5, 15); // Distance to SL/TP
    
    // Random day in month (1-28 to be safe)
    const day = Math.floor(rand(1, 28));
    
    // Ensure date is not in future if using current month
    let date = new Date(year, month, day, Math.floor(rand(8, 20)), 0);
    if (date > now) {
       date = new Date(now.getTime() - rand(1000, 86400000)); // fallback to recent past if generated future date
    }

    return {
      id: `mock_${year}_${month}_${index}`,
      asset: 'XAUUSD',
      type: isLong ? 'LONG' : 'SHORT',
      entryPrice: parseFloat(entry.toFixed(2)),
      stopLoss: parseFloat((isLong ? entry - dist : entry + dist).toFixed(2)),
      takeProfit1: parseFloat((isLong ? entry + dist * 2 : entry - dist * 2).toFixed(2)),
      takeProfit2: parseFloat((isLong ? entry + dist * 3 : entry - dist * 3).toFixed(2)),
      timestamp: date.getTime(),
      status: outcome,
      notes: `Technical setup based on ${isLong ? 'support bounce' : 'resistance rejection'}.`,
      author: 'Alex (Mentor)',
      resultImage: outcome === 'HIT_TP' 
        ? 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800&h=500' 
        : undefined
    };
  };

  currentMonthOutcomes.forEach((outcome, i) => {
    signals.push(createSignal(i, outcome, currentMonth, currentYear));
  });

  prevMonthOutcomes.forEach((outcome, i) => {
    signals.push(createSignal(i + 100, outcome, prevMonth, prevYear));
  });

  return signals.sort((a, b) => b.timestamp - a.timestamp);
};

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
    studentId: 'u_student', // Matched to the student ID created in LoginScreen
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

// Local Storage Keys
// Version bump to v3 to reset data and use new generated signals
const KEYS = {
  USER: 'orbit_user_v3',
  SIGNALS: 'orbit_signals_v3',
  CONVERSATIONS: 'orbit_conversations_v3',
  IDEAS: 'orbit_ideas_v3'
};

const App: React.FC = () => {
  // Initialize State from Local Storage
  // User can be null if not logged in
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [signals, setSignals] = useState<Signal[]>(() => {
    const saved = localStorage.getItem(KEYS.SIGNALS);
    return saved ? JSON.parse(saved) : generateMockSignals();
  });

  const [conversations, setConversations] = useState<PrivateConversation[]>(() => {
    const saved = localStorage.getItem(KEYS.CONVERSATIONS);
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [tradeIdeas, setTradeIdeas] = useState<TradeIdea[]>(() => {
    const saved = localStorage.getItem(KEYS.IDEAS);
    return saved ? JSON.parse(saved) : INITIAL_IDEAS;
  });

  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<{message: string, visible: boolean}>({ message: '', visible: false });
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    if (user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(KEYS.SIGNALS, JSON.stringify(signals));
  }, [signals]);

  useEffect(() => {
    localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(KEYS.IDEAS, JSON.stringify(tradeIdeas));
  }, [tradeIdeas]);

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
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 4000);
  };

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentView('HOME');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('HOME');
  };

  const handleAddSignal = (newSignalData: Omit<Signal, 'id' | 'timestamp' | 'status' | 'author'>) => {
    if (!user) return;
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

  const handleDeleteSignal = (id: string) => {
    setSignals(prev => prev.filter(s => s.id !== id));
    showNotification('Signal deleted from history.');
  };

  const handlePostIdea = (newIdeaData: Omit<TradeIdea, 'id' | 'timestamp' | 'likes' | 'author'>) => {
    if (!user) return;
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

  const handleDeleteIdea = (id: string) => {
    setTradeIdeas(prev => prev.filter(i => i.id !== id));
    showNotification('Insight deleted.');
  };

  const handleSendPrivateMessage = (conversationId: string, text: string) => {
    if (!user) return;
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

  const renderContent = () => {
    if (!user) return null;

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
                   onDelete={handleDeleteSignal}
                 />
               ))
             )}
          </div>
        );
      case 'HISTORY':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="flex justify-between items-center mb-2">
               <h3 className="text-lg font-bold text-white">All Signals</h3>
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
                     <SignalCard 
                        key={signal.id} 
                        signal={signal} 
                        userRole={user.role}
                        onViewImage={handleViewImage} 
                        onDelete={handleDeleteSignal}
                     />
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
        return <div className="animate-in fade-in duration-300"><TradeIdeasView user={user} ideas={tradeIdeas} onPostIdea={handlePostIdea} onDelete={handleDeleteIdea} /></div>;
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

  // If user is not authenticated, show Login Screen
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

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

           {/* Logout Button */}
           <button 
             onClick={handleLogout}
             className="ml-2 p-2 bg-white/5 rounded-full text-gray-400 hover:text-brand-danger hover:bg-brand-danger/10 transition-colors"
             title="Log Out"
           >
             <LogOut size={18} />
           </button>
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
