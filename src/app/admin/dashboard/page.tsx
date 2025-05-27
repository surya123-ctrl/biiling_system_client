'use client';

import React, { useState, useEffect } from 'react';
import { GET, POST } from '../../../services/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Shop {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
}

interface NewShop {
  name: string;
  address: string;
  phone: string;
}

const AdminDashboardPage = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newShop, setNewShop] = useState<NewShop>({
    name: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const data = await GET('/admin/shops');
        setShops(data.data.shops);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewShop(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShop.name.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await POST('/admin/shop/register', newShop);
      setShops(prev => [...prev, response.data.newShop]);
      setIsModalOpen(false);
      setNewShop({ name: '', address: '', phone: '' });
    } catch (err: any) {
      console.error('Error adding shop:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewShop({ name: '', address: '', phone: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              🏪 Sweet Shop Manager
            </h1>
            <p className="text-gray-600 text-lg">Manage your shops and create delicious menus</p>
          </div>
          
          {/* Add Shop Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          >
            <span>✨</span> Add New Shop
          </motion.button>
        </div>

        {/* Stats Bar */}
        {!loading && shops.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{shops.length}</div>
                <div className="text-gray-600 text-sm">Total Shops</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">🍭</div>
                <div className="text-gray-600 text-sm">Sweet Success</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl">🍰</span>
              </div>
            </div>
            <span className="ml-4 text-gray-600 text-lg">Loading your sweet shops...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && shops.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="text-8xl mb-6">🍭</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">No shops yet</h3>
            <p className="text-gray-500 text-lg mb-8">Start your sweet journey by adding your first shop!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🏪 Add Your First Shop
            </motion.button>
          </motion.div>
        )}

        {/* Shops Grid */}
        {!loading && shops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shops.map((shop, index) => (
              <motion.div
                key={shop._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border border-white/20"
              >
                {/* Shop Header */}
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🧁</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{shop.name}</h2>
                    <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-1"></div>
                  </div>
                </div>

                {/* Shop Details */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg mt-1">📍</span>
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Address</div>
                      <div className="text-gray-700">{shop.address || 'No address provided'}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-lg mt-1">📞</span>
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Phone</div>
                      <div className="text-gray-700">{shop.phone || 'No phone provided'}</div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Link href={`/admin/shops/${shop._id}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span className="text-lg">🍽️</span>
                    <span>Manage Menu</span>
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Shop Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏪</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Add New Shop</h2>
                <p className="text-gray-600">Create a new sweet shop location</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newShop.name}
                    onChange={handleInputChange}
                    required
                    className="text-purple-500 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Sweet Dreams Bakery"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={newShop.address}
                    onChange={handleInputChange}
                    className="text-purple-500 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="123 Sweet Street, Sugar City"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newShop.phone}
                    onChange={handleInputChange}
                    className="text-purple-500 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newShop.name.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Add Shop</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboardPage;