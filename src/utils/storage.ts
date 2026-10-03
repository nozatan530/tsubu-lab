import { UserProgress } from '../types';

const STORAGE_KEY = 'tsubu_lab_progress_v1';

const DEFAULT_PROGRESS: UserProgress = {
  completedMissions: {},
  unlockedCards: ['H2O', 'NaCl'], // default initial unlocked cards
  hasSeenMoleAnalogy: false,
};

// In-memory fallback if localStorage is disabled or in private mode with blocked storage
let inMemoryProgress: UserProgress = { ...DEFAULT_PROGRESS };

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...inMemoryProgress };
    const parsed = JSON.parse(raw) as UserProgress;
    return {
      completedMissions: parsed.completedMissions || {},
      unlockedCards: Array.isArray(parsed.unlockedCards) && parsed.unlockedCards.length > 0
        ? parsed.unlockedCards
        : ['H2O', 'NaCl'],
      hasSeenMoleAnalogy: !!parsed.hasSeenMoleAnalogy,
    };
  } catch (e) {
    console.warn('localStorage not available, using in-memory state:', e);
    return { ...inMemoryProgress };
  }
}

export function saveUserProgress(progress: UserProgress): void {
  inMemoryProgress = { ...progress };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export function resetAllUserProgress(): UserProgress {
  const resetState: UserProgress = {
    completedMissions: {},
    unlockedCards: ['H2O', 'NaCl'],
    hasSeenMoleAnalogy: false,
  };
  inMemoryProgress = { ...resetState };
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear localStorage:', e);
  }
  return resetState;
}
