import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';
import './styles/phase3.css';
import './styles/phase4.css';
import './styles/phase5.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(225, 20%, 12%)',
          color: 'hsl(0, 0%, 95%)',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      }}
    />
  </React.StrictMode>,
);

