'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, Profiler } from 'react';
import { X, Menu, Store, Settings, ChevronLeft, User, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '@/lib/features/authSlice';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
export default function Sidebar() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const email = user?.email;

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navLinks = [
    { href: '/admin/dashboard', label: 'Shops', icon: Store, badge: null },
    { href: '/admin/settings', label: 'Settings', icon: Settings, badge: null },
    { href: '/admin/profile', label: 'Profile', icon: User, badge: null },
  ];

  const isActive = (href: any) => pathname === href;

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200/50"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-lg shadow-2xl z-40 
          transition-all duration-300 ease-in-out border-r border-gray-200/50
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:shadow-lg
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">Management Dashboard</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={() => setMobileOpen(false)} 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
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
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm border border-indigo-100' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-r-full" />
                  )}
                  
                  <Icon className={`
                    w-5 h-5 transition-all duration-200
                    ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                  
                  <span className="flex-1">{link.label}</span>
                  
                  {link.badge && (
                    <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                      {link.badge}
                    </span>
                  )}
                  
                  {active && (
                    <ChevronLeft className="w-4 h-4 text-indigo-500 rotate-180" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Actions Section */}
          <div className="pt-4 border-t border-gray-100">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Quick Actions
            </h2>
            
            {/* <button className="w-full flex items-center gap-3 py-3 px-3 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 group">
              <User className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              <span>Profile</span>
            </button> */}
            
            <button 
              onClick={() => handleLogout()}
              className="w-full flex items-center gap-3 py-3 px-3 rounded-xl font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">{email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
    </>
  );
}