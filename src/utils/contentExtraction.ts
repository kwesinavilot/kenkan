import { TextSegment, ContentExtractionOptions } from '../types/content';

// Selectors for elements to exclude from content extraction
const DEFAULT_EXCLUDE_SELECTORS = [
    'nav',
    'header',
    'footer',
    'aside',
    '.navigation',
    '.nav',
    '.menu',
    '.sidebar',
    '.advertisement',
    '.ad',
    '.ads',
    '.banner',
    '.popup',
    '.modal',
    '.cookie-notice',
    '.social-share',
    '.comments',
    '.comment',
    'script',
    'style',
    'noscript',
    '[role="navigation"]',
    '[role="banner"]',
    '[role="complementary"]',
    '[aria-hidden="true"]',
    '.sr-only',
    '.screen-reader-only',
    '.visually-hidden'
];

// Selectors for main content areas
const CONTENT_SELECTORS = [
    'main',
    'article',
    '[role="main"]',
    '.content',
    '.main-content',
    '.article-content',
    '.post-content',
    '.entry-content',
    '#content',
    '#main'
];

/**
 * Checks if an element should be excluded from content extraction
 */
export function shouldExcludeElement(element: Element, excludeSelectors: string[]): boolean {
    // Check if element matches any exclude selector
    for (const selector of excludeSelectors) {
        try {
            if (element.matches(selector)) {
                return true;
            }
        } catch (e) {
            // Invalid selector, skip
            continue;
        }
    }

    // Check if element is hidden
    if (element instanceof HTMLElement) {
        const style = window.getComputedStyle(element);
        if (style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.opacity === '0' ||
            element.offsetHeight === 0 ||
            element.offsetWidth === 0) {
            return true;
        }
    }

    return false;
}

/**
 * Finds the main content container on the page
 */
export function findMainContentContainer(): Element | null {
    // Try content selectors first
    for (const selector of CONTENT_SELECTORS) {
        const element = document.querySelector(selector);
        if (element) {
            return element;
        }
    }

    // Fallback to body if no main content found
    return document.body;
}

/**
 * Extracts text segments from DOM elements
 */
export function extractTextSegments(
    container: Element,
    options: ContentExtractionOptions = {}
): TextSegment[] {
    const segments: TextSegment[] = [];
    const excludeSelectors = [...DEFAULT_EXCLUDE_SELECTORS, ...(options.excludeSelectors || [])];
    const minTextLength = options.minTextLength || 10;

    function processElement(element: Element, startPosition: number): number {
        if (shouldExcludeElement(element, excludeSelectors)) {
            return startPosition;
        }

        let currentPosition = startPosition;

        // Handle text nodes directly
        if (element.nodeType === Node.TEXT_NODE) {
            const text = cleanText(element.textContent || '');
            if (text.length >= minTextLength) {
                segments.push({
                    text,
                    element: element.parentElement || undefined,
                    position: { start: currentPosition, end: currentPosition + text.length },
                    type: 'other'
                });
                currentPosition += text.length;
            }
            return currentPosition;
        }

        // Handle element nodes
        if (element.nodeType === Node.ELEMENT_NODE) {
            const htmlElement = element as HTMLElement;
            const tagName = htmlElement.tagName.toLowerCase();

            // Check if this is a content element that should be processed as a segment
            if (isContentElement(tagName)) {
                const text = cleanText(htmlElement.textContent || '');
                if (text.length >= minTextLength) {
                    const segmentType = getSegmentType(tagName);
                    segments.push({
                        text,
                        element: htmlElement,
                        position: { start: currentPosition, end: currentPosition + text.length },
                        type: segmentType
                    });
                    currentPosition += text.length;
                }
            } else {
                // Process child nodes recursively
                for (const child of Array.from(element.childNodes)) {
                    currentPosition = processElement(child as Element, currentPosition);
                }
            }
        }

        return currentPosition;
    }

    processElement(container, 0);
    return segments;
}

/**
 * Determines if an element should be treated as a content segment
 */
function isContentElement(tagName: string): boolean {
    const contentTags = [
        'p', 'div', 'span', 'article', 'section',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'li', 'blockquote', 'pre', 'code'
    ];
    return contentTags.includes(tagName);
}

/**
 * Determines the segment type based on HTML tag
 */
function getSegmentType(tagName: string): TextSegment['type'] {
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        return 'heading';
    }
    if (['p', 'div', 'article', 'section'].includes(tagName)) {
        return 'paragraph';
    }
    if (tagName === 'li') {
        return 'list';
    }
    return 'other';
}

/**
 * Cleans and normalizes text content
 */
export function cleanText(text: string): string {
    return text
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Remove leading/trailing whitespace
        .trim()
        // Remove common unwanted characters
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width characters
        // Normalize quotes
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        // Remove multiple consecutive punctuation
        .replace(/[.]{3,}/g, '...')
        // Ensure proper spacing after punctuation
        .replace(/([.!?])([A-Z])/g, '$1 $2');
}

/**
 * Filters content elements to exclude navigation, ads, and non-content
 */
export function filterContentElements(elements: Element[]): Element[] {
    return elements.filter(element => {
        // Skip if element should be excluded
        if (shouldExcludeElement(element, DEFAULT_EXCLUDE_SELECTORS)) {
            return false;
        }

        // Skip if element has no meaningful text content
        const textContent = element.textContent?.trim() || '';
        if (textContent.length < 10) {
            return false;
        }

        // Skip if element appears to be navigation or UI
        const className = element.className?.toLowerCase() || '';
        const id = element.id?.toLowerCase() || '';

        const skipPatterns = [
            'nav', 'menu', 'header', 'footer', 'sidebar', 'ad', 'advertisement',
            'social', 'share', 'comment', 'popup', 'modal', 'cookie'
        ];

        for (const pattern of skipPatterns) {
            if (className.includes(pattern) || id.includes(pattern)) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Generates a unique ID for content
 */
export function generateContentId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}