import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Desactivar StrictMode para evitar dobles renders/efectos en dev compartido (mejor UX con ngrok)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
