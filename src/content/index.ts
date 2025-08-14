// Content script entry point
import { getGlobalHighlighter } from '../utils/textHighlighter';
import { findMainContentContainer, extractTextSegments, generateContentId } from '../utils/contentExtraction';
import { cleanTextForTTS, isValidTTSText } from '../utils/textProcessing';
import { isPDFJSDocument, extractPDFText, getPDFMetadata } from '../utils/pdfExtraction';
import type { TextContent } from '../types/content';

console.log('Kenkan Chrome Extension content script loaded');

class KenkanContentScript {
  private isActive = false;
  private currentContent: TextContent | null = null;
  private highlighter = getGlobalHighlighter();
  private overlayContainer: HTMLDivElement | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Wait for page to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }

      // Listen for messages from background script
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse);
        return true;
      });
    } catch (error) {
      console.error('Error initializing Kenkan content script:', error);
    }
  }

  private setup(): void {
    this.createFloatingButton();

    // Debounce content extraction to avoid excessive processing
    setTimeout(() => {
      this.detectAndExtractContent();
    }, 1000);
  }

  private createFloatingButton(): void {
    const button = document.createElement('button');
    button.innerHTML = '🎧';
    button.title = 'Kenkan TTS - Click to start reading';
    button.style.cssText = `
      position: fixed;
      bottom: 35px;
      right: 25px;
      z-index: 10000;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.background = '#2563eb';
      button.style.transform = 'translateY(-2px) scale(1.05)';
      button.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = '#3b82f6';
      button.style.transform = 'translateY(0) scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
    });

    button.addEventListener('click', () => {
      this.toggleTTS();
    });

    document.body.appendChild(button);
    console.log('Kenkan floating button added to page');
  }

  private async detectAndExtractContent(): Promise<void> {
    try {
      let result: any = { success: false, content: null };

      // Try HTML extraction first
      try {
        const container = findMainContentContainer();
        if (container) {
          let segments = extractTextSegments(container, {
            minTextLength: 50,
            excludeSelectors: [
              '.kenkan-overlay', // Exclude our own overlay
              '.kenkan-highlight' // Exclude our highlights
            ]
          });

          // Filter and clean segments
          const filteredSegments = segments.filter(segment => isValidTTSText(segment.text));
          const cleanedSegments = filteredSegments.map(segment => ({
            ...segment,
            text: cleanTextForTTS(segment.text)
          }));

          if (cleanedSegments.length > 0) {
            const wordCount = cleanedSegments.reduce((count, segment) => {
              return count + segment.text.split(/\s+/).length;
            }, 0);

            result = {
              success: true,
              content: {
                id: generateContentId(),
                source: 'html',
                segments: cleanedSegments,
                metadata: {
                  title: document.title || 'Untitled Page',
                  url: window.location.href,
                  extractedAt: new Date(),
                  wordCount
                }
              }
            };
          }
        }
      } catch (error) {
        console.warn('HTML extraction failed:', error);
      }

      // If HTML extraction fails or returns little content, try PDF
      if (!result.success && isPDFJSDocument()) {
        try {
          const extractedSegments = await extractPDFText();
          const filteredSegments = extractedSegments.filter(segment => isValidTTSText(segment.text));
          const cleanedSegments = filteredSegments.map(segment => ({
            ...segment,
            text: cleanTextForTTS(segment.text)
          }));

          if (cleanedSegments.length > 0) {
            const wordCount = cleanedSegments.reduce((count, segment) => {
              return count + segment.text.split(/\s+/).length;
            }, 0);

            const pdfMetadata = await getPDFMetadata();

            result = {
              success: true,
              content: {
                id: generateContentId(),
                source: 'pdf',
                segments: cleanedSegments,
                metadata: {
                  title: pdfMetadata.title || document.title || 'PDF Document',
                  url: window.location.href,
                  extractedAt: new Date(),
                  wordCount
                }
              }
            };
          }
        } catch (error) {
          console.log('PDF extraction failed:', error);
        }
      }

      if (result.success && result.content && result.content.segments.length > 0) {
        this.currentContent = result.content;

        // Send content to background script
        chrome.runtime.sendMessage({
          action: 'updateContent',
          data: this.currentContent
        });

        console.log(`Extracted ${result.content.segments.length} text segments from page`);
      } else {
        console.log('No readable content found on this page');
      }
    } catch (error) {
      console.error('Error extracting content:', error);
    }
  }

  private async toggleTTS(): Promise<void> {
    if (!this.currentContent) {
      alert('No readable content found on this page. Please try refreshing or navigate to a page with text content.');
      return;
    }

    try {
      if (this.isActive) {
        // Stop TTS
        await this.sendMessage({ action: 'stopReading' });
        this.isActive = false;
        this.highlighter.clearHighlight();
        this.hideOverlay();
      } else {
        // Start TTS
        const response = await this.sendMessage({ action: 'startReading' });
        if (response.success) {
          this.isActive = true;
          this.showOverlay();
        } else {
          alert(`Failed to start reading: ${response.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error toggling TTS:', error);
      alert('Error communicating with extension. Please try refreshing the page.');
    }
  }

  private showOverlay(): void {
    if (this.overlayContainer) return;

    // Create overlay container
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.className = 'kenkan-overlay';
    this.overlayContainer.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      pointer-events: auto;
    `;

    // Create a simple overlay (in a real implementation, this would be React)
    this.overlayContainer.innerHTML = `
      <div style="
        background: white;
        border: 2px solid #3b82f6;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        min-width: 280px;
        backdrop-filter: blur(10px);
      ">
        <div style="display: flex; align-items: center; justify-content: between; margin-bottom: 12px;">
          <span style="font-weight: 600; color: #1f2937;">🎧 Kenkan TTS</span>
          <button id="kenkan-close" style="
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #6b7280;
            margin-left: auto;
          ">×</button>
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <button id="kenkan-play-pause" style="
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">⏸️</button>
          
          <button id="kenkan-stop" style="
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            cursor: pointer;
          ">⏹️ Stop</button>
        </div>
        
        <div style="font-size: 12px; color: #6b7280; text-align: center;">
          Reading page content...
        </div>
      </div>
    `;

    // Add event listeners
    const closeBtn = this.overlayContainer.querySelector('#kenkan-close');
    const playPauseBtn = this.overlayContainer.querySelector('#kenkan-play-pause');
    const stopBtn = this.overlayContainer.querySelector('#kenkan-stop');

    closeBtn?.addEventListener('click', () => this.hideOverlay());
    playPauseBtn?.addEventListener('click', () => this.togglePlayPause());
    stopBtn?.addEventListener('click', () => this.stopReading());

    document.body.appendChild(this.overlayContainer);
  }

  private hideOverlay(): void {
    if (this.overlayContainer) {
      this.overlayContainer.remove();
      this.overlayContainer = null;
    }
  }

  private async togglePlayPause(): Promise<void> {
    try {
      const state = await this.sendMessage({ action: 'getPlaybackState' });

      if (state.data?.isPlaying) {
        await this.sendMessage({ action: 'pauseReading' });
      } else {
        await this.sendMessage({ action: 'resumeReading' });
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }

  private async stopReading(): Promise<void> {
    try {
      await this.sendMessage({ action: 'stopReading' });
      this.isActive = false;
      this.highlighter.clearHighlight();
      this.hideOverlay();
    } catch (error) {
      console.error('Error stopping reading:', error);
    }
  }

  private async handleMessage(message: any, sender: any, sendResponse: (response: any) => void): Promise<void> {
    try {
      console.log('Message sent from: ' + sender)
      switch (message.action) {
        case 'highlightText':
          if (message.data?.text) {
            const highlighted = this.highlighter.highlightText(message.data.text);
            sendResponse({ success: highlighted });
          } else {
            sendResponse({ success: false, error: 'No text provided' });
          }
          break;

        case 'clearHighlight':
          this.highlighter.clearHighlight();
          sendResponse({ success: true });
          break;

        case 'getContent':
          sendResponse({ success: true, data: this.currentContent });
          break;

        case 'refreshContent':
          await this.detectAndExtractContent();
          sendResponse({ success: true, data: this.currentContent });
          break;

        case 'test':
          console.log('Test message received in content script');
          sendResponse({ success: true, message: 'Content script is working!' });
          break;

        default:
          sendResponse({ success: false, error: `Unknown action: ${message.action}` });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response || { success: true });
        }
      });
    });
  }

  // Cleanup method
  cleanup(): void {
    this.highlighter.cleanup();
    this.hideOverlay();
  }
}

// Initialize the content script
const kenkanContentScript = new KenkanContentScript();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  kenkanContentScript.cleanup();
});

export { };