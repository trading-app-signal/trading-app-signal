import React, { useState } from 'react';
import { Signal, SignalType } from '../types';
import { X, Send, Wand2 } from 'lucide-react';

interface AddSignalModalProps {
  onClose: () => void;
  onSubmit: (signal: Omit<Signal, 'id' | 'timestamp' | 'status' | 'author'>) => void;
}

const AddSignalModal: React.FC<AddSignalModalProps> = ({ onClose, onSubmit }) => {
  const [asset, setAsset] = useState('XAUUSD');
  const [type, setType] = useState<SignalType>('LONG');
  const [entry, setEntry] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      asset: asset.toUpperCase(),
      type,
      entryPrice: parseFloat(entry),
      stopLoss: parseFloat(sl),
      takeProfit1: parseFloat(tp),
      takeProfit2: parseFloat(tp) * 1.05, // Auto-calc for demo
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#121217] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex justify-between items-center p-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">New Signal</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-xs text-gray-400 font-medium ml-1">Asset</label>
                <input 
                  type="text" 
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors font-mono"
                  placeholder="XAUUSD"
                  required
                />
             </div>
             <div className="space-y-1">
                <label className="text-xs text-gray-400 font-medium ml-1">Direction</label>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  <button 
                    type="button"
                    onClick={() => setType('LONG')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'LONG' ? 'bg-brand-success text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    LONG
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType('SHORT')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'SHORT' ? 'bg-brand-danger text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    SHORT
                  </button>
                </div>
             </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">Entry Price</label>
            <input 
              type="number" 
              step="any"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors font-mono"
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-brand-success/80 font-medium ml-1">Take Profit</label>
              <input 
                type="number" 
                step="any"
                value={tp}
                onChange={(e) => setTp(e.target.value)}
                className="w-full bg-brand-success/5 border border-brand-success/20 rounded-xl px-4 py-3 text-brand-success focus:outline-none focus:border-brand-success transition-colors font-mono"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-brand-danger/80 font-medium ml-1">Stop Loss</label>
              <input 
                type="number" 
                step="any"
                value={sl}
                onChange={(e) => setSl(e.target.value)}
                className="w-full bg-brand-danger/5 border border-brand-danger/20 rounded-xl px-4 py-3 text-brand-danger focus:outline-none focus:border-brand-danger transition-colors font-mono"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs text-gray-400 font-medium ml-1">Teacher's Note</label>
             <textarea 
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors text-sm min-h-[80px]"
               placeholder="Why are we taking this trade?"
             />
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-accent hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
          >
            <Send size={18} />
            Post Signal
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSignalModal;