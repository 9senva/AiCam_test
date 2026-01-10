import { useState, useRef, useEffect } from 'react';

/**
 * 计时器 Hook
 * 提供简单的计时功能，精确到秒
 */
export const useTimer = () => {
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimer(0);
  };

  // 自动清理
  useEffect(() => {
    return () => stopTimer();
  }, []);

  return { timer, startTimer, stopTimer, resetTimer };
};
