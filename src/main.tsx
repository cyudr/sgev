import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// In the AI Studio iframe preview environment, HMR WebSockets are disabled.
// Ignore benign WebSocket/Vite reconnection events per environment guidelines.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '');
    if (
      reasonStr.includes('WebSocket') ||
      reasonStr.includes('vite') ||
      reasonStr.includes('Failed to fetch') && reasonStr.includes('@vite')
    ) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = String(event.message || '');
    if (
      msg.includes('WebSocket') ||
      msg.includes('[vite]') ||
      (event.filename && event.filename.includes('@vite'))
    ) {
      event.preventDefault();
    }
  });
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
