import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { Wallet } from 'lucide-react';

const Header = () => {
  // Access global user state for the real balance
  const { user } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 gradient-horizontal flex items-center justify-center border-b-2 border-cyan-100/50 backdrop-blur-md shadow-sm">
      <div className="w-full max-w-md px-5 flex justify-between items-center">
        
        {/* --- Logo Section --- */}
        <div className="flex items-center gap-2 cursor-pointer">
          {/* Stylized 'C' Logo */}
          <div className="w-9 h-9 bg-gradient-to-tr from-cyan-600 to-cyan-400 rounded-xl flex items-center justify-center text-white font-heavy text-lg shadow-sm transform -rotate-6">
            C
          </div>
          <span className="font-heavy tracking-widest text-xl text-slate-850">
            CASHFORGE
          </span>
        </div>

        {/* --- Live Balance Pill --- */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          // Breathing animation
          transition={{ 
            scale: { repeat: Infinity, duration: 3, repeatType: "reverse" },
            default: { duration: 0.5 }
          }}
          className="glass-panel px-4 py-1.5 rounded-full border-2 border-cyan-300 shadow-sm flex items-center gap-2"
        >
          <div className="bg-cyan-100 p-1 rounded-full text-cyan-700">
            <Wallet size={12} strokeWidth={3} />
          </div>
          <span className="text-sm font-heavy text-cyan-900">
            ₨ {user?.balance?.toLocaleString() || '0'}
          </span>
        </motion.div>

      </div>
    </header>
  );
};

export default Header;