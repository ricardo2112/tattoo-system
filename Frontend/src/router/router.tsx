import { Navigate, RouteObject } from "react-router";

import AuthGuard from "@/middleware/AuthGuard";
import { DynamicLayout } from "@/app/layouts/DynamicLayout";
import { AppLayout } from "@/app/layouts/AppLayout";

const protectedRoutes: RouteObject = {
  id: "protected",
  Component: AuthGuard,
  children: [
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/module/home" />,
        },
        {
          path: "module",
          children: [
            {
              path: "home",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/modules/home")
                ).default,
              }),
            },
            {
              path: "clientes",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/modules/clientes")
                ).default,
              }),
            },
            {
              path: "citas",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/modules/citas")
                ).default,
              }),
            },
          ],
        },
        {
          path: "settings",
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/general")
                ).default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/appearance")
                ).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };
