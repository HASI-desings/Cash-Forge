import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Users, Trophy, Share2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../hooks/useToast';
import { SALARY_TIERS } from '../config/app-data';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import SalaryTier from '../components/features/affiliate/SalaryTier';

const Affiliation = () => {
  const { user } = useUser();
  const toast = useToast();

  // Construct the invite link (Simulated)
  const inviteLink = `https://cashforge.com/register?ref=${user?.referralCode || 'CF-000'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join CashForge',
        text: 'Join my team on CashForge and earn daily crypto rewards!',
        url: inviteLink,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <PageLayout>
      {/* --- Page Header --- */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-heavy text-slate-800">Affiliate Program</h1>
        <p className="text-sm font-medium text-slate-500">Build your team & unlock monthly salaries</p>
      </div>

      {/* --- 1. The Invite Card (Hero) --- */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-xl shadow-cyan-500/30 mb-8"
      >
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-cyan-100 text-xs font-bold uppercase tracking-wider">Your Referral Code</p>
              <h2 className="text-3xl font-heavy tracking-widest mt-1">{user?.referralCode}</h2>
            </div>
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-md">
              <Users size={24} className="text-white" />
            </div>
          </div>

          {/* Link Box */}
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
            <div className="flex-grow px-3 overflow-hidden">
              <p className="text-xs text-cyan-50 truncate font-mono">{inviteLink}</p>
            </div>
            <button 
              onClick={handleCopy}
              className="p-2 bg-white text-cyan-600 rounded-lg shadow-sm hover:scale-105 transition-transform active:scale-95"
            >
              <Copy size={16} strokeWidth={3} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 bg-cyan-400 text-white rounded-lg shadow-sm hover:scale-105 transition-transform active:scale-95"
            >
              <Share2 size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* --- 2. User Stats Grid --- */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="flex flex-col items-center justify-center py-4 border-l-4 border-l-cyan-400">
          <Users size={24} className="text-cyan-500 mb-2" />
          <span className="text-2xl font-heavy text-slate-800">{user?.referrals || 0}</span>
          <span className="text-xs font-bold text-slate-400 uppercase">Total Referrals</span>
        </Card>

        <Card className="flex flex-col items-center justify-center py-4 border-l-4 border-l-yellow-400">
          <Trophy size={24} className="text-yellow-500 mb-2" />
          <span className="text-2xl font-heavy text-slate-800">VIP {user?.vipLevel || 0}</span>
          <span className="text-xs font-bold text-slate-400 uppercase">Current Rank</span>
        </Card>
      </div>

      {/* --- 3. Salary Tiers List --- */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-2">
          <Trophy size={20} className="text-purple-500" />
          <h3 className="text-lg font-heavy text-slate-800">Monthly Salary Plan</h3>
        </div>

        <div className="space-y-1">
          {SALARY_TIERS.map((tier) => (
            <SalaryTier 
              key={tier.vip} 
              tier={tier} 
              currentReferrals={user?.referrals || 0} 
            />
          ))}
        </div>
      </div>
      
    </PageLayout>
  );
};

export default Affiliation;