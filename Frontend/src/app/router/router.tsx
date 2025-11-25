import { Navigate, RouteObject } from "react-router";

import AuthGuard from "@/middleware/AuthGuard";
import { DynamicLayout } from "../layouts/DynamicLayout";
import { AppLayout } from "../layouts/AppLayout";

/**
 * Protected routes configuration
 * These routes require authentication to access
 * Uses AuthGuard middleware to verify user authentication
 */
const protectedRoutes: RouteObject = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the header and the sidebar.
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards/home" />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/dashboards/home")
                ).default,
              }),
            },
          ],
        },
      ],
    },
    // The app layout supports only the header. Used for settings and similar pages.
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              element: <div>Settings General Page (Coming Soon)</div>,
            },
            {
              path: "appearance",
              element: <div>Settings Appearance Page (Coming Soon)</div>,
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };
