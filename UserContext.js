import React, { createContext, useContext, useState, useEffect } from 'react';

// --- INITIAL DEFAULT STATE (Hardcoded Requirements) ---
const DEFAULT_USER = {
  id: 'CF-88291', // Static ID for demo
  name: 'Crypto Investor',
  email: 'user@gmail.com',
  isLoggedIn: false,
  
  // Financials
  balance: 10000,      // 10k Start
  totalDeposited: 10000, // 10k Start
  totalWagered: 0,
  
  // Progression
  vipLevel: 0,         // 0 = No Package
  activePackageId: null, 
  
  // Inventory
  keys: {
    bronze: 1,
    gold: 1,
    diamond: 1
  },
  
  // Team
  referrals: 0,
  referralCode: 'CF-992',
  
  // History
  transactions: [
    { 
      id: 'init-1', 
      type: 'deposit', 
      amount: 10000, 
      date: new Date().toISOString(), 
      status: 'completed',
      method: 'System' 
    }
  ]
};

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. LOAD / INITIALIZE ---
  useEffect(() => {
    const storedData = localStorage.getItem('cashforge_user');
    
    if (storedData) {
      // Restore session
      setUser(JSON.parse(storedData));
    } else {
      // First time visitor? Don't log them in yet, wait for Auth screen
      // But prepare the data structure
      setUser({ ...DEFAULT_USER, isLoggedIn: false });
    }
    setIsLoading(false);
  }, []);

  // --- 2. SAVE ON UPDATE ---
  useEffect(() => {
    if (user) {
      localStorage.setItem('cashforge_user', JSON.stringify(user));
    }
  }, [user]);

  // --- 3. ACTIONS ---

  // Mock Login
  const login = (email, password) => {
    // In a real app, verify with backend.
    // Here, we just simulate a successful login.
    setUser(prev => ({ ...prev, isLoggedIn: true, email }));
    return true;
  };

  // Mock Logout
  const logout = () => {
    setUser({ ...DEFAULT_USER, isLoggedIn: false });
    localStorage.removeItem('cashforge_user');
  };

  // Generic Update Helper (Merge new data into user object)
  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  // Add Transaction to History
  const addTransaction = ({ type, amount, status = 'pending', method = 'USDT' }) => {
    const newTx = {
      id: `tx-${Date.now()}`,
      type, // 'deposit', 'withdraw', 'invest', 'profit', 'commission'
      amount,
      date: new Date().toISOString(),
      status,
      method
    };
    
    setUser(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions]
    }));
  };

  // Handle Package Purchase / Upgrade
  const buyPackage = (pkg, finalCost) => {
    if (user.balance < finalCost) return false;

    setUser(prev => ({
      ...prev,
      balance: prev.balance - finalCost,
      vipLevel: pkg.level,
      activePackageId: pkg.id,
      // Add a 'purchase' transaction
      transactions: [
        {
          id: `buy-${Date.now()}`,
          type: 'invest',
          amount: finalCost,
          date: new Date().toISOString(),
          status: 'completed',
          method: 'Balance'
        },
        ...prev.transactions
      ]
    }));
    return true;
  };

  // Debugging: Reset Account
  const resetAccount = () => {
    setUser({ ...DEFAULT_USER, isLoggedIn: true });
  };

  return (
    <UserContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      updateUser,
      addTransaction,
      buyPackage,
      resetAccount
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;