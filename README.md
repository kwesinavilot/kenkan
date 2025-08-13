# Kenkan Chrome Extension

A React + TypeScript + Vite Chrome extension project with Tailwind CSS.

## Development Setup

1. Install dependencies:
```bash
npm install
npm install tailwindcss postcss autoprefixer lucide-react ai @ai-sdk/openai
```

2. Install Tailwind CSS:
```bash
npx tailwindcss init -p
```

3. Build the extension:
```bash
npm run build:extension
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## Project Structure

```
src/
├── content/          # Content scripts
├── background/       # Background scripts  
├── popup/           # Popup UI components
├── assets/          # Static assets
└── ...
```

## Required Dependencies

The following dependencies need to be installed:
- tailwindcss, postcss, autoprefixer (for styling)
- lucide-react (for icons)
- ai, @ai-sdk/openai (for AI functionality)

## Icons

Add the following icon files to the public directory:
- icon16.png (16x16 pixels)
- icon48.png (48x48 pixels)
- icon128.png (128x128 pixels)