console.log('Test popup script loaded');

document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('test-button');
  const status = document.getElementById('status');
  
  if (button && status) {
    status.textContent = 'Popup loaded successfully';
    
    button.addEventListener('click', function() {
      status.textContent = 'Button clicked!';
      console.log('Test button clicked');
      
      // Test chrome extension API
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        status.textContent = 'Chrome extension API available';
      } else {
        status.textContent = 'Chrome extension API not available';
      }
    });
  }
});