import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', // primary | secondary | danger | ghost
  isLoading = false, 
  disabled = false, 
  className = '',
  type = 'button',
  ...props 
}) => {

  // --- Style Variants ---
  const baseStyles = "relative w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-heavy text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:grayscale";
  
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-white shadow-lg shadow-cyan-500/30 border border-transparent",
    secondary: "bg-white text-slate-700 border-2 border-slate-100 hover:bg-slate-50 hover:border-cyan-200 shadow-sm",
    danger: "bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg shadow-red-500/30",
    ghost: "bg-transparent text-cyan-600 hover:bg-cyan-50 border border-transparent",
    glass: "bg-white/20 backdrop-blur-md border border-white/40 text-white hover:bg-white/30"
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={!(disabled || isLoading) ? { scale: 0.96 } : {}}
      className={`${baseStyles} ${selectedVariant} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;