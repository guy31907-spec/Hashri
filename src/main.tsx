import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Polyfill Promise.try for modern pdfjs-dist runtimes if missing
if (typeof (Promise as any).try !== 'function') {
  (Promise as any).try = function<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
    return new Promise((resolve) => resolve(fn(...args)));
  };
}
createRoot(document.getElementById('root')!).render(<App />);
