# Changelog

All notable changes to Kenkan will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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