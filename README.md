# 🎧 Kenkan - AI-Powered Text-to-Speech Chrome Extension

> Transform any web content into natural, AI-enhanced speech with advanced text-to-speech capabilities.

[![Version](https://img.shields.io/badge/version-0.4.0-blue.svg)](https://github.com/your-repo/kenkan)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)

## ✨ What is Kenkan?

Kenkan is a powerful Chrome extension that converts web content into high-quality speech using advanced AI technology. Whether you're reading articles, PDFs, or any web content, Kenkan makes it accessible through natural-sounding text-to-speech with intelligent content processing.

## 🚀 Current Features

### 📄 **Smart Content Extraction**
- **HTML Content Reading** - Automatically detects and extracts readable content from web pages
- **PDF Document Support** - Advanced PDF.js integration for extracting text from PDF documents
- **Intelligent Filtering** - Removes navigation, ads, and non-content elements automatically
- **Content Structure Preservation** - Maintains headings, paragraphs, and list formatting

### 🎤 **Advanced Text-to-Speech**
- **Chrome TTS Integration** - Native Chrome text-to-speech with full voice control
- **Web Speech API Fallback** - Cross-platform compatibility when Chrome TTS unavailable
- **Voice Selection** - Choose from all available system voices with smart defaults
- **Playback Controls** - Play, pause, stop, speed control (0.1x - 10x), volume, and pitch adjustment
- **AI Text Enhancement** - Uses OpenAI GPT to improve text naturalness for better speech

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

### ✅ **Completed Features (v0.4.0)**
- Core content extraction system
- Advanced PDF text extraction
- Complete TTS management system
- AI-powered text enhancement
- Comprehensive error handling
- Performance monitoring

### 🚧 **In Development**
- Background service worker for state management
- Floating UI overlay with controls
- User preferences and settings
- Real-time text highlighting
- Cross-tab synchronization

### 🔮 **Planned Features**
- OCR support for image-based content
- Custom voice training
- Reading progress tracking
- Accessibility enhancements
- Performance analytics

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

- ✅ **Content Extraction** - HTML and PDF text extraction with intelligent filtering
- ✅ **TTS Integration** - Chrome TTS API with Web Speech API fallback
- ✅ **Voice Controls** - Complete voice selection and playback controls
- ✅ **Error Handling** - Comprehensive error recovery and fallback mechanisms
- ✅ **AI Enhancement** - Text optimization for natural speech synthesis
- ✅ **Performance** - Efficient processing and memory management

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