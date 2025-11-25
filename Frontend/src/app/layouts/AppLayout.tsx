import { Outlet } from "react-router";
import Header from "@/components/template/Header";

/**
 * AppLayout component
 * Simple layout with only header (no sidebar)
 * Used for settings and other pages that don't need sidebar navigation
 */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Header />
      <main className="ml-64 pt-16 min-h-screen overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
