
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User } from '../types';
import { Send, Users, Hash, Image as ImageIcon } from 'lucide-react';

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '0', user: 'System', text: 'Welcome to the official community chat!', timestamp: Date.now() - 172800000, isMe: false, avatarColor: 'bg-gray-600' }, // 2 days ago
  { id: '1', user: 'CryptoKing', text: 'Anyone watching BTC support?', timestamp: Date.now() - 3600000, isMe: false, avatarColor: 'bg-orange-500' },
  { id: '2', user: 'Alex (Mentor)', text: 'Yes, looking for a bounce at 62k. Be patient.', timestamp: Date.now() - 900000, isMe: false, avatarColor: 'bg-brand-accent' },
  { id: '3', user: 'SarahTrades', text: 'Thanks Alex! Caught the ETH move earlier too.', timestamp: Date.now() - 500000, isMe: false, avatarColor: 'bg-purple-500' },
];

interface CommunityViewProps {
  user: User;
}

const STORAGE_KEY = 'orbit_community_messages_v1';

const CommunityView: React.FC<CommunityViewProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : MOCK_MESSAGES;
  });

  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Persist messages whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: user.name,
      text: inputText,
      timestamp: Date.now(),
      isMe: true,
      avatarColor: 'bg-brand-accent'
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          user: user.name,
          text: 'Shared an image',
          image: reader.result as string,
          timestamp: Date.now(),
          isMe: true,
          avatarColor: 'bg-brand-accent'
        };
        setMessages([...messages, newMessage]);
      };
      reader.readAsDataURL(file);
    }
  };

  const getDateLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="glass-high rounded-2xl p-4 mb-4 flex items-center justify-between border border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl">
            <Hash size={20} className="text-gray-300" />
          </div>
          <div>
             <h2 className="font-bold text-white">General Chat</h2>
             <p className="text-xs text-gray-400">1,240 Members Online</p>
          </div>
        </div>
        <div className="flex -space-x-2">
           <div className="w-8 h-8 rounded-full border-2 border-[#121217] bg-blue-500"></div>
           <div className="w-8 h-8 rounded-full border-2 border-[#121217] bg-purple-500"></div>
           <div className="w-8 h-8 rounded-full border-2 border-[#121217] bg-gray-700 flex items-center justify-center text-[10px] text-white font-bold">+99</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.map((msg, index) => {
          const dateLabel = getDateLabel(msg.timestamp);
          const prevDateLabel = index > 0 ? getDateLabel(messages[index - 1].timestamp) : null;
          const showDivider = dateLabel !== prevDateLabel;

          return (
            <React.Fragment key={msg.id}>
              {showDivider && (
                <div className="flex items-center gap-4 py-4">
                  <div className="h-px bg-white/5 flex-1"></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                    {dateLabel}
                  </span>
                  <div className="h-px bg-white/5 flex-1"></div>
                </div>
              )}
              
              <div className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${msg.avatarColor}`}>
                  {msg.user[0]}
                </div>
                <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <span className="text-[10px] text-gray-500 mb-1 px-1">{msg.user}</span>
                  
                  <div className={`p-1 rounded-2xl ${
                    msg.isMe 
                      ? 'bg-brand-accent text-white rounded-tr-sm' 
                      : 'bg-white/10 text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.image && (
                      <img src={msg.image} alt="Shared" className="rounded-xl w-full mb-1 max-w-[200px]" />
                    )}
                    <div className="px-3 py-1.5 text-sm leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-600 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="mt-4 relative flex gap-2">
        <div className="relative flex-1">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-3.5 text-white focus:outline-none focus:border-brand-accent/50 focus:bg-white/10 transition-colors"
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ImageIcon size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!inputText.trim()}
          className="p-3.5 bg-brand-accent rounded-full text-white disabled:opacity-50 disabled:bg-gray-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default CommunityView;
