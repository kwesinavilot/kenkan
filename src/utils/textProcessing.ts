import type { TextSegment, TextChunk, TextProcessingOptions } from '../types/content';

/**
 * Splits text into manageable chunks for TTS processing
 */
export function chunkText(
  text: string,
  options: TextProcessingOptions = {}
): TextChunk[] {
  const {
    maxChunkSize = 500,
    maxChunkWords = 100,
    preserveSentences = true,
    addPauses = true
  } = options;

  const chunks: TextChunk[] = [];

  if (!text || text.trim().length === 0) {
    return chunks;
  }

  // Normalize the text first
  const normalizedText = normalizeTextForTTS(text, options);

  // Split into sentences if preserveSentences is true
  const sentences = preserveSentences
    ? splitIntoSentences(normalizedText)
    : [normalizedText];

  let currentChunk = '';
  let currentWordCount = 0;
  let startIndex = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).length;

    // Check if adding this sentence would exceed limits
    const wouldExceedSize = currentChunk.length + sentence.length > maxChunkSize;
    const wouldExceedWords = currentWordCount + sentenceWords > maxChunkWords;

    if (currentChunk && (wouldExceedSize || wouldExceedWords)) {
      // Create chunk from current content
      const chunkText = addPauses ? addNaturalPauses(currentChunk.trim()) : currentChunk.trim();

      chunks.push({
        id: generateChunkId(chunks.length),
        text: chunkText,
        startIndex,
        endIndex: startIndex + currentChunk.length,
        wordCount: currentWordCount,
        estimatedDuration: estimateSpeechDuration(chunkText)
      });

      // Start new chunk
      startIndex += currentChunk.length;
      currentChunk = sentence;
      currentWordCount = sentenceWords;
    } else {
      // Add sentence to current chunk
      if (currentChunk) {
        currentChunk += ' ' + sentence;
      } else {
        currentChunk = sentence;
      }
      currentWordCount += sentenceWords;
    }
  }

  // Add final chunk if there's remaining content
  if (currentChunk.trim()) {
    const chunkText = addPauses ? addNaturalPauses(currentChunk.trim()) : currentChunk.trim();

    chunks.push({
      id: generateChunkId(chunks.length),
      text: chunkText,
      startIndex,
      endIndex: startIndex + currentChunk.length,
      wordCount: currentWordCount,
      estimatedDuration: estimateSpeechDuration(chunkText)
    });
  }

  return chunks;
}

/**
 * Normalizes text for optimal TTS processing
 */
export function normalizeTextForTTS(
  text: string,
  options: TextProcessingOptions = {}
): string {
  const {
    normalizeWhitespace = true,
    removeSpecialChars = true
  } = options;

  let normalized = text;

  if (normalizeWhitespace) {
    // Normalize whitespace
    normalized = normalized
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
      .trim();
  }

  if (removeSpecialChars) {
    // Remove or replace problematic characters for TTS
    normalized = normalized
      // Remove zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Normalize quotes
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      // Normalize dashes
      .replace(/[—–]/g, '-')
      // Remove excessive punctuation
      .replace(/[.]{4,}/g, '...')
      .replace(/[!]{2,}/g, '!')
      .replace(/[?]{2,}/g, '?')
      // Handle common abbreviations
      .replace(/\bDr\./g, 'Doctor')
      .replace(/\bMr\./g, 'Mister')
      .replace(/\bMrs\./g, 'Missus')
      .replace(/\bMs\./g, 'Miss')
      .replace(/\bProf\./g, 'Professor')
      // Handle numbers and dates
      .replace(/(\d+)\/(\d+)\/(\d+)/g, '$1 slash $2 slash $3')
      .replace(/(\d+)%/g, '$1 percent')
      .replace(/\$(\d+)/g, '$1 dollars');
  }

  return normalized;
}

/**
 * Adds natural pauses to text for better TTS flow
 */
export function addNaturalPauses(text: string): string {
  return text
    // Add pause after sentences
    .replace(/([.!?])\s+/g, '$1 <break time="0.5s"/> ')
    // Add pause after commas
    .replace(/,\s+/g, ', <break time="0.2s"/> ')
    // Add pause after colons and semicolons
    .replace(/([;:])\s+/g, '$1 <break time="0.3s"/> ')
    // Add pause after paragraph breaks
    .replace(/\n\n/g, ' <break time="1s"/> ')
    // Add pause for parenthetical content
    .replace(/\(\s*([^)]+)\s*\)/g, ' <break time="0.2s"/> ($1) <break time="0.2s"/> ');
}

