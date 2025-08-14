# Changelog

All notable changes to Kenkan will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1] - 2025-08-14

### 🎨 UI/UX Enhancements

#### Enhanced Floating Button
- **IMPROVED**: Floating button now draggable in all directions (previously horizontal-only)
- **FIXED**: Button roundness with proper CSS overrides using `!rounded-full`
- **ENHANCED**: Improved drag behavior with better event handling and visual feedback
- **ADDED**: Proper cursor states (grab/grabbing) during drag operations
- **OPTIMIZED**: Drag boundaries adjusted for better screen edge handling
- **IMPROVED**: Prevented text selection and improved responsiveness during dragging

### 🔧 Technical Improvements
- **ENHANCED**: Mouse event handling with preventDefault for smoother dragging
- **IMPROVED**: Drag state management with proper cleanup and cursor restoration
- **OPTIMIZED**: Event listeners with passive flags for better performance

---

## [1.3.0] - 2025-08-14

### 🎉 Major Features Added

#### Custom TTS Engine Implementation
- **NEW**: Complete Chrome TTS Engine implementation with `ttsEngine` permission
- **NEW**: 4 unique AI-powered voices with distinct personalities:
  - **Sandra**: Warm, friendly conversational voice (English)
  - **Kwesi**: Deep, authoritative news anchor voice (English)  
  - **Kwame**: Rich, expressive storyteller voice (English)
  - **Akua**: Eloquent, graceful French voice (French)
- **NEW**: Voice personality profiles with specialized characteristics and use cases
- **NEW**: AI-enhanced text processing tailored to each voice's personality
- **NEW**: Dynamic voice registration and management system

#### Enhanced TTS Architecture
- **NEW**: Multi-engine TTS architecture (Chrome TTS + Web Speech API + Custom Engine)
- **NEW**: Intelligent voice matching system that selects optimal system voices
- **NEW**: Seamless fallback mechanisms between different TTS engines
- **NEW**: Real-time voice availability monitoring and health checks
- **NEW**: Extension now functions as both TTS consumer AND provider

#### AI Integration Improvements
- **ENHANCED**: OpenAI GPT integration now adapts text for specific voice characteristics
- **ENHANCED**: Voice-specific text enhancement based on personality profiles
- **ENHANCED**: Improved natural speech flow with personality-aware pauses and emphasis

### 🔧 Technical Improvements

#### Build System & TypeScript
- **FIXED**: All TypeScript compilation errors and type safety issues
- **FIXED**: Browser environment compatibility (setTimeout/clearTimeout types)
- **FIXED**: Chrome extension API type definitions for TTS Engine
- **IMPROVED**: Build configuration for extension packaging
- **IMPROVED**: Type definitions for custom voice profiles

#### Error Handling & Reliability
- **ENHANCED**: Multi-level fallback system for TTS engine failures
- **ENHANCED**: Robust error recovery with voice-specific fallbacks
- **ENHANCED**: Network connectivity checks for remote voices
- **IMPROVED**: Extension context invalidation handling
- **IMPROVED**: Graceful degradation when AI services unavailable

#### Performance Optimizations
- **OPTIMIZED**: Voice initialization and loading performance
- **OPTIMIZED**: Memory usage for large document processing
- **OPTIMIZED**: Background script efficiency and resource management
- **IMPROVED**: Reduced API calls and better caching strategies

### 🎨 UI/UX Enhancements

#### Voice Selection Interface
- **NEW**: Advanced voice selector component with personality previews
- **NEW**: Voice testing functionality with sample audio
- **NEW**: Visual voice characteristics display (gender, age, tone, specialties)
- **NEW**: TTS engine status indicators and health monitoring
- **IMPROVED**: Popup interface with better voice management

#### User Experience
- **ENHANCED**: Smoother transitions between different voices
- **ENHANCED**: Better feedback for voice switching and engine status
- **IMPROVED**: Error messages with actionable recovery suggestions
- **IMPROVED**: Loading states and progress indicators

### 📋 Manifest & Permissions
- **ADDED**: `ttsEngine` permission for custom voice provider functionality
- **ADDED**: TTS engine voice registration in manifest
- **UPDATED**: Extension description to reflect AI voice capabilities
- **CONFIGURED**: Voice event types and engine capabilities

### 🐛 Bug Fixes
- **FIXED**: TypeScript errors related to Chrome TTS Engine API types
- **FIXED**: Global/globalThis compatibility issues in service worker
- **FIXED**: NodeJS.Timeout type conflicts in browser environment
- **FIXED**: Extension context invalidation error handling
- **FIXED**: Voice availability detection and fallback logic
- **FIXED**: Build process for extension packaging

### 🔄 Breaking Changes
- **CHANGED**: Voice selection interface now includes custom AI voices
- **CHANGED**: TTS engine initialization process with multi-engine support
- **CHANGED**: Background script architecture to support TTS engine provider

### 📚 Documentation
- **UPDATED**: README with comprehensive TTS Engine documentation
- **ADDED**: Voice personality profiles and use case descriptions
- **ADDED**: Technical architecture documentation for TTS Engine
- **ADDED**: Installation and development setup instructions
- **CREATED**: This changelog for version tracking

---

## [1.2.0] - 2025-08-13

### Added
- Enhanced content extraction for complex web pages
- Improved PDF processing with better text segmentation
- Advanced error handling and recovery mechanisms
- Performance optimizations for large documents

### Fixed
- Content script injection timing issues
- Memory leaks in background service worker
- PDF extraction reliability improvements

---

## [1.1.0] - 2025-08-13

### Added
- Complete UI/UX system with animated floating controls
- Smart popup interface with current reading tab display
- Cross-tab state management and synchronization
- Real-time text highlighting during playback
- AI text enhancement using OpenAI GPT
- Comprehensive error handling and fallback systems

### Changed
- Migrated to Manifest V3 for Chrome extensions
- Updated to React 19 and modern development stack
- Improved content extraction algorithms

---

## [1.0.0] - 2025-08-13

### Added
- Initial release of Kenkan Chrome Extension
- Basic text-to-speech functionality
- HTML and PDF content extraction
- Chrome TTS and Web Speech API integration
- Simple floating button interface
- Basic playback controls (play, pause, stop)

### Technical
- TypeScript implementation
- React-based popup interface
- Vite build system
- Chrome Extension Manifest V3

---

## Legend

- 🎉 **Major Features**: Significant new functionality
- 🔧 **Technical**: Under-the-hood improvements
- 🎨 **UI/UX**: User interface and experience changes
- 📋 **Manifest**: Extension configuration changes
- 🐛 **Bug Fixes**: Issue resolutions
- 🔄 **Breaking Changes**: Changes that may affect existing usage
- 📚 **Documentation**: Documentation updates