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
  private isDarkMode = false;
  private buttonPosition = { bottom: 25, right: 25 };
  private isDragging = false;

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

      // Set up keyboard shortcuts
      this.setupKeyboardShortcuts();

      // Detect dark mode
      this.detectDarkMode();
    } catch (error) {
      console.error('Error initializing Kenkan content script:', error);
    }
  }

  private detectDarkMode(): void {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check if page has dark background
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
    
    // Simple heuristic: if background is dark, use dark mode
    const isDarkBackground = this.isColorDark(bodyBg) || this.isColorDark(htmlBg);
    
    this.isDarkMode = prefersDark || isDarkBackground;
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.isDarkMode = e.matches;
      this.updateTheme();
    });
  }

  private isColorDark(color: string): boolean {
    // Convert RGB to luminance
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return false;
    
    const [r, g, b] = rgb.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }

  private updateTheme(): void {
    const container = document.getElementById('kenkan-floating-container');
    const controls = document.getElementById('kenkan-controls');
    
    if (container && controls) {
      this.applyTheme(controls);
    }
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement || 
          (event.target as HTMLElement).contentEditable === 'true') {
        return;
      }

      // Handle keyboard shortcuts
      switch (event.code) {
        case 'Space':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.togglePlayPause();
          }
          break;
        case 'KeyS':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.stopReading();
          }
          break;
        case 'KeyR':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.toggleTTS();
          }
          break;
        case 'ArrowUp':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.adjustSpeed(0.1);
          }
          break;
        case 'ArrowDown':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.adjustSpeed(-0.1);
          }
          break;
      }
    });
  }

  private async adjustSpeed(delta: number): Promise<void> {
    try {
      this.currentSpeed = Math.max(0.5, Math.min(3.0, this.currentSpeed + delta));
      await this.sendMessage({ action: 'setSpeed', data: { speed: this.currentSpeed } });
      
      // Update speed button text
      const speedBtn = document.querySelector('#kenkan-controls button:nth-child(3)') as HTMLButtonElement;
      if (speedBtn) {
        speedBtn.innerHTML = `<span style="margin-right: 8px;">⚡</span><span style="font-size: 12px;">Speed: ${this.currentSpeed.toFixed(1)}x</span>`;
      }
    } catch (error) {
      console.error('Error adjusting speed:', error);
    }
  }

  private async setup(): Promise<void> {
    // Load saved button position
    await this.loadButtonPosition();
    
    this.createFloatingButton();

    // Debounce content extraction to avoid excessive processing
    setTimeout(() => {
      this.detectAndExtractContent();
    }, 1000);
  }

  private createFloatingButton(): void {
    // Create container for button and controls
    const container = document.createElement('div');
    container.id = 'kenkan-floating-container';
    container.style.cssText = `
      position: fixed;
      bottom: ${this.buttonPosition.bottom}px;
      right: ${this.buttonPosition.right}px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      cursor: move;
    `;

    // Main floating button
    const button = document.createElement('button');
    button.id = 'kenkan-main-button';
    button.innerHTML = '🎧';
    button.title = 'Kenkan TTS - Click to start reading';
    button.style.cssText = `
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Controls panel
    const controls = document.createElement('div');
    controls.id = 'kenkan-controls';
    this.applyTheme(controls);

    // Progress bar
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
      margin-bottom: 8px;
      padding: 4px 0;
    `;
    
    const progressLabel = document.createElement('div');
    progressLabel.id = 'kenkan-progress-label';
    progressLabel.style.cssText = `
      font-size: 10px;
      color: #6b7280;
      margin-bottom: 4px;
      text-align: center;
    `;
    progressLabel.textContent = 'Ready to read';
    
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      width: 100%;
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
    `;
    
    const progressFill = document.createElement('div');
    progressFill.id = 'kenkan-progress-fill';
    progressFill.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
      border-radius: 2px;
      transition: width 0.3s ease;
    `;
    
    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressLabel);
    progressContainer.appendChild(progressBar);

    // Control buttons
    const playPauseBtn = this.createControlButton('⏯️', 'Play/Pause', () => this.togglePlayPause());
    const stopBtn = this.createControlButton('⏹️', 'Stop', () => this.stopReading());
    const speedBtn = this.createControlButton('⚡', 'Speed: 1.0x', () => this.cycleSpeed());

    // Keyboard shortcuts help
    const helpBtn = this.createControlButton('⌨️', 'Shortcuts', () => this.showKeyboardHelp());

    controls.appendChild(progressContainer);
    controls.appendChild(playPauseBtn);
    controls.appendChild(stopBtn);
    controls.appendChild(speedBtn);
    controls.appendChild(helpBtn);

    container.appendChild(controls);
    container.appendChild(button);

    // Hover events for smooth animation
    let hoverTimeout: NodeJS.Timeout;

    const showControls = () => {
      clearTimeout(hoverTimeout);
      controls.style.opacity = '1';
      controls.style.transform = 'translateY(0) scale(1)';
      controls.style.pointerEvents = 'auto';
      button.style.background = '#2563eb';
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
    };

    const hideControls = () => {
      hoverTimeout = setTimeout(() => {
        controls.style.opacity = '0';
        controls.style.transform = 'translateY(20px) scale(0.8)';
        controls.style.pointerEvents = 'none';
        button.style.background = this.isActive ? '#10b981' : '#3b82f6';
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
      }, 300);
    };

    container.addEventListener('mouseenter', showControls);
    container.addEventListener('mouseleave', hideControls);

    button.addEventListener('click', (e) => {
      if (!this.isDragging) {
        this.toggleTTS();
      }
    });

    // Add drag functionality
    this.setupDragFunctionality(container, button);

    document.body.appendChild(container);
    console.log('Kenkan floating controls added to page');
  }

  private setupDragFunctionality(container: HTMLElement, button: HTMLElement): void {
    let startX = 0, startY = 0, startBottom = 0, startRight = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.target !== button) return;
      
      this.isDragging = false;
      startX = e.clientX;
      startY = e.clientY;
      startBottom = this.buttonPosition.bottom;
      startRight = this.buttonPosition.right;
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = startX - e.clientX;
      const deltaY = e.clientY - startY;
      
      // Mark as dragging if moved more than 5px
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        this.isDragging = true;
      }
      
      const newRight = Math.max(10, Math.min(window.innerWidth - 70, startRight + deltaX));
      const newBottom = Math.max(10, Math.min(window.innerHeight - 70, startBottom + deltaY));
      
      this.buttonPosition = { bottom: newBottom, right: newRight };
      
      container.style.bottom = `${newBottom}px`;
      container.style.right = `${newRight}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // Save position to storage
      this.saveButtonPosition();
      
      // Reset dragging flag after a short delay
      setTimeout(() => {
        this.isDragging = false;
      }, 100);
    };

    button.addEventListener('mousedown', onMouseDown);
  }

  private async saveButtonPosition(): Promise<void> {
    try {
      await this.sendMessage({
        action: 'saveButtonPosition',
        data: this.buttonPosition
      });
    } catch (error) {
      console.error('Error saving button position:', error);
    }
  }

  private async loadButtonPosition(): Promise<void> {
    try {
      const response = await this.sendMessage({ action: 'getButtonPosition' });
      if (response.success && response.data) {
        this.buttonPosition = response.data;
      }
    } catch (error) {
      console.error('Error loading button position:', error);
    }
  }

  private showKeyboardHelp(): void {
    const helpText = `
