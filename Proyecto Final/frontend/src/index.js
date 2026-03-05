import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Ignorar warnings de React Router v7
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('React Router')) return;
  originalError.call(console, ...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
