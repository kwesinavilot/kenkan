import type { TextSegment, ContentExtractionOptions } from '../types/content';
import { cleanText, generateContentId } from './contentExtraction';

// PDF.js detection timeout and retry configuration
const PDF_LOAD_TIMEOUT = 15000; // 15 seconds
const PDF_LOAD_RETRY_INTERVAL = 100; // 100ms
const MAX_EXTRACTION_RETRIES = 3;

/**
 * Detects if the current page is displaying a PDF using PDF.js
 * Enhanced with more comprehensive detection methods
 */
export function isPDFJSDocument(): boolean {
  // Check for PDF.js specific elements and properties
  const indicators = [
    // PDF.js viewer elements (most common)
    () => document.querySelector('#viewer') !== null,
    () => document.querySelector('.pdfViewer') !== null,
    () => document.querySelector('#viewerContainer') !== null,
    () => document.querySelector('#outerContainer') !== null,

    // PDF.js global objects
    () => typeof (window as any).PDFViewerApplication !== 'undefined',
    () => typeof (window as any).pdfjsLib !== 'undefined',
    () => typeof (window as any).PDFJS !== 'undefined',

    // PDF.js specific classes and structure
    () => document.querySelector('.page') !== null && document.querySelector('.textLayer') !== null,
    () => document.querySelector('.pdfViewer .page') !== null,
    () => document.querySelector('[data-page-number]') !== null,

    // Check document content type
    () => document.contentType === 'application/pdf',

    // Check URL patterns
    () => window.location.pathname.toLowerCase().endsWith('.pdf'),
    () => window.location.href.includes('pdfjs'),
    () => window.location.search.includes('file=') && window.location.search.includes('.pdf'),

    // Check for PDF.js specific meta tags and attributes
    () => document.querySelector('meta[name="generator"][content*="PDF.js"]') !== null,
    () => document.querySelector('meta[name="generator"][content*="pdf.js"]') !== null,
    () => document.documentElement.classList.contains('pdfjs'),

    // Check for PDF.js CSS files
    () => Array.from(document.styleSheets).some(sheet => {
      try {
        return sheet.href && (sheet.href.includes('viewer.css') || sheet.href.includes('pdf'));
      } catch (e) {
        return false;
      }
    }),

    // Check for embedded PDF viewers
    () => document.querySelector('embed[type="application/pdf"]') !== null,
    () => document.querySelector('object[type="application/pdf"]') !== null,
    () => document.querySelector('iframe[src*=".pdf"]') !== null
  ];

  const detectionResults = indicators.map(check => {
    try {
      return check();
    } catch (e) {
      return false;
    }
  });

  // Log detection results for debugging
  const positiveResults = detectionResults.filter(result => result).length;
  console.debug(`PDF.js detection: ${positiveResults}/${indicators.length} indicators positive`);

  return positiveResults > 0;
}

/**
 * Gets detailed information about the PDF.js environment
 */
export function getPDFJSEnvironmentInfo(): {
  isPDFJS: boolean;
  version?: string;
  hasTextLayers: boolean;
  pageCount: number;
  isLoaded: boolean;
  detectionMethod: string[];
} {
  const detectionMethods: string[] = [];
  let version: string | undefined;

  // Check PDF.js application
  const pdfApp = (window as any).PDFViewerApplication;
  if (pdfApp) {
    detectionMethods.push('PDFViewerApplication');
    version = pdfApp.version;
  }

  // Check PDF.js library
  if (typeof (window as any).pdfjsLib !== 'undefined') {
    detectionMethods.push('pdfjsLib');
    version = version || (window as any).pdfjsLib?.version;
  }

  // Check DOM elements
  if (document.querySelector('#viewer, .pdfViewer, #viewerContainer')) {
    detectionMethods.push('DOM elements');
  }

  // Check text layers
  const textLayers = document.querySelectorAll('.textLayer');
  const hasTextLayers = textLayers.length > 0;

  // Check page count
  const pages = document.querySelectorAll('.page, [data-page-number]');
  const pageCount = pages.length;

  // Check if loaded
  const isLoaded = (pdfApp && pdfApp.pdfDocument) || hasTextLayers;

  return {
    isPDFJS: detectionMethods.length > 0,
    version,
    hasTextLayers,
    pageCount,
    isLoaded,
    detectionMethod: detectionMethods
  };
}

