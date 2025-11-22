import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';

const SalaryTier = ({ tier, currentReferrals }) => {
  // Calculate progress percentage (clamped between 0 and 100)
  const progress = Math.min(Math.max((currentReferrals / tier.req) * 100, 0), 100);
  const isUnlocked = currentReferrals >= tier.req;

  return (
    <div className={`glass-panel p-4 rounded-2xl mb-4 border-2 transition-all ${isUnlocked ? 'border-green-400 shadow-green-100' : 'border-cyan-100'}`}>
      
      {/* Header: VIP Level & Salary Amount */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className={`font-heavy text-lg ${isUnlocked ? 'text-green-700' : 'text-slate-700'}`}>
            VIP {tier.vip}
          </span>
          {isUnlocked ? (
            <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <CheckCircle2 size={10} /> Active
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Lock size={10} /> Locked
            </span>
          )}
        </div>
        <div className="font-heavy text-cyan-700 text-lg">
          ₨ {tier.salary.toLocaleString()}
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden inner-shadow">
        {/* Animated Fill */}
        <motion.div 
          className={`h-full ${isUnlocked ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-cyan-500 to-cyan-300'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        />
      </div>

      {/* Footer: Count & Requirement */}
      <div className="flex justify-between items-center mt-2 text-xs font-bold text-slate-500">
        <span>Referrals Required</span>
        <span className={isUnlocked ? 'text-green-600' : 'text-cyan-600'}>
          {currentReferrals} / {tier.req}
        </span>
      </div>
    </div>
  );
};

export default SalaryTier;