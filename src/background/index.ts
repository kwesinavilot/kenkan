// Background script entry point
import { StateManager } from './stateManager';
import { TTSManager } from './ttsManager';
import { MessageHandler } from './messageHandler';
import { StorageManager } from './storageManager';

console.log('Kenkan Chrome Extension background script loaded');

// Verify we're running in the correct context
if (typeof chrome === 'undefined') {
  console.error('Chrome APIs not available - extension not loaded properly');
  throw new Error('Chrome extension context not available');
}

if (typeof (globalThis as any).importScripts === 'function') {
  console.log('Running in service worker context');
} else {
  console.warn('Not running in service worker context - this may cause issues');
}

// Initialize managers
const storageManager = new StorageManager();
const stateManager = new StateManager();
const ttsManager = new TTSManager({
  enableAIEnhancement: false, // Disable by default for performance
  retryAttempts: 3,
  retryDelay: 1000
});
new MessageHandler(stateManager, ttsManager);

// Initialize storage
storageManager.initialize().catch(error => {
  console.error('Failed to initialize storage:', error);
});

// Listen for extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Kenkan Extension installed:', details.reason);

  if (details.reason === 'install') {
    console.log('First time installation - welcome to Kenkan!');

    try {
      // Load preferences from storage
      const preferences = await storageManager.getPreferences();

      // Initialize state with stored preferences
      stateManager.updateGlobalSettings({
        defaultVoice: preferences.voice,
        defaultSpeed: preferences.speed,
        defaultVolume: preferences.volume,
        defaultPitch: preferences.pitch,
        autoPlay: preferences.autoPlay,
        highlightText: preferences.highlightText
      });

      // Update statistics
      await storageManager.updateStatistics({
        lastActivity: new Date()
      });
    } catch (error) {
      console.error('Error loading preferences on install:', error);
    }
  }
});

// Set up TTS event listeners with comprehensive error handling
ttsManager.addEventListener('start', async () => {
  console.log('TTS started');

  try {
    // Update statistics
    await storageManager.updateStatistics({
      lastActivity: new Date()
    });
  } catch (error) {
    console.error('Error updating statistics on TTS start:', error);
  }
});

ttsManager.addEventListener('end', async () => {
  console.log('TTS ended');

  try {
    // Update state when TTS ends
    const activeTab = stateManager.getActiveTabState();
    if (activeTab) {
      stateManager.updateTabPlaybackState(activeTab.tabId, {
        isPlaying: false,
        isPaused: false
      });

      // Save reading progress
      if (activeTab.content) {
        await storageManager.saveProgress(activeTab.content.id, {
          url: activeTab.url,
          title: activeTab.title,
          currentSegment: activeTab.playbackState.currentSegment,
          currentPosition: activeTab.playbackState.currentPosition,
          totalSegments: activeTab.playbackState.totalSegments,
          wordCount: activeTab.content.metadata.wordCount,
          estimatedTimeRemaining: 0,
          lastRead: new Date()
        });
      }

      // Update statistics
      await storageManager.updateStatistics({
        documentsRead: (await storageManager.getStatistics()).documentsRead + 1,
        lastActivity: new Date()
      });
    }
  } catch (error) {
    console.error('Error handling TTS end:', error);
  }
});

ttsManager.addEventListener('pause', async () => {
  console.log('TTS paused');

  try {
    // Save progress when paused
    const activeTab = stateManager.getActiveTabState();
    if (activeTab?.content) {
      await storageManager.saveProgress(activeTab.content.id, {
        url: activeTab.url,
        title: activeTab.title,
        currentSegment: activeTab.playbackState.currentSegment,
        currentPosition: activeTab.playbackState.currentPosition,
        totalSegments: activeTab.playbackState.totalSegments,
        wordCount: activeTab.content.metadata.wordCount,
        estimatedTimeRemaining: (activeTab.playbackState.totalSegments - activeTab.playbackState.currentSegment) * 30, // Rough estimate
        lastRead: new Date()
      });
    }
  } catch (error) {
    console.error('Error saving progress on pause:', error);
  }
});

ttsManager.addEventListener('resume', () => {
  console.log('TTS resumed');
});

