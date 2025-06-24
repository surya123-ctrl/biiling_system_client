'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';
import { FaBars } from 'react-icons/fa';
import ProtectedShopRoute from '../../components/ProtectedShopRoute';

interface LayoutProps {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

//   const hideLayout =
//     pathname === '/shop/login' ||
//     pathname === '/shop/signup' ||
//     pathname.includes('/menu/builder');

//   if (hideLayout) {
//     return <>{children}</>;
//   }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-4 text-purple-600"
        >
          <FaBars />
        </button>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
            <ProtectedShopRoute>
                {children}
            </ProtectedShopRoute>
        </main>
      </div>
    </div>
  );
}