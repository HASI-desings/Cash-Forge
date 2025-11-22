// --- RUNTIME THEME CONFIGURATION ---
// Use these constants inside JS logic (Canvas, Motion Variants, Inline Styles)

export const COLORS = {
  primary: '#00FFFF',   // Cyan 500 (Brand Base)
  primaryDark: '#00CCCC', // Cyan 600 (Hover/Active)
  primaryLight: '#E0FFFF', // Cyan 100 (Backgrounds)
  
  secondary: '#FFFFFF',
  
  text: {
    main: '#1e293b',   // Slate 850 (Headings)
    body: '#475569',   // Slate 600 (Paragraphs)
    muted: '#94a3b8',  // Slate 400 (Placeholders/Disabled)
  },

  status: {
    success: '#22c55e', // Green 500
    error: '#ef4444',   // Red 500
    warning: '#f59e0b', // Amber 500
    info: '#3b82f6',    // Blue 500
  }
};

export const GRADIENTS = {
  // The Main Vertical Background (Matches global CSS)
  pageBackground: `linear-gradient(180deg, #FFFFFF 0%, #00FFFF 30%, #e0ffff 60%, #FFFFFF 100%)`,
  
  // The Header/Footer Horizontal Gradient
  header: `linear-gradient(90deg, #FFFFFF 0%, #00FFFF 50%, #FFFFFF 100%)`,
  
  // Primary Button Gradient
  buttonPrimary: `linear-gradient(to right, #00FFFF, #4DFFFF)`,
  
  // Green Action Gradient (Claim/Deposit)
  buttonSuccess: `linear-gradient(to right, #22c55e, #4ade80)`,
};

export const FONTS = {
  base: '"Inter", sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

// Animation transition defaults for Framer Motion
export const TRANSITIONS = {
  spring: { type: "spring", stiffness: 300, damping: 20 },
  smooth: { duration: 0.3, ease: "easeInOut" },
};