import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Settings, User, Wallet, History, Gift, 
  Users, MessageCircle, LogOut, ShieldCheck, TrendingUp 
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatters';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, resetAccount } = useUser();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    navigate('/auth');
    toast.info("Logged out successfully");
  };

  const handleReset = () => {
    if(window.confirm("Reset all progress and balance to default?")) {
      resetAccount();
      toast.success("Account reset to factory settings");
    }
  };

  return (
    <PageLayout>
      
      {/* --- 1. User Header --- */}
      <div className="flex items-center gap-4 mb-6 relative">
        {/* Avatar */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 p-1 shadow-lg shadow-cyan-500/30"
        >
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden relative">
            {user?.avatar ? (
              <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-slate-400" />
            )}
          </div>
        </motion.div>

        {/* Info */}
        <div className="flex-grow">
          <h1 className="text-xl font-heavy text-slate-800">{user?.name || 'Investor'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
              ID: {user?.id}
            </span>
            <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200">
              VIP {user?.vipLevel}
            </span>
          </div>
        </div>

        {/* Settings Link */}
        <button 
          onClick={() => navigate('/profile/settings')}
          className="p-3 bg-white/50 hover:bg-white rounded-full text-slate-500 transition-colors border border-slate-200"
        >
          <Settings size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* --- 2. Financial Stats --- */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="flex flex-col justify-center py-4 bg-gradient-to-br from-white to-cyan-50 border-cyan-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase mb-1">
            <ShieldCheck size={14} className="text-cyan-500" /> Deposited
          </div>
          <div className="text-lg font-heavy text-slate-800">
            {formatCurrency(user?.totalDeposited)}
          </div>
        </Card>

        <Card className="flex flex-col justify-center py-4 bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase mb-1">
            <TrendingUp size={14} className="text-purple-500" /> Wagered
          </div>
          <div className="text-lg font-heavy text-slate-800">
            {formatCurrency(user?.totalWagered)}
          </div>
        </Card>
      </div>

      {/* --- 3. Quick Actions (Big Buttons) --- */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/deposit')}
          className="flex flex-col items-center justify-center gap-1 py-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-400 text-white shadow-lg shadow-green-500/30"
        >
          <div className="p-2 bg-white/20 rounded-full mb-1">
             <Wallet size={20} strokeWidth={3} />
          </div>
          <span className="font-heavy text-sm">Deposit</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/withdraw')}
          className="flex flex-col items-center justify-center gap-1 py-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-400 text-white shadow-lg shadow-red-500/30"
        >
          <div className="p-2 bg-white/20 rounded-full mb-1">
             <Wallet size={20} strokeWidth={3} />
          </div>
          <span className="font-heavy text-sm">Withdraw</span>
        </motion.button>
      </div>

      {/* --- 4. Menu Grid --- */}
      <h3 className="text-sm font-heavy text-slate-500 uppercase tracking-wide mb-3 pl-2">
        Menu
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {/* History (Currently no dedicated page in routes, could route to a transaction list or stay here) */}
        <MenuCard 
          icon={History} 
          label="History" 
          color="text-blue-500" 
          bg="bg-blue-50"
          onClick={() => toast.info("History Log is maintained in Context.")} 
        />
        
        <MenuCard 
          icon={Gift} 
          label="Rewards" 
          color="text-pink-500" 
          bg="bg-pink-50"
          onClick={() => navigate('/profile/rewards')} 
        />
        
        <MenuCard 
          icon={Users} 
          label="Affiliate" 
          color="text-orange-500" 
          bg="bg-orange-50"
          onClick={() => navigate('/teams')} 
        />
        
        <MenuCard 
          icon={MessageCircle} 
          label="Support" 
          color="text-green-500" 
          bg="bg-green-50"
          onClick={() => navigate('/profile/support')} 
        />
      </div>

      {/* --- 5. Footer Actions --- */}
      <div className="space-y-3">
        <Button variant="ghost" onClick={handleLogout} className="text-slate-400 hover:text-red-500 hover:bg-red-50">
          <LogOut size={18} /> Sign Out
        </Button>

        {/* Debug Button for Testing */}
        <button 
          onClick={handleReset}
          className="w-full text-[10px] text-slate-300 font-bold uppercase tracking-widest hover:text-slate-400"
        >
          Dev: Reset Progress
        </button>
      </div>

    </PageLayout>
  );
};

// --- Helper Component ---
const MenuCard = ({ icon: Icon, label, color, bg, onClick }) => (
  <motion.div
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="glass-panel p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/90 transition-colors"
  >
    <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <span className="font-heavy text-slate-700 text-sm">{label}</span>
  </motion.div>
);

export default Profile;