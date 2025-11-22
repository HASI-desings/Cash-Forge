import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

import { useUser } from '../context/UserContext';
import { useToast } from '../hooks/useToast';
import { APP_CONFIG, WITHDRAW_PRESETS } from '../config/app-data';
import { formatCurrency } from '../utils/formatters';

import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Withdraw = () => {
  const navigate = useNavigate();
  const { user, addTransaction } = useUser();
  const toast = useToast();

  // --- State ---
  const [step, setStep] = useState(1); // 1 = Amount, 2 = Security
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Logic: Fees ---
  const selectedAmount = parseFloat(amount) || 0;
  const fee = selectedAmount * APP_CONFIG.WITHDRAWAL_FEE_PERCENT;
  const receiveAmount = selectedAmount - fee;

  // --- Handlers ---

  const handlePresetClick = (val) => {
    setAmount(val.toString());
  };

  const handleNext = () => {
    // Validations
    if (!amount || selectedAmount < APP_CONFIG.MIN_WITHDRAW) {
      toast.error(`Minimum withdrawal is ${formatCurrency(APP_CONFIG.MIN_WITHDRAW)}`);
      return;
    }
    if (selectedAmount > user.balance) {
      toast.error("Insufficient Balance");
      return;
    }
    
    // Logic removed: No Wager Lock check anymore
    
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pin) {
      toast.error("Please enter your PIN");
      return;
    }

    setIsSubmitting(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic PIN check (In real app, verify hash)
    if (pin.length !== 6) {
      toast.error("Invalid PIN format");
      setIsSubmitting(false);
      return;
    }

    // Process Transaction
    addTransaction({
      type: 'withdraw',
      amount: selectedAmount, // We record the full amount
      status: 'pending',
      method: 'USDT (TRC20)'
    });

    toast.success("Withdrawal request submitted!");
    navigate('/profile');
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="relative text-center mb-6">
        {step === 2 && (
          <button 
            onClick={() => setStep(1)}
            className="absolute left-0 top-1 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <h1 className="text-2xl font-heavy text-slate-800">Withdraw</h1>
        <p className="text-sm font-medium text-slate-500">
          Secure Payout Gateway
        </p>
      </div>

      <AnimatePresence mode='wait'>
        
        {/* === STEP 1: AMOUNT SELECTION === */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* 1. Balance Display Card */}
            <Card className="mb-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700 shadow-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Balance</span>
                <Wallet className="text-cyan-400" size={20} />
              </div>
              <h2 className="text-4xl font-heavy text-white mb-1">
                {formatCurrency(user.balance)}
              </h2>
              <p className="text-xs text-slate-400">
                Network: USDT (TRC20)
              </p>
            </Card>

            {/* 2. Amount Input & Presets */}
            <div className="mb-6">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {WITHDRAW_PRESETS.map((val) => (
                  <button
                    key={val}
                    onClick={() => handlePresetClick(val)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all
                      ${parseInt(amount) === val 
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-cyan-300'
                      }`}
                  >
                    {val.toLocaleString()}
                  </button>
                ))}
              </div>

              <Input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="text-lg font-bold"
                icon={Wallet}
              />
            </div>

            {/* 3. Fee Breakdown */}
            <div className="glass-panel p-4 rounded-xl mb-6 space-y-2 border-slate-200">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Request Amount</span>
                <span className="font-bold text-slate-800">{formatCurrency(selectedAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-500">
                <span>Service Fee (7%)</span>
                <span className="font-bold">- {formatCurrency(fee)}</span>
              </div>
              <div className="h-px bg-slate-200 w-full my-1"></div>
              <div className="flex justify-between text-lg font-heavy text-cyan-700">
                <span>You Receive</span>
                <span>{formatCurrency(receiveAmount)}</span>
              </div>
            </div>

            <Button onClick={handleNext}>
              Next Step <ArrowRight size={20} />
            </Button>
          </motion.div>
        )}

        {/* === STEP 2: SECURITY CHECK === */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-100">
                <ShieldCheck size={40} className="text-cyan-500" />
              </div>
              <h2 className="text-xl font-heavy text-slate-700">Security Verification</h2>
              <p className="text-slate-500 text-sm mt-1">
                Enter your 6-digit Transaction PIN to confirm withdrawal of <br/>
                <strong className="text-slate-800">{formatCurrency(receiveAmount)}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="max-w-[200px] mx-auto">
                <Input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="• • • • • •"
                  className="text-center text-3xl tracking-[0.5em] font-heavy"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 items-start justify-center text-center bg-orange-50 p-3 rounded-xl border border-orange-100">
                 <AlertCircle size={16} className="text-orange-600 mt-0.5" />
                 <p className="text-xs text-orange-800 font-medium">
                   Withdrawals are irreversible. Please ensure your receiving wallet is correct.
                 </p>
              </div>

              <Button 
                type="submit" 
                isLoading={isSubmitting} 
                variant="primary"
                className="bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/20"
              >
                Confirm Withdraw
              </Button>
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </PageLayout>
  );
};

export default Withdraw;