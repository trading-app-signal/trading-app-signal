
import React, { useMemo, useState } from 'react';
import { Signal, PerformanceMetric } from '../types';
import SignalCard from './SignalCard';
import { Trophy, Calendar, TrendingUp, CheckCircle, XCircle, Minus, Activity, ChevronDown, ChevronUp, History } from 'lucide-react';

interface ResultsViewProps {
  signals: Signal[];
  onViewImage?: (url: string) => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ signals, onViewImage }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'WEEK' | 'MONTH' | null>(null);
  
  // Calculate metrics dynamically
  const metrics = useMemo(() => {
    // 1. Filter only closed/finished trades
    const history = signals.filter(s => s.status !== 'ACTIVE');

    // Helper to calc pips for a single trade
    const calculatePips = (s: Signal): number => {
      let pips = 0;
      // Standard Gold (XAUUSD) Pip calc: $1.00 move = 10 pips usually (or 100 points)
      // We will use 10 pips per dollar for simplicity.
      
      if (s.status === 'HIT_TP') {
        const diff = Math.abs(s.takeProfit1 - s.entryPrice);
        pips = diff * 10;
      } else if (s.status === 'HIT_SL') {
        const diff = Math.abs(s.entryPrice - s.stopLoss);
        pips = -diff * 10;
      } else if (s.status === 'BREAK_EVEN') {
        pips = 0;
      } else if (s.status === 'CLOSED') {
        // Conservative assumption: 0 pips if manually closed without specific exit price data
        pips = 0; 
      }
      return Math.round(pips);
    };

    let totalPips = 0;
    let wins = 0;
    let losses = 0;
    let breakeven = 0;

    // Grouping Data
    const currentWeekStart = new Date();
    // Adjust to Monday of current week if needed, simplified here to "last 7 days" or "this week"
    const day = currentWeekStart.getDay(); 
    const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(currentWeekStart.setDate(diff));
    monday.setHours(0,0,0,0);

    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0,0,0,0);

    let weekPips = 0;
    const weekTradesList: Signal[] = [];
    let weekWins = 0;

    let monthPips = 0;
    const monthTradesList: Signal[] = [];
    let monthWins = 0;

    history.forEach(s => {
      const pips = calculatePips(s);
      totalPips += pips;

      if (s.status === 'HIT_TP') wins++;
      else if (s.status === 'HIT_SL') losses++;
      else breakeven++;

      const date = new Date(s.timestamp);
      
      // Weekly Stats
      if (date >= monday) {
        weekPips += pips;
        weekTradesList.push(s);
        if (s.status === 'HIT_TP') weekWins++;
      }

      // Monthly Stats
      if (date >= currentMonthStart) {
        monthPips += pips;
        monthTradesList.push(s);
        if (s.status === 'HIT_TP') monthWins++;
      }
    });

    const totalTrades = wins + losses + breakeven;
    const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
    
    // Construct simplified historic rows
    const weekTradesCount = weekTradesList.length;
    const weekWinRate = weekTradesCount > 0 ? Math.round((weekWins / weekTradesCount) * 100) : 0;
    
    const monthTradesCount = monthTradesList.length;
    const monthWinRate = monthTradesCount > 0 ? Math.round((monthWins / monthTradesCount) * 100) : 0;

    return {
      totalPips,
      winRate,
      totalTrades,
      wins,
      losses,
      breakeven,
      rows: [
        { 
          label: 'This Week', 
          winRate: weekWinRate, 
          totalPips: weekPips, 
          tradesCount: weekTradesCount, 
          type: 'WEEK' as const,
          tradeList: weekTradesList.sort((a,b) => b.timestamp - a.timestamp)
        },
        { 
          label: 'This Month', 
          winRate: monthWinRate, 
          totalPips: monthPips, 
          tradesCount: monthTradesCount, 
          type: 'MONTH' as const,
          tradeList: monthTradesList.sort((a,b) => b.timestamp - a.timestamp)
        },
      ]
    };
  }, [signals]);

  const activeRow = metrics.rows.find(r => r.type === selectedPeriod);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white">Performance</h2>
        <div className="bg-white/5 px-3 py-1 rounded-full text-xs text-brand-accent border border-brand-accent/20 flex items-center gap-2">
          <Activity size={12} /> Live Stats
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-5 flex flex-col justify-between h-40 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10">
              <TrendingUp size={60} />
           </div>
           <div className="flex items-start justify-between relative z-10">
              <div className={`p-2 rounded-full ${metrics.totalPips >= 0 ? 'bg-brand-success/20 text-brand-success' : 'bg-brand-danger/20 text-brand-danger'}`}>
                <TrendingUp size={20} />
              </div>
           </div>
           <div className="relative z-10">
             <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Net PnL (Est.)</p>
             <h3 className={`text-2xl font-bold ${metrics.totalPips >= 0 ? 'text-white' : 'text-brand-danger'}`}>
               {metrics.totalPips > 0 ? '+' : ''}{metrics.totalPips}
               <span className="text-sm font-normal text-gray-400"> pips</span>
             </h3>
           </div>
        </div>
        
        <div className="glass rounded-3xl p-5 flex flex-col justify-between h-40 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-5">
              <Trophy size={60} />
           </div>
           <div className="flex items-start justify-between relative z-10">
              <div className="bg-amber-500/20 p-2 rounded-full text-amber-500">
                <Trophy size={20} />
              </div>
           </div>
           <div className="relative z-10">
             <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Win Rate</p>
             <h3 className="text-2xl font-bold text-white">{metrics.winRate}<span className="text-sm font-normal text-gray-400">%</span></h3>
           </div>
        </div>
      </div>

      {/* Breakdown Stats */}
      <div className="grid grid-cols-3 gap-2">
         <div className="glass rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
            <span className="text-brand-success font-bold text-xl">{metrics.wins}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-1">Wins</span>
         </div>
         <div className="glass rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
            <span className="text-brand-danger font-bold text-xl">{metrics.losses}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-1">Losses</span>
         </div>
         <div className="glass rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
            <span className="text-blue-400 font-bold text-xl">{metrics.breakeven}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-1">B.E.</span>
         </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-sm font-semibold pl-1">Period Analysis</h3>
        
        {metrics.rows.map((metric, idx) => {
          const isSelected = selectedPeriod === metric.type;
          return (
            <div 
              key={idx} 
              onClick={() => setSelectedPeriod(isSelected ? null : metric.type)}
              className={`glass rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden border ${isSelected ? 'border-brand-accent/50 bg-brand-accent/5' : 'border-transparent hover:bg-white/10'}`}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${metric.type === 'WEEK' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                     <Calendar size={20} />
                   </div>
                   <div>
                     <h4 className="text-white font-bold">{metric.label}</h4>
                     <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                            {metric.tradesCount} Trades
                        </span>
                     </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-white font-bold font-mono">{metric.winRate}% WR</div>
                    <div className={`text-xs ${metric.totalPips > 0 ? 'text-brand-success' : metric.totalPips < 0 ? 'text-brand-danger' : 'text-gray-400'}`}>
                      {metric.totalPips > 0 ? '+' : ''}{metric.totalPips} pips
                    </div>
                  </div>
                  {isSelected ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                </div>
              </div>

              {/* Expanded Trade List */}
              {isSelected && (
                <div className="border-t border-white/5 bg-black/20 animate-slide-down">
                   <div className="p-4 space-y-3">
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                        <History size={12} /> Trade Resume
                      </div>
                      {metric.tradeList.length === 0 ? (
                        <p className="text-center text-gray-500 text-xs py-4">No trades recorded for this period.</p>
                      ) : (
                        metric.tradeList.map(signal => (
                          <SignalCard 
                            key={signal.id} 
                            signal={signal} 
                            onViewImage={onViewImage}
                          />
                        ))
                      )}
                   </div>
                </div>
              )}
            </div>
          );
        })}

        {metrics.totalTrades === 0 && (
           <div className="text-center py-8 text-gray-500 text-xs">
              No closed trades found in history.
           </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl">
        <p className="text-[10px] text-gray-500 text-center leading-relaxed">
          Pips are estimated based on entry vs TP/SL prices (approx 10 pips per $1 XAU move).
          Past performance is not indicative of future results.
        </p>
      </div>
    </div>
  );
};

export default ResultsView;
