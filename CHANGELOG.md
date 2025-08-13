# Changelog

All notable changes to the Kenkan Chrome Extension project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Next Steps
- Background service worker for state management
- UI components for TTS controls
- User preferences and settings persistence
- Performance monitoring and analytics
- Accessibility features and keyboard shortcuts

---

## [0.4.0] - 2025-08-13

### Added
#### Enhanced PDF Text Extraction System
- **Comprehensive PDF.js Detection** - 15+ detection methods for various PDF.js configurations
  - Support for embedded PDFs and different viewer implementations
  - Environment diagnostics with detailed detection reporting
  - Fallback detection for edge cases and custom implementations

- **Multi-Method Text Extraction** - Robust extraction with automatic fallback chain
  - Text Layer Extraction with DOM-based processing and element type detection
  - PDF.js API Extraction with direct API access and line grouping
  - DOM Fallback Extraction for when other methods fail
  - Intelligent text structure preservation and formatting

- **Advanced Error Handling & Recovery**
  - Retry logic with exponential backoff for temporary failures
  - Comprehensive environment validation before extraction attempts
  - Detailed error reporting with diagnostic information
  - Graceful degradation when PDF.js features are unavailable

- **Enhanced Metadata Extraction**
  - Complete PDF metadata support (title, author, dates, page count, encryption status)
  - PDF date format parsing with proper handling of PDF date strings
  - Text content detection to verify extractable content availability
  - Fallback metadata extraction from DOM and URL when API unavailable

- **Performance Monitoring & Diagnostics**
  - Performance tracking with detailed timing measurements
  - Progress logging during long PDF processing operations
  - Adaptive retry intervals based on operation duration
  - Memory-efficient processing for large PDF documents
  - Comprehensive extraction reporting with method tracking

### Enhanced
- **PDF Extraction Integration** - Full integration with existing content extraction system
- **Type Safety** - Enhanced TypeScript interfaces for PDF-specific functionality
- **Error Reporting** - Structured error messages with actionable recommendations

### Files Modified
- `src/utils/pdfExtraction.ts` - Complete rewrite with 600+ lines of enhanced functionality

### Requirements Satisfied
- ✅ **Requirement 1.2** - PDF text extraction using PDF.js detection
- ✅ **Requirement 1.5** - Error handling for when PDF.js is not available

### Added
#### Enhanced PDF Text Extraction System
- **Comprehensive PDF.js Detection** - 15+ detection methods for various PDF viewer configurations
  - Support for embedded PDFs and different PDF.js versions
  - Environment diagnostics with detailed detection reporting
  - Automatic fallback detection for edge cases

#### Advanced Text Extraction Methods
- **Multi-Method Extraction Pipeline**
  - Text Layer Extraction - Fast DOM-based extraction with element type detection
  - PDF.js API Extraction - Direct API access with intelligent line grouping
  - DOM Fallback Extraction - Robust fallback when other methods fail
  - Automatic method selection with performance optimization

#### Robust Error Handling & Recovery
- **Intelligent Retry Logic** - Exponential backoff for temporary failures
- **Environment Validation** - Pre-flight checks with issue detection and recommendations
- **Comprehensive Error Reporting** - Detailed diagnostics for troubleshooting
- **Graceful Degradation** - Continues operation when features are unavailable

#### Enhanced Metadata & Performance
- **Complete PDF Metadata Extraction**
  - Document properties (title, author, creation date, page count)
  - PDF format version and encryption status
  - Text content availability detection
  - Fallback metadata from DOM and URL when API unavailable

- **Performance Monitoring & Optimization**
  - Extraction timing and performance metrics
  - Progress logging for long operations
  - Memory-efficient processing for large documents
  - Adaptive retry intervals based on operation duration

### Enhanced
- **Text Structure Preservation** - Intelligent grouping maintains document formatting
- **Type Safety** - Full TypeScript integration with existing content extraction system
- **Debug Capabilities** - Comprehensive logging and diagnostic information

