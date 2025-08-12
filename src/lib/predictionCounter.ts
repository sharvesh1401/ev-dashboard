// Prediction counter utility
const STORAGE_KEY = 'ecoamp_prediction_count';

export const getPredictionCount = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 1000;
  } catch {
    return 1000;
  }
};

export const incrementPredictionCount = (): number => {
  try {
    const current = getPredictionCount();
    const newCount = current + 1;
    localStorage.setItem(STORAGE_KEY, newCount.toString());
    return newCount;
  } catch {
    return getPredictionCount();
  }
};

export const formatCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M+`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K+`;
  return `${count}+`;
};