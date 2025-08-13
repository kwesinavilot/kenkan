import ReactDOM from 'react-dom/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import './popup.css';

function Popup() {
  const handleTestClick = () => {
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'test' });
      }
    });
  };

  return (
    <div className="w-80 h-96 p-4 bg-gray-50">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="text-2xl mr-2">🎧</span>
            Kenkan Extension
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Extension is installed and working!
            </p>
          </div>
          
          <Button onClick={handleTestClick} className="w-full">
            Test Extension
          </Button>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Look for the floating 🎧 button on web pages</p>
            <p>• Click it to test the extension</p>
            <p>• Full TTS features coming in next tasks</p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-2">Current Status:</h3>
            <div className="text-sm text-gray-600">
              <p>✅ Project setup complete</p>
              <p>⏳ TTS functionality (next task)</p>
              <p>⏳ Content extraction (next task)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Popup />);