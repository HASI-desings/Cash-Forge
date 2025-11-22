import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import { ToastProvider } from '../../hooks/useToast';

const MainLayout = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        {/* Fixed Top */}
        <Header />
        
        {/* Dynamic Page Content */}
        <Outlet />
        
        {/* Fixed Bottom */}
        <BottomNav />
      </div>
    </ToastProvider>
  );
};

export default MainLayout;