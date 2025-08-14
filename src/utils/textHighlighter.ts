export interface HighlightOptions {
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  padding?: string;
  transition?: string;
}

export class TextHighlighter {
  private currentHighlight: HTMLElement | null = null;
  // private highlightClass = 'kenkan-highlight';
  private options: HighlightOptions;

  constructor(options: HighlightOptions = {}) {
    this.options = {
      className: 'kenkan-highlight',
      backgroundColor: '#fef3c7',
      textColor: '#92400e',
      borderRadius: '3px',
      padding: '2px 4px',
      transition: 'all 0.3s ease',
      ...options
    };

    this.injectStyles();
  }

  /**
   * Inject CSS styles for highlighting
   */
  private injectStyles(): void {
    const existingStyle = document.getElementById('kenkan-highlight-styles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'kenkan-highlight-styles';
    style.textContent = `
      .${this.options.className} {
        background-color: ${this.options.backgroundColor} !important;
        color: ${this.options.textColor} !important;
        border-radius: ${this.options.borderRadius} !important;
        padding: ${this.options.padding} !important;
        transition: ${this.options.transition} !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        position: relative !important;
        z-index: 1 !important;
      }

      .${this.options.className}::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, #fbbf24, #f59e0b);
        border-radius: ${this.options.borderRadius};
        z-index: -1;
        opacity: 0.3;
        animation: kenkan-pulse 2s infinite;
      }

      @keyframes kenkan-pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
      }

      .kenkan-highlight-smooth {
        animation: kenkan-highlight-in 0.3s ease-out;
      }

      @keyframes kenkan-highlight-in {
        from {
          background-color: transparent;
          transform: scale(1);
        }
        to {
          background-color: ${this.options.backgroundColor};
          transform: scale(1.02);
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Highlight text at specific position
   */
  highlightAtPosition(element: HTMLElement, startOffset: number, endOffset: number): void {
    this.clearHighlight();

    try {
      const textContent = element.textContent || '';
      if (startOffset >= textContent.length || endOffset > textContent.length) {
        return;
      }

      // Create text range
      const range = document.createRange();
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
      );

      let currentOffset = 0;
      let startNode: Text | null = null;
      let endNode: Text | null = null;
      let startNodeOffset = 0;
      let endNodeOffset = 0;

      // Find start and end text nodes
      let node: Text | null;
      while (node = walker.nextNode() as Text) {
        const nodeLength = node.textContent?.length || 0;
        
        if (!startNode && currentOffset + nodeLength > startOffset) {
          startNode = node;
          startNodeOffset = startOffset - currentOffset;
        }
        
        if (!endNode && currentOffset + nodeLength >= endOffset) {
          endNode = node;
          endNodeOffset = endOffset - currentOffset;
          break;
        }
        
        currentOffset += nodeLength;
      }

      if (startNode && endNode) {
        range.setStart(startNode, startNodeOffset);
        range.setEnd(endNode, endNodeOffset);

        // Create highlight span
        const highlightSpan = document.createElement('span');
        highlightSpan.className = `${this.options.className} kenkan-highlight-smooth`;
        
        try {
          range.surroundContents(highlightSpan);
          this.currentHighlight = highlightSpan;
        } catch (error) {
          // Fallback: extract and wrap content
          const contents = range.extractContents();
          highlightSpan.appendChild(contents);
          range.insertNode(highlightSpan);
          this.currentHighlight = highlightSpan;
        }
      }
    } catch (error) {
      console.warn('Error highlighting text:', error);
    }
  }

  /**
   * Highlight specific text segment
   */
  highlightSegment(segment: { element?: HTMLElement; text: string; position: { start: number; end: number } }): void {
    if (!segment.element) {
      // Try to find element containing the text
      const elements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li');
      for (const el of elements) {
        if (el.textContent?.includes(segment.text)) {
          segment.element = el as HTMLElement;
          break;
        }
      }
    }

    if (segment.element) {
      this.highlightAtPosition(segment.element, segment.position.start, segment.position.end);
    }
  }

  /**
   * Highlight text by searching for it
   */
  highlightText(text: string, container?: HTMLElement): boolean {
    this.clearHighlight();

    const searchContainer = container || document.body;
    const walker = document.createTreeWalker(
      searchContainer,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Text | null;
    while (node = walker.nextNode() as Text) {
      const nodeText = node.textContent || '';
      const index = nodeText.toLowerCase().indexOf(text.toLowerCase());
      
      if (index !== -1) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + text.length);

        const highlightSpan = document.createElement('span');
        highlightSpan.className = `${this.options.className} kenkan-highlight-smooth`;
        
        try {
          range.surroundContents(highlightSpan);
          this.currentHighlight = highlightSpan;
          
          // Scroll into view
          highlightSpan.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
          
          return true;
        } catch (error) {
          console.warn('Error highlighting text:', error);
        }
      }
    }

    return false;
  }

  /**
   * Clear current highlight
   */
  clearHighlight(): void {
    if (this.currentHighlight) {
      const parent = this.currentHighlight.parentNode;
      if (parent) {
        // Move children out of highlight span
        while (this.currentHighlight.firstChild) {
          parent.insertBefore(this.currentHighlight.firstChild, this.currentHighlight);
        }
        // Remove the highlight span
        parent.removeChild(this.currentHighlight);
        
        // Normalize text nodes
        parent.normalize();
      }
      this.currentHighlight = null;
    }
  }

  /**
   * Update highlight style
   */
  updateStyle(options: Partial<HighlightOptions>): void {
    this.options = { ...this.options, ...options };
    
    // Remove existing styles
    const existingStyle = document.getElementById('kenkan-highlight-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Inject updated styles
    this.injectStyles();
  }

  /**
   * Get current highlight element
   */
  getCurrentHighlight(): HTMLElement | null {
    return this.currentHighlight;
  }

  /**
   * Check if text is currently highlighted
   */
  isHighlighted(): boolean {
    return this.currentHighlight !== null;
  }

  /**
   * Cleanup - remove styles and highlights
   */
  cleanup(): void {
    this.clearHighlight();
    
    const style = document.getElementById('kenkan-highlight-styles');
    if (style) {
      style.remove();
    }
  }
}

// Singleton instance for global use
let globalHighlighter: TextHighlighter | null = null;

export function getGlobalHighlighter(options?: HighlightOptions): TextHighlighter {
  if (!globalHighlighter) {
    globalHighlighter = new TextHighlighter(options);
  }
  return globalHighlighter;
}

export function clearGlobalHighlight(): void {
  if (globalHighlighter) {
    globalHighlighter.clearHighlight();
  }
}