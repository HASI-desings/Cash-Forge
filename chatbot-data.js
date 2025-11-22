import { APP_CONFIG } from './app-data';

// --- CONFIGURATION ---
export const CHAT_CONFIG = {
  botName: "CashForge AI",
  typingDelay: 1500, // ms to simulate thinking
  initialGreeting: "Hello! I am your automated assistant. How can I help you with your investment today?",
};

// --- KNOWLEDGE BASE ---
// Categories with keywords and specific answers
const KNOWLEDGE_BASE = [
  {
    id: 'deposit',
    keywords: ['deposit', 'recharge', 'add', 'money', 'usdt', 'trc20', 'bep20', 'rate', 'account'],
    response: `To deposit funds, go to the Deposit page. We accept USDT (TRC20 & BEP20). The current exchange rate is 1 USDT = ${APP_CONFIG.USDT_PKR_RATE} PKR. Your balance will update automatically after you submit the transaction proof.`
  },
  {
    id: 'withdraw',
    keywords: ['withdraw', 'payout', 'cash', 'out', 'receive', 'fee', 'tax', 'pending'],
    response: `Withdrawals are processed within 24 hours. Please note there is a fixed transaction fee of ${APP_CONFIG.WITHDRAWAL_FEE_PERCENT * 100}% on all withdrawals. Ensure your Total Wagered amount matches your Total Deposited amount to unlock withdrawals.`
  },
  {
    id: 'tasks',
    keywords: ['task', 'work', 'daily', 'income', 'ads', 'click', 'earn', 'time'],
    response: "Daily tasks take approximately 75 seconds to complete. You must complete all tasks to claim your full daily income. Remember: Tasks reset every 24 hours at midnight server time."
  },
  {
    id: 'weekend',
    keywords: ['weekend', 'saturday', 'sunday', 'closed', 'lock', 'shield', 'open'],
    response: "Markets are closed on Weekends (Saturday & Sunday). During this time, the Task system is paused to simulate real-world market closures. You can still deposit, withdraw, or use the Lucky Wheel."
  },
  {
    id: 'vip',
    keywords: ['vip', 'upgrade', 'package', 'level', 'plan', 'cost', 'price', 'roi'],
    response: "You can upgrade your package at any time! You only pay the difference between your current package and the new one. Higher tiers unlock significantly higher Daily ROI."
  },
  {
    id: 'referral',
    keywords: ['invite', 'refer', 'friend', 'team', 'salary', 'commission', 'link'],
    response: "Invite friends to earn huge rewards! We offer a Monthly Salary system starting from VIP 5 (50 active referrals). Check the 'Teams' page for your unique link and progress tracking."
  },
  {
    id: 'rewards',
    keywords: ['spin', 'wheel', 'lucky', 'key', 'bronze', 'gold', 'diamond', 'prize'],
    response: "You need Keys to spin the Lucky Wheels. Keys are earned by upgrading your package or reaching specific referral milestones. Prizes are credited to your balance immediately."
  },
  {
    id: 'trade',
    keywords: ['trade', 'trading', 'invest', 'min', 'max', 'booster', 'crypto'],
    response: "Pro Trading allows you to lock funds for a specific duration (Day, Week, Month) to earn extra returns. You can only have one active trade position at a time."
  }
];

const FALLBACK_RESPONSES = [
  "I'm not sure I understand. Could you please rephrase that?",
  "I can help with Deposits, Withdrawals, Tasks, or VIP upgrades. What do you need?",
  "Could you be more specific? I'm an AI trained on CashForge policies.",
];

// --- LOGIC ENGINE ---
export const findBotResponse = (input) => {
  const lowerInput = input.toLowerCase();
  
  // 1. Score each category based on keyword matches
  let bestMatch = null;
  let maxScore = 0;

  KNOWLEDGE_BASE.forEach(category => {
    let score = 0;
    category.keywords.forEach(word => {
      if (lowerInput.includes(word)) {
        score++;
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestMatch = category;
    }
  });

  // 2. Return best match or random fallback
  if (bestMatch && maxScore > 0) {
    return bestMatch.response;
  } else {
    const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
    return FALLBACK_RESPONSES[randomIndex];
  }
};