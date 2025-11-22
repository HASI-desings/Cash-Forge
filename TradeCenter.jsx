import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertTriangle, CheckCircle2, History } from 'lucide-react';

import { useUser } from '../context/UserContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../hooks/useToast';
import { TRADES } from '../config/app-data';
import { formatCurrency } from '../utils/formatters';

import PageLayout from '../components/layout/PageLayout';
import TradeCard from '../components/features/trade/TradeCard';
import ActiveTrade from '../components/features/trade/ActiveTrade';
import Button from '../components/ui/Button';

const TradeCenter = () => {
  const { user } = useUser();
  const { activeTrade, startTrade, checkTradeStatus, claimTradeReward } = useGame();
  const toast = useToast();
  
  // Local state to force re-render when timer ticks check status
  const [tradeStatus, setTradeStatus] = useState(activeTrade?.status || 'idle');

  // --- Effect: Monitor Active Trade ---
  useEffect(() => {
    if (activeTrade) {
      const interval = setInterval(() => {
        const updated = checkTradeStatus();
        if (updated && updated.status !== tradeStatus) {
          setTradeStatus(updated.status);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTradeStatus('idle');
    }
  }, [activeTrade, checkTradeStatus, tradeStatus]);

  // --- Actions ---

  const handleInvest = (tradeObj, amount) => {
    const result = startTrade(tradeObj, amount);
    if (result.success) {
      toast.success(`Position opened: -${formatCurrency(amount)}`);
      setTradeStatus('running');
    } else {
      toast.error(result.message);
    }
  };

  const handleClaim = () => {
    const totalReturn = claimTradeReward();
    if (totalReturn) {
      toast.success(`Trade Settled! +${formatCurrency(totalReturn)}`);
      setTradeStatus('idle');
    }
  };

  return (
    <PageLayout>
      {/* --- Header --- */}
      <div className="mb-6">
        <h1 className="text-2xl font-heavy text-slate-800 flex items-center gap-2">
          <TrendingUp className="text-cyan-600" /> Pro Trading
        </h1>
        <p className="text-sm font-medium text-slate-500">
          High-yield, time-locked investment pools.
        </p>
      </div>

      <AnimatePresence mode='wait'>
        
        {/* === VIEW 1: ACTIVE TRADE DASHBOARD === */}
        {activeTrade && tradeStatus === 'running' && (
          <motion.div
            key="running"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ActiveTrade 
              trade={activeTrade} 
              startTime={activeTrade.startTime} 
              investedAmount={activeTrade.amount}
            />
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
              <History className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-blue-800 font-medium">
                Other trading options are locked while this position is active. 
                Funds cannot be withdrawn until the timer expires.
              </p>
            </div>
          </motion.div>
        )}

        {/* === VIEW 2: CLAIM REWARD === */}
        {activeTrade && tradeStatus === 'claimable' && (
          <motion.div
            key="claimable"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-green-500/30"
          >
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md"
            >
              <CheckCircle2 size={40} className="text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-heavy mb-2">Trade Completed!</h2>
            <p className="text-green-100 mb-6">
              Your investment has matured successfully.
            </p>

            <div className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm border border-white/20">
              <div className="text-sm text-green-100 font-bold uppercase">Total Payout</div>
              <div className="text-3xl font-heavy">
                {formatCurrency(activeTrade.amount + (activeTrade.amount * activeTrade.returnPercentage))}
              </div>
            </div>

            <Button 
              onClick={handleClaim} 
              className="bg-white text-green-600 hover:bg-green-50 shadow-lg"
            >
              Claim to Wallet
            </Button>
          </motion.div>
        )}

        {/* === VIEW 3: MARKET LIST (IDLE) === */}
        {!activeTrade && (
          <motion.div
            key="market"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="space-y-4">
              {TRADES.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  isActive={false} // List is only shown when no trade is active
                  isLocked={false}
                  onInvest={handleInvest}
                  userBalance={user?.balance || 0}
                />
              ))}
            </div>

            {/* Risk Disclaimer */}
            <div className="mt-8 flex gap-2 items-start opacity-60 px-2">
              <AlertTriangle size={14} className="text-slate-400 mt-0.5" />
              <p className="text-[10px] text-slate-500 font-medium">
                Trading involves financial risk. Returns are estimated based on historical simulation. 
                Do not invest money you cannot afford to lose.
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </PageLayout>
  );
};

export default TradeCenter;