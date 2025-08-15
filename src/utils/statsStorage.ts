// Central storage system for reading statistics
export interface ReadingStats {
  todayReadingTime: number; // in seconds
  totalDocumentsRead: number;
  lastResetDate: string; // ISO date string for daily reset
  currentSessionStart?: number; // timestamp when current reading session started
}

const STATS_STORAGE_KEY = 'kenkan-reading-stats';

// Get today's date as YYYY-MM-DD string
const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Load stats from localStorage
export const loadReadingStats = (): ReadingStats => {
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (!stored) {
      return getDefaultStats();
    }

    const stats: ReadingStats = JSON.parse(stored);
    const today = getTodayDateString();
    
    // Reset daily stats if it's a new day
    if (stats.lastResetDate !== today) {
      return {
        ...stats,
        todayReadingTime: 0,
        lastResetDate: today,
        currentSessionStart: undefined
      };
    }

    return stats;
  } catch (error) {
    console.error('Error loading reading stats:', error);
    return getDefaultStats();
  }
};

// Save stats to localStorage
export const saveReadingStats = (stats: ReadingStats): void => {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving reading stats:', error);
  }
};

// Get default stats structure
const getDefaultStats = (): ReadingStats => ({
  todayReadingTime: 0,
  totalDocumentsRead: 0,
  lastResetDate: getTodayDateString(),
  currentSessionStart: undefined
});

// Start a reading session
export const startReadingSession = (): ReadingStats => {
  const stats = loadReadingStats();
  const updatedStats = {
    ...stats,
    currentSessionStart: Date.now()
  };
  saveReadingStats(updatedStats);
  return updatedStats;
};

// End a reading session and add time to today's total
export const endReadingSession = (): ReadingStats => {
  const stats = loadReadingStats();
  
  if (stats.currentSessionStart) {
    const sessionDuration = Math.floor((Date.now() - stats.currentSessionStart) / 1000);
    const updatedStats = {
      ...stats,
      todayReadingTime: stats.todayReadingTime + sessionDuration,
      currentSessionStart: undefined
    };
    saveReadingStats(updatedStats);
    return updatedStats;
  }
  
  return stats;
};

// Increment document count when a new document is read
export const incrementDocumentCount = (): ReadingStats => {
  const stats = loadReadingStats();
  const updatedStats = {
    ...stats,
    totalDocumentsRead: stats.totalDocumentsRead + 1
  };
  saveReadingStats(updatedStats);
  return updatedStats;
};

// Format time in seconds to human readable format
export const formatReadingTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

// Get current session duration (for real-time display)
export const getCurrentSessionDuration = (): number => {
  const stats = loadReadingStats();
  if (stats.currentSessionStart) {
    return Math.floor((Date.now() - stats.currentSessionStart) / 1000);
  }
  return 0;
};