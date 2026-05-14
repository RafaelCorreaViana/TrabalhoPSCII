import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { initTheme } from './store/themeStore';
import App from './App.tsx';
import './index.css';
import './styles/phase3.css';
import './styles/phase4.css';
import './styles/phase5.css';

// Apply saved theme immediately before first render to avoid flash
initTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: '12px',
          fontSize: '0.875rem',
          fontWeight: 600,
          maxWidth: '340px',
        },
      }}
    />
  </React.StrictMode>,
);
