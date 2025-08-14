export interface UserPreferences {
  voice: string;
  speed: number;
  volume: number;
  pitch: number;
  autoPlay: boolean;
  highlightText: boolean;
  theme: 'light' | 'dark' | 'auto';
  keyboardShortcuts: boolean;
}

export interface ReadingProgress {
  contentId: string;
  url: string;
  title: string;
  currentSegment: number;
  currentPosition: number;
  totalSegments: number;
  lastRead: Date;
  wordCount: number;
  estimatedTimeRemaining: number;
}

export interface StorageData {
  preferences: UserPreferences;
  progress: Record<string, ReadingProgress>;
  statistics: {
    totalWordsRead: number;
    totalTimeListened: number;
    documentsRead: number;
    lastActivity: Date;
  };
}

export class StorageManager {
  private defaultPreferences: UserPreferences = {
    voice: '',
    speed: 1.0,
    volume: 1.0,
    pitch: 1.0,
    autoPlay: false,
    highlightText: true,
    theme: 'auto',
    keyboardShortcuts: true
  };

  private defaultStatistics = {
    totalWordsRead: 0,
    totalTimeListened: 0,
    documentsRead: 0,
    lastActivity: new Date()
  };

  /**
   * Initialize storage with default values
   */
  async initialize(): Promise<void> {
    try {
      const stored = await this.getStoredData();
      
      // Initialize preferences if not exists
      if (!stored.preferences) {
        await this.savePreferences(this.defaultPreferences);
      }

      // Initialize statistics if not exists
      if (!stored.statistics) {
        await this.saveStatistics(this.defaultStatistics);
      }

      console.log('Storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  /**
   * Get all stored data
   */
  private async getStoredData(): Promise<Partial<StorageData>> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(null, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result as Partial<StorageData>);
        }
      });
    });
  }

  /**
   * Save user preferences
   */
  async savePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...preferences };
      
      // Validate preferences
      this.validatePreferences(updated);

      await this.setStorageData({ preferences: updated });
      console.log('Preferences saved:', updated);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    try {
      const stored = await this.getStoredData();
      return { ...this.defaultPreferences, ...stored.preferences };
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return this.defaultPreferences;
    }
  }

  /**
   * Save reading progress for a document
   */
  async saveProgress(contentId: string, progress: Omit<ReadingProgress, 'contentId'>): Promise<void> {
    try {
      const stored = await this.getStoredData();
      const allProgress = stored.progress || {};
      
      allProgress[contentId] = {
        contentId,
        ...progress,
        lastRead: new Date()
      };

      await this.setStorageData({ progress: allProgress });
      console.log('Progress saved for:', contentId);
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw error;
    }
  }

  /**
   * Get reading progress for a document
   */
  async getProgress(contentId: string): Promise<ReadingProgress | null> {
    try {
      const stored = await this.getStoredData();
      const progress = stored.progress?.[contentId];
      
      if (progress) {
        // Convert date string back to Date object
        progress.lastRead = new Date(progress.lastRead);
        return progress;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get progress:', error);
      return null;
    }
  }

  /**
   * Get all reading progress
   */
  async getAllProgress(): Promise<ReadingProgress[]> {
    try {
      const stored = await this.getStoredData();
      const allProgress = stored.progress || {};
      
      return Object.values(allProgress).map(progress => ({
        ...progress,
        lastRead: new Date(progress.lastRead)
      }));
    } catch (error) {
      console.error('Failed to get all progress:', error);
      return [];
    }
  }

  /**
   * Remove reading progress for a document
   */
  async removeProgress(contentId: string): Promise<void> {
    try {
      const stored = await this.getStoredData();
      const allProgress = stored.progress || {};
      
      delete allProgress[contentId];
      
      await this.setStorageData({ progress: allProgress });
      console.log('Progress removed for:', contentId);
    } catch (error) {
      console.error('Failed to remove progress:', error);
      throw error;
    }
  }

  /**
   * Clean up old progress data
   */
  async cleanupOldProgress(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    try {
      const stored = await this.getStoredData();
      const allProgress = stored.progress || {};
      const now = new Date();
      let removedCount = 0;

      const cleanedProgress: Record<string, ReadingProgress> = {};

      for (const [contentId, progress] of Object.entries(allProgress)) {
        const lastRead = new Date(progress.lastRead);
        const age = now.getTime() - lastRead.getTime();
        
        if (age <= maxAge) {
          cleanedProgress[contentId] = progress;
        } else {
          removedCount++;
        }
      }

      if (removedCount > 0) {
        await this.setStorageData({ progress: cleanedProgress });
        console.log(`Cleaned up ${removedCount} old progress entries`);
      }

      return removedCount;
    } catch (error) {
      console.error('Failed to cleanup old progress:', error);
      return 0;
    }
  }

  /**
   * Update statistics
   */
  async updateStatistics(updates: Partial<StorageData['statistics']>): Promise<void> {
    try {
      const current = await this.getStatistics();
      const updated = { 
        ...current, 
        ...updates,
        lastActivity: new Date()
      };

      await this.saveStatistics(updated);
    } catch (error) {
      console.error('Failed to update statistics:', error);
      throw error;
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<StorageData['statistics']> {
    try {
      const stored = await this.getStoredData();
      const stats = stored.statistics || this.defaultStatistics;
      
      // Convert date string back to Date object
      if (typeof stats.lastActivity === 'string') {
        stats.lastActivity = new Date(stats.lastActivity);
      }
      
      return stats;
    } catch (error) {
      console.error('Failed to get statistics:', error);
      return this.defaultStatistics;
    }
  }

  /**
   * Save statistics
   */
  private async saveStatistics(statistics: StorageData['statistics']): Promise<void> {
    await this.setStorageData({ statistics });
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{
    bytesInUse: number;
    quotaBytes: number;
    percentUsed: number;
  }> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.getBytesInUse(null, (bytesInUse) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          const quotaBytes = chrome.storage.sync.QUOTA_BYTES;
          const percentUsed = (bytesInUse / quotaBytes) * 100;
          
          resolve({
            bytesInUse,
            quotaBytes,
            percentUsed
          });
        }
      });
    });
  }

  /**
   * Export all data for backup
   */
  async exportData(): Promise<StorageData> {
    try {
      const stored = await this.getStoredData();
      return {
        preferences: stored.preferences || this.defaultPreferences,
        progress: stored.progress || {},
        statistics: stored.statistics || this.defaultStatistics
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Import data from backup
   */
  async importData(data: Partial<StorageData>): Promise<void> {
    try {
      // Validate imported data
      if (data.preferences) {
        this.validatePreferences(data.preferences);
      }

      await this.setStorageData(data);
      console.log('Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  /**
   * Clear all stored data
   */
  async clearAllData(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.clear(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log('All storage data cleared');
          resolve();
        }
      });
    });
  }

  /**
   * Set data in storage
   */
  private async setStorageData(data: Partial<StorageData>): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Validate user preferences
   */
  private validatePreferences(preferences: UserPreferences): void {
    if (preferences.speed < 0.1 || preferences.speed > 10) {
      throw new Error('Speed must be between 0.1 and 10');
    }
    
    if (preferences.volume < 0 || preferences.volume > 1) {
      throw new Error('Volume must be between 0 and 1');
    }
    
    if (preferences.pitch < 0 || preferences.pitch > 2) {
      throw new Error('Pitch must be between 0 and 2');
    }

    if (!['light', 'dark', 'auto'].includes(preferences.theme)) {
      throw new Error('Theme must be light, dark, or auto');
    }
  }

  /**
   * Add storage change listener
   */
  addChangeListener(callback: (changes: Record<string, chrome.storage.StorageChange>) => void): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        callback(changes);
      }
    });
  }
}