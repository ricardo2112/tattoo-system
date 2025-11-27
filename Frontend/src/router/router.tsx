import { Navigate, RouteObject } from "react-router";

import AuthGuard from "@/middleware/AuthGuard";
import { DynamicLayout } from "@/app/layouts/DynamicLayout";

const protectedRoutes: RouteObject = {
  id: "protected",
  Component: AuthGuard,
  children: [
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/" />,
        },
        {
          path: "modules",
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
                  await import("@/app/pages/modules/clientes/index")
                ).default,
              }),
            },
            {
              path: "clientes/nuevo",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/modules/clientes/form")
                ).default,
              }),
            },
            {
              path: "clientes/editar/:slug",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/modules/clientes/form")
                ).default,
              }),
            },
            {
              path: "clientes/:slug",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/modules/clientes/detail")
                ).default,
              }),
            },
            {
              path: "citas",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/modules/citas/index")
                ).default,
              }),
            },

            {
              path: "tatuajes",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/modules/tatuajes/index")
                ).default,
              }),
            },
            {
              path: "tatuajes/:id",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/modules/tatuajes/detail")
                ).default,
              }),
            },

            {
              path: "tatuajes/nuevo",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/modules/tatuajes/form")
                ).default,
              }),
            },            

            {
              path: "piercings",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/modules/piercings/index")
                ).default,
              }),
            },



            {
              path: "usuarios",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/modules/usuarios/index")
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
            {
              path: "catalogos",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/modules/catalogos/index")
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
