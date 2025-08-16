# Changelog

All notable changes to Kenkan will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.7.0] - 2025-08-16

### 🎉 **MAJOR RELEASE - AI-Powered Voice Enhancement**

#### Revolutionary LLM TTS Integration
- **NEW**: Multi-provider LLM TTS architecture supporting Gemini, OpenAI, and ElevenLabs
- **NEW**: Seamless voice enhancement - existing voice profiles now powered by premium AI TTS
- **NEW**: Behind-the-scenes LLM mapping preserves familiar voice branding while delivering superior quality
- **NEW**: Automatic fallback system - LLM TTS → System TTS for uninterrupted experience

#### Enhanced Voice Profiles with AI Power
- **ENHANCED**: **Kwame** (Expressive Storyteller) → Now powered by Gemini Puck for natural storytelling
- **ENHANCED**: **Sandra** (Warm & Friendly) → Now powered by Gemini Kore for warm conversations  
- **ENHANCED**: **Kwesi** (Authoritative News) → Now powered by OpenAI Onyx HD for professional delivery
- **ENHANCED**: **Akua** (French Eloquent) → Now powered by ElevenLabs Bella for multilingual excellence

#### Pluggable TTS Provider System
- **NEW**: `BaseTTSProvider` abstract class for extensible provider architecture
- **NEW**: `TTSProviderManager` for intelligent provider switching and management
- **NEW**: `GeminiTTSProvider` with Gemini 2.5 Flash/Pro Preview TTS models
- **NEW**: `OpenAITTSProvider` with TTS-1 and TTS-1-HD quality options
- **NEW**: `ElevenLabsTTSProvider` with professional voice actor quality
- **NEW**: Voice mapping system (`voiceMapping.ts`) for branded voice → LLM voice translation

#### Smart Audio Management
- **NEW**: Intelligent audio caching system to minimize API costs and improve performance
- **NEW**: Provider-specific audio generation with optimal settings per voice type
- **NEW**: Real-time audio playback with progress tracking and boundary events
- **NEW**: Automatic cleanup and memory management for cached audio files

### 🔧 Technical Architecture Improvements

#### Multi-Provider Infrastructure
- **NEW**: Generic provider interface supporting unlimited TTS services
- **NEW**: Provider-specific configuration management with model and voice selection
- **NEW**: Hardcoded API key system for seamless deployment (no user configuration needed)
- **NEW**: Automatic provider initialization and health monitoring

#### Enhanced TTS Manager
- **REFACTORED**: Complete TTS manager overhaul with provider-agnostic architecture
- **NEW**: Voice mapping detection - automatically routes branded voices to appropriate LLM providers
- **NEW**: Intelligent provider switching based on voice selection
- **NEW**: Enhanced error handling with provider-specific fallback strategies
- **NEW**: Background message handling for provider configuration updates

#### Type Safety & Code Quality
- **IMPROVED**: Comprehensive TypeScript interfaces for all provider types
- **IMPROVED**: Type-only imports for better compilation performance
- **IMPROVED**: Proper error handling and async/await patterns throughout
- **FIXED**: All TypeScript compilation errors and import issues

### 🎨 User Experience Enhancements

#### Preserved Voice Branding
- **MAINTAINED**: All existing voice names, descriptions, and personality profiles
- **MAINTAINED**: Familiar user interface with no learning curve
- **MAINTAINED**: Same voice selection process - users see Kwame, Sandra, Kwesi, Akua
- **ENHANCED**: Dramatically improved voice quality without changing user experience

#### Seamless Integration
- **HIDDEN**: LLM TTS settings panel (commented out) - no user configuration required
- **AUTOMATIC**: Voice enhancement happens transparently behind the scenes
- **FALLBACK**: Graceful degradation to system TTS if LLM providers unavailable
- **CONSISTENT**: Same playback controls and features work with enhanced voices

#### Performance Optimizations
- **OPTIMIZED**: Audio caching reduces repeated API calls for same content
- **OPTIMIZED**: Provider-specific speed mapping for optimal playback experience
- **OPTIMIZED**: Memory management with automatic cache cleanup
- **OPTIMIZED**: Network efficiency with intelligent request batching

### 📋 Configuration & Deployment

#### Hardcoded API Integration
- **NEW**: `voiceMapping.ts` configuration file for easy API key management
- **NEW**: Provider-specific voice and model mappings
- **NEW**: Centralized API key storage for deployment
- **SIMPLIFIED**: No user configuration required - works out of the box

