// Content extraction types and interfaces

export interface TextSegment {
  text: string;
  element?: HTMLElement;
  position: { start: number; end: number };
  type: 'paragraph' | 'heading' | 'list' | 'other';
  processed?: boolean; // Whether text has been processed for TTS
  chunks?: TextChunk[]; // Text chunks for TTS processing
}

export interface TextChunk {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
  estimatedDuration: number; // in seconds
}

export interface TextContent {
  id: string;
  source: 'html' | 'pdf' | 'ocr';
  segments: TextSegment[];
  metadata: {
    title: string;
    url: string;
    extractedAt: Date;
    wordCount: number;
  };
}

export interface ContentExtractionOptions {
  excludeSelectors?: string[];
  includeSelectors?: string[];
  minTextLength?: number;
  preserveFormatting?: boolean;
}

export interface ContentExtractionResult {
  content: TextContent;
  success: boolean;
  error?: string;
}

export interface TextProcessingOptions {
  maxChunkSize?: number; // Maximum characters per chunk
  maxChunkWords?: number; // Maximum words per chunk
  preserveSentences?: boolean; // Try to keep sentences intact
  addPauses?: boolean; // Add natural pauses for TTS
  normalizeWhitespace?: boolean; // Normalize whitespace
  removeSpecialChars?: boolean; // Remove problematic characters for TTS
}