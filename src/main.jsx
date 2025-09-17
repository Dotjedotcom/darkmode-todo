import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App.jsx';
import { setupServiceWorker } from '@/services/serviceWorker.js';
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

if (import.meta.env.PROD) {
  setupServiceWorker();
}
