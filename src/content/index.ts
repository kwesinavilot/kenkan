// Content script entry point
console.log('Kenkan Chrome Extension content script loaded');

// Create a simple floating button to show the extension is working
function createFloatingButton() {
  const button = document.createElement('button');
  button.innerHTML = '🎧 Kenkan';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.background = '#2563eb';
    button.style.transform = 'translateY(-1px)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.background = '#3b82f6';
    button.style.transform = 'translateY(0)';
  });

  button.addEventListener('click', () => {
    alert('Kenkan Chrome Extension is working! 🎉\n\nThis is a basic test. The full TTS functionality will be implemented in the next tasks.');
  });

  document.body.appendChild(button);
  console.log('Kenkan floating button added to page');
}

// Wait for page to load, then add the button
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingButton);
} else {
  createFloatingButton();
}

export {};