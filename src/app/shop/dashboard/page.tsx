'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Link from 'next/link';
const Page = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    useEffect(() => {
        if(!isAuthenticated || user?.role !== 'user') router.push('/login');
    }, [])
    if(!isAuthenticated || user?.role !== 'user') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🛒 Your SweetSpot Shop Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage your menu, orders, and receipts</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/shop/menu" className="group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="font-semibold text-lg text-gray-800">Menu Builder</h3>
              <p className="text-sm text-gray-500 mt-1">Add sweets, prices, and manage your shop menu</p>
            </div>
          </Link>

          <Link href="/shop/orders" className="group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-semibold text-lg text-gray-800">Order Queue</h3>
              <p className="text-sm text-gray-500 mt-1">View and process customer orders</p>
            </div>
          </Link>

          <Link href="/shop/receipts" className="group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">🧾</span>
              </div>
              <h3 className="font-semibold text-lg text-gray-800">Receipts</h3>
              <p className="text-sm text-gray-500 mt-1">View order history and receipts</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders (mock) */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-dashed border-gray-200">
              <div>
                <p className="font-medium">SLIP-START-9876</p>
                <p className="text-sm text-gray-500">2 items • ₹399</p>
              </div>
              <div className="text-green-600 font-semibold">PAID</div>
            </div>
            <div className="flex justify-between py-3 border-b border-dashed border-gray-200">
              <div>
                <p className="font-medium">SLIP-START-1234</p>
                <p className="text-sm text-gray-500">1 item • ₹199</p>
              </div>
              <div className="text-yellow-600 font-semibold">PENDING</div>
            </div>
            <div className="flex justify-between py-3">
              <div>
                <p className="font-medium">SLIP-START-5678</p>
                <p className="text-sm text-gray-500">3 items • ₹599</p>
              </div>
              <div className="text-green-600 font-semibold">PAID</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Logged in as: {user.name} ({user.email})</p>
          <p className="mt-1">Role: Sweet Shop Owner</p>
        </div>
      </div>
    </div>

    );
}

export default Page;
