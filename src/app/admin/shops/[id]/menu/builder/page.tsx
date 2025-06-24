'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, ImageIcon } from 'lucide-react';

export default function ShopMenuPreviewOnly() {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Dummy items for preview
  const dummyItems = [
    { _id: '1', name: 'Jalebi', price: { $numberDecimal: '150' }, unit: 'kg' },
    { _id: '2', name: 'Laddoo', price: { $numberDecimal: '200' }, unit: 'kg' },
    { _id: '3', name: 'Barfi', price: { $numberDecimal: '180' }, unit: 'kg' }
  ];

  const handleFileUpload = (e, setUrl) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setUrl(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const generateCustomHTML = () => {
    return `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Poppins', sans-serif;
          background: #fff;
          padding: 2rem;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .logo {
          width: 120px;
          height: auto;
          display: block;
          margin: 0 auto 1rem auto;
        }
        .banner {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }
        .item {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .item-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .item-price {
          color: #4b5563;
          font-size: 0.9rem;
        }
        .cart-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          width: 60px;
          height: 60px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(139, 87, 165, 0.3);
        }
      </style>

      <div class="container">
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo" />` : ''}
        
        ${bannerUrl ? `<img src="${bannerUrl}" alt="Banner" class="banner" />` : ''}
        
        <h1 class="text-center text-2xl font-bold mb-6">Our Special Menu</h1>

        ${dummyItems.map(item => `
          <div class="item">
            <div class="item-name">${item.name}</div>
            <div class="item-price">₹${item.price.$numberDecimal}/${item.unit}</div>
          </div>
        `).join('')}
      </div>

      <div class="cart-btn">🛒</div>
    `;
  };

  const handleSave = () => {
    alert("✅ Saved! This would be sent to backend in live version");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🖼️ Logo & Banner Preview</h1>
              <p className="text-gray-600 mt-1">Upload your logo and banner image</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Upload Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6">
              {/* Logo Upload */}
              <div className="space-y-2 mb-6">
                <label className="block text-sm font-semibold text-gray-700">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setLogoUrl)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {logoUrl && (
                  <div className="mt-4 flex justify-center">
                    <img src={logoUrl} alt="Uploaded Logo" className="w-32 h-auto rounded-lg shadow-md" />
                  </div>
                )}
              </div>

              {/* Banner Upload */}
              <div className="space-y-2 mb-6">
                <label className="block text-sm font-semibold text-gray-700">Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setBannerUrl)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {bannerUrl && (
                  <div className="mt-4">
                    <img src={bannerUrl} alt="Banner Preview" className="w-full h-auto rounded-lg shadow-md" />
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={!logoUrl && !bannerUrl}
              >
                <Save className="w-5 h-5 mr-2" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
                Live Preview
              </h3>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 min-h-[600px]">
                <iframe
                  srcDoc={generateCustomHTML()}
                  title="Menu Preview"
                  className="w-full h-full min-h-[580px] bg-white rounded-lg border border-gray-200"
                  style={{ transform: 'scale(0.9)', transformOrigin: 'top left', width: '111%', height: '111%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}