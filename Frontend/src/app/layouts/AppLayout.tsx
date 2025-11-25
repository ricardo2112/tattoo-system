import { Outlet } from "react-router";
import Header from "@/components/template/Header";

/**
 * AppLayout component
 * Simple layout with only header (no sidebar)
 * Used for settings and other pages that don't need sidebar navigation
 */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="w-full p-6 pt-6">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