🎧 Kenkan Keyboard Shortcuts:

Ctrl/Cmd + Space: Play/Pause
Ctrl/Cmd + S: Stop
Ctrl/Cmd + R: Start Reading
Ctrl/Cmd + ↑: Speed Up
Ctrl/Cmd + ↓: Speed Down

💡 Tip: You can drag the floating button to reposition it!
    `;
    
    alert(helpText.trim());
  }

  private createControlButton(icon: string, title: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.innerHTML = `<span style="margin-right: 8px;">${icon}</span><span style="font-size: 12px;">${title}</span>`;
    btn.title = title;
    btn.style.cssText = `
      border-radius: 6px;
      padding: 8px 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      font-size: 12px;
      width: 100%;
      border: 1px solid;
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.background = btn.dataset.hoverBg || '#3b82f6';
      btn.style.color = 'white';
      btn.style.transform = 'translateX(-2px)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.background = btn.dataset.normalBg || '#f8fafc';
      btn.style.color = btn.dataset.normalColor || '#374151';
      btn.style.transform = 'translateX(0)';
    });

    btn.addEventListener('click', onClick);
    return btn;
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
        this.updateButtonState();
      } else {
        // Start TTS
        const response = await this.sendMessage({ action: 'startReading' });
        if (response.success) {
          this.isActive = true;
          this.showOverlay();
          this.updateButtonState();
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

  // private async togglePlayPause(): Promise<void> {
  //   try {
  //     const state = await this.sendMessage({ action: 'getPlaybackState' });

  //     if (state.data?.isPlaying) {
  //       await this.sendMessage({ action: 'pauseReading' });
  //     } else {
  //       await this.sendMessage({ action: 'resumeReading' });
  //     }
  //   } catch (error) {
  //     console.error('Error toggling play/pause:', error);
  //   }
  // }

  private async stopReading(): Promise<void> {
    try {
      await this.sendMessage({ action: 'stopReading' });
      this.isActive = false;
      this.highlighter.clearHighlight();
      this.hideOverlay();
      this.updateButtonState();
    } catch (error) {
      console.error('Error stopping reading:', error);
    }
  }

  private async togglePlayPause(): Promise<void> {
    try {
      const state = await this.sendMessage({ action: 'getPlaybackState' });

      if (state.data?.isPlaying) {
        await this.sendMessage({ action: 'pauseReading' });
      } else {
        if (this.isActive) {
          await this.sendMessage({ action: 'resumeReading' });
        } else {
          await this.toggleTTS();
        }
      }
      this.updateButtonState();
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }

  private currentSpeed = 1.0;
  private speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  private async cycleSpeed(): Promise<void> {
    try {
      const currentIndex = this.speedOptions.indexOf(this.currentSpeed);
      const nextIndex = (currentIndex + 1) % this.speedOptions.length;
      this.currentSpeed = this.speedOptions[nextIndex];

      await this.sendMessage({ action: 'setSpeed', data: { speed: this.currentSpeed } });

      // Update speed button text
      const speedBtn = document.querySelector('#kenkan-controls button:nth-child(3)') as HTMLButtonElement;
      if (speedBtn) {
        speedBtn.innerHTML = `<span style="margin-right: 8px;">⚡</span><span style="font-size: 12px;">Speed: ${this.currentSpeed}x</span>`;
      }
    } catch (error) {
      console.error('Error changing speed:', error);
    }
  }

  private updateButtonState(): void {
    const button = document.getElementById('kenkan-main-button') as HTMLButtonElement;
    if (button) {
      if (this.isActive) {
        button.style.background = '#10b981'; // Green when active
        button.innerHTML = '🔊';
      } else {
        button.style.background = '#3b82f6'; // Blue when inactive
        button.innerHTML = '🎧';
      }
    }
  }

  private updateProgressDisplay(data: { currentSegment: number; totalSegments: number; progress: number }): void {
    const progressFill = document.getElementById('kenkan-progress-fill');
    const progressLabel = document.getElementById('kenkan-progress-label');
    
    if (progressFill && progressLabel) {
      progressFill.style.width = `${data.progress}%`;
      progressLabel.textContent = `Reading ${data.currentSegment + 1} of ${data.totalSegments} (${Math.round(data.progress)}%)`;
    }
  }

  private applyTheme(controls: HTMLElement): void {
    const theme = this.isDarkMode ? {
      background: '#1f2937',
      border: '2px solid #4f46e5',
      color: '#f9fafb',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      progressLabelColor: '#9ca3af',
      progressBg: '#374151',
      buttonBg: '#374151',
      buttonBorder: '#4b5563',
      buttonColor: '#f9fafb',
      buttonHoverBg: '#4f46e5'
    } : {
      background: 'white',
      border: '2px solid #3b82f6',
      color: '#1f2937',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      progressLabelColor: '#6b7280',
      progressBg: '#e5e7eb',
      buttonBg: '#f8fafc',
      buttonBorder: '#e2e8f0',
      buttonColor: '#374151',
      buttonHoverBg: '#3b82f6'
    };

    controls.style.cssText = `
      background: ${theme.background};
      border: ${theme.border};
      color: ${theme.color};
      border-radius: 12px;
      padding: 12px;
      box-shadow: ${theme.shadow};
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 200px;
      opacity: 0;
      transform: translateY(20px) scale(0.8);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    `;

    // Update progress label color
    const progressLabel = controls.querySelector('#kenkan-progress-label') as HTMLElement;
    if (progressLabel) {
      progressLabel.style.color = theme.progressLabelColor;
    }

    // Update progress bar background
    const progressBar = controls.querySelector('#kenkan-progress-fill')?.parentElement as HTMLElement;
    if (progressBar) {
      progressBar.style.background = theme.progressBg;
    }

    // Update button themes
    const buttons = controls.querySelectorAll('button');
    buttons.forEach(button => {
      const btn = button as HTMLButtonElement;
      btn.style.background = theme.buttonBg;
      btn.style.borderColor = theme.buttonBorder;
      btn.style.color = theme.buttonColor;
      
      // Store theme colors for hover effects
      btn.dataset.hoverBg = theme.buttonHoverBg;
      btn.dataset.normalBg = theme.buttonBg;
      btn.dataset.normalColor = theme.buttonColor;
    });
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

        case 'updateProgress':
          this.updateProgressDisplay(message.data);
          sendResponse({ success: true });
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