import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, UploadCloud, CheckCircle2, AlertCircle, QrCode, ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../hooks/useToast';
import { APP_CONFIG, WALLET_ADDRESSES } from '../config/app-data';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const DepositProof = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addTransaction } = useUser();
  const toast = useToast();

  // Redirect if accessed directly without data
  useEffect(() => {
    if (!state?.amount || !state?.network) {
      navigate('/deposit');
    }
  }, [state, navigate]);

  const { amount, network } = state || {};
  const walletAddress = WALLET_ADDRESSES[network] || '';

  // --- State ---
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Handlers ---
  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet address copied!");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
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

    // Simulate Network Request & Transaction Creation
    setTimeout(() => {
      addTransaction({
        type: 'deposit',
        amount: parseFloat(amount),
        status: 'pending',
        method: `USDT (${network})`
      });

      setIsSubmitting(false);
      toast.success("Deposit Submitted! Awaiting approval.");
      navigate('/profile'); 
    }, 2000);
  };

  if (!amount) return null; // Prevent render flash

  return (
    <PageLayout>
      {/* Header */}
      <div className="relative text-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-0 top-1 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-heavy text-slate-800">Confirm Payment</h1>
        <p className="text-sm font-medium text-slate-500">
          Upload proof for ₨ {amount.toLocaleString()}
        </p>
      </div>

      <div className="space-y-6">
        
        {/* 1. Payment Details Card */}
        <Card className="text-center space-y-4">
          
          {/* QR Placeholder */}
          <div className="mx-auto w-48 h-48 bg-white rounded-xl border-2 border-slate-100 p-2 shadow-inner flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(#334155 2px, transparent 2px)', backgroundSize: '12px 12px' }}>
            </div>
            <QrCode size={80} className="text-slate-800 relative z-10" strokeWidth={1.5} />
            <div className="absolute bottom-2 left-0 right-0 text-[10px] font-bold text-slate-400">
              Scan via App
            </div>
          </div>

          {/* Wallet Address Display */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-left relative group">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
              Send USDT ({network}) to:
            </p>
            <p className="text-xs font-mono text-slate-700 break-all pr-8 font-bold">
              {walletAddress}
            </p>
            <button 
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors"
            >
              <Copy size={18} />
            </button>
          </div>

          {/* Warning */}
          <div className="flex gap-2 items-start text-left bg-yellow-50 p-2 rounded-lg border border-yellow-100">
            <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-yellow-700 font-medium">
              Only send USDT via the <strong>{network}</strong> network. Sending other assets may result in permanent loss.
            </p>
          </div>
        </Card>

        {/* 2. Proof Upload Area */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-6 border-2 border-dashed border-cyan-200 text-center hover:bg-cyan-50/30 transition-colors relative"
        >
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          {previewUrl ? (
            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <img src={previewUrl} alt="Proof" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold backdrop-blur-[2px]">
                Tap to change image
              </div>
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                <CheckCircle2 size={12} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mb-1">
                <UploadCloud size={24} />
              </div>
              <h3 className="font-heavy text-slate-700">Upload Receipt</h3>
              <p className="text-xs text-slate-400">
                Screenshot of successful transfer
              </p>
            </div>
          )}
        </motion.div>

        {/* 3. Action Button */}
        <Button 
          onClick={handleSubmit} 
          isLoading={isSubmitting}
          variant="primary"
          className="shadow-xl shadow-cyan-500/20"
        >
          Submit Transaction
        </Button>

      </div>
    </PageLayout>
  );
};

export default DepositProof;