'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { X, Menu, Store, Settings, ChevronLeft, User, LogOut, Package, ShoppingCart, ClipboardList } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '@/lib/features/authSlice';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

export default function Sidebar() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const email = user?.email;
  const role = user?.role;

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (href) => pathname === href;

  const handleLogout = () => {
    dispatch(logout());
    router.push('/scanner');
  };

  // Sidebar Links Based on Role
  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Store },
    { href: '/admin/shops', label: 'Shops', icon: Store },
    { href: '/admin/menu/builder', label: 'Menu Builder', icon: Package },
    { href: '/admin/orders', label: 'Order Queue', icon: ClipboardList },
    { href: '/admin/settings', label: 'Settings', icon: Settings }
  ];

  const shopLinks = [
    { href: '/shop/dashboard', label: 'Dashboard', icon: Store },
    { href: '/shop/menu', label: 'Manage Menu', icon: Package },
    { href: '/shop/orders', label: 'Order Queue', icon: ClipboardList },
    { href: '/shop/settings', label: 'Shop Settings', icon: Settings },
    { href: '/shop/profile', label: 'Profile', icon: User }
  ];

  const navLinks = role === 'admin' ? adminLinks : role === 'user' ? shopLinks : [];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:bg-white border border-gray-200/50 transition-all duration-200"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-72 bg-white/95 backdrop-blur-lg shadow-2xl z-40 
          transition-transform duration-300 ease-in-out transform flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:shadow-lg 
          md:border-r md:border-gray-200/50
        `}
      >
        {/* Header - Fixed height */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">
                {role === 'admin' ? 'Admin' : role === 'user' ? 'Shop' : 'User'} Panel
              </h1>
              <p className="text-xs text-gray-500">Management Dashboard</p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation Links - Scrollable content */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Main Navigation
            </h2>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    group flex items-center gap-3 py-3 px-3 rounded-xl font-medium transition-all duration-200 relative
                    ${active 
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-r-full" />
                  )}

                  {/* Icon */}
                  <Icon className={`
                    w-5 h-5 transition-all duration-200
                    ${active 
                      ? 'text-indigo-600' 
                      : 'text-gray-400 group-hover:text-gray-600'
                    }
                  `} />

                  {/* Label */}
                  <span className="flex-1">{link.label}</span>

                  {/* Arrow on active */}
                  {active && (
                    <ChevronLeft className="w-4 h-4 text-indigo-500 rotate-180" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-gray-100">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Quick Actions
            </h2>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 py-3 px-3 rounded-xl font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>

        {/* Footer - Fixed at bottom */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {email?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {role === 'admin' ? 'Admin' : role === 'user' ? 'Shop' : 'Customer'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {email || 'Guest@example.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          aria-hidden="true"
        ></div>
      )}
    </>
  );
}