### Files Modified
- `src/utils/pdfExtraction.ts` - Complete rewrite with 600+ lines of enhanced functionality

### Requirements Satisfied
- ✅ **Requirement 1.2** - PDF text extraction using PDF.js detection
- ✅ **Requirement 1.5** - Error handling for when PDF.js is not available

---

## [0.3.0] - 2025-08-13

### Added
#### TTS Management System - Complete Implementation
- **TTSManager Class** - Comprehensive text-to-speech management system
  - Chrome TTS API integration with full voice control capabilities
  - Web Speech API fallback for cross-platform compatibility
  - Voice selection and enumeration with `chrome.tts.getVoices()` support
  - Speed, volume, and pitch controls with type safety and validation
  - Event-driven architecture for playback state management
  - Support for start, end, pause, resume, boundary, and error events

#### AI SDK Integration
- **Vercel AI SDK Integration** - Enhanced text processing for natural speech
  - Text enhancement using OpenAI GPT-3.5-turbo for better TTS output
  - Natural pause insertion and pronunciation improvements
  - Configurable AI enhancement options
  - Fallback to original text when AI enhancement fails

#### Advanced Error Handling & Fallback Systems
- **TTSErrorHandler Utility Class** - Comprehensive error management
  - Automatic error categorization (Network, Voice, Permission, Synthesis errors)
  - User-friendly error messages and recovery suggestions
  - Error reporting system with detailed debugging information
  - Voice reliability filtering to prefer stable voices

- **Multi-Level Fallback Mechanisms**
  - Voice fallback when preferred voice is unavailable
  - Engine fallback from Chrome TTS to Web Speech API
  - Segment skipping for problematic content
  - Full system recovery and reinitialization
  - Network connectivity checking for remote voices

- **Retry Logic with Exponential Backoff**
  - Configurable retry attempts and delays
  - Smart retry logic for temporary failures
  - Exponential backoff to prevent system overload
  - Maximum retry limits to prevent infinite loops

#### System Health & Monitoring
- **Health Status Monitoring**
  - TTS engine availability checking
  - Voice count and availability monitoring
  - Network connectivity status
  - Comprehensive health reporting with error details

- **Voice Testing & Validation**
  - Pre-flight voice testing before usage
  - Voice configuration validation
  - Parameter range checking (rate: 0.1-10, pitch: 0-2, volume: 0-1)
  - Automatic fallback voice selection

### Files Added
- `src/background/ttsManager.ts` - Main TTS management class (850+ lines)
- `src/background/ttsErrorHandler.ts` - Error handling utilities (300+ lines)
- `src/types/tts.ts` - TypeScript type definitions (80+ lines)

### Requirements Satisfied
- ✅ **Requirement 2.1** - TTS integration with Chrome extension APIs
- ✅ **Requirement 2.2** - Voice selection and audio controls
- ✅ **Requirement 2.5** - Error handling and fallback mechanisms

---

## [0.2.0] - 2025-08-12

### Added
#### Content Processing & Text Optimization
- **Text Processing Utilities** (`src/utils/textProcessing.ts`)
  - Smart text chunking for optimal TTS processing
  - Sentence boundary detection with abbreviation handling
  - Text normalization and cleanup for better speech synthesis
  - Natural pause insertion for improved speech flow
  - Special character and formatting handling (URLs, emails, symbols)
  - Speech duration estimation algorithms
  - Text validation for TTS suitability

#### React Hook for Content Management
- **useContentExtractor Hook** (`src/hooks/useContentExtractor.ts`)
  - Unified interface for content extraction from multiple sources
  - HTML text extraction with TTS optimization
  - PDF text extraction integration
  - OCR text extraction placeholder (future implementation)
  - Text processing pipeline for TTS preparation
  - State management for extraction operations
  - Error handling and loading states

#### Enhanced Content Types
- **Extended TextSegment Interface** - Added TTS-specific properties
  - `processed` flag for tracking TTS optimization status
  - `chunks` array for storing processed text chunks
