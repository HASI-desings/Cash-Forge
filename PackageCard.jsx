import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight, Check, Lock, Zap } from 'lucide-react';

const PackageCard = ({ pkg, currentLevel, onBuy }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Logic to determine the state of this package relative to the user
  const isOwned = pkg.id <= currentLevel;
  const isNextUpgrade = pkg.id === currentLevel + 1;
  const isLocked = pkg.id > currentLevel + 1;

  // Dynamic Styles based on state
  const cardBorder = isOwned 
    ? 'border-green-400 shadow-green-100' 
    : isNextUpgrade 
      ? 'border-cyan-400 shadow-cyan-100' 
      : 'border-slate-200 opacity-80 grayscale-[0.5]';

  return (
    <motion.div
      whileHover={{ scale: 1.01, translateY: -2 }}
      transition={{ type: "spring", stiffness: 400 }}
      className={`glass-panel rounded-2xl mb-3 overflow-hidden transition-all border-2 ${cardBorder} ${isOpen ? 'shadow-lg' : 'shadow-sm'}`}
    >
      {/* --- Card Header (Always Visible) --- */}
      <div 
        className="p-5 flex justify-between items-center cursor-pointer hover:bg-cyan-50/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {/* Icon Badge */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOwned ? 'bg-green-100 text-green-600' : 'bg-cyan-100 text-cyan-600'}`}>
            {isOwned ? <Check size={20} /> : isLocked ? <Lock size={20} /> : <Zap size={20} />}
          </div>
          
          <div>
            <h4 className="font-heavy text-lg text-slate-800 leading-tight">{pkg.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                Level {pkg.level}
              </span>
              {isOwned && (
                <span className="text-xs font-bold text-green-600">Active</span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="font-heavy text-lg text-cyan-700">₨ {pkg.investment.toLocaleString()}</div>
          <motion.div 
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="inline-block mt-1 text-cyan-400"
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </div>

      {/* --- Expanded Details (Accordion) --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t-2 border-slate-100 bg-white/40"
          >
            <div className="p-5 pt-2">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/60 p-3 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase">Daily Income</div>
                  <div className="text-lg font-heavy text-cyan-600">₨ {pkg.dailyIncome}</div>
                </div>
                <div className="bg-white/60 p-3 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase">Monthly ROI</div>
                  <div className="text-lg font-heavy text-green-600">₨ {(pkg.dailyIncome * 30).toLocaleString()}</div>
                </div>
              </div>

              {/* Action Button */}
              {isOwned ? (
                <button 
                  disabled 
                  className="w-full py-3 rounded-xl font-heading text-slate-400 bg-slate-100 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Plan Active
                </button>
              ) : isLocked ? (
                <button 
                  disabled
                  className="w-full py-3 rounded-xl font-heading text-slate-400 bg-slate-100 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock size={18} /> Locked (Upgrade Previous First)
                </button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onBuy(pkg)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-white font-heavy py-3 rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 text-lg"
                >
                  Upgrade Now <ArrowRight size={20} />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PackageCard;