
import React from 'react';
import { Activity } from 'lucide-react';

interface DailySummaryProps {
  count: number;
}

const DailySummary: React.FC<DailySummaryProps> = ({ count }) => {
  return (
    <div className="mb-6">
      <h3 className="text-white font-bold text-lg mb-3 tracking-tight">Daily Briefing</h3>
      <div className="glass rounded-3xl p-6 flex items-center justify-between relative overflow-hidden group border border-white/5 hover:bg-white/5 transition-all duration-300">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-[40px] -mr-10 -mt-10"></div>
        
        <div className="relative z-10">
           <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${count > 0 ? 'bg-brand-success animate-pulse' : 'bg-gray-500'}`}></span>
              <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">TODAY</p>
           </div>
           
           <div className="flex items-baseline gap-2">
             <h2 className="text-4xl font-bold text-white tracking-tighter">
               {count}
             </h2>
             <span className="text-lg font-medium text-gray-400">
               {count === 1 ? 'New Signal' : 'New Signals'}
             </span>
           </div>
           
           <p className="text-xs text-gray-500 mt-2 font-medium">
             {count === 0 ? "Waiting for market opportunities..." : "Opportunities posted by mentors."}
           </p>
        </div>

        <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-accent to-blue-700 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white">
           <Activity size={28} />
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
