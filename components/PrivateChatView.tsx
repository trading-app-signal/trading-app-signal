import React, { useState, useEffect, useRef } from 'react';
import { User, PrivateConversation, ChatMessage } from '../types';
import { Send, ChevronLeft, Search, User as UserIcon } from 'lucide-react';

interface PrivateChatViewProps {
  user: User;
  conversations: PrivateConversation[];
  onSendMessage: (conversationId: string, text: string) => void;
  onMarkRead: (conversationId: string) => void;
}

const PrivateChatView: React.FC<PrivateChatViewProps> = ({ user, conversations, onSendMessage, onMarkRead }) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // If user is STUDENT, they only have one conversation (with Mentor). Auto-select it.
  useEffect(() => {
    if (user.role === 'STUDENT' && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [user.role, conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    if (activeConversationId) {
      onMarkRead(activeConversationId);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [activeConversationId, activeConversation?.messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;
    onSendMessage(activeConversationId, inputText);
    setInputText('');
  };

  // RENDER: Teacher Inbox List
  if (user.role === 'TEACHER' && !activeConversationId) {
    return (
      <div className="animate-in fade-in duration-300 h-[calc(100dvh-140px)] flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-1">Inbox</h2>
          <p className="text-xs text-gray-400">Student Inquiries</p>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-base text-white focus:outline-none focus:border-brand-accent/50"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className="glass p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors group"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-900 to-slate-800 flex items-center justify-center border border-white/10 text-white font-bold text-lg">
                  {conv.studentName[0]}
                </div>
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-accent rounded-full border-2 border-[#121217] flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-white' : 'text-gray-300'}`}>
                    {conv.studentName}
                  </h3>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">
                    {new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // RENDER: Chat Interface (for both Student & Teacher)
  return (
    <div className="animate-in slide-in-from-right duration-300 h-[calc(100dvh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
        {user.role === 'TEACHER' && (
          <button 
            onClick={() => setActiveConversationId(null)}
            className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent border border-brand-accent/20">
           <UserIcon size={20} />
        </div>
        <div>
           <h3 className="font-bold text-white leading-tight">
             {user.role === 'STUDENT' ? 'Alex (Mentor)' : activeConversation?.studentName}
           </h3>
           <p className="text-[10px] text-brand-success flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-brand-success"></span> Online
           </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mb-4">
        {activeConversation?.messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
             {!msg.isMe && (
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0">
                 {msg.user[0]}
               </div>
             )}
             <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
               msg.isMe 
                 ? 'bg-brand-accent text-white rounded-tr-sm' 
                 : 'bg-white/10 text-gray-200 rounded-tl-sm'
             }`}>
               {msg.text}
             </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="relative flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={user.role === 'STUDENT' ? "Ask a question..." : "Reply..."}
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-base text-white focus:outline-none focus:border-brand-accent/50 focus:bg-white/10 transition-colors"
        />
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

export default PrivateChatView;