import { APP_CONFIG } from '../config/app-data';

/**
 * Formats a number into the PKR Currency string.
 * Usage: formatCurrency(12000) -> "₨ 12,000"
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₨ 0';
  
  // Create the number formatter
  const formatter = new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `${APP_CONFIG.CURRENCY_SYMBOL} ${formatter.format(amount)}`;
};

/**
 * Formats a number into USDT string.
 * Usage: formatUSDT(10.5) -> "10.50 USDT"
 */
export const formatUSDT = (amount) => {
  if (amount === undefined || amount === null) return '0.00 USDT';
  
  return `${Number(amount).toFixed(2)} USDT`;
};

/**
 * Shortens a wallet address or ID for display.
 * Usage: shortenAddress("TTr7...99x") -> "TTr7...99x"
 */
export const shortenAddress = (address, start = 6, end = 4) => {
  if (!address) return '';
  if (address.length <= start + end) return address;
  
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

/**
 * Formats a date string into a readable "Month Day, Time" format.
 * Usage: formatDate("2025-11-20T10:00:00") -> "Nov 20, 10:00 AM"
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

/**
 * Formats a date to just the day name (for Weekend checks).
 * Usage: getDayName(new Date()) -> "Sunday"
 */
export const getDayName = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
};