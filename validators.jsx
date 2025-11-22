/**
 * Strict Email Validator
 * Requirement: Must end in @gmail.com
 */
export const validateEmail = (email) => {
  if (!email) return "Email is required";
  
  // Standard format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  // Specific Domain Restriction
  if (!email.endsWith('@gmail.com')) {
    return "Only @gmail.com addresses are allowed";
  }

  return true; // Valid
};

/**
 * Complex Password Validator
 * Requirement: 8+ chars, Uppercase, Lowercase, Digit, Special Char
 * Returns: true (if valid) || Error Message string
 */
export const validatePassword = (password) => {
  if (!password) return "Password is required";

  if (password.length < 8) return "Must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Must contain an Uppercase letter";
  if (!/[a-z]/.test(password)) return "Must contain a Lowercase letter";
  if (!/[0-9]/.test(password)) return "Must contain a Number";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Must contain a Special Character (!@#$...)";

  return true;
};

/**
 * Password Strength Analyzer (For UI Feedback)
 * Usage: Returns object with boolean status for each rule
 */
export const analyzePasswordStrength = (password = '') => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

/**
 * Transaction Password / PIN Validator
 * Requirement: Usually 6 digits
 */
export const validateTransactionPin = (pin) => {
  if (!pin) return "Transaction PIN is required";
  
  // Check if it's exactly 6 digits
  const pinRegex = /^\d{6}$/;
  
  if (!pinRegex.test(pin)) {
    return "PIN must be exactly 6 digits";
  }

  return true;
};

/**
 * Wallet Address Validator (Basic Format Check)
 */
export const validateWalletAddress = (address, network) => {
  if (!address) return "Wallet address is required";

  if (network === 'TRC20') {
    // TRON addresses start with T and are 34 chars long
    if (!address.startsWith('T') || address.length !== 34) {
      return "Invalid TRC20 Address (Must start with T)";
    }
  }

  if (network === 'BEP20') {
    // BSC addresses start with 0x and are 42 chars long
    if (!address.startsWith('0x') || address.length !== 42) {
      return "Invalid BEP20 Address (Must start with 0x)";
    }
  }

  return true;
};