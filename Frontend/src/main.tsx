/**
 * Application Entry Point
 *
 * Initializes the React application with all necessary providers:
 * - i18n for internationalization
 * - Theme configuration
 * - Router
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n'; // Initialize i18n
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
