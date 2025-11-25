import { Outlet } from "react-router";
import Header from "@/components/template/Header";
import Sidebar from "@/components/template/Sidebar";

/**
 * DynamicLayout component
 * Main layout with header and sidebar navigation
 * Used for most authenticated pages
 */
export function DynamicLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="ml-64 w-full p-6 pt-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
