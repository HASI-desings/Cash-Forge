import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext'; // We will create this next
import { TRADES } from '../config/app-data';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const { user, updateUser } = useUser();

  // --- STATE ---
  const [isWeekend, setIsWeekend] = useState(false);
  const [activeTrade, setActiveTrade] = useState(null); // { id, tradeId, amount, startTime, endTime }
  const [tasksDoneToday, setTasksDoneToday] = useState([]); // Array of task IDs

  // --- 1. WEEKEND CHECK (Runs on mount & every minute) ---
  useEffect(() => {
    const checkMarketStatus = () => {
      const today = new Date();
      const day = today.getDay();
      // 0 = Sunday, 6 = Saturday
      const isClosed = day === 0 || day === 6;
      setIsWeekend(isClosed);
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // --- 2. RESTORE ACTIVE TRADE FROM STORAGE ---
  useEffect(() => {
    const savedTrade = localStorage.getItem('cashforge_active_trade');
    if (savedTrade) {
      const parsed = JSON.parse(savedTrade);
      // Check if it's still valid or finished
      setActiveTrade(parsed);
    }
  }, []);

  // --- 3. TRADE LOGIC ---
  
  const startTrade = (tradeObj, amount) => {
    if (activeTrade) return { success: false, message: "A trade is already active." };
    if (user.balance < amount) return { success: false, message: "Insufficient balance." };

    // Deduct Balance immediately
    updateUser({ 
      balance: user.balance - amount,
      // Update Wagered Amount here? Or only on win? 
      // Usually wager counts when you commit money.
      totalWagered: (user.totalWagered || 0) + amount 
    });

    // Create Trade Object
    const now = Date.now();
    const durationMs = tradeObj.duration * 60 * 60 * 1000;
    
    const newTrade = {
      tradeId: tradeObj.id,
      name: tradeObj.name,
      amount: amount,
      returnPercentage: tradeObj.returnPercentage,
      startTime: now,
      endTime: now + durationMs,
      status: 'running'
    };

    setActiveTrade(newTrade);
    localStorage.setItem('cashforge_active_trade', JSON.stringify(newTrade));
    return { success: true, message: "Trade started successfully!" };
  };

  const checkTradeStatus = () => {
    if (!activeTrade) return null;

    const now = Date.now();
    if (now >= activeTrade.endTime && activeTrade.status === 'running') {
      // Trade Finished!
      return { ...activeTrade, status: 'claimable' };
    }
    return activeTrade;
  };

  const claimTradeReward = () => {
    if (!activeTrade) return;
    
    // Calculate Reward
    const profit = activeTrade.amount * activeTrade.returnPercentage;
    const totalReturn = activeTrade.amount + profit;

    // Update User Balance
    updateUser({
      balance: user.balance + totalReturn
    });

    // Clear Trade
    setActiveTrade(null);
    localStorage.removeItem('cashforge_active_trade');
    
    return totalReturn;
  };

  // --- 4. TASK LOGIC ---
  // Simple helper to track what's done today in memory (or local storage if we want persistence)
  const markTaskComplete = (taskId) => {
    setTasksDoneToday(prev => [...prev, taskId]);
  };

  const resetDailyTasks = () => {
    setTasksDoneToday([]);
  };

  return (
    <GameContext.Provider value={{
      isWeekend,
      activeTrade,
      startTrade,
      checkTradeStatus,
      claimTradeReward,
      tasksDoneToday,
      markTaskComplete,
      resetDailyTasks
    }}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;