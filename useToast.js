import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // --- Actions ---

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Public Interface
  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* --- Toast Container (Fixed Bottom, Above Nav) --- */}
      <div className="fixed bottom-24 left-0 right-0 pointer-events-none z-[60] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// --- Internal Component: Individual Toast Bubble ---
const ToastItem = ({ toast, onDismiss }) => {
  // Styles based on type
  const styles = {
    success: {
      bg: 'bg-slate-800/90', // Dark bg for contrast
      border: 'border-green-500',
      icon: <CheckCircle2 className="text-green-400" size={20} />,
      text: 'text-white'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      icon: <AlertCircle className="text-red-500" size={20} />,
      text: 'text-red-800'
    },
    info: {
      bg: 'bg-white/90',
      border: 'border-cyan-400',
      icon: <Info className="text-cyan-500" size={20} />,
      text: 'text-slate-800'
    }
  };

  const style = styles[toast.type] || styles.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`pointer-events-auto min-w-[280px] max-w-sm w-full backdrop-blur-md rounded-2xl shadow-xl border-l-4 p-4 flex items-center gap-3 ${style.bg} ${style.border}`}
    >
      <div className="flex-shrink-0">
        {style.icon}
      </div>
      
      <p className={`flex-grow text-sm font-heavy ${style.text}`}>
        {toast.message}
      </p>

      <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600">
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default ToastProvider;