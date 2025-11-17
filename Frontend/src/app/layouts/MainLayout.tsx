/**
 * MainLayout Component
 *
 * Main application layout with sidebar, header, and content area.
 * Responsive design with collapsible sidebar.
 *
 * @example
 * ```tsx
 * <MainLayout>
 *   <YourPageContent />
 * </MainLayout>
 * ```
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, Header } from '../navigation';

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />

      {/* Main content area */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