/**
 * Splits text into sentences while preserving sentence boundaries
 */
export function splitIntoSentences(text: string): string[] {
  // More sophisticated sentence splitting that handles common abbreviations
  const sentences: string[] = [];

  // Common abbreviations that shouldn't trigger sentence breaks
  const abbreviations = [
    'Dr', 'Mr', 'Mrs', 'Ms', 'Prof', 'Sr', 'Jr', 'vs', 'etc', 'Inc', 'Ltd', 'Corp',
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Create regex pattern for abbreviations
  const abbrevPattern = abbreviations.join('|');

  // Split on sentence endings, but not after abbreviations
  const parts = text.split(/([.!?]+\s+)/);

  let currentSentence = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    currentSentence += part;

    // Check if this part ends a sentence
    if (/[.!?]+\s+$/.test(part)) {
      // Check if the previous part was an abbreviation
      const prevPart = parts[i - 1] || '';
      const isAbbreviation = new RegExp(`\\b(${abbrevPattern})$`, 'i').test(prevPart.trim());

      if (!isAbbreviation) {
        sentences.push(currentSentence.trim());
        currentSentence = '';
      }
    }
  }

  // Add any remaining content as the final sentence
  if (currentSentence.trim()) {
    sentences.push(currentSentence.trim());
  }

  return sentences.filter(s => s.length > 0);
}

/**
 * Estimates speech duration in seconds based on text length and complexity
 */
export function estimateSpeechDuration(text: string, wordsPerMinute: number = 150): number {
  const words = text.split(/\s+/).length;
  const baseTime = (words / wordsPerMinute) * 60; // Convert to seconds

  // Add time for punctuation pauses
  const punctuationCount = (text.match(/[.!?]/g) || []).length;
  const commaCount = (text.match(/,/g) || []).length;

  const pauseTime = (punctuationCount * 0.5) + (commaCount * 0.2);

  return Math.max(baseTime + pauseTime, 1); // Minimum 1 second
}

/**
 * Processes text segments into optimized chunks for TTS
 */
export function processSegmentsForTTS(
  segments: TextSegment[],
  options: TextProcessingOptions = {}
): TextChunk[] {
  const allChunks: TextChunk[] = [];

  for (const segment of segments) {
    const segmentChunks = chunkText(segment.text, options);
    allChunks.push(...segmentChunks);
  }

  return allChunks;
}

/**
 * Handles special characters and formatting for TTS
 */
export function handleSpecialFormatting(text: string): string {
  return text
    // Handle URLs
    .replace(/https?:\/\/[^\s]+/g, 'link')
    .replace(/www\.[^\s]+/g, 'website')
    // Handle email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'email address')
    // Handle phone numbers
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, 'phone number')
    // Handle hashtags and mentions
    .replace(/#(\w+)/g, 'hashtag $1')
    .replace(/@(\w+)/g, 'at $1')
    // Handle mathematical expressions
    .replace(/(\d+)\s*\+\s*(\d+)/g, '$1 plus $2')
    .replace(/(\d+)\s*-\s*(\d+)/g, '$1 minus $2')
    .replace(/(\d+)\s*\*\s*(\d+)/g, '$1 times $2')
    .replace(/(\d+)\s*\/\s*(\d+)/g, '$1 divided by $2')
    .replace(/(\d+)\s*=\s*(\d+)/g, '$1 equals $2')
    // Handle common symbols
    .replace(/&/g, 'and')
    .replace(/@/g, 'at')
    .replace(/#/g, 'number')
    .replace(/\$/g, 'dollar')
    .replace(/%/g, 'percent')
    .replace(/\+/g, 'plus')
    .replace(/</g, 'less than')
    .replace(/>/g, 'greater than');
}

/**
 * Generates a unique ID for text chunks
 */
function generateChunkId(index: number): string {
  return `chunk_${index}_${Date.now()}`;
}

/**
 * Cleans text content for better readability and TTS processing
 */
export function cleanTextForTTS(text: string): string {
  return handleSpecialFormatting(
    normalizeTextForTTS(text, {
      normalizeWhitespace: true,
      removeSpecialChars: true
    })
  );
}

/**
 * Validates if text is suitable for TTS processing
 */
export function isValidTTSText(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const trimmed = text.trim();

  // Check minimum length
  if (trimmed.length < 3) {
    return false;
  }

  // Check if text contains mostly non-alphabetic characters
  const alphaCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
  const alphaRatio = alphaCount / trimmed.length;

  if (alphaRatio < 0.3) {
    return false;
  }

  return true;
}