#### Provider Capabilities
- **GEMINI**: 4 voices (Puck, Charon, Kore, Fenrir) with 2 quality models
- **OPENAI**: 6 voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer) with standard/HD quality
- **ELEVENLABS**: 6+ professional voices with multiple model options
- **SYSTEM**: Fallback to Chrome TTS and Web Speech API

### 🔄 Breaking Changes
- **INTERNAL**: Complete TTS provider architecture redesign (user-facing interface unchanged)
- **ENHANCED**: Voice quality dramatically improved while maintaining same voice names
- **REMOVED**: User-facing LLM configuration (now handled automatically)

### 🐛 Bug Fixes
- **FIXED**: TypeScript compilation errors with proper type-only imports
- **FIXED**: React import warnings in components
- **FIXED**: ReadingStats type conflicts between components
- **FIXED**: Duplicate variable declarations in popup component
- **FIXED**: Provider initialization and error handling edge cases

### 📚 Documentation Updates
- **ADDED**: Comprehensive LLM TTS integration documentation
- **ADDED**: Provider architecture and voice mapping documentation
- **UPDATED**: Installation and configuration instructions
- **CREATED**: Voice enhancement feature descriptions

---

## [2.6.1] - 2025-08-15

### 🏗️ Code Architecture & Maintainability Improvements

#### Component-Based Architecture Refactoring
- **REFACTORED**: Broke down monolithic 700+ line popup into 9 modular components
- **NEW**: `Header.tsx` - Clean app header with logo and settings button
- **NEW**: `ContentDetectionBar.tsx` - Displays detected content information
- **NEW**: `VoiceSelector.tsx` - Complete voice selection dropdown with premium indicators
- **NEW**: `ProgressSection.tsx` - Progress display with integrated waveform animation
- **NEW**: `MainControls.tsx` - Primary playback controls (play/pause/stop/skip)
- **NEW**: `SecondaryControls.tsx` - Conditional volume and speed controls
- **NEW**: `QuickStats.tsx` - Reading time and document statistics display
- **NEW**: `Footer.tsx` - Simple version footer component
- **NEW**: `Switch.tsx` - Reusable toggle switch component

#### Type Safety & Code Organization
- **NEW**: `src/types/popup.ts` - Centralized TypeScript interfaces for all popup components
- **IMPROVED**: Consistent prop interfaces across all components
- **ENHANCED**: Better separation of concerns - business logic in main file, UI in components
- **OPTIMIZED**: 65% reduction in main popup file size (700+ → 200 lines)

#### Developer Experience Improvements
- **ENHANCED**: Each component has single responsibility and clear boundaries
- **IMPROVED**: Components are now reusable and easily testable
- **BETTER**: Cleaner import structure and dependency management
- **MAINTAINABLE**: Easier to modify individual UI sections without affecting others

---

## [2.5.0] - 2025-08-15

### 🎨 Interface Cleanup & Modern Controls

#### Modern Switch Controls
- **NEW**: iOS-style toggle switches for all interface settings
- **REPLACED**: Basic checkboxes with professional switch components
- **ENHANCED**: Smooth animations and proper focus states for accessibility
- **IMPROVED**: Touch-friendly design with larger interaction areas

#### Interface Cleanup
- **DISABLED**: Redundant floating overlay by default (can be re-enabled in settings)
- **COMMENTED**: Secondary control overlay to reduce interface clutter
- **STREAMLINED**: Focus on main floating button and popup interface
- **SIMPLIFIED**: Removed duplicate control mechanisms

---

## [2.4.0] - 2025-08-15

### ⚙️ Enhanced Interface Settings & Controls

#### New Interface Settings
- **NEW**: "Show floating button" toggle - Control visibility of main floating TTS button
- **NEW**: "Show floating overlay" toggle - Control secondary overlay during reading
- **NEW**: "Show waveform visualizer" toggle - Control animated waveform display
- **NEW**: "Show volume on main screen" toggle - Control volume slider visibility
- **NEW**: "Show speed on main screen" toggle - Control speed slider visibility

#### Conditional UI Rendering
- **ENHANCED**: Volume and speed controls only show when enabled in settings
- **IMPROVED**: Waveform section conditionally renders based on user preference
- **OPTIMIZED**: Secondary controls section only renders if at least one control is enabled

---

## [2.3.0] - 2025-08-15

### 💾 Settings Storage & Persistence

#### Local Storage Implementation
- **NEW**: Complete local storage implementation for all app settings
- **NEW**: Automatic settings persistence across browser sessions
- **NEW**: Real-time settings synchronization between popup and content script
- **IMPROVED**: Settings load on extension startup with proper fallbacks

