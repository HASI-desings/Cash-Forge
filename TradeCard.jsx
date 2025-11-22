import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const TradeCard = ({ trade, isActive, isLocked, onInvest, userBalance }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  // ROI Calculation for display
  const roiPercent = (trade.returnPercentage * 100).toFixed(2);
  
  // Helper to validate input
  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    setError('');
    
    if (val && (Number(val) < trade.min || Number(val) > trade.max)) {
      setError(`Range: ${trade.min} - ${trade.max}`);
    }
  };

  const handleInvestClick = () => {
    const numAmount = Number(amount);
    
    // 1. Validation checks
    if (!amount || isNaN(numAmount)) {
      setError('Enter valid amount');
      return;
    }
    if (numAmount < trade.min || numAmount > trade.max) {
      setError(`Must be between ${trade.min} and ${trade.max}`);
      return;
    }
    if (numAmount > userBalance) {
      setError('Insufficient Balance');
      return;
    }

    // 2. Proceed
    onInvest(trade, numAmount);
  };

  // Dynamic Styles based on State
  const containerClass = isActive
    ? 'border-cyan-500 shadow-lg shadow-cyan-500/20 bg-white' // Active (Running)
    : isLocked
      ? 'border-slate-200 opacity-70 grayscale-[0.8] bg-slate-50' // Locked
      : 'border-cyan-200 hover:border-cyan-400 bg-white/90'; // Available

  return (
    <motion.div
      whileHover={!isLocked && !isActive ? { translateY: -4 } : {}}
      className={`glass-panel rounded-2xl p-5 mb-4 border-2 transition-all relative overflow-hidden ${containerClass}`}
    >
      {/* Active Badge */}
      {isActive && (
        <div className="absolute top-0 right-0 bg-cyan-500 text-white text-[10px] font-heavy px-3 py-1 rounded-bl-xl z-10 shadow-md">
          CURRENTLY ACTIVE
        </div>
      )}

      {/* --- Header --- */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-heavy text-slate-800 flex items-center gap-2">
            {trade.name}
            {isLocked && <Lock size={14} className="text-slate-400" />}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
              <Clock size={12} /> {trade.duration} Hours
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-heavy text-green-600 flex items-center justify-end gap-1">
            <TrendingUp size={20} /> {roiPercent}%
          </div>
          <span className="text-[10px] font-bold text-green-700/70 uppercase tracking-wider">
            Return
          </span>
        </div>
      </div>

      {/* --- Limits Progress Bar Visual --- */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
          <span>Min: {trade.min.toLocaleString()}</span>
          <span>Max: {trade.max.toLocaleString()}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-300 to-cyan-500 w-1/3 opacity-50"></div>
        </div>
      </div>

      {/* --- Interaction Area --- */}
      {isActive ? (
        <button disabled className="w-full py-3 bg-cyan-50 text-cyan-600 rounded-xl font-heavy text-sm border border-cyan-100 animate-pulse">
          Trade in Progress...
        </button>
      ) : isLocked ? (
        <button disabled className="w-full py-3 bg-slate-200 text-slate-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
          <Lock size={16} /> Position Locked
        </button>
      ) : (
        <div className="space-y-3">
          {/* Input Field */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-heavy text-slate-400">₨</span>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder={`Amount (${trade.min}-${trade.max})`}
              className={`w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 border-2 font-bold text-slate-700 focus:outline-none transition-colors ${error ? 'border-red-300 focus:border-red-400 bg-red-50' : 'border-slate-200 focus:border-cyan-400'}`}
            />
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="text-red-500 text-xs font-bold flex items-center gap-1 pl-1"
              >
                <AlertCircle size={12} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <button
            onClick={handleInvestClick}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-white font-heavy py-3 rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            Start Trade <ArrowRight size={18} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default TradeCard;