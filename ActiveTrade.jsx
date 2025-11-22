import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Activity, ShieldCheck } from 'lucide-react';

const ActiveTrade = ({ trade, startTime, investedAmount }) => {
  // State for the countdown
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);

  // Calculate duration in milliseconds
  const durationMs = trade.duration * 60 * 60 * 1000;
  const endTime = startTime + durationMs;

  // ROI Calc
  const projectedReturn = investedAmount + (investedAmount * trade.returnPercentage);
  const profit = projectedReturn - investedAmount;

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const elapsed = now - startTime;
      
      setTimeLeft(remaining);
      
      // Calculate percentage (0 to 100)
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, startTime, durationMs]);

  // Helper to format HH:MM:SS
  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel rounded-3xl p-6 mb-6 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 relative overflow-hidden"
    >
      {/* Background Pulse Effect */}
      <div className="absolute top-0 right-0 p-4">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-cyan-100 rounded-lg text-cyan-600">
          <Activity size={24} className="animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-heavy text-slate-800">Active Position</h2>
          <p className="text-xs font-bold text-slate-500">{trade.name}</p>
        </div>
      </div>

      {/* Main Countdown Circle */}
      <div className="flex justify-center mb-8 relative">
        {/* SVG Circle Logic */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="#ecfeff"
              strokeWidth="8"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="#00FFFF"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283" // 2 * pi * 45
              strokeDashoffset={283 - (283 * progress) / 100}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          
          {/* Time Text centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Closing In</span>
            <span className="text-2xl font-heavy tabular-nums tracking-tight">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/60 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 mb-1">
            <ShieldCheck size={12} /> Invested
          </div>
          <div className="text-lg font-heavy text-slate-700">
            ₨ {investedAmount.toLocaleString()}
          </div>
        </div>

        <div className="bg-cyan-50/50 rounded-xl p-3 border border-cyan-100">
          <div className="flex items-center gap-1 text-xs font-bold text-cyan-600 mb-1">
            <TrendingUp size={12} /> Est. Return
          </div>
          <div className="text-lg font-heavy text-green-600">
            ₨ {projectedReturn.toLocaleString()}
          </div>
          <div className="text-[10px] font-bold text-green-500">
            (+₨ {profit.toLocaleString()})
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400 font-medium">
          Trade is locked until timer expires.
        </p>
      </div>

    </motion.div>
  );
};

export default ActiveTrade;