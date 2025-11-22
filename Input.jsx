import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = forwardRef(({ 
  label, 
  error, 
  icon: Icon, 
  type = 'text', 
  className = '', 
  containerClass = '',
  ...props 
}, ref) => {
  
  // State to handle password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  
  // Determine actual input type based on toggle state
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full ${containerClass}`}>
      
      {/* Optional Label */}
      {label && (
        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wide">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Left Icon (Optional) */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon size={20} strokeWidth={2.5} />
          </div>
        )}

        {/* The Input Field */}
        <input
          ref={ref}
          type={inputType}
          className={`
            w-full bg-slate-50/80 border-2 rounded-xl py-3.5 text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-medium transition-all duration-200 outline-none
            ${Icon ? 'pl-12' : 'pl-4'} 
            ${isPasswordType ? 'pr-12' : 'pr-4'}
            ${error 
              ? 'border-red-300 focus:border-red-500 bg-red-50/30' 
              : 'border-slate-200 focus:border-cyan-400 hover:border-cyan-200'
            }
            ${className}
          `}
          {...props}
        />

        {/* Password Toggle Button (Right) */}
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {/* Error Message Animation */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            className="flex items-center gap-1 mt-1.5 ml-1 text-xs font-bold text-red-500"
          >
            <AlertCircle size={12} />
            <span>{error.message || error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Display name for debugging
Input.displayName = 'Input';

export default Input;