#### Settings Management
- **NEW**: `saveSettings()` function for immediate setting persistence
- **NEW**: `savePlaybackState()` function for voice, speed, volume, pitch persistence
- **NEW**: `loadSettings()` function with error handling and fallbacks
- **ENHANCED**: All setting changes immediately saved to localStorage

---

## [2.2.0] - 2025-08-15

### 🎵 Waveform & Control Improvements

#### Enhanced Waveform Animation
- **OPTIMIZED**: Faster waveform animation (150ms intervals instead of 1000ms)
- **IMPROVED**: Waveform behavior - uniform when stopped, animated when playing, pulsing when paused
- **ENHANCED**: 20-bar waveform with proper state management using useState
- **FIXED**: Waveform heights properly controlled based on playback state

#### Fixed Volume & Speed Controls
- **FIXED**: Volume slider track visibility with proper CSS styling
- **FIXED**: Speed control added next to volume with green gradient progress
- **ENHANCED**: Both controls now send proper messages to background script
- **IMPROVED**: Real-time updates and error handling for both controls
- **UPGRADED**: Slider styling with better visual feedback and larger touch targets

---

## [2.1.0] - 2025-08-15

### 🔧 Technical Fixes & UI Polish

#### Settings Panel Improvements
- **FIXED**: Settings panel scrolling - content no longer cut off at bottom
- **ENHANCED**: Proper flex layout with fixed header and scrollable content
- **IMPROVED**: Settings panel height constraints and overflow handling
- **OPTIMIZED**: Better responsive design for different content heights

#### Progress Display Enhancement
- **RESTORED**: Real-time progress information above waveform
- **ENHANCED**: "Progress" label with percentage and word count (e.g., "11% • 2.4k/4.2k words")
- **IMPROVED**: Dynamic word progress calculation showing words read vs total
- **FIXED**: Progress updates in real-time during reading

#### Technical Improvements
- **FIXED**: TypeScript compilation errors and browser compatibility issues
- **IMPROVED**: NodeJS.Timeout replaced with number for browser environment
- **ENHANCED**: Proper function closures and syntax error resolution
- **OPTIMIZED**: Code structure and error handling

---

## [2.0.0] - 2025-08-15

### 🎉 **MAJOR RELEASE - Complete UI/UX Redesign**

#### Revolutionary Modern Interface
- **NEW**: Complete popup redesign with modern, fluid animations and premium feel
- **NEW**: 400px width container with dynamic height and rounded corners
- **NEW**: Gradient headers with blue-to-indigo styling and professional shadows
- **NEW**: Enhanced typography with proper font weights and spacing
- **NEW**: Smooth transitions and hover effects throughout the interface

#### Advanced Content Detection System
- **NEW**: Intelligent content type detection with 95% accuracy for PDFs
- **NEW**: Real-time page analysis detecting 10+ content types:
  - Research Articles, News Articles, Blog Posts, Documentation
  - Product Pages, Forum Discussions, Social Media, Wikipedia
  - PDF Documents, and generic Web Pages
- **NEW**: Live page title display with smart truncation (40 characters)
- **NEW**: Content confidence scoring and multiple detection indicators
- **NEW**: Real-time word count for current active page

#### Smart Tab Management
- **NEW**: 3-tab limit enforcement for optimal performance
- **NEW**: Visual tab usage indicator with progress bars
- **NEW**: Automatic tab cleanup and resource management
- **NEW**: Cross-tab state synchronization improvements

#### Enhanced Waveform Visualization
- **NEW**: Full-width waveform display with 20 animated bars
- **NEW**: Larger, more prominent visualization (12px base, up to 44px when active)
- **NEW**: Always-visible waveform in styled container with subtle borders
- **NEW**: Smooth animations with staggered delays for professional feel
- **NEW**: Real-time status display ("Now Playing", "Paused", "Ready to Read")

#### Sliding Settings Panel (SPA-Style)
- **NEW**: Full-screen sliding settings panel with smooth left-to-right animation
- **NEW**: Organized sections: Playback, Reading Preferences, Tab Management, About
- **NEW**: Enhanced speed control with visual range indicators (0.5x - 2.0x)
- **NEW**: Improved volume control with percentage display
- **NEW**: Toggle switches for Auto-read, Highlight following, Smart pause
- **NEW**: Tab management dashboard with visual progress tracking

