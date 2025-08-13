// Background script entry point
console.log('Kenkan Chrome Extension background script loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Kenkan Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    console.log('First time installation - welcome to Kenkan!');
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message, 'from:', sender);
  
  if (message.action === 'test') {
    console.log('Test message received in background script');
    sendResponse({ success: true, message: 'Background script is working!' });
  }
  
  return true; // Keep message channel open for async response
});

// Listen for tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
  }
});

export {};