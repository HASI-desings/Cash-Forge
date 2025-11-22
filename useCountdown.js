import { useState, useEffect } from 'react';

/**
 * Custom Hook to count down to a specific date/timestamp.
 * @param {number} targetDate - The timestamp (Date.now() + duration) to count down to.
 * @returns {Object} { timeLeft, isFinished, formatTime }
 */
const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // If no target is set, do nothing
    if (!targetDate) return;

    // 1. Immediate calculation
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft(0);
        setIsFinished(true);
        return 0;
      } else {
        setTimeLeft(difference);
        setIsFinished(false);
        return difference;
      }
    };

    calculateTimeLeft();

    // 2. Interval Setup (1 second tick)
    const intervalId = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (remaining <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [targetDate]);

  /**
   * Helper to format the milliseconds into HH:MM:SS
   */
  const formatTime = () => {
    if (timeLeft <= 0) return "00:00:00";

    const seconds = Math.floor((timeLeft / 1000) % 60);
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    const hours = Math.floor((timeLeft / (1000 * 60 * 60))); // Can exceed 24h for long trades

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return { timeLeft, isFinished, formatTime };
};

export default useCountdown;