import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

import { useUser } from '../context/UserContext';
import { useToast } from '../hooks/useToast';
import { WHEEL_PRIZES } from '../config/app-data';

import PageLayout from '../components/layout/PageLayout';
import KeysDisplay from '../components/features/rewards/KeysDisplay';
import Wheel from '../components/features/rewards/Wheel';

const Rewards = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const toast = useToast();

  // --- State ---
  const [activeTab, setActiveTab] = useState('bronze'); // 'bronze' | 'gold' | 'diamond'
  const [lastPrize, setLastPrize] = useState(null);

  // --- Logic ---

  const handleSpinComplete = (prizeAmount) => {
    // 1. Visual Celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#ffffff'] // Gold/White confetti
    });

    // 2. Update User Data (Deduct Key, Add Balance)
    const keyType = activeTab; // 'bronze', 'gold', 'diamond'
    
    // Safety check just in case
    if (user.keys[keyType] <= 0) return;

    updateUser({
      balance: user.balance + prizeAmount,
      keys: {
        ...user.keys,
        [keyType]: user.keys[keyType] - 1
      },
      // Optional: Add to transaction history
      transactions: [
        {
          id: `win-${Date.now()}`,
          type: 'reward',
          amount: prizeAmount,
          date: new Date().toISOString(),
          status: 'completed',
          method: 'Lucky Wheel'
        },
        ...user.transactions
      ]
    });

    setLastPrize(prizeAmount);
    toast.success(`You won ₨ ${prizeAmount}! Added to balance.`);
  };

  // --- Tab Configuration ---
  const tabs = [
    { id: 'bronze', label: 'Bronze', color: 'from-orange-400 to-orange-600', text: 'text-orange-600', border: 'border-orange-200' },
    { id: 'gold', label: 'Gold', color: 'from-yellow-400 to-yellow-600', text: 'text-yellow-600', border: 'border-yellow-200' },
    { id: 'diamond', label: 'Diamond', color: 'from-cyan-400 to-cyan-600', text: 'text-cyan-600', border: 'border-cyan-200' },
  ];

  return (
    <PageLayout>
      {/* --- Header --- */}
      <div className="relative text-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-0 top-1 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-heavy text-slate-800 flex items-center justify-center gap-2">
          <Gift className="text-pink-500" /> Rewards Center
        </h1>
        <p className="text-sm font-medium text-slate-500">Spin to win instant cash</p>
      </div>

      {/* --- 1. Key Inventory --- */}
      <KeysDisplay keys={user.keys} />

      {/* --- 2. Wheel Selector Tabs --- */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-8 relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 py-2 text-sm font-heavy z-10 transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`relative z-10 ${isActive ? tab.text : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* --- 3. The Wheel Container --- */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center min-h-[400px]"
        >
          <Wheel 
            prizes={WHEEL_PRIZES[activeTab]} 
            type={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            hasKey={user.keys[activeTab] > 0}
            onSpinComplete={handleSpinComplete}
          />
        </motion.div>
      </AnimatePresence>

      {/* --- 4. Recent Win Banner --- */}
      <AnimatePresence>
        {lastPrize && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-green-500 to-emerald-400 rounded-2xl text-white text-center shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
          >
            <Sparkles size={20} className="text-yellow-300 animate-spin-slow" />
            <div>
              <p className="text-xs font-bold text-green-100 uppercase">Latest Win</p>
              <p className="text-2xl font-heavy">₨ {lastPrize}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </PageLayout>
  );
};

export default Rewards;