- **TextChunk Interface** - Granular text processing units
  - Unique chunk identification
  - Position tracking within original text
  - Word count and duration estimation
  - Optimized for TTS playback control

### Enhanced
- **Content Extraction Options** - Added TTS-specific processing options
  - Text chunking configuration
  - Pause insertion controls
  - Whitespace normalization settings
  - Special character handling options

### Files Modified
- `src/types/content.ts` - Extended with TTS-related interfaces
- `src/hooks/useContentExtractor.ts` - Added TTS processing integration

### Files Added
- `src/utils/textProcessing.ts` - Complete text processing utilities (400+ lines)

---

## [0.1.0] - 2025-08-12

### Added
#### Core Content Extraction System
- **Content Type Definitions** (`src/types/content.ts`)
  - `TextSegment` interface for structured text representation
  - `TextContent` interface for complete document structure
  - `ContentExtractionOptions` for configurable extraction behavior
  - `ContentExtractionResult` for operation results with error handling

#### HTML Content Extraction
- **Content Extraction Utilities** (`src/utils/contentExtraction.ts`)
  - Smart main content detection using semantic selectors
  - DOM traversal with noise filtering (navigation, ads, UI elements)
  - Text segment extraction with position tracking
  - Element type classification (paragraph, heading, list, other)
  - Text cleaning and normalization
  - Content filtering to exclude non-readable elements

#### PDF Document Support
- **PDF.js Integration** (`src/utils/pdfExtraction.ts`)
  - PDF.js document detection and compatibility checking
  - Asynchronous PDF text extraction
  - PDF metadata extraction (title, author, creation date)
  - Page-by-page text processing
  - PDF loading state management
  - Error handling for PDF processing failures

#### Project Foundation
- **Chrome Extension Structure**
  - Vite-based build system with TypeScript support
  - React 19 with modern hooks and components
  - Chrome extension manifest and permissions
  - Background script entry point
  - Content script integration
  - Popup interface foundation

#### Dependencies & Tooling
- **Core Dependencies**
  - React 19.1.1 with React DOM
  - TypeScript 5.8.3 with strict type checking
  - Vite 7.1.2 for fast development and building
  - Chrome Types for extension API support
  - Tailwind CSS 4.1.11 for styling
  - Lucide React for icons

- **AI SDK Foundation**
  - Vercel AI SDK 5.0.11 for future AI integration
  - OpenAI SDK 2.0.11 for text enhancement capabilities

### Files Added
- `src/types/content.ts` - Core content type definitions (60+ lines)
- `src/utils/contentExtraction.ts` - HTML content extraction (300+ lines)
- `src/utils/pdfExtraction.ts` - PDF processing utilities (200+ lines)
- `src/hooks/useContentExtractor.ts` - React hook for content management (200+ lines)
- `src/background/index.ts` - Background script entry point
- `src/content/index.ts` - Content script entry point
- `src/popup/index.tsx` - Popup interface component

### Architecture Decisions
- **Modular Design** - Separated concerns across utilities, hooks, and types
- **Type Safety** - Comprehensive TypeScript interfaces for all data structures
- **Error Handling** - Structured error reporting with success/failure states
- **Extensibility** - Plugin-ready architecture for multiple content sources
- **Performance** - Lazy loading and efficient DOM traversal algorithms

---

## Development Notes

### Technical Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite with Chrome extension optimizations
- **AI Integration**: Vercel AI SDK with OpenAI GPT models
- **Browser APIs**: Chrome Extension APIs, Web Speech API, Chrome TTS API
- **Architecture**: Event-driven, modular design with comprehensive error handling

### Known Limitations
- OCR text extraction not yet implemented (placeholder in v0.2.0)
- AI enhancement requires internet connectivity
- Some voices may not be available on all systems
- Chrome TTS API availability varies by platform
- Network-dependent voices may have latency issues

### Performance Considerations
- Lazy voice loading to improve startup time
- Voice caching to reduce API calls
- Exponential backoff to prevent system overload
- Text chunking for large content processing
- Async/await patterns for non-blocking operations