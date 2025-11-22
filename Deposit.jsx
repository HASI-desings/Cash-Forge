import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Copy, UploadCloud, CheckCircle2, AlertCircle, QrCode, ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../hooks/useToast';
import { APP_CONFIG, WALLET_ADDRESSES } from '../config/app-data';
import { formatUSDT, shortenAddress } from '../utils/formatters';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Deposit = () => {
  const navigate = useNavigate();
  const { addTransaction } = useUser();
  const toast = useToast();

  // --- State ---
  const [step, setStep] = useState(1); // 1 = Amount, 2 = Payment
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState('TRC20'); // Default
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Calculations ---
  const usdtAmount = amount ? (parseFloat(amount) / APP_CONFIG.USDT_PKR_RATE) : 0;
  const walletAddress = WALLET_ADDRESSES[network];

  // --- Handlers ---

  const handleNext = () => {
    if (!amount || parseFloat(amount) < 500) {
      toast.error("Minimum deposit is ₨ 500");
      return;
    }
    setStep(2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet address copied!");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      // Create local preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!proofFile) {
      toast.error("Please upload the payment screenshot.");
      return;
    }

    setIsSubmitting(true);

    // Simulate Network Request
    setTimeout(() => {
      addTransaction({
        type: 'deposit',
        amount: parseFloat(amount),
        status: 'pending',
        method: `USDT (${network})`
      });

      setIsSubmitting(false);
      toast.success("Deposit Submitted! Awaiting approval.");
      navigate('/profile'); // Redirect to profile history
    }, 2000);
  };

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="relative text-center mb-8">
        {step === 2 && (
          <button 
            onClick={() => setStep(1)}
            className="absolute left-0 top-1 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <h1 className="text-2xl font-heavy text-slate-800">Deposit Funds</h1>
        <p className="text-sm font-medium text-slate-500">
          Step {step} of 2: {step === 1 ? 'Amount & Network' : 'Confirm Payment'}
        </p>
      </div>

      <AnimatePresence mode='wait'>
        
        {/* === STEP 1: CALCULATOR === */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Amount Input */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Enter Amount (PKR)</label>
              <Input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Min: 500"
                className="text-2xl font-heavy text-center text-cyan-700"
                autoFocus
              />
              
              {/* Conversion Display */}
              <div className="mt-4 flex justify-between items-center bg-cyan-50 rounded-xl p-3 border border-cyan-100">
                <span className="text-sm font-bold text-cyan-800">You Receive:</span>
                <span className="text-xl font-heavy text-cyan-600">
                  {formatUSDT(usdtAmount)}
                </span>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                Exchange Rate: 1 USDT = ₨ {APP_CONFIG.USDT_PKR_RATE}
              </p>
            </div>

            {/* Network Selection */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-3 block px-1">Select Network</label>
              <div className="grid grid-cols-2 gap-4">
                {['TRC20', 'BEP20'].map((net) => (
                  <div 
                    key={net}
                    onClick={() => setNetwork(net)}
                    className={`cursor-pointer rounded-2xl p-4 border-2 text-center transition-all relative overflow-hidden
                      ${network === net 
                        ? 'border-cyan-500 bg-white shadow-lg shadow-cyan-500/20 transform scale-105' 
                        : 'border-slate-100 bg-white/50 text-slate-400 hover:bg-white'
                      }`}
                  >
                    <span className={`font-heavy text-lg ${network === net ? 'text-cyan-700' : 'text-slate-500'}`}>
                      {net}
                    </span>
                    {network === net && (
                      <div className="absolute top-2 right-2 text-cyan-500">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleNext}>
              Next Step <ArrowRight size={20} />
            </Button>
          </motion.div>
        )}

        {/* === STEP 2: PAYMENT & PROOF === */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* QR & Address Card */}
            <Card className="text-center space-y-4">
              
              {/* QR Placeholder (Dot Pattern) */}
              <div className="mx-auto w-48 h-48 bg-white rounded-xl border-2 border-slate-100 p-2 shadow-inner flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" 
                     style={{ backgroundImage: 'radial-gradient(#334155 2px, transparent 2px)', backgroundSize: '12px 12px' }}>
                </div>
                <QrCode size={80} className="text-slate-800 relative z-10" strokeWidth={1.5} />
                
                {/* Scan Overlay Text */}
                <div className="absolute bottom-2 left-0 right-0 text-[10px] font-bold text-slate-400">
                  Scan to Pay
                </div>
              </div>

              {/* Address Display */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-left relative group">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Send USDT ({network}) to:</p>
                <p className="text-xs font-mono text-slate-700 break-all pr-8">
                  {walletAddress}
                </p>
                <button 
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>

              <div className="flex gap-2 items-start text-left bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-yellow-700 font-medium">
                  Only send USDT via {network} network. Other assets will be lost forever.
                </p>
              </div>
            </Card>

            {/* Proof Upload */}
            <div className="glass-panel rounded-2xl p-6 border-2 border-dashed border-cyan-200 text-center hover:bg-cyan-50/30 transition-colors relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {previewUrl ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                  <img src={previewUrl} alt="Proof" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">
                    Click to change
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center">
                    <UploadCloud size={24} />
                  </div>
                  <h3 className="font-heavy text-slate-700">Upload Screenshot</h3>
                  <p className="text-xs text-slate-400">Payment proof required</p>
                </div>
              )}
            </div>

            <Button 
              onClick={handleSubmit} 
              isLoading={isSubmitting}
              variant="primary"
            >
              Submit Deposit
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export default Deposit;