ttsManager.addEventListener('boundary', async (event) => {
  try {
    // Update current position and save progress periodically
    const activeTab = stateManager.getActiveTabState();
    if (activeTab) {
      stateManager.updateTabPlaybackState(activeTab.tabId, {
        currentPosition: event.charIndex || 0
      });

      // Send progress update to content script
      const progress = activeTab.playbackState.totalSegments > 0 
        ? (activeTab.playbackState.currentSegment / activeTab.playbackState.totalSegments) * 100 
        : 0;

      chrome.tabs.sendMessage(activeTab.tabId, {
        action: 'updateProgress',
        data: {
          currentSegment: activeTab.playbackState.currentSegment,
          totalSegments: activeTab.playbackState.totalSegments,
          progress
        }
      }).catch(() => {
        // Ignore if content script is not available
      });

      // Save progress every 100 boundary events (reduced frequency)
      if ((event.charIndex || 0) % 100 === 0 && activeTab.content) {
        await storageManager.saveProgress(activeTab.content.id, {
          url: activeTab.url,
          title: activeTab.title,
          currentSegment: activeTab.playbackState.currentSegment,
          currentPosition: event.charIndex || 0,
          totalSegments: activeTab.playbackState.totalSegments,
          wordCount: activeTab.content.metadata.wordCount,
          estimatedTimeRemaining: (activeTab.playbackState.totalSegments - activeTab.playbackState.currentSegment) * 30,
          lastRead: new Date()
        });
      }
    }
  } catch (error) {
    console.error('Error handling boundary event:', error);
  }
});

ttsManager.setErrorCallback(async (error) => {
  console.error('TTS Error:', error);

  try {
    // Update state on error
    const activeTab = stateManager.getActiveTabState();
    if (activeTab) {
      stateManager.updateTabPlaybackState(activeTab.tabId, {
        isPlaying: false,
        isPaused: false
      });

      // Send error notification to content script
      chrome.tabs.sendMessage(activeTab.tabId, {
        action: 'ttsError',
        data: { error: error.message }
      }).catch(() => {
        // Ignore if content script is not available
      });
    }
  } catch (handlingError) {
    console.error('Error handling TTS error:', handlingError);
  }
});

// Periodic maintenance tasks
setInterval(async () => {
  try {
    // Clean up old tabs
    stateManager.cleanupOldTabs();

    // Clean up old progress data (older than 30 days)
    const removedCount = await storageManager.cleanupOldProgress();
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old progress entries`);
    }
  } catch (error) {
    console.error('Error in periodic cleanup:', error);
  }
}, 60 * 60 * 1000); // Every hour

// Health check and statistics logging (reduced frequency)
setInterval(async () => {
  try {
    const stats = stateManager.getStats();
    const ttsHealth = await ttsManager.getHealthStatus();
    const storageInfo = await storageManager.getStorageInfo();

    // Only log if there are issues or significant activity
    if (!ttsHealth.isHealthy || storageInfo.percentUsed > 80 || stats.playingTabs > 0) {
      console.log('System Health Check:', {
        stateStats: stats,
        ttsHealth: ttsHealth.isHealthy,
        storageUsed: `${storageInfo.percentUsed.toFixed(1)}%`
      });

      // Warn if storage is getting full
      if (storageInfo.percentUsed > 80) {
        console.warn('Storage usage is high:', storageInfo);
      }

      // Warn if TTS is unhealthy
      if (!ttsHealth.isHealthy) {
        console.warn('TTS system is unhealthy:', ttsHealth.errors);
      }
    }
  } catch (error) {
    console.error('Error in health check:', error);
  }
}, 15 * 60 * 1000); // Every 15 minutes (reduced from 5)

// Listen for storage changes and sync with state
storageManager.addChangeListener((changes) => {
  try {
    if (changes.preferences) {
      const newPrefs = changes.preferences.newValue;
      if (newPrefs) {
        stateManager.updateGlobalSettings({
          defaultVoice: newPrefs.voice,
          defaultSpeed: newPrefs.speed,
          defaultVolume: newPrefs.volume,
          defaultPitch: newPrefs.pitch,
          autoPlay: newPrefs.autoPlay,
          highlightText: newPrefs.highlightText
        });
      }
    }
  } catch (error) {
    console.error('Error handling storage changes:', error);
  }
});

// Global error handler for service worker
self.addEventListener('error', (event) => {
  console.error('Unhandled error in background script:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in background script:', event.reason);
});

export { };