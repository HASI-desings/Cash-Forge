import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  icon: Icon,
  className = '' 
}) => {

  // --- Effect: Lock Body Scroll ---
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // --- Animation Variants ---
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", duration: 0.5, bounce: 0.3 }
    },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
  };

  // Render via Portal to ensure it sits on top of everything (Z-Index 100)
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          
          {/* 1. Backdrop (Click to Close) */}
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* 2. Modal Panel */}
          <motion.div
            className={`relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-cyan-200 ${className}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Header (Optional) */}
            {(title || Icon) && (
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  {Icon && (
                    <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg">
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                  )}
                  {title && (
                    <h3 className="text-lg font-heavy text-slate-800">{title}</h3>
                  )}
                </div>
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
            )}

            {/* No Header Close Button (Absolute) */}
            {!title && !Icon && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white text-slate-500 rounded-full backdrop-blur-md transition-colors shadow-sm"
              >
                <X size={18} />
              </button>
            )}

            {/* Body Content */}
            <div className="p-5">
              {children}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body // Mounts to body tag
  );
};

export default Modal;