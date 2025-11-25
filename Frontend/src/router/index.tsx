import { createBrowserRouter } from "react-router";
import { protectedRoutes } from "./router";

/**
 * Main router configuration
 * Combines protected and public routes
 */
const router = createBrowserRouter([
  protectedRoutes,
  // TODO: Descomentar cuando implementes el login real
  // {
  //   path: "/auth",
  //   children: [
  //     {
  //       path: "login",
  //       lazy: async () => ({
  //         Component: (await import("@/app/pages/auth/Login")).default,
  //       }),
  //     },
  //   ],
  // },
]);

export default router;
