'use client';
import React, { useState, useEffect } from 'react';
import { GET, POST } from '../../../services/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';


interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Shop {
  _id: string;
  name: string;
  address?: Address;
  phone?: string;
  email?: string;
}
interface NewShop {
  name: string;
  email: string;
  phone: string;
  address: Address;
}

const AdminDashboardPage = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize newShop with empty address fields
  const [newShop, setNewShop] = useState<NewShop>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    }
  });

  const fetchShops = async () => {
    try {
      const data = await GET('/admin/shops');
      if (data.success === true) {
        setShops(data.data.shops);
      }
    } catch (err) {
      console.error("Failed to fetch shops:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // Handle input change for non-address fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewShop(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle input change for address fields
  const handleAddressChange = (field: keyof Address, value: string) => {
    setNewShop(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate individual fields
  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'name':
        return value.trim().length < 2 ? 'Shop name must be at least 2 characters' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{3,14}$/;
        return !phoneRegex.test(value.replace(/\s/g, '')) ? 'Please enter a valid phone number' : '';
      case 'street':
        return value.trim().length < 5 ? 'Street address must be at least 5 characters' : '';
      case 'city':
        return value.trim().length < 2 ? 'City name must be at least 2 characters' : '';
      case 'state':
        return value.trim().length < 2 ? 'State name must be at least 2 characters' : '';
      case 'postalCode':
        return value.trim().length < 4 ? 'Postal code must be at least 4 characters' : '';
      default:
        return '';
    }
  };

  // Validate current step
  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      newErrors.name = validateField('name', newShop.name);
      newErrors.email = validateField('email', newShop.email);
      newErrors.phone = validateField('phone', newShop.phone);
    } else if (currentStep === 2) {
      newErrors.street = validateField('street', newShop.address.street);
      newErrors.city = validateField('city', newShop.address.city);
      newErrors.state = validateField('state', newShop.address.state);
      newErrors.postalCode = validateField('postalCode', newShop.address.postalCode);
    }
    
    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next step
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(2);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    setCurrentStep(1);
    setErrors({});
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await POST('/admin/shop/register', newShop);

      if (response?.success && response.data?.newShop) {
        setShops(prev => [
          ...prev,
          {
            _id: response.data.newShop._id,
            name: response.data.newShop.name,
            email: response.data.newShop.email,
            phone: response.data.newShop.phone,
            address: {
              street: response.data.newShop.address.street,
              city: response.data.newShop.address.city,
              state: response.data.newShop.address.state,
              postalCode: response.data.newShop.address.postalCode,
              country: response.data.newShop.address.country,
            },
          },
        ]);
        closeModal();
      } else {
        setErrors({ submit: "Failed to add shop. Please try again." });
      }
    } catch (err) {
      console.error("Error adding shop:", err);
      setErrors({ submit: "Network error – please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
    setErrors({});
    setNewShop({
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              🏪 Sweet Shop Manager
            </h1>
            <p className="text-gray-600">Manage your shops and create delicious menus</p>
          </div>
          {/* Add Shop Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          >
            <span>✨</span>
            <span>Add New Shop</span>
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
            <span className="ml-4 text-gray-600">Loading your sweet shops...</span>
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
            <h3 className="text-2xl font-semibold text-purple-500 mb-4">No shops yet</h3>
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
                      <div className="text-purple-500">{shop.address
                        ? `${shop.address.street}, ${shop.address.city}, ${shop.address.state} ${shop.address.postalCode}, ${shop.address.country}`
                        : 'No address provided'}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-lg mt-1">📞</span>
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Phone</div>
                      <div className="text-purple-500">{shop.phone || 'No phone provided'}</div>
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

      {/* Improved Add Shop Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-white relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <span className="text-xl">×</span>
                </button>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Add New Shop</h2>
                    <p className="text-purple-100">Step {currentStep} of 2</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4 bg-white/20 rounded-full h-2">
                  <motion.div
                    className="bg-white rounded-full h-2"
                    initial={{ width: "50%" }}
                    animate={{ width: currentStep === 1 ? "50%" : "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <div className="text-4xl mb-2">📝</div>
                          <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
                          <p className="text-gray-600 text-sm">Let's start with the shop details</p>
                        </div>

                        {/* Shop Name */}
                        <div>
                          <label htmlFor="name" className="block text-sm font-semibold text-purple-500 mb-2">
                            Shop Name *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={newShop.name}
                              onChange={handleInputChange}
                              placeholder="Sweet Dreams Bakery"
                              className={`w-full px-4 py-3 pr-10 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-purple-500 ${
                                errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-purple-300'
                              }`}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {newShop.name.length >= 2 ? (
                                <span className="text-green-500">✓</span>
                              ) : (
                                <span className="text-gray-400">🏪</span>
                              )}
                            </div>
                          </div>
                          {errors.name && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1 flex items-center space-x-1"
                            >
                              <span>⚠️</span>
                              <span>{errors.name}</span>
                            </motion.p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-purple-500 mb-2">
                            Email Address *
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={newShop.email}
                              onChange={handleInputChange}
                              placeholder="shop@example.com"
                              className={`w-full px-4 py-3 pr-10 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-purple-500 ${
                                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-purple-300'
                              }`}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {newShop.email.includes('@') && newShop.email.includes('.') ? (
                                <span className="text-green-500">✓</span>
                              ) : (
                                <span className="text-gray-400">📧</span>
                              )}
                            </div>
                          </div>
                          {errors.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1 flex items-center space-x-1"
                            >
                              <span>⚠️</span>
                              <span>{errors.email}</span>
                            </motion.p>
                          )}
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label htmlFor="phone" className="block text-sm font-semibold text-purple-500 mb-2">
                            Phone Number *
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={newShop.phone}
                              onChange={handleInputChange}
                              placeholder="+91 98765 43210"
                              className={`w-full px-4 py-3 pr-10 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-purple-500 ${
                                errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-purple-300'
                              }`}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {newShop.phone.length >= 10 ? (
                                <span className="text-green-500">✓</span>
                              ) : (
                                <span className="text-gray-400">📞</span>
                              )}
                            </div>
                          </div>
                          {errors.phone && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1 flex items-center space-x-1"
                            >
                              <span>⚠️</span>
                              <span>{errors.phone}</span>
                            </motion.p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <div className="text-4xl mb-2">📍</div>
                          <h3 className="text-xl font-semibold text-gray-800">Address Details</h3>
                          <p className="text-gray-600 text-sm">Where is your shop located?</p>
                        </div>

                        {/* Street */}
                        <div>
                          <label htmlFor="street" className="block text-sm font-semibold text-purple-500 mb-2">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            id="street"
                            name="street"
                            value={newShop.address.street}
                            onChange={(e) => handleAddressChange('street', e.target.value)}
                            placeholder="123 Main Street"
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-purple-500 ${
                              errors.street ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-purple-300'
                            }`}
                          />
                          {errors.street && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1 flex items-center space-x-1"
                            >
                              <span>⚠️</span>
                              <span>{errors.street}</span>
                            </motion.p>
                          )}
                        </div>

                        {/* City and State */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="city" className="block text-sm font-semibold text-purple-500 mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              id="city"
                              name="city"
                              value={newShop.address.city}
                              onChange={(e) => handleAddressChange('city', e.target.value)}
                              placeholder="Lucknow"
                              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-purple-500 ${
                                errors.city ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-purple-300'
                              }`}
                            />
                            {errors.city && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm mt-1 flex items-center space-x-1"
                              >
                                <span>⚠️</span>
                                <span>{errors.city}</span>
                              </motion.p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="state" className="block text-sm font-semibold text-purple-500 mb-2">
                              State *
                            </label>
                            <input
                              type="text"
                              id="state"
                              name="state"
                              value={newShop.address.state}
                              onChange={(e) => handleAddressChange('state', e.target.value)}
                              placeholder="Uttar Pradesh"
                              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-purple-500 ${
                                errors.state ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-purple-300'
                              }`}
                            />
                            {errors.state && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm mt-1 flex items-center space-x-1"
                              >
                                <span>⚠️</span>
                                <span>{errors.state}</span>
                              </motion.p>
                            )}
                          </div>
                        </div>

                        {/* Postal Code */}
                        <div>
                          <label htmlFor="postalCode" className="block text-sm font-semibold text-purple-500 mb-2">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={newShop.address.postalCode}
                            onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                            placeholder="226017"
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-purple-500 ${
                              errors.postalCode ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-purple-300'
                            }`}
                          />
                          {errors.postalCode && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1 flex items-center space-x-1"
                            >
                              <span>⚠️</span>
                              <span>{errors.postalCode}</span>
                            </motion.p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Message */}
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-2"
                    >
                      <span className="text-red-500">❌</span>
                      <span className="text-red-700">{errors.submit}</span>
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex space-x-4 pt-6">
                    {currentStep === 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={closeModal}
                          className="flex-1 px-6 py-3 border-2 border-gray-200 text-purple-500 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                        >
                          Cancel
                        </button>
                        <motion.button
                          type="button"
                          onClick={nextStep}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <span>Next</span>
                          <span>→</span>
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex-1 px-6 py-3 border-2 border-gray-200 text-purple-500 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
                        >
                          <span>←</span>
                          <span>Back</span>
                        </button>
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                          className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
                            isSubmitting
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg'
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                              <span>Creating...</span>
                            </>
                          ) : (
                            <>
                              <span>✨</span>
                              <span>Create Shop</span>
                            </>
                          )}
                        </motion.button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboardPage;