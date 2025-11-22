import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../hooks/useToast';
import { PACKAGES } from '../config/app-data';
import PageLayout from '../components/layout/PageLayout';
import PackageCard from '../components/features/invest/PackageCard';
import UpgradeModal from '../components/features/invest/UpgradeModal';

// --- MOCK PROMOS ---
const PROMOS = [
  {
    id: 1,
    title: "Future of Crypto",
    subtitle: "Join the revolution today",
    gradient: "from-indigo-500 to-purple-500",
    tag: "1 USDT = ₨ 285"
  },
  {
    id: 2,
    title: "Double Rewards",
    subtitle: "Complete tasks daily",
    gradient: "from-pink-500 to-rose-500",
    tag: "Limited Time"
  },
  {
    id: 3,
    title: "VIP Upgrades",
    subtitle: "Unlock higher income",
    gradient: "from-amber-400 to-orange-500",
    tag: "High ROI"
  }
];

const Home = () => {
  const { user, buyPackage } = useUser();
  const toast = useToast();

  // --- State ---
  const [currentPromo, setCurrentPromo] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState(null); // For Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Carousel Logic ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % PROMOS.length);
    }, 4000); // 4 Seconds
    return () => clearInterval(timer);
  }, []);

  // --- Actions ---

  const handleBuyClick = (pkg) => {
    if (!user.isLoggedIn) {
      toast.error("Please log in first.");
      return;
    }
    setSelectedPkg(pkg);
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = (pkg, finalPrice) => {
    const success = buyPackage(pkg, finalPrice);
    
    if (success) {
      toast.success(`Successfully upgraded to ${pkg.name}!`);
      setIsModalOpen(false);
    } else {
      toast.error("Insufficient Balance. Please Deposit.");
    }
  };

  // Calculate current package value for discount logic
  const currentPkg = PACKAGES.find(p => p.id === user?.activePackageId);
  const currentPkgValue = currentPkg ? currentPkg.investment : 0;

  return (
    <PageLayout>
      
      {/* --- 1. Promo Carousel --- */}
      <div className="relative w-full h-40 rounded-3xl overflow-hidden glow-shadow mb-8 border-2 border-white/50">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentPromo}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 bg-gradient-to-r ${PROMOS[currentPromo].gradient} p-6 flex flex-col justify-center`}
          >
            <div className="bg-white/20 w-fit px-2 py-0.5 rounded text-[10px] font-bold text-white mb-2 backdrop-blur-md">
              {PROMOS[currentPromo].tag}
            </div>
            <h2 className="text-2xl font-heavy text-white drop-shadow-md">
              {PROMOS[currentPromo].title}
            </h2>
            <p className="text-white/90 font-medium text-sm">
              {PROMOS[currentPromo].subtitle}
            </p>
            
            {/* Abstract Shapes */}
            <div className="absolute -right-4 -bottom-8 opacity-20 text-white">
              <Sparkles size={80} />
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
          {PROMOS.map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentPromo ? 'bg-white w-4' : 'bg-white/50'}`} 
            />
          ))}
        </div>
      </div>

      {/* --- 2. Package List Header --- */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Briefcase size={20} className="text-cyan-600" />
          <h3 className="text-lg font-heavy text-slate-800">Investment Tiers</h3>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
          <TrendingUp size={12} />
          ROI up to 3.4%
        </div>
      </div>

      {/* --- 3. Package List --- */}
      <div className="space-y-1">
        {PACKAGES.map((pkg) => (
          <PackageCard 
            key={pkg.id} 
            pkg={pkg} 
            currentLevel={user?.vipLevel || 0}
            onBuy={handleBuyClick}
          />
        ))}
      </div>

      {/* --- 4. Upgrade Modal --- */}
      <UpgradeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPurchase}
        targetPkg={selectedPkg}
        currentPkgValue={currentPkgValue}
      />

    </PageLayout>
  );
};

export default Home;