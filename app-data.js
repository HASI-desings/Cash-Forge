// --- GLOBAL ECONOMY CONSTANTS ---
export const APP_CONFIG = {
  USDT_PKR_RATE: 285,
  WITHDRAWAL_FEE_PERCENT: 0.07, // 7%
  MIN_WITHDRAW: 500,
  CURRENCY_SYMBOL: '₨',
  SUPPORT_WHATSAPP: 'https://wa.me/1234567890', // Placeholder
  SUPPORT_TELEGRAM: 'https://t.me/cashforge_official', // Placeholder
};

// --- WALLET ADDRESSES (SYSTEM) ---
export const WALLET_ADDRESSES = {
  TRC20: "TAjyw8fVP8dkXJjqFE3vNMBWGaNz5sRbeG",
  BEP20: "0x216c7d58c3F07428D3c1Be3762F402f71b43Eb56"
};

// --- WITHDRAWAL PRESETS ---
export const WITHDRAW_PRESETS = [
  500, 2500, 10000, 25000, 65000, 150000, 400000, 850000
];

// --- INVESTMENT PACKAGES ---
export const PACKAGES = [
  {
    id: 1,
    key: 'basic',
    level: 1,
    name: "Basic",
    investment: 900,
    dailyIncome: 35,
    tasks: ["Process basic market data", "Verify transactional records"]
  },
  {
    id: 2,
    key: 'standard',
    level: 2,
    name: "Standard",
    investment: 3900,
    dailyIncome: 135,
    tasks: ["Process intermediate market data", "Analyze asset performance"]
  },
  {
    id: 3,
    key: 'advanced',
    level: 3,
    name: "Advanced",
    investment: 8900,
    dailyIncome: 300,
    tasks: ["Process advanced market data", "Review encrypted financial reports", "Execute complex algorithm"]
  },
  {
    id: 4,
    key: 'pro',
    level: 4,
    name: "Pro",
    investment: 18500,
    dailyIncome: 620,
    tasks: ["Process high-frequency trading data", "Analyze derivative contracts", "Optimize portfolio allocation"]
  },
  {
    id: 5,
    key: 'premium',
    level: 5,
    name: "Premium",
    investment: 32500,
    dailyIncome: 1100,
    tasks: ["Process institutional trade data", "Deconstruct market trends", "Backtest advanced strategies", "Verify data integrity"]
  },
  {
    id: 6,
    key: 'supreme',
    level: 6,
    name: "Supreme",
    investment: 54900,
    dailyIncome: 2000,
    tasks: ["Process large-scale market data", "Analyze macroeconomic indicators", "Simulate hedge fund operations", "Review risk models"]
  },
  {
    id: 7,
    key: 'elite',
    level: 7,
    name: "Elite",
    investment: 112000,
    dailyIncome: 3900,
    tasks: ["Process proprietary financial data", "Model geopolitical market impact", "Run AI-driven portfolio analysis", "Audit smart contracts", "Finalize ledger entries"]
  },
  {
    id: 8,
    key: 'ultimate',
    level: 8,
    name: "Ultimate",
    investment: 250000,
    dailyIncome: 8500,
    tasks: ["Process global market data stream", "Synthesize cross-asset correlations", "Stress-test algorithmic models", "Verify international transactions", "Analyze dark pool liquidity", "Execute quantum computing simulation"]
  }
];

// --- PRO TRADING TIERS ---
export const TRADES = [
  {
    id: 'daily',
    name: "Day Trading",
    min: 3000,
    max: 80000,
    duration: 24, // Hours
    returnPercentage: 0.03 // 3%
  },
  {
    id: 'weekly',
    name: "Weekly Booster",
    min: 15000,
    max: 250000,
    duration: 168, // 7 Days * 24
    returnPercentage: 0.25 // 25%
  },
  {
    id: 'monthly',
    name: "Monthly Mega",
    min: 250000,
    max: 1000000,
    duration: 720, // 30 Days * 24
    returnPercentage: 3.5 // 350% (3.5x)
  }
];

// --- LUCKY WHEEL PRIZES ---
export const WHEEL_PRIZES = {
  bronze: [50, 10, 100, 20, 150, 10, 200, 30],
  gold: [300, 50, 500, 100, 750, 150, 1000, 200],
  diamond: [1500, 500, 2500, 750, 3500, 1000, 5000, 1250]
};

// --- AFFILIATE SALARY TIERS ---
// Note: Ordered from lowest requirement to highest for UI rendering logic
export const SALARY_TIERS = [
  { vip: 5, req: 50, salary: 12000 },
  { vip: 4, req: 180, salary: 50000 },
  { vip: 3, req: 300, salary: 120000 },
  { vip: 2, req: 500, salary: 480000 },
  { vip: 1, req: 1500, salary: 1000000 }
];