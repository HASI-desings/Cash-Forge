import React from 'react';
import { motion } from 'framer-motion';

const PageLayout = ({ children, className = "" }) => {
  return (
    <motion.div
      // Page Transition Animation
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      
      // Layout Formatting
      // pt-20: Clears the fixed Header (h-16) + spacing
      // pb-32: Clears the fixed BottomNav + Footer + spacing
      className={`w-full max-w-md mx-auto px-4 pt-20 pb-32 min-h-screen flex flex-col ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageLayout;