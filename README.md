# 🎧 Kenkan - AI-Powered Text-to-Speech Chrome Extension

> Transform any web content into natural, AI-enhanced speech with advanced text-to-speech capabilities.

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-repo/kenkan)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)

## ✨ What is Kenkan?

Kenkan is a powerful Chrome extension that converts web content into high-quality speech using advanced AI technology. Whether you're reading articles, PDFs, or any web content, Kenkan makes it accessible through natural-sounding text-to-speech with intelligent content processing.

## 🚀 Current Features

### 🎮 **Intuitive User Interface**
- **Fully Draggable Floating Button** - Move anywhere on screen with smooth drag behavior
- **Enhanced Button Design** - Perfect circular buttons with proper roundness
- **Animated Hover Controls** - Smooth slide-up controls when hovering over floating button
- **Visual State Feedback** - Blue 🎧 when ready, Green 🔊 when playing
- **One-Click Speed Control** - Cycle through 6 speed levels (0.5x to 2.0x)
- **Smart Popup Interface** - Shows current reading tab with quick navigation
- **Professional Animations** - 60fps smooth transitions with cubic-bezier easing
- **Improved Drag Experience** - Proper cursor states and visual feedback during dragging

### 📄 **Smart Content Extraction**
- **HTML Content Reading** - Automatically detects and extracts readable content from web pages
- **PDF Document Support** - Advanced PDF.js integration for extracting text from PDF documents
- **Intelligent Filtering** - Removes navigation, ads, and non-content elements automatically
- **Content Structure Preservation** - Maintains headings, paragraphs, and list formatting

### 🎤 **Advanced Text-to-Speech Engine**
- **Custom AI Voices** - 4 unique AI-powered voices with distinct personalities and specialties
- **Chrome TTS Engine Provider** - Functions as both TTS consumer and provider for other extensions
- **Intelligent Voice Matching** - Automatically selects system voices that match custom voice characteristics
- **AI-Enhanced Speech Synthesis** - Uses OpenAI GPT to adapt text for each voice's unique personality
- **Multi-Engine Fallback** - Chrome TTS, Web Speech API, and custom engine with seamless switching
- **Voice Personality Profiles** - Sandra (friendly), Kwesi (authoritative), Kwame (storyteller), Akua (French eloquent)
- **Dynamic Voice Registration** - Real-time voice updates and availability management
- **Complete Playback Controls** - Play, pause, stop, resume with position memory
- **Real-time Speed Adjustment** - Change speed during playback without interruption

### 🛡️ **Robust Error Handling**
- **Multi-Level Fallbacks** - Automatic fallback between TTS engines and voices
- **Smart Recovery** - Handles network issues, voice unavailability, and API failures
- **Retry Logic** - Exponential backoff for temporary failures
- **Graceful Degradation** - Continues operation even when some features are unavailable

### 🔧 **Advanced Text Processing**
- **Smart Chunking** - Breaks large content into optimal segments for TTS
- **Text Normalization** - Handles special characters, URLs, numbers, and symbols
- **Natural Pauses** - Adds appropriate pauses for better speech flow
- **Content Validation** - Ensures text is suitable for speech synthesis

### 📊 **Performance & Monitoring**
- **Health Monitoring** - Real-time TTS system health checks
- **Performance Tracking** - Monitors extraction and speech performance
- **Diagnostic Tools** - Comprehensive error reporting and debugging
- **Memory Optimization** - Efficient processing for large documents

## 🎭 Custom AI Voices

### **Sandra** - The Friendly Companion
- **Profile**: Warm, friendly African female voice (late 20s)
- **Tone**: Light, conversational with gentle rhythm
- **Specialties**: Casual updates, relatable content, friendly conversations
- **Accent**: West African lilt with cultural warmth
- **Best For**: Social media, blogs, casual articles

### **Kwesi** - The News Anchor
- **Profile**: Deep, confident male voice (early 40s)
- **Tone**: Smooth, commanding with refined articulation
- **Specialties**: Formal news, serious commentary, authoritative content
- **Accent**: Professional African broadcast quality
- **Best For**: News articles, formal documents, business content

### **Kwame** - The Storyteller
- **Profile**: Rich, expressive voice (mid-40s)
- **Tone**: Warm, engaging with dynamic modulation
- **Specialties**: Storytelling, documentaries, longform content
- **Accent**: Smooth West African cadence
- **Best For**: Narratives, podcasts, educational content

### **Akua** - The French Eloquent
- **Profile**: Warm, eloquent West African French female (early 30s)
- **Tone**: Graceful, articulate with lyrical cadence
- **Specialties**: French content, educational material, heartfelt messages
- **Accent**: Parisian French with West African authenticity
- **Best For**: French articles, educational content, cultural material

## 🎯 Use Cases

- **Accessibility** - Make web content accessible for visually impaired users
- **Multitasking** - Listen to articles while doing other tasks
- **Learning** - Improve comprehension through audio + visual learning
- **Language Learning** - Hear proper pronunciation of text content
- **Productivity** - Consume content faster through audio
- **Research** - Listen to academic papers and documentation

## 🏗️ Technical Architecture

### **Built With Modern Technologies**
- **React 19** - Latest React with modern hooks and components
- **TypeScript 5.8** - Full type safety and enhanced developer experience
- **Vite 7.1** - Fast development and optimized builds
- **Tailwind CSS 4.1** - Modern utility-first CSS framework
- **Vercel AI SDK** - Advanced AI text processing capabilities

### **Chrome Extension Architecture**
- **Content Scripts** - Inject functionality into web pages
- **Background Service Worker** - Manage state and cross-tab communication
- **Popup Interface** - Global controls and settings
- **Manifest V3** - Latest Chrome extension standards

### **AI Integration**
- **OpenAI GPT-3.5-turbo** - Text enhancement for natural speech
- **Smart Processing** - Context-aware text optimization
- **Fallback Handling** - Works offline when AI unavailable

## 📈 Development Status

### ✅ **Completed Features (v2.0.0)**
- **Complete UI/UX System** - Fully draggable floating controls with enhanced hover interactions
- **Full Playback Control** - Play, pause, stop, resume, and speed cycling
- **Smart Popup Interface** - Current reading tab display with navigation
- **Core Content Extraction** - HTML and PDF text processing
- **Custom TTS Engine** - Full TTS engine implementation with 4 AI-powered voices
- **Chrome TTS Engine Provider** - Registered as TTS provider for other extensions
- **AI Voice Personalities** - Sandra, Kwesi, Kwame, and Akua with unique characteristics
- **Multi-Engine Architecture** - Chrome TTS, Web Speech API, and custom engine integration
- **Cross-tab State Management** - Background service worker coordination
- **Persistent Storage** - User preferences and reading progress
- **Real-time Text Highlighting** - Synchronized highlighting during playback
- **Comprehensive Error Handling** - Multi-level fallbacks and recovery
- **AI Text Enhancement** - OpenAI integration for voice-specific text adaptation

### 🔮 **Planned Features**
- **Voice Training** - Custom voice model training and fine-tuning
- **Audio Streaming** - Real-time audio streaming from AI synthesis services
- **Language Management** - Dynamic language installation and uninstallation
- **Reading Analytics** - Progress tracking and reading statistics
- **OCR Support** - Image-based content extraction
- **Multi-language Support** - International language detection and synthesis
- **Accessibility Enhancements** - Screen reader integration
- **Performance Analytics** - Usage metrics and optimization

## 🛠️ Installation & Development

### **Prerequisites**
- Node.js 18+ and npm
- Chrome browser for testing
- Git for version control

### **Quick Start**
```bash
# Clone the repository
git clone https://github.com/your-repo/kenkan.git
cd kenkan

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:extension
```

### **Load in Chrome**
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` folder
4. The extension will appear in your Chrome toolbar

## 📋 Requirements Satisfied

- ✅ **User Interface** - Animated floating controls with professional UX design
- ✅ **Playback Control** - Complete TTS control with visual state feedback
- ✅ **Navigation** - Smart popup with current reading tab and quick jump
- ✅ **Content Extraction** - HTML and PDF text extraction with intelligent filtering
- ✅ **TTS Integration** - Chrome TTS API with Web Speech API fallback
- ✅ **Voice Controls** - Complete voice selection and real-time speed adjustment
- ✅ **State Management** - Cross-tab synchronization and persistent storage
- ✅ **Error Handling** - Comprehensive error recovery and fallback mechanisms
- ✅ **AI Enhancement** - Text optimization for natural speech synthesis
- ✅ **Performance** - Efficient processing and smooth 60fps animations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

### **Code Standards**
- TypeScript for all new code
- ESLint for code quality
- Prettier for formatting
- Comprehensive error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PDF.js** - Mozilla's PDF rendering library
- **Chrome Extensions API** - Google's extension platform
- **Vercel AI SDK** - AI integration capabilities
- **React Team** - Modern UI framework
- **TypeScript Team** - Type safety and developer experience

## 📞 Support

- **Issues** - Report bugs and request features on [GitHub Issues](https://github.com/your-repo/kenkan/issues)
- **Discussions** - Join conversations on [GitHub Discussions](https://github.com/your-repo/kenkan/discussions)
- **Documentation** - Check our [Wiki](https://github.com/your-repo/kenkan/wiki) for detailed guides

---

**Made with ❤️ for accessibility and productivity**

*Kenkan - Making web content accessible through intelligent text-to-speech technology.*