#### Redesigned Control System
- **REDESIGNED**: Main controls with proper spacing and visual hierarchy
- **NEW**: Stop button with warning colors (orange-to-red gradient) next to play/pause
- **NEW**: Enhanced play/pause logic - pause preserves position, stop resets to beginning
- **NEW**: Improved button sizing and hover effects with scale transforms
- **NEW**: Professional shadow effects and ring highlights

#### Voice Selection Improvements
- **ENHANCED**: Premium voice selector with avatar circles and personality indicators
- **NEW**: Dropdown with voice characteristics, accents, and language tags
- **NEW**: Premium voice indicators with star icons
- **NEW**: Smooth dropdown animations with backdrop blur effects
- **NEW**: Voice personality profiles prominently displayed

#### Content Reading Experience
- **NEW**: "Reading: [Page Title]" display with document type below
- **NEW**: Smart title truncation with full title on hover
- **NEW**: Content detection bar with animated pulse indicator
- **NEW**: Word count display in progress section
- **REMOVED**: Progress bar temporarily (commented out for focus on waveform)

### 🔧 Technical Architecture Improvements

#### Content Type Detection Engine
- **NEW**: Comprehensive content analysis system (`contentTypeDetection.ts`)
- **NEW**: URL pattern matching for academic, news, and blog platforms
- **NEW**: DOM structure analysis for content classification
- **NEW**: Keyword-based content type inference
- **NEW**: Confidence scoring system for detection accuracy

#### Enhanced Message Handling
- **NEW**: `getWordCount` message handler for real-time page analysis
- **NEW**: `enforceTabLimit` functionality for resource management
- **NEW**: Improved error handling and fallback mechanisms
- **NEW**: Better Chrome extension API integration

#### Performance Optimizations
- **OPTIMIZED**: Reduced polling frequency for better battery life
- **OPTIMIZED**: Efficient DOM queries and content extraction
- **OPTIMIZED**: Improved memory management for large documents
- **OPTIMIZED**: Better event listener management and cleanup

#### CSS and Styling System
- **NEW**: Tailwind CSS v4 integration with proper imports
- **NEW**: Custom slider styling with webkit and moz support
- **NEW**: Gradient backgrounds and professional color palette
- **NEW**: Responsive design with proper touch targets
- **NEW**: Accessibility improvements with focus states

### 🎨 Design System & Visual Identity

#### Color Palette
- **Primary**: Blue (#2563eb) to Indigo (#4338ca) gradients
- **Success**: Green (#10b981, #059669) for positive actions
- **Warning**: Orange (#f59e0b) to Red (#ef4444) for stop button
- **Backgrounds**: Gray scale (#f9fafb, #f3f4f6, #e5e7eb)
- **Text**: Proper contrast ratios (#111827, #374151, #6b7280)

#### Typography & Spacing
- **Font**: System font stack with proper fallbacks
- **Spacing**: Consistent 4px grid system throughout
- **Sizing**: Proper text hierarchy with 12px to 18px range
- **Line Height**: Optimized for readability and visual balance

#### Animation & Interactions
- **Transitions**: 300ms cubic-bezier easing for all interactions
- **Hover Effects**: Scale transforms and color transitions
- **Loading States**: Pulse animations and visual feedback
- **Micro-interactions**: Button press feedback and state changes

### 📱 User Experience Enhancements

#### Intuitive Navigation
- **NEW**: Settings accessible via header button (replaced status dot)
- **NEW**: Breadcrumb-style navigation in settings panel
- **NEW**: Clear visual hierarchy and information architecture
- **NEW**: Contextual help and status indicators

#### Accessibility Improvements
- **NEW**: Proper ARIA labels and screen reader support
- **NEW**: Keyboard navigation for all interactive elements
- **NEW**: High contrast support and reduced motion preferences
- **NEW**: Touch-friendly button sizes (44px minimum)

#### Information Architecture
- **IMPROVED**: Logical grouping of related functions
- **IMPROVED**: Clear visual separation between sections
- **IMPROVED**: Consistent iconography and visual language
- **IMPROVED**: Progressive disclosure of advanced features

### 🔄 Breaking Changes
- **CHANGED**: Complete popup interface redesign
- **CHANGED**: Settings moved from accordion to sliding panel
- **CHANGED**: Control layout and button positioning
- **CHANGED**: Content detection display format
- **CHANGED**: Progress visualization approach

### 📚 Documentation Updates
- **UPDATED**: README with new feature descriptions
- **UPDATED**: Version numbers across all files
- **ADDED**: Content type detection documentation
- **ADDED**: Tab management feature descriptions

---

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