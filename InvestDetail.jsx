import React, { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, CheckCircle2, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../hooks/useToast';
import { PACKAGES } from '../config/app-data';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import UpgradeModal from '../components/features/invest/UpgradeModal';

const InvestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, buyPackage } = useUser();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Find the specific package
  const pkg = PACKAGES.find(p => p.id === parseInt(id));

  // Redirect if invalid ID
  if (!pkg) return <Navigate to="/" replace />;

  // 2. Logic: Determine Pricing & State
  const currentPkgId = user?.activePackageId;
  const currentPkg = PACKAGES.find(p => p.id === currentPkgId);
  
  const isOwned = user?.vipLevel >= pkg.level;
  const isLocked = user?.vipLevel < pkg.level - 1; // Can only jump 1 level at a time usually, or just check price
  
  // Upgrade Calculation
  const currentPkgValue = currentPkg ? currentPkg.investment : 0;
  // If upgrading, pay difference. If downgrading/same, logic usually prevents buy.
  const isUpgrade = pkg.investment > currentPkgValue;
  const finalPrice = isUpgrade ? pkg.investment - currentPkgValue : pkg.investment;

  const handleConfirmPurchase = (targetPkg, price) => {
    const success = buyPackage(targetPkg, price);
    if (success) {
      toast.success(`Welcome to ${targetPkg.name} Tier!`);
      setIsModalOpen(false);
      navigate('/tasks'); // Send them straight to work
    } else {
      toast.error("Insufficient Balance for this upgrade.");
    }
  };

  return (
    <PageLayout>
      {/* --- Header / Navigation --- */}
      <div className="relative flex items-center justify-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-0 p-2 bg-white/50 hover:bg-white rounded-full text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={3} />
        </button>
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Plan Details
        </span>
      </div>

      {/* --- Hero Section --- */}
      <div className="text-center mb-8 relative">
        {/* Background Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-400/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-2xl shadow-lg shadow-cyan-500/30 text-white mb-4 transform -rotate-3"
        >
          <Briefcase size={40} />
        </motion.div>
        
        <h1 className="text-3xl font-heavy text-slate-800">{pkg.name}</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
            Level {pkg.level}
          </span>
          {isOwned && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> Active
            </span>
          )}
        </div>
      </div>

      {/* --- Pricing Card --- */}
      <Card className="mb-6 border-cyan-400 shadow-xl shadow-cyan-500/10">
        <div className="flex justify-between items-end mb-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Investment Required</p>
            {isUpgrade && currentPkgValue > 0 ? (
              <div className="flex flex-col">
                <span className="text-sm text-slate-400 line-through decoration-red-400">
                  ₨ {pkg.investment.toLocaleString()}
                </span>
                <span className="text-3xl font-heavy text-cyan-700">
                  ₨ {finalPrice.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-3xl font-heavy text-cyan-700">
                ₨ {pkg.investment.toLocaleString()}
              </span>
            )}
          </div>
          
          {isUpgrade && currentPkgValue > 0 && (
             <div className="text-right">
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">
                  Discount Applied
                </span>
             </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-slate-50 rounded-xl p-3 text-center">
             <div className="text-green-600 flex justify-center mb-1"><TrendingUp size={20} /></div>
             <div className="text-xl font-heavy text-slate-700">₨ {pkg.dailyIncome}</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase">Daily Income</div>
           </div>
           <div className="bg-slate-50 rounded-xl p-3 text-center">
             <div className="text-purple-600 flex justify-center mb-1"><Zap size={20} /></div>
             <div className="text-xl font-heavy text-slate-700">{(pkg.dailyIncome * 30).toLocaleString()}</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase">Monthly ROI</div>
           </div>
        </div>
      </Card>

      {/* --- Protocols (Tasks) List --- */}
      <div className="mb-24">
        <h3 className="text-sm font-heavy text-slate-500 uppercase tracking-wide mb-3 pl-2">
          Included Protocols
        </h3>
        <div className="space-y-2">
          {pkg.tasks.map((taskName, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-slate-100"
            >
              <div className="mt-0.5 text-cyan-500">
                <ShieldCheck size={18} />
              </div>
              <span className="text-sm font-medium text-slate-700">{taskName}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- Sticky Action Footer --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-30">
        <div className="max-w-md mx-auto">
          {isOwned ? (
            <Button disabled variant="secondary">
              Plan Currently Active
            </Button>
          ) : (
            <Button onClick={() => setIsModalOpen(true)}>
              {isUpgrade ? 'Upgrade Now' : 'Start Investment'}
            </Button>
          )}
        </div>
      </div>

      {/* --- Confirmation Modal --- */}
      <UpgradeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPurchase}
        targetPkg={pkg}
        currentPkgValue={currentPkgValue}
      />

    </PageLayout>
  );
};

export default InvestDetail;