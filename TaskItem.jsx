import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Check, Clock, Loader2, DollarSign } from 'lucide-react';

const TaskItem = ({ task, index, status, onStart, onClaim, disabled }) => {
  // Local timer state for visual countdown
  const [timeLeft, setTimeLeft] = useState(task.duration);

  // Reset timer if task resets (optional safety)
  useEffect(() => {
    if (status === 'idle') setTimeLeft(task.duration);
  }, [status, task.duration]);

  // Handle Countdown Logic
  useEffect(() => {
    let interval = null;
    if (status === 'running' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 0.1)); // Update every 100ms for smooth decimal
      }, 100);
    }
    return () => clearInterval(interval);
  }, [status, timeLeft]);

  // --- Button State Logic ---
  const renderButton = () => {
    switch (status) {
      case 'running':
        return (
          <button 
            disabled 
            className="min-w-[80px] px-3 py-2 rounded-lg bg-cyan-50 text-cyan-600 font-bold text-xs flex items-center justify-center gap-1 border border-cyan-100"
          >
            <Loader2 size={14} className="animate-spin" />
            {timeLeft.toFixed(1)}s
          </button>
        );
      case 'claimable':
        return (
          <motion.button
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClaim}
            className="min-w-[80px] px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-400 text-white font-heavy text-xs shadow-lg shadow-green-500/30 flex items-center justify-center gap-1 animate-pulse-slow"
          >
            <DollarSign size={14} /> CLAIM
          </motion.button>
        );
      case 'completed':
        return (
          <button 
            disabled 
            className="min-w-[80px] px-3 py-2 rounded-lg bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-1"
          >
            <Check size={14} /> DONE
          </button>
        );
      case 'idle':
      default:
        return (
          <button
            onClick={onStart}
            disabled={disabled}
            className={`min-w-[80px] px-3 py-2 rounded-lg font-heavy text-xs flex items-center justify-center gap-1 transition-all
              ${disabled 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-md shadow-cyan-500/20'
              }
            `}
          >
            <Play size={14} fill="currentColor" /> START
          </button>
        );
    }
  };

  // --- Icon Logic ---
  const renderIcon = () => {
    if (status === 'completed') {
      return <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Check size={20} /></div>;
    }
    if (status === 'running') {
      return <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center"><Loader2 size={20} className="animate-spin" /></div>;
    }
    return (
      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-heavy flex items-center justify-center border border-slate-200">
        {index + 1}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel rounded-xl p-3 mb-3 relative overflow-hidden border-2 transition-colors ${status === 'running' ? 'border-cyan-400 bg-cyan-50/30' : 'border-cyan-100'}`}
    >
      {/* --- Progress Bar (Background) --- */}
      {status === 'running' && (
        <motion.div 
          className="absolute bottom-0 left-0 top-0 bg-cyan-100/50 -z-10"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: task.duration, ease: "linear" }}
        />
      )}

      {/* --- Content --- */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          {renderIcon()}
          <div>
            <h4 className={`font-bold text-sm ${status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {task.name}
            </h4>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] font-bold bg-white/60 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 flex items-center gap-1">
                <Clock size={10} /> {task.duration}s
              </span>
              <span className="text-[10px] font-heavy text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                + ₨ {task.reward.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div>
          {renderButton()}
        </div>
      </div>

      {/* Bottom Green Line Animation for Progress */}
      {status === 'running' && (
        <motion.div 
          className="absolute bottom-0 left-0 h-1 bg-cyan-500 shadow-[0_0_10px_#00FFFF]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: task.duration, ease: "linear" }}
        />
      )}
    </motion.div>
  );
};

export default TaskItem;