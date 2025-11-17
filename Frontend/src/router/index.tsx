/**
 * React Router Configuration
 *
 * Defines all application routes including:
 * - Public routes (accessible without authentication)
 * - Private routes (require authentication - to be implemented)
 * - Error pages (404, etc.)
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../app/layouts';
import { ClientesList, ClienteForm } from '../app/pages/modules/clientes';
import { TatuajesList, TatuajeForm } from '../app/pages/modules/tatuajes';
import { Settings } from '../app/pages/settings';
import { NotFound } from '../app/pages/errors';

/**
 * Application router configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/clientes" replace />,
      },
      {
        path: 'clientes',
        children: [
          {
            index: true,
            element: <ClientesList />,
          },
          {
            path: ':id',
            element: <ClienteForm />,
          },
        ],
      },
      {
        path: 'tatuajes',
        children: [
          {
            index: true,
            element: <TatuajesList />,
          },
          {
            path: ':id',
            element: <TatuajeForm />,
          },
        ],
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
