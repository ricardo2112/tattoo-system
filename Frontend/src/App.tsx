/**
 * App Component
 *
 * Main application component that provides routing.
 */

import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useThemeStore } from './stores';

function App() {
  const { initTheme } = useThemeStore();

  // Initialize theme on app load
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <RouterProvider router={router} />;
}

export default App;
