import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';

// Initialize default theme attribute for consistent styling
if (!document.documentElement.getAttribute('data-theme')) {
  document.documentElement.setAttribute('data-theme', 'light');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ErrorBoundary at the root to catch unforeseen render errors */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
