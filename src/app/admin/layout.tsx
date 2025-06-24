'use client';

import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaBars } from 'react-icons/fa';
import { ReactNode } from 'react';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';
interface LayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const hideLayouts =
      pathname === '/admin/login' ||
      pathname === '/admin/signup' ||
      // pathname === '/admin/' ||
      pathname.includes('/menu/builder');

    if (hideLayouts) {
      return <>{children}</>;
    }
  // const hideLayoutRoutes = ['/admin/login', '/admin/signup', '/admin/shops'];
  // const hideLayouts = hideLayoutRoutes.includes(pathname);

  if (hideLayouts) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
        {/* Hamburger Menu for Mobile */}
        {/* <div className="md:hidden p-2"> */}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FaBars />
          </button>
        {/* </div> */}

        {/* Page Content (Scrolls if needed) */}
        <main className="flex-1 overflow-auto">
          <ProtectedAdminRoute>
            {children}
          </ProtectedAdminRoute>
        </main>
      </div>
    </div>
  );
}