/**
 * Extracts text from PDF.js text layer elements with enhanced error handling
 */
export function extractPDFTextFromLayers(options: ContentExtractionOptions = {}): TextSegment[] {
  const segments: TextSegment[] = [];
  const minTextLength = options.minTextLength || 1;

  try {
    // Find all text layer elements with multiple selectors
    const textLayers = document.querySelectorAll('.textLayer, .textLayer > span, .textLayer > div');

    if (textLayers.length === 0) {
      throw new Error('No PDF.js text layers found');
    }

    let globalPosition = 0;
    const processedElements = new Set<Element>();

    // Process text layers
    const actualTextLayers = document.querySelectorAll('.textLayer');

    actualTextLayers.forEach((textLayer, pageIndex) => {
      try {
        // Extract text from each text layer with better element selection
        const textElements = textLayer.querySelectorAll('span, div, [data-font-name]');

        let pageText = '';
        const pageSegments: TextSegment[] = [];

        textElements.forEach((element) => {
          if (processedElements.has(element)) return;
          processedElements.add(element);

          const rawText = element.textContent || '';
          const text = cleanText(rawText);

          if (text.length >= minTextLength) {
            // Determine segment type based on element properties
            const segmentType = determineSegmentType(element as HTMLElement);

            pageSegments.push({
              text,
              element: element as HTMLElement,
              position: {
                start: globalPosition,
                end: globalPosition + text.length
              },
              type: segmentType
            });

            pageText += text + ' ';
            globalPosition += text.length + 1;
          }
        });

        // If no individual segments found, try to get page text as a whole
        if (pageSegments.length === 0) {
          const pageTextContent = cleanText(textLayer.textContent || '');
          if (pageTextContent.length >= minTextLength) {
            segments.push({
              text: pageTextContent,
              element: textLayer as HTMLElement,
              position: {
                start: globalPosition,
                end: globalPosition + pageTextContent.length
              },
              type: 'paragraph'
            });
            globalPosition += pageTextContent.length + 1;
          }
        } else {
          segments.push(...pageSegments);
        }

      } catch (pageError) {
        console.warn(`Error processing PDF page ${pageIndex + 1}:`, pageError);
        continue;
      }
    });

    console.debug(`Extracted ${segments.length} text segments from ${actualTextLayers.length} PDF pages`);
    return segments;

  } catch (error) {
    console.error('Error extracting PDF text from layers:', error);
    throw new Error(`PDF text layer extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Determines the segment type based on element properties
 */
function determineSegmentType(element: HTMLElement): TextSegment['type'] {
  // Check font size for headings
  const style = window.getComputedStyle(element);
  const fontSize = parseFloat(style.fontSize);

  // Check for heading indicators
  if (fontSize > 16 || style.fontWeight === 'bold' || style.fontWeight === '700') {
    return 'heading';
  }

  // Check for list indicators
  const text = element.textContent || '';
  if (/^[\d\w]\.\s/.test(text) || /^[•\-\*]\s/.test(text)) {
    return 'list';
  }

  return 'paragraph';
}

/**
 * Enhanced method to extract text using PDF.js API directly with better error handling
 */
export async function extractPDFTextUsingAPI(options: ContentExtractionOptions = {}): Promise<TextSegment[]> {
  const segments: TextSegment[] = [];
  const minTextLength = options.minTextLength || 1;

  try {
    // Access PDF.js application with multiple fallback methods
    const pdfApp = (window as any).PDFViewerApplication ||
      (window as any).PDFApplication ||
      (window as any).pdfViewer;

    if (!pdfApp) {
      throw new Error('PDF.js application not found');
    }

    const pdfDocument = pdfApp.pdfDocument || pdfApp.pdfDoc;

    if (!pdfDocument) {
      throw new Error('PDF document not loaded in PDF.js application');
    }

    const numPages = pdfDocument.numPages || pdfDocument._pdfInfo?.numPages;

    if (!numPages || numPages <= 0) {
      throw new Error('Invalid PDF document: no pages found');
    }

    console.debug(`Extracting text from ${numPages} PDF pages using API`);

    let globalPosition = 0;
    let successfulPages = 0;

    // Extract text from each page with retry logic
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      let retryCount = 0;

      while (retryCount < MAX_EXTRACTION_RETRIES) {
        try {
          const page = await pdfDocument.getPage(pageNum);
          const textContent = await page.getTextContent();

          if (!textContent || !textContent.items) {
            throw new Error(`No text content found on page ${pageNum}`);
          }

          // Process text items with better structure preservation
          const textItems = textContent.items.filter((item: any) =>
            item.str && typeof item.str === 'string' && item.str.trim().length > 0
          );

          if (textItems.length === 0) {
            console.debug(`Page ${pageNum} has no readable text items`);
            break;
          }

          // Group text items by approximate line position
          const lines = groupTextItemsByLine(textItems);

          // Create segments from lines
          for (const line of lines) {
            const lineText = line.map(item => item.str).join(' ');
            const cleanedText = cleanText(lineText);

            if (cleanedText.length >= minTextLength) {
              // Determine if this looks like a heading based on font properties
              const isHeading = line.some(item =>
                item.height > 14 || // Larger font size
                item.fontName?.toLowerCase().includes('bold') ||
                item.fontName?.toLowerCase().includes('heading')
              );

              segments.push({
                text: cleanedText,
                position: {
                  start: globalPosition,
                  end: globalPosition + cleanedText.length
                },
                type: isHeading ? 'heading' : 'paragraph'
              });

              globalPosition += cleanedText.length + 1;
            }
          }

          successfulPages++;
          break; // Success, exit retry loop

        } catch (pageError) {
          retryCount++;
          console.warn(`Error extracting text from page ${pageNum} (attempt ${retryCount}):`, pageError);

          if (retryCount >= MAX_EXTRACTION_RETRIES) {
            console.error(`Failed to extract text from page ${pageNum} after ${MAX_EXTRACTION_RETRIES} attempts`);
            break;
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
        }
      }
    }

    console.debug(`Successfully extracted text from ${successfulPages}/${numPages} PDF pages`);

    if (segments.length === 0) {
      throw new Error('No readable text content found in PDF document');
    }

    return segments;

  } catch (error) {
    console.error('Error extracting PDF text using API:', error);
    throw new Error(`PDF API extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Groups text items by approximate line position for better text structure
 */
function groupTextItemsByLine(textItems: any[]): any[][] {
  const lines: any[][] = [];
  const tolerance = 2; // Pixel tolerance for line grouping

  // Sort items by vertical position (top to bottom)
  const sortedItems = textItems.sort((a, b) => {
    const yDiff = (b.transform[5] || 0) - (a.transform[5] || 0);
    if (Math.abs(yDiff) < tolerance) {
      // Same line, sort by horizontal position (left to right)
      return (a.transform[4] || 0) - (b.transform[4] || 0);
    }
    return yDiff;
  });

  let currentLine: any[] = [];
  let currentY: number | null = null;

  for (const item of sortedItems) {
    const itemY = item.transform[5] || 0;

    if (currentY === null || Math.abs(itemY - currentY) < tolerance) {
      // Same line
      currentLine.push(item);
      currentY = itemY;
    } else {
      // New line
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine = [item];
      currentY = itemY;
    }
  }

  // Add the last line
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Attempts to extract text using multiple PDF.js methods with comprehensive error handling
 */
export async function extractPDFText(options: ContentExtractionOptions = {}): Promise<TextSegment[]> {
  // First, verify this is a PDF.js document
  if (!isPDFJSDocument()) {
    const envInfo = getPDFJSEnvironmentInfo();
    throw new Error(`Current document is not a PDF.js rendered document. Environment: ${JSON.stringify(envInfo)}`);
  }

  const envInfo = getPDFJSEnvironmentInfo();
  console.debug('PDF.js environment info:', envInfo);

  // Wait for PDF.js to be ready if not already loaded
  if (!envInfo.isLoaded) {
    console.debug('PDF.js not fully loaded, waiting...');
    try {
      await waitForPDFJSLoad(PDF_LOAD_TIMEOUT);
    } catch (error) {
      console.warn('PDF.js load timeout, attempting extraction anyway:', error);
    }
  }

  let segments: TextSegment[] = [];
  const extractionMethods: Array<{
    name: string;
    method: () => Promise<TextSegment[]> | TextSegment[];
  }> = [
      {
        name: 'Text Layers',
        method: () => extractPDFTextFromLayers(options)
      },
      {
        name: 'PDF.js API',
        method: () => extractPDFTextUsingAPI(options)
      },
      {
        name: 'DOM Fallback',
        method: () => extractPDFTextFromDOM(options)
      }
    ];

  // Try each extraction method in order
  for (const { name, method } of extractionMethods) {
    try {
      console.debug(`Attempting PDF text extraction using: ${name}`);

      const result = await method();

      if (result && result.length > 0) {
        console.debug(`Successfully extracted ${result.length} segments using ${name}`);
        return result;
      } else {
        console.debug(`${name} extraction returned no segments`);
      }

    } catch (error) {
      console.warn(`${name} extraction failed:`, error);
      continue;
    }
  }

  // If all methods failed, provide detailed error information
  const errorDetails = {
    url: window.location.href,
    envInfo,
    availableMethods: extractionMethods.map(m => m.name),
    documentReady: document.readyState,
    hasTextLayers: document.querySelectorAll('.textLayer').length,
    hasPDFApp: typeof (window as any).PDFViewerApplication !== 'undefined'
  };

  throw new Error(`Unable to extract text from PDF document using any available method. Details: ${JSON.stringify(errorDetails)}`);
}

/**
 * Fallback method to extract text from DOM elements
 */
function extractPDFTextFromDOM(options: ContentExtractionOptions = {}): TextSegment[] {
  const segments: TextSegment[] = [];
  const minTextLength = options.minTextLength || 1;

  try {
    // Try multiple container selectors
    const containerSelectors = [
      '#viewerContainer',
      '.pdfViewer',
      '#viewer',
      '#outerContainer',
      '.page',
      '[data-page-number]'
    ];

    let container: Element | null = null;

    for (const selector of containerSelectors) {
      container = document.querySelector(selector);
      if (container) {
        console.debug(`Found PDF container using selector: ${selector}`);
        break;
      }
    }

    if (!container) {
      throw new Error('No PDF container found in DOM');
    }

    // Extract text from container
    const text = cleanText(container.textContent || '');

    if (text.length >= minTextLength) {
      segments.push({
        text,
        element: container as HTMLElement,
        position: { start: 0, end: text.length },
        type: 'paragraph'
      });
    }

    // Also try to extract from individual pages if available
    const pages = container.querySelectorAll('.page, [data-page-number]');

    if (pages.length > 0) {
      console.debug(`Found ${pages.length} PDF pages in DOM`);

      let globalPosition = text.length > 0 ? text.length + 1 : 0;

      pages.forEach((page, index) => {
        const pageText = cleanText(page.textContent || '');

        if (pageText.length >= minTextLength && pageText !== text) {
          segments.push({
            text: pageText,
            element: page as HTMLElement,
            position: {
              start: globalPosition,
              end: globalPosition + pageText.length
            },
            type: 'paragraph'
          });

          globalPosition += pageText.length + 1;
        }
      });
    }

    return segments;

  } catch (error) {
    console.error('DOM fallback extraction failed:', error);
    throw new Error(`DOM fallback extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Waits for PDF.js to fully load before attempting text extraction with enhanced monitoring
 */
export function waitForPDFJSLoad(timeout: number = PDF_LOAD_TIMEOUT): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let lastLogTime = startTime;

    const checkLoaded = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      // Log progress every 2 seconds
      if (currentTime - lastLogTime > 2000) {
        console.debug(`Waiting for PDF.js to load... ${Math.round(elapsed / 1000)}s elapsed`);
        lastLogTime = currentTime;
      }

      // Check multiple indicators of PDF.js readiness
      const pdfApp = (window as any).PDFViewerApplication;
      const hasTextLayers = document.querySelectorAll('.textLayer').length > 0;
      const hasPages = document.querySelectorAll('.page, [data-page-number]').length > 0;
      const documentReady = document.readyState === 'complete';

      // More comprehensive readiness check
      const isReady = (
        (pdfApp && pdfApp.pdfDocument && pdfApp.pdfDocument.numPages > 0) ||
        (hasTextLayers && hasPages) ||
        (documentReady && hasPages)
      );

      if (isReady) {
        console.debug(`PDF.js loaded successfully after ${Math.round(elapsed / 1000)}s`);
        resolve();
        return;
      }

      // Check timeout
      if (elapsed > timeout) {
        const envInfo = getPDFJSEnvironmentInfo();
        reject(new Error(`Timeout waiting for PDF.js to load after ${Math.round(timeout / 1000)}s. Environment: ${JSON.stringify(envInfo)}`));
        return;
      }

      // Continue checking with adaptive interval
      const interval = elapsed < 1000 ? PDF_LOAD_RETRY_INTERVAL : PDF_LOAD_RETRY_INTERVAL * 2;
      setTimeout(checkLoaded, interval);
    };

    // Start checking immediately
    checkLoaded();
  });
}

/**
 * Validates PDF.js environment and provides diagnostic information
 */
export function validatePDFJSEnvironment(): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  environment: ReturnType<typeof getPDFJSEnvironmentInfo>;
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  const environment = getPDFJSEnvironmentInfo();

  // Check basic PDF.js presence
  if (!environment.isPDFJS) {
    issues.push('PDF.js not detected in current document');
    recommendations.push('Ensure the document is opened with PDF.js viewer');
  }

  // Check if PDF is loaded
  if (!environment.isLoaded) {
    issues.push('PDF document not fully loaded');
    recommendations.push('Wait for PDF.js to complete loading before extraction');
  }

  // Check for text layers
  if (!environment.hasTextLayers) {
    issues.push('No text layers found in PDF');
    recommendations.push('PDF may be image-based or text layers may not be rendered yet');
  }

  // Check page count
  if (environment.pageCount === 0) {
    issues.push('No PDF pages detected');
    recommendations.push('Verify PDF document is valid and properly loaded');
  }

  // Check for common issues
  const pdfApp = (window as any).PDFViewerApplication;
  if (pdfApp && pdfApp.pdfDocument && pdfApp.pdfDocument.numPages !== environment.pageCount) {
    issues.push('Mismatch between API page count and DOM page count');
    recommendations.push('PDF may still be loading or rendering');
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
    environment
  };
}

/**
 * Gets comprehensive PDF document metadata with enhanced error handling
 */
export async function getPDFMetadata(): Promise<{
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount?: number;
  version?: string;
  fileSize?: number;
  isEncrypted?: boolean;
  hasTextContent?: boolean;
}> {
  try {
    const pdfApp = (window as any).PDFViewerApplication;

    if (!pdfApp || !pdfApp.pdfDocument) {
      console.debug('PDF.js application or document not available for metadata extraction');
      return await getFallbackMetadata();
    }

    const pdfDocument = pdfApp.pdfDocument;
    const metadata = await pdfDocument.getMetadata();
    const info = metadata.info || {};

    // Get additional document properties
    const pageCount = pdfDocument.numPages;
    const fingerprint = pdfDocument.fingerprint;

    // Parse dates safely
    const parseDate = (dateString: string | undefined): Date | undefined => {
      if (!dateString) return undefined;
      try {
        // Handle PDF date format (D:YYYYMMDDHHmmSSOHH'mm')
        if (dateString.startsWith('D:')) {
          const cleanDate = dateString.substring(2, 16); // Extract YYYYMMDDHHMMSS
          const year = parseInt(cleanDate.substring(0, 4));
          const month = parseInt(cleanDate.substring(4, 6)) - 1; // Month is 0-indexed
          const day = parseInt(cleanDate.substring(6, 8));
          const hour = parseInt(cleanDate.substring(8, 10)) || 0;
          const minute = parseInt(cleanDate.substring(10, 12)) || 0;
          const second = parseInt(cleanDate.substring(12, 14)) || 0;

          return new Date(year, month, day, hour, minute, second);
        }
        return new Date(dateString);
      } catch (error) {
        console.warn('Error parsing PDF date:', dateString, error);
        return undefined;
      }
    };

    // Check if document has text content
    let hasTextContent = false;
    try {
      if (pageCount > 0) {
        const firstPage = await pdfDocument.getPage(1);
        const textContent = await firstPage.getTextContent();
        hasTextContent = textContent.items && textContent.items.length > 0;
      }
    } catch (error) {
      console.debug('Could not check text content:', error);
    }

    const result = {
      title: info.Title || document.title || undefined,
      author: info.Author || undefined,
      subject: info.Subject || undefined,
      creator: info.Creator || undefined,
      producer: info.Producer || undefined,
      creationDate: parseDate(info.CreationDate),
      modificationDate: parseDate(info.ModDate),
      pageCount,
      version: info.PDFFormatVersion || pdfApp.version || undefined,
      isEncrypted: info.IsEncrypted || false,
      hasTextContent
    };

    console.debug('Extracted PDF metadata:', result);
    return result;

  } catch (error) {
    console.warn('Error getting PDF metadata from API, trying fallback:', error);
    return await getFallbackMetadata();
  }
}

/**
 * Fallback method to get basic metadata from DOM and URL
 */
async function getFallbackMetadata(): Promise<{
  title?: string;
  pageCount?: number;
  hasTextContent?: boolean;
}> {
  try {
    const result: any = {};

    // Get title from document or URL
    result.title = document.title ||
      window.location.pathname.split('/').pop()?.replace('.pdf', '') ||
      'PDF Document';

    // Count pages from DOM
    const pages = document.querySelectorAll('.page, [data-page-number]');
    if (pages.length > 0) {
      result.pageCount = pages.length;
    }

    // Check for text content in DOM
    const textLayers = document.querySelectorAll('.textLayer');
    result.hasTextContent = textLayers.length > 0 &&
      Array.from(textLayers).some(layer =>
        (layer.textContent || '').trim().length > 0
      );

    console.debug('Fallback PDF metadata:', result);
    return result;

  } catch (error) {
    console.error('Error getting fallback PDF metadata:', error);
    return {};
  }
}

/**
 * Comprehensive PDF extraction with validation and error reporting
 */
export async function extractPDFTextWithValidation(options: ContentExtractionOptions = {}): Promise<{
  segments: TextSegment[];
  metadata: Awaited<ReturnType<typeof getPDFMetadata>>;
  validation: ReturnType<typeof validatePDFJSEnvironment>;
  extractionMethod: string;
  performance: {
    startTime: number;
    endTime: number;
    duration: number;
  };
}> {
  const startTime = Date.now();

  try {
    // Validate environment first
    const validation = validatePDFJSEnvironment();

    if (!validation.isValid) {
      console.warn('PDF.js environment validation failed:', validation.issues);
      console.info('Recommendations:', validation.recommendations);
    }

    // Extract metadata
    const metadata = await getPDFMetadata();

    // Extract text segments
    const segments = await extractPDFText(options);

    const endTime = Date.now();

    // Determine which extraction method was successful
    let extractionMethod = 'unknown';
    if (segments.length > 0) {
      // This is a simplified detection - in practice, you'd track this in extractPDFText
      if (document.querySelectorAll('.textLayer').length > 0) {
        extractionMethod = 'text-layers';
      } else {
        extractionMethod = 'pdf-api';
      }
    }

    const result = {
      segments,
      metadata,
      validation,
      extractionMethod,
      performance: {
        startTime,
        endTime,
        duration: endTime - startTime
      }
    };

    console.debug('PDF extraction completed:', {
      segmentCount: segments.length,
      method: extractionMethod,
      duration: result.performance.duration,
      isValid: validation.isValid
    });

    return result;

  } catch (error) {
    const endTime = Date.now();

    console.error('PDF extraction with validation failed:', error);

    throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}. Duration: ${endTime - startTime}ms`);
  }
}