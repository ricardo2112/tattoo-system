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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 min-h-screen overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
