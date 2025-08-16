import { StateManager } from './stateManager';
import { TTSManager } from './ttsManager';
import type { TextContent } from '../types/content';

export interface Message {
  action: string;
  data?: any;
  tabId?: number;
}

export interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class MessageHandler {
  private stateManager: StateManager;
  private ttsManager: TTSManager;

  constructor(stateManager: StateManager, ttsManager: TTSManager) {
    this.stateManager = stateManager;
    this.ttsManager = ttsManager;
    this.initializeListeners();
  }

  private initializeListeners(): void {
    chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
      // Handle the message asynchronously
      this.handleMessage(message, sender, sendResponse).catch(error => {
        console.error('Error in message handler:', error);
        sendResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      });
      return true; // Keep message channel open for async responses
    });
  }

  private async handleMessage(
    message: Message, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (response: MessageResponse) => void
  ): Promise<void> {
    try {
      let tabId = sender.tab?.id || message.tabId;
      
      // If no tab ID, try to get the active tab
      if (!tabId && (message.action === 'startReading' || message.action === 'updateContent')) {
        try {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          tabId = activeTab?.id;
        } catch (error) {
          console.warn('Could not get active tab:', error);
        }
      }
      
      console.log('Background received message:', message.action, 'from tab:', tabId);

      switch (message.action) {
        case 'getState':
          sendResponse({
            success: true,
            data: this.stateManager.getState()
          });
          break;

        case 'getTabState':
          if (!tabId) {
            sendResponse({ success: false, error: 'No tab ID provided' });
            return;
          }
          sendResponse({
            success: true,
            data: this.stateManager.getTabState(tabId)
          });
          break;

        case 'updateContent':
          if (!tabId || !message.data) {
            sendResponse({ success: false, error: 'Missing tab ID or content data' });
            return;
          }
          this.stateManager.updateTabContent(tabId, message.data as TextContent);
          sendResponse({ success: true });
          break;

        case 'refreshContent':
          if (!tabId) {
            sendResponse({ success: false, error: 'No tab ID provided' });
            return;
          }
          // Ask content script to refresh content
          try {
            await chrome.tabs.sendMessage(tabId, { action: 'refreshContent' });
            sendResponse({ success: true });
          } catch (error) {
            sendResponse({ success: false, error: 'Failed to refresh content' });
          }
          break;

        case 'startReading':
          await this.handleStartReading(message, tabId, sendResponse);
          return; // Don't continue to avoid double response

        case 'pauseReading':
          this.ttsManager.pauseReading();
          if (tabId) {
            this.stateManager.updateTabPlaybackState(tabId, { 
              isPlaying: false, 
              isPaused: true 
            });
          }
          sendResponse({ success: true });
          break;

        case 'resumeReading':
          this.ttsManager.resumeReading();
          if (tabId) {
            this.stateManager.updateTabPlaybackState(tabId, { 
              isPlaying: true, 
              isPaused: false 
            });
          }
          sendResponse({ success: true });
          break;

        case 'stopReading':
          this.ttsManager.stopReading();
          if (tabId) {
            this.stateManager.updateTabPlaybackState(tabId, { 
              isPlaying: false, 
              isPaused: false,
              currentSegment: 0,
              currentPosition: 0
            });
          }
          sendResponse({ success: true });
          break;

        case 'setVoice':
          if (!message.data?.voiceURI) {
            sendResponse({ success: false, error: 'No voice URI provided' });
            return;
          }
          await this.ttsManager.setVoice(message.data.voiceURI);
          if (tabId) {
            this.stateManager.updateTabPlaybackState(tabId, { 
              voice: message.data.voiceURI 
            });
          }
          sendResponse({ success: true });
          break;

        case 'setSpeed':
          if (typeof message.data?.speed !== 'number') {
            sendResponse({ success: false, error: 'Invalid speed value' });
            return;
          }
          this.ttsManager.setSpeed(message.data.speed);
          if (tabId) {
            this.stateManager.updateTabPlaybackState(tabId, { 
              speed: message.data.speed 
            });
          }
          sendResponse({ success: true });
          break;

        case 'setVolume':
          if (typeof message.data?.volume !== 'number') {
            sendResponse({ success: false, error: 'Invalid volume value' });
            return;
          }
          this.ttsManager.setVolume(message.data.volume);
          if (tabId) {
            this.stateManager.updateTabPlaybackState(tabId, { 
              volume: message.data.volume 
            });
          }
          sendResponse({ success: true });
          break;

        case 'setPitch':
          if (typeof message.data?.pitch !== 'number') {
            sendResponse({ success: false, error: 'Invalid pitch value' });
            return;
          }
          this.ttsManager.setPitch(message.data.pitch);
          if (tabId) {
            this.stateManager.updateTabPlaybackState(tabId, { 
              pitch: message.data.pitch 
            });
          }
          sendResponse({ success: true });
          break;

        case 'getVoices':
          sendResponse({
            success: true,
            data: this.ttsManager.getVoices()
          });
          break;

        case 'getPlaybackState':
          sendResponse({
            success: true,
            data: this.ttsManager.getPlaybackState()
          });
          break;

        case 'updateSettings':
          if (!message.data) {
            sendResponse({ success: false, error: 'No settings data provided' });
            return;
          }
          this.stateManager.updateGlobalSettings(message.data);
          sendResponse({ success: true });
          break;

        case 'getStats':
          sendResponse({
            success: true,
            data: this.stateManager.getStats()
          });
          break;

        case 'saveButtonPosition':
          if (!message.data) {
            sendResponse({ success: false, error: 'No position data provided' });
            return;
          }
          // Save to Chrome storage
          chrome.storage.local.set({ buttonPosition: message.data }, () => {
            sendResponse({ success: true });
          });
          break;

        case 'getButtonPosition':
          chrome.storage.local.get(['buttonPosition'], (result) => {
            sendResponse({ 
              success: true, 
              data: result.buttonPosition || { bottom: 25, right: 25 }
            });
          });
          break;

        case 'getTTSEngineStatus':
          sendResponse({
            success: true,
            data: { status: 'Using Chrome TTS API' }
          });
          break;

        case 'test':
          console.log('Test message received in background script');
          sendResponse({ 
            success: true, 
            data: 'Background script is working!' 
          });
          break;

        case 'LLM_TTS_SETTINGS_CHANGED':
          if (message.data) {
            try {
              await this.ttsManager.updateLLMTTSProvider(message.data);
              sendResponse({ success: true });
            } catch (error) {
              sendResponse({ 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to update LLM TTS provider' 
              });
            }
          } else {
            sendResponse({ success: false, error: 'No settings data provided' });
          }
          return; // Don't continue to avoid double response

        default:
          console.warn('Unknown message action:', message.action);
          sendResponse({ 
            success: false, 
            error: `Unknown action: ${message.action}` 
          });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private async handleStartReading(
    _message: Message, 
    tabId: number | undefined, 
    sendResponse: (response: MessageResponse) => void
  ): Promise<void> {
    try {
      if (!tabId) {
        sendResponse({ success: false, error: 'No tab ID provided' });
        return;
      }

      const tabState = this.stateManager.getTabState(tabId);
      if (!tabState?.content) {
        sendResponse({ success: false, error: 'No content available for reading' });
        return;
      }

      // Pause other tabs if needed
      this.stateManager.pauseAllTabsExcept(tabId);

      // Start reading the content
      await this.ttsManager.startReading(
        tabState.content.segments,
        {
          rate: tabState.playbackState.speed,
          volume: tabState.playbackState.volume,
          pitch: tabState.playbackState.pitch,
          voiceURI: tabState.playbackState.voice
        }
      );

      // Update tab state
      this.stateManager.updateTabPlaybackState(tabId, {
        isPlaying: true,
        isPaused: false,
        totalSegments: tabState.content.segments.length
      });

      sendResponse({ success: true });
    } catch (error) {
      console.error('Error starting reading:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start reading' 
      });
    }
  }

  /**
   * Send message to specific tab
   */
  async sendMessageToTab(tabId: number, message: Message): Promise<MessageResponse> {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ 
            success: false, 
            error: chrome.runtime.lastError.message 
          });
        } else {
          resolve(response || { success: true });
        }
      });
    });
  }

  /**
   * Send message to all tabs
   */
  async broadcastMessage(message: Message): Promise<void> {
    const tabs = await chrome.tabs.query({});
    const promises = tabs.map(tab => {
      if (tab.id) {
        return this.sendMessageToTab(tab.id, message);
      }
      return Promise.resolve({ success: false, error: 'No tab ID' });
    });

    await Promise.allSettled(promises);
  }

  /**
   * Send message to active tab
   */
  async sendMessageToActiveTab(message: Message): Promise<MessageResponse> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      return this.sendMessageToTab(tabs[0].id, message);
    }
    return { success: false, error: 'No active tab found' };
  }
}