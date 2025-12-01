
import React, { useState, useRef } from 'react';
import { TradeIdea, User } from '../types';
import { Plus, X, Upload, Maximize2 } from 'lucide-react';

interface TradeIdeasViewProps {
  user: User;
  ideas: TradeIdea[];
  onPostIdea: (idea: Omit<TradeIdea, 'id' | 'timestamp' | 'likes' | 'author'>) => void;
}

const TradeIdeasView: React.FC<TradeIdeasViewProps> = ({ user, ideas, onPostIdea }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPostIdea({
      title,
      description,
      imageUrl: image || undefined
    });
    // Reset
    setTitle('');
    setDescription('');
    setImage(null);
    setShowModal(false);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString() + ' • ' + new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-white">Market Insights</h2>
           <p className="text-xs text-gray-400">Analysis & Ideas</p>
        </div>
        {user.role === 'TEACHER' && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-brand-accent hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={16} /> New Idea
          </button>
        )}
      </div>

      <div className="space-y-6 pb-20">
        {ideas.map((idea) => (
          <div key={idea.id} className="glass rounded-3xl overflow-hidden group">
            {/* Image Section */}
            {idea.imageUrl && (
              <div 
                className="relative h-56 overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage(idea.imageUrl!)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-transparent to-transparent z-10 opacity-80 pointer-events-none"></div>
                <img 
                  src={idea.imageUrl} 
                  alt={idea.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* View Indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                   <div className="bg-black/60 backdrop-blur-md p-3 rounded-full text-white">
                      <Maximize2 size={24} />
                   </div>
                </div>

                <div className="absolute bottom-3 left-4 z-20 pointer-events-none">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="bg-brand-accent/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md">
                        ANALYSIS
                      </span>
                      <span className="text-gray-300 text-[10px] font-medium backdrop-blur-sm bg-black/20 px-2 py-0.5 rounded-md">
                        {formatTimestamp(idea.timestamp)}
                      </span>
                   </div>
                </div>
              </div>
            )}

            <div className={`p-5 ${!idea.imageUrl ? 'pt-6' : ''}`}>
              {!idea.imageUrl && (
                 <div className="flex items-center gap-2 mb-3">
                    <span className="bg-brand-accent/20 text-brand-accent border border-brand-accent/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      ANALYSIS
                    </span>
                    <span className="text-gray-500 text-[10px] font-medium">
                        {formatTimestamp(idea.timestamp)}
                    </span>
                 </div>
              )}
              
              <h3 className="text-lg font-bold text-white mb-2 leading-tight">{idea.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line mb-4">
                {idea.description}
              </p>

              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-accent to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {idea.author[0]}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{idea.author}</span>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="w-full max-w-md bg-[#121217] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
              <div className="flex justify-between items-center p-5 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">Publish Idea</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-white/5 text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-medium ml-1">Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="e.g., Gold Weekly Outlook"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-medium ml-1">Analysis / Thoughts</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors min-h-[120px]"
                    placeholder="Share your market perspective..."
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-medium ml-1">Chart / Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors overflow-hidden relative"
                  >
                    {image ? (
                       <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload size={20} className="text-gray-500" />
                        <span className="text-xs text-gray-500">Tap to upload image</span>
                      </>
                    )}
                  </div>
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
                  className="w-full bg-brand-accent hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 mt-4 flex items-center justify-center gap-2"
                >
                  Publish to Students
                </button>
              </form>
           </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-50"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="Full Screen Analysis" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default TradeIdeasView;
