import ReactDOM from 'react-dom/client';
import './popup.css';

function Popup() {
  return (
    <div className="w-80 h-96 p-4">
      <h1 className="text-xl font-bold mb-4">Kenkan Extension</h1>
      <p>Chrome extension popup is working!</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Popup />);