import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';

const UpgradeModal = ({ isOpen, onClose, onConfirm, targetPkg, currentPkgValue = 0 }) => {
  if (!isOpen || !targetPkg) return null;

  // Logic: Calculate the actual amount the user needs to pay
  // If user has a previous package, they only pay the difference
  const discount = currentPkgValue; 
  const finalPrice = targetPkg.investment - discount;

  // Animation Variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* 1. Backdrop Blur */}
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* 2. The Glass Modal */}
          <motion.div
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-cyan-200"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-3 backdrop-blur-md border border-white/30">
                <ArrowUpRight className="text-white" size={24} />
              </div>
              <h3 className="text-white font-heavy text-xl">Confirm Upgrade</h3>
              <p className="text-cyan-50 text-sm font-medium">Switching to {targetPkg.name}</p>
            </div>

            {/* Close Button (Absolute) */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Receipt / Calculation Section */}
            <div className="p-6 space-y-4">
              
              {/* Line Item 1: Package Price */}
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Package Value</span>
                <span className="font-bold">₨ {targetPkg.investment.toLocaleString()}</span>
              </div>

              {/* Line Item 2: Discount (Current Pkg Value) */}
              {discount > 0 && (
                <div className="flex justify-between items-center text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">
                  <span className="font-bold flex items-center gap-1 text-sm">
                    <ShieldCheck size={14} /> Current Plan Credit
                  </span>
                  <span className="font-heavy">- ₨ {discount.toLocaleString()}</span>
                </div>
              )}

              <div className="h-px bg-slate-200 w-full my-2"></div>

              {/* Total Due */}
              <div className="flex justify-between items-end">
                <span className="text-slate-500 font-bold text-sm pb-1">Net Payable</span>
                <span className="text-3xl font-heavy text-cyan-700">
                  ₨ {finalPrice.toLocaleString()}
                </span>
              </div>

              {/* Warning/Note */}
              <div className="flex gap-2 items-start bg-cyan-50 p-3 rounded-xl text-xs text-cyan-800 border border-cyan-100">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <p>
                  By confirming, <b>₨ {finalPrice.toLocaleString()}</b> will be deducted from your balance. Daily income will increase to ₨ {targetPkg.dailyIncome}.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={onClose}
                  className="py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => onConfirm(targetPkg, finalPrice)}
                  className="py-3 rounded-xl font-bold text-white bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/30 transition-all active:scale-95"
                >
                  Confirm
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;