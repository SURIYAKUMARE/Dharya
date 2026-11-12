import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { autoRunCleanSlateOnBoot } from './services/cleanSlateService';

// Ensure a brand new, clean fresh user state across all devices
autoRunCleanSlateOnBoot();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

