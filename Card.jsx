import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hoverEffect = false, 
  onClick,
  ...props 
}) => {
  return (
    <motion.div
      onClick={onClick}
      // Base styles: Glassmorphism + Rounded Corners + Default Padding
      className={`glass-panel rounded-2xl p-5 relative overflow-hidden transition-colors ${className}`}
      
      // Optional Hover Animation (Physical Lift)
      whileHover={hoverEffect ? { 
        y: -4, 
        scale: 1.01,
        borderColor: 'rgba(0, 255, 255, 0.6)' 
      } : {}}
      
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;