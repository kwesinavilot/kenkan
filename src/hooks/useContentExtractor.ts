import { useState, useCallback, useEffect } from 'react';
import { 
  TextContent, 
  ContentExtractionResult, 
  ContentExtractionOptions,
  TextChunk
} from '../types/content';
import { 
  findMainContentContainer,
  extractTextSegments,
  filterContentElements,
  generateContentId,
  cleanText
} from '../utils/contentExtraction';
import { 
  isPDFJSDocument,
  extractPDFText,
  waitForPDFJSLoad,
  getPDFMetadata
} from '../utils/pdfExtraction';
import {
  processSegmentsForTTS,
  cleanTextForTTS,
  isValidTTSText,
  TextProcessingOptions
} from '../utils/textProcessing';

export interface UseContentExtractorReturn {
  extractHTMLText: (options?: ContentExtractionOptions) => ContentExtractionResult;
  extractPDFText: () => Promise<ContentExtractionResult>;
  extractImageText: () => Promise<ContentExtractionResult>;
  processTextForTTS: (content: TextContent, options?: TextProcessingOptions) => TextContent;
  isExtracting: boolean;
  lastExtraction: ContentExtractionResult | null;
  error: string | null;
}

/**
 * Custom React hook for extracting content from various sources
 */
export function useContentExtractor(): UseContentExtractorReturn {
  const [isExtracting, setIsExtracting] = useState(false);
  const [lastExtraction, setLastExtraction] = useState<ContentExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Extracts text content from HTML elements on the current page
   */
  const extractHTMLText = useCallback((options: ContentExtractionOptions = {}): ContentExtractionResult => {
    try {
      setIsExtracting(true);
      setError(null);

      // Find the main content container
      const container = findMainContentContainer();
      if (!container) {
        throw new Error('No content container found on page');
      }

      // Extract text segments from the container
      let segments = extractTextSegments(container, options);

      // Filter out invalid segments for TTS
      segments = segments.filter(segment => isValidTTSText(segment.text));

      if (segments.length === 0) {
        throw new Error('No readable text content found on page');
      }

      // Clean text for TTS processing
      segments = segments.map(segment => ({
        ...segment,
        text: cleanTextForTTS(segment.text)
      }));

      // Calculate total word count
      const wordCount = segments.reduce((count, segment) => {
        return count + segment.text.split(/\s+/).length;
      }, 0);

      // Create content object
      const content: TextContent = {
        id: generateContentId(),
        source: 'html',
        segments,
        metadata: {
          title: document.title || 'Untitled Page',
          url: window.location.href,
          extractedAt: new Date(),
          wordCount
        }
      };

      const result: ContentExtractionResult = {
        content,
        success: true
      };

      setLastExtraction(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      const result: ContentExtractionResult = {
        content: {
          id: generateContentId(),
          source: 'html',
          segments: [],
          metadata: {
            title: document.title || 'Untitled Page',
            url: window.location.href,
            extractedAt: new Date(),
            wordCount: 0
          }
        },
        success: false,
        error: errorMessage
      };

      setLastExtraction(result);
      return result;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  /**
   * Extracts text from PDF documents using PDF.js integration
   */
  const extractPDFText = useCallback(async (): Promise<ContentExtractionResult> => {
    try {
      setIsExtracting(true);
      setError(null);

      // Check if this is a PDF.js document
      if (!isPDFJSDocument()) {
        throw new Error('Current page is not a PDF.js rendered document');
      }

      // Wait for PDF.js to fully load
      await waitForPDFJSLoad();

      // Extract text segments from PDF
      let segments = await extractPDFText();

      // Filter out invalid segments for TTS
      segments = segments.filter(segment => isValidTTSText(segment.text));

      if (segments.length === 0) {
        throw new Error('No readable text content found in PDF document');
      }

      // Clean text for TTS processing
      segments = segments.map(segment => ({
        ...segment,
        text: cleanTextForTTS(segment.text)
      }));

      // Calculate total word count
      const wordCount = segments.reduce((count, segment) => {
        return count + segment.text.split(/\s+/).length;
      }, 0);

      // Get PDF metadata
      const pdfMetadata = await getPDFMetadata();

      // Create content object
      const content: TextContent = {
        id: generateContentId(),
        source: 'pdf',
        segments,
        metadata: {
          title: pdfMetadata.title || document.title || 'PDF Document',
          url: window.location.href,
          extractedAt: new Date(),
          wordCount
        }
      };

      const result: ContentExtractionResult = {
        content,
        success: true
      };

      setLastExtraction(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PDF extraction failed';
      setError(errorMessage);
      
      const result: ContentExtractionResult = {
        content: {
          id: generateContentId(),
          source: 'pdf',
          segments: [],
          metadata: {
            title: document.title || 'PDF Document',
            url: window.location.href,
            extractedAt: new Date(),
            wordCount: 0
          }
        },
        success: false,
        error: errorMessage
      };

      setLastExtraction(result);
      return result;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  /**
   * Extracts text from images using OCR (placeholder for OCR integration)
   */
  const extractImageText = useCallback(async (): Promise<ContentExtractionResult> => {
    try {
      setIsExtracting(true);
      setError(null);

      // TODO: Implement OCR integration for scanned documents
      throw new Error('OCR text extraction not yet implemented');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OCR extraction failed';
      setError(errorMessage);
      
      const result: ContentExtractionResult = {
        content: {
          id: generateContentId(),
          source: 'ocr',
          segments: [],
          metadata: {
            title: document.title || 'Scanned Document',
            url: window.location.href,
            extractedAt: new Date(),
            wordCount: 0
          }
        },
        success: false,
        error: errorMessage
      };

      setLastExtraction(result);
      return result;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  /**
   * Processes extracted text content for optimal TTS playback
   */
  const processTextForTTS = useCallback((
    content: TextContent, 
    options: TextProcessingOptions = {}
  ): TextContent => {
    try {
      // Process segments into TTS-optimized chunks
      const processedSegments = content.segments.map(segment => {
        const chunks = processSegmentsForTTS([segment], options);
        return {
          ...segment,
          processed: true,
          chunks
        };
      });

      // Recalculate word count after processing
      const wordCount = processedSegments.reduce((count, segment) => {
        return count + (segment.chunks?.reduce((chunkCount, chunk) => 
          chunkCount + chunk.wordCount, 0) || 0);
      }, 0);

      return {
        ...content,
        segments: processedSegments,
        metadata: {
          ...content.metadata,
          wordCount
        }
      };
    } catch (error) {
      console.error('Error processing text for TTS:', error);
      return content; // Return original content if processing fails
    }
  }, []);

  // Clear error when component unmounts or extraction starts
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  return {
    extractHTMLText,
    extractPDFText,
    extractImageText,
    processTextForTTS,
    isExtracting,
    lastExtraction,
    error
  };
}