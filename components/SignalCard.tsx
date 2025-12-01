
import React, { useState, useRef } from 'react';
import { Signal } from '../types';
import { TrendingUp, TrendingDown, ChevronRight, Target, ShieldAlert, Image as ImageIcon, CheckCircle, XCircle, Shield, Upload, X, Maximize2 } from 'lucide-react';

interface SignalCardProps {
  signal: Signal;
  userRole?: 'STUDENT' | 'TEACHER';
  onStatusChange?: (id: string, status: Signal['status'], resultImage?: string) => void;
  onViewImage?: (imageUrl: string) => void;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, userRole, onStatusChange, onViewImage }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLong = signal.type === 'LONG';
  
  // Dynamic styles based on Status
  const getStatusStyles = () => {
    switch (signal.status) {
      case 'HIT_TP':
        return { text: 'text-brand-success', bg: 'bg-brand-success/10', border: 'border-brand-success/20' };
      case 'HIT_SL':
        return { text: 'text-brand-danger', bg: 'bg-brand-danger/10', border: 'border-brand-danger/20' };
      case 'BREAK_EVEN':
        return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
      case 'CLOSED':
        return { text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
      default: // ACTIVE - Always Green as requested
        return { 
          text: 'text-brand-success',
          bg: 'bg-brand-success/10',
          border: 'border-brand-success/20'
        };
    }
  };

  const statusStyle = getStatusStyles();

  // Base colors for main icon/text (Directional)
  const dirColorClass = isLong ? 'text-brand-success' : 'text-brand-danger';
  const dirBgClass = isLong ? 'bg-brand-success/10' : 'bg-brand-danger/10';

  const handleStatusUpdate = (e: React.MouseEvent, newStatus: Signal['status']) => {
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(signal.id, newStatus, resultImage || undefined);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResultImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Determine which image to show: Result image takes precedence if it exists (e.g. for history)
  const displayImage = signal.resultImage || signal.imageUrl;
  const imageLabel = signal.resultImage ? "Trade Result" : "Chart Analysis";

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`relative w-full overflow-hidden transition-all duration-300 ease-spring ${isExpanded ? 'mb-4' : 'mb-3'} rounded-3xl glass hover:bg-white/5 active:scale-[0.98] cursor-pointer group`}
    >
      {/* Decorative Glow based on status or direction */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20 ${
        signal.status === 'HIT_SL' ? 'bg-red-500' : 
        signal.status === 'HIT_TP' ? 'bg-emerald-500' : 
        isLong ? 'bg-emerald-500' : 'bg-rose-500'
      }`}></div>

      <div className="p-5 relative z-10">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dirBgClass}`}>
              {isLong ? <TrendingUp size={20} className={dirColorClass} /> : <TrendingDown size={20} className={dirColorClass} />}
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-tight text-white">{signal.asset}</h3>
              <p className="text-xs text-gray-400 font-medium tracking-wide">
                {signal.type} ENTRY @ <span className="text-white">{signal.entryPrice}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 font-mono mb-1">{formatDate(signal.timestamp)}</span>
            <div className={`px-2 py-0.5 rounded-full border ${statusStyle.border} ${statusStyle.bg} text-[10px] font-bold tracking-wider uppercase ${statusStyle.text}`}>
              {signal.status.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="flex flex-col bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1 text-gray-400 text-xs font-medium uppercase tracking-wider">
              <Target size={12} /> Take Profit
            </div>
            <span className="text-brand-success font-mono font-semibold text-lg">{signal.takeProfit1}</span>
          </div>
          <div className="flex flex-col bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1 text-gray-400 text-xs font-medium uppercase tracking-wider">
              <ShieldAlert size={12} /> Stop Loss
            </div>
            <span className="text-brand-danger font-mono font-semibold text-lg">{signal.stopLoss}</span>
          </div>
        </div>

        {/* Expanded Details */}
        <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
          <div className="overflow-hidden">
             <div className="pt-2 border-t border-white/10">
                {/* Trade Image / Chart Screenshot */}
                {displayImage && (
                  <div 
                    className="mb-4 relative rounded-xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-colors cursor-zoom-in group/image"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewImage) onViewImage(displayImage);
                    }}
                  >
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-white flex items-center gap-1 z-10 pointer-events-none">
                      <ImageIcon size={10} /> {imageLabel}
                    </div>
                    <img 
                      src={displayImage} 
                      alt="Chart Analysis" 
                      className="w-full h-48 object-cover opacity-95 group-hover/image:opacity-100 transition-opacity"
                    />
                     {/* Zoom Overlay */}
                     <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/image:opacity-100 transition-opacity backdrop-blur-[1px]">
                        <div className="bg-black/50 p-2 rounded-full text-white backdrop-blur-md">
                           <Maximize2 size={20} />
                        </div>
                     </div>
                  </div>
                )}

                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-gray-300">Strategy Insight</h4>
                </div>
                
                <p className="text-gray-500 text-sm italic mb-3">
                  {signal.notes || "No additional notes provided by the mentor."}
                </p>

                {/* Teacher Action Buttons */}
                {userRole === 'TEACHER' && signal.status === 'ACTIVE' && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                     <p className="text-[10px] text-center text-gray-500 mb-3 uppercase tracking-wider font-medium">Update Signal Status</p>
                     
                     {/* Image Upload for Result */}
                     <div className="mb-4">
                        {resultImage ? (
                          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/20 group/img bg-black/40">
                             <img src={resultImage} alt="Result Preview" className="w-full h-full object-cover" />
                             <button 
                               onClick={(e) => { e.stopPropagation(); setResultImage(null); }}
                               className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-md hover:bg-red-500/80 transition-colors"
                             >
                               <X size={14} />
                             </button>
                             <div className="absolute bottom-2 left-2 text-[10px] text-white bg-black/50 px-2 py-1 rounded-md">
                               Result Attached
                             </div>
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            className="w-full py-3 border border-dashed border-white/20 rounded-xl flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-white hover:border-brand-accent/50 hover:bg-white/5 transition-all"
                          >
                            <Upload size={14} />
                            Attach Result Screenshot (Optional)
                          </button>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          onClick={(e) => e.stopPropagation()}
                        />
                     </div>

                     <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={(e) => handleStatusUpdate(e, 'HIT_TP')}
                          className="py-3 bg-brand-success/10 border border-brand-success/20 text-brand-success hover:bg-brand-success/20 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all active:scale-95"
                        >
                          <CheckCircle size={18} />
                          TP HIT
                        </button>
                        <button 
                          onClick={(e) => handleStatusUpdate(e, 'HIT_SL')}
                          className="py-3 bg-brand-danger/10 border border-brand-danger/20 text-brand-danger hover:bg-brand-danger/20 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all active:scale-95"
                        >
                          <XCircle size={18} />
                          SL HIT
                        </button>
                        <button 
                          onClick={(e) => handleStatusUpdate(e, 'BREAK_EVEN')}
                          className="py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all active:scale-95"
                        >
                          <Shield size={18} />
                          B.E HIT
                        </button>
                     </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
                   <span>Signal ID: #{signal.id.slice(-4)}</span>
                   <span>Mentor: {signal.author}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Expand Indicator */}
        <div className="flex justify-center mt-1">
          <ChevronRight 
            size={16} 
            className={`text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-90'}`} 
            style={{ opacity: isExpanded ? 0 : 0.5}} 
          />
        </div>
      </div>
    </div>
  );
};

export default SignalCard;
