import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ClipboardCheck, TrendingUp, Users, User } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', path: '/', icon: Home, label: 'Home' },
    { id: 'tasks', path: '/tasks', icon: ClipboardCheck, label: 'Tasks' },
    { id: 'trade', path: '/trade', icon: TrendingUp, label: 'Trade' },
    { id: 'teams', path: '/teams', icon: Users, label: 'Teams' },
    { id: 'profile', path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-8 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-md mx-auto px-6 pointer-events-auto">
        <div className="glass-panel rounded-3xl shadow-2xl shadow-cyan-500/20 border-2 border-cyan-100/80 flex justify-around py-3 px-2 backdrop-blur-xl">
          
          {navItems.map((item) => {
            // Check active state (exact match for home, startsWith for others to handle sub-routes)
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center w-12 h-12"
              >
                {/* Animated Background Bubble for Active State */}
                {isActive && (
                  <motion.div
                    layoutId="navBubble"
                    className="absolute inset-0 bg-cyan-100 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  animate={{ 
                    scale: isActive ? 1 : 1,
                    y: isActive ? -2 : 0 
                  }}
                  whileTap={{ scale: 0.8 }}
                  className={`${isActive ? 'text-cyan-600' : 'text-slate-400 hover:text-cyan-500'} transition-colors duration-200`}
                >
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>

                {/* Label (Only visible when active) */}
                <motion.span
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0,
                    height: isActive ? 'auto' : 0
                  }}
                  className="text-[10px] font-heavy text-cyan-700 mt-0.5 overflow-hidden whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              </button>
            );
          })}

        </div>
      </div>
    </nav>
  );
};

export default BottomNav;