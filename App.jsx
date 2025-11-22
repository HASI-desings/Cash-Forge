import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Context Providers (The Logic Layer) ---
import { UserProvider } from './context/UserContext';
import { GameProvider } from './context/GameContext';

// --- Layout (The UI Shell: Header, Footer, Nav) ---
import MainLayout from './components/layout/MainLayout';

// --- Pages (The Views) ---
import Auth from './pages/Auth';
import Home from './pages/Home';
import InvestDetail from './pages/InvestDetail';
import TaskExecution from './pages/TaskExecution';
import TradeCenter from './pages/TradeCenter';
import Teams from './pages/Teams';
import Profile from './pages/Profile';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Rewards from './pages/Rewards';
import Settings from './pages/Settings';
import CustomerCare from './pages/CustomerCare';

const App = () => {
  return (
    <UserProvider>
      <GameProvider>
        <Router>
          <Routes>
            {/* Public Route: Authentication */}
            <Route path="/auth" element={<Auth />} />

            {/* Protected Routes (Wrapped in MainLayout) */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              
              {/* Investment & Tasks */}
              <Route path="/invest/:id" element={<InvestDetail />} />
              <Route path="/tasks" element={<TaskExecution />} />
              
              {/* Trading */}
              <Route path="/trade" element={<TradeCenter />} />
              
              {/* Team & Affiliation */}
              <Route path="/teams" element={<Teams />} />
              
              {/* Profile & Finance */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/withdraw" element={<Withdraw />} />
              
              {/* Profile Sub-pages */}
              <Route path="/profile/rewards" element={<Rewards />} />
              <Route path="/profile/settings" element={<Settings />} />
              <Route path="/profile/support" element={<CustomerCare />} />
            </Route>

            {/* Fallback: Redirect unknown URLs to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </GameProvider>
    </UserProvider>
  );
};

export default App;