'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PUT, POST } from '../services/api'
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
export default function CustomerDetailsModal({ isOpen, onClose, amount, orderId }) {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    console.log(user)
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { name, email, phone } = details;

    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert("⚠️ Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // Send POST request to backend
      const data = await PUT(`/customer/${user._id}`, details);
      console.log("----up---")
      console.log(data)
    //   const res = await fetch('/api/customer/details/save', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(details)
    //   });

    //   const data = await res.json();

      if (data.success) {
        // Redirect to payment page
        const razorpayResponse = await POST('/razorpay/create-order', { ...details, amount });
        console.log("Razorpay response: ", razorpayResponse);
        if (!razorpayResponse.success) {
            alert("Unable to create Razorpay order");
            return;
        }

        router.push(`/customer/payment?razorpayOrderId=${razorpayResponse.data.orderId}&orderId=${orderId}`);
      } else {
        alert("❌ Failed to save customer details");
      }
    } catch (err) {
      console.error("Error saving customer:", err);
      alert("⚠️ Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md mx-auto my-6 p-8 rounded-2xl shadow-xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-center">📝 Enter Your Details</h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-left text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            name="name"
            value={details.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200"
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-left text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={details.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200"
            disabled={loading}
          />
        </div>

        {/* Phone */}
        <div className="mb-6">
          <label className="block text-left text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={details.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200"
            disabled={loading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300'
            }`}
          >
            {loading ? "Saving..." : "Confirm & Pay"}
          </button>
        </div>
      </div>
    </div>
  );
}