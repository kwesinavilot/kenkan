import type { PlaybackState } from '../types/tts';
import type { TextContent } from '../types/content';

export interface TabState {
  tabId: number;
  url: string;
  title: string;
  content?: TextContent;
  playbackState: PlaybackState;
  lastActivity: Date;
  isActive: boolean;
}

export interface GlobalState {
  activeTabId: number | null;
  tabs: Map<number, TabState>;
  globalSettings: {
    defaultVoice: string;
    defaultSpeed: number;
    defaultVolume: number;
    defaultPitch: number;
    autoPlay: boolean;
    highlightText: boolean;
  };
}

export class StateManager {
  private state: GlobalState;
  private listeners: Set<(state: GlobalState) => void> = new Set();

  constructor() {
    this.state = {
      activeTabId: null,
      tabs: new Map(),
      globalSettings: {
        defaultVoice: '',
        defaultSpeed: 1.0,
        defaultVolume: 1.0,
        defaultPitch: 1.0,
        autoPlay: false,
        highlightText: true
      }
    };

    this.initializeListeners();
  }

  private initializeListeners(): void {
    // Listen for tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.updateTabInfo(tabId, {
          url: tab.url,
          title: tab.title || 'Untitled',
          lastActivity: new Date()
        });
      }
    });

    // Listen for tab activation
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.setActiveTab(activeInfo.tabId);
    });

    // Listen for tab removal
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.removeTab(tabId);
    });

    // Listen for window focus changes
    chrome.windows.onFocusChanged.addListener((windowId) => {
      if (windowId !== chrome.windows.WINDOW_ID_NONE) {
        chrome.tabs.query({ active: true, windowId }, (tabs) => {
          if (tabs[0]) {
            this.setActiveTab(tabs[0].id!);
          }
        });
      }
    });
  }

  /**
   * Get current global state
   */
  getState(): GlobalState {
    return { ...this.state };
  }

  /**
   * Get state for specific tab
   */
  getTabState(tabId: number): TabState | null {
    return this.state.tabs.get(tabId) || null;
  }

  /**
   * Get active tab state
   */
  getActiveTabState(): TabState | null {
    if (!this.state.activeTabId) return null;
    return this.getTabState(this.state.activeTabId);
  }

  /**
   * Set active tab
   */
  setActiveTab(tabId: number): void {
    // Deactivate previous tab
    if (this.state.activeTabId) {
      const prevTab = this.state.tabs.get(this.state.activeTabId);
      if (prevTab) {
        prevTab.isActive = false;
      }
    }

    // Activate new tab
    this.state.activeTabId = tabId;
    let tabState = this.state.tabs.get(tabId);

    if (!tabState) {
      // Create new tab state
      tabState = this.createDefaultTabState(tabId);
      this.state.tabs.set(tabId, tabState);
    }

    tabState.isActive = true;
    tabState.lastActivity = new Date();

    this.notifyListeners();
  }

  /**
   * Update tab information
   */
  updateTabInfo(tabId: number, updates: Partial<Pick<TabState, 'url' | 'title' | 'lastActivity'>>): void {
    let tabState = this.state.tabs.get(tabId);

    if (!tabState) {
      tabState = this.createDefaultTabState(tabId);
      this.state.tabs.set(tabId, tabState);
    }

    Object.assign(tabState, updates);
    this.notifyListeners();
  }

  /**
   * Update tab content
   */
  updateTabContent(tabId: number, content: TextContent): void {
    let tabState = this.state.tabs.get(tabId);

    if (!tabState) {
      tabState = this.createDefaultTabState(tabId);
      this.state.tabs.set(tabId, tabState);
    }

    tabState.content = content;
    tabState.lastActivity = new Date();
    this.notifyListeners();
  }

  /**
   * Update tab playback state
   */
  updateTabPlaybackState(tabId: number, playbackState: Partial<PlaybackState>): void {
    const tabState = this.state.tabs.get(tabId);
    if (!tabState) return;

    Object.assign(tabState.playbackState, playbackState);
    tabState.lastActivity = new Date();
    this.notifyListeners();
  }

  /**
   * Remove tab from state
   */
  removeTab(tabId: number): void {
    this.state.tabs.delete(tabId);

    if (this.state.activeTabId === tabId) {
      this.state.activeTabId = null;
    }

    this.notifyListeners();
  }

  /**
   * Update global settings
   */
  updateGlobalSettings(settings: Partial<GlobalState['globalSettings']>): void {
    Object.assign(this.state.globalSettings, settings);
    this.notifyListeners();
  }

  /**
   * Get all tabs with content
   */
  getTabsWithContent(): TabState[] {
    return Array.from(this.state.tabs.values()).filter(tab => tab.content);
  }

  /**
   * Get playing tabs
   */
  getPlayingTabs(): TabState[] {
    return Array.from(this.state.tabs.values()).filter(tab => tab.playbackState.isPlaying);
  }

  /**
   * Pause all tabs except specified one
   */
  pauseAllTabsExcept(exceptTabId?: number): void {
    for (const [tabId, tabState] of this.state.tabs) {
      if (tabId !== exceptTabId && tabState.playbackState.isPlaying) {
        tabState.playbackState.isPlaying = false;
        tabState.playbackState.isPaused = true;
      }
    }
    this.notifyListeners();
  }

  /**
   * Clean up old inactive tabs
   */
  cleanupOldTabs(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = new Date();
    const tabsToRemove: number[] = [];

    for (const [tabId, tabState] of this.state.tabs) {
      const age = now.getTime() - tabState.lastActivity.getTime();
      if (age > maxAge && !tabState.isActive) {
        tabsToRemove.push(tabId);
      }
    }

    for (const tabId of tabsToRemove) {
      this.state.tabs.delete(tabId);
    }

    if (tabsToRemove.length > 0) {
      this.notifyListeners();
    }
  }

  /**
   * Add state change listener
   */
  addListener(listener: (state: GlobalState) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove state change listener
   */
  removeListener(listener: (state: GlobalState) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Create default tab state
   */
  private createDefaultTabState(tabId: number): TabState {
    return {
      tabId,
      url: '',
      title: 'Loading...',
      playbackState: {
        isPlaying: false,
        isPaused: false,
        currentSegment: 0,
        currentPosition: 0,
        totalSegments: 0,
        voice: this.state.globalSettings.defaultVoice,
        speed: this.state.globalSettings.defaultSpeed,
        volume: this.state.globalSettings.defaultVolume,
        pitch: this.state.globalSettings.defaultPitch
      },
      lastActivity: new Date(),
      isActive: false
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    }
  }

  /**
   * Get state statistics
   */
  getStats(): {
    totalTabs: number;
    activeTabs: number;
    tabsWithContent: number;
    playingTabs: number;
  } {
    const tabs = Array.from(this.state.tabs.values());
    return {
      totalTabs: tabs.length,
      activeTabs: tabs.filter(tab => tab.isActive).length,
      tabsWithContent: tabs.filter(tab => tab.content).length,
      playingTabs: tabs.filter(tab => tab.playbackState.isPlaying).length
    };
  }
}