import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Globe, Lock, Mail, ArrowRight, Check, X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { validateEmail, validatePassword, analyzePasswordStrength } from '../utils/validators';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const passwordValue = watch('password', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    // Simulate API Network Delay
    setTimeout(() => {
      login(data.email, data.password);
      setIsLoading(false);
      navigate('/'); // Go to Home after login
    }, 1500);
  };

  // Password Strength Visualizer
  const strength = analyzePasswordStrength(passwordValue);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-cyan-50 to-cyan-100 z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4 transform rotate-3">
            <Globe className="text-white" size={32} strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-heavy text-slate-800 tracking-tight">CashForge</h1>
          <p className="text-slate-500 font-medium text-sm">Secure Crypto Investment</p>
        </div>

        {/* Toggle Switch */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            icon={Mail}
            placeholder="name@gmail.com"
            {...register('email', { validate: validateEmail })}
            error={errors.email}
          />
          
          <div className="relative">
            <Input 
              type="password"
              icon={Lock}
              placeholder="Password"
              {...register('password', { validate: isLogin ? undefined : validatePassword })}
              error={errors.password}
            />
          </div>

          {/* Sign Up Password Rules */}
          {!isLogin && passwordValue && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-slate-50 p-3 rounded-xl space-y-2 overflow-hidden"
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase">Password Requirements</p>
              <div className="grid grid-cols-2 gap-2">
                <Rule label="8+ Chars" valid={strength.length} />
                <Rule label="Uppercase" valid={strength.uppercase} />
                <Rule label="Lowercase" valid={strength.lowercase} />
                <Rule label="Number" valid={strength.number} />
                <Rule label="Symbol" valid={strength.special} />
              </div>
            </motion.div>
          )}

          <Button 
            type="submit" 
            isLoading={isLoading} 
            variant="primary"
            className="w-full py-4 text-lg shadow-xl shadow-cyan-500/20"
          >
            {isLogin ? 'Access Account' : 'Create Account'} <ArrowRight size={20} />
          </Button>
        </form>

      </motion.div>
    </div>
  );
};

const Rule = ({ label, valid }) => (
  <div className={`flex items-center gap-1.5 text-xs font-bold ${valid ? 'text-green-600' : 'text-slate-400'}`}>
    {valid ? <Check size={12} /> : <X size={12} />}
    <span>{label}</span>
  </div>
);

export default Auth;