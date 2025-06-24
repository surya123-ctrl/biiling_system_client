'use client';
import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GET } from '@/services/api';

const OrderStatusPage = () => {
  const router = useRouter();
    const searchParams = new URLSearchParams(window.location.search);
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const fetchOrder = async () => {
        if(!orderId) {
            setError("⚠️ No orderId found");
            setLoading(false);
            return;
        }
        try {
            const data = await GET(`/order/getorderDetails/${orderId}`);
            console.log(data)
            setOrder(data.data.order);
        }
        catch (err) {
            console.error("Network error:", err);
            setError("⚠️ Failed to load order status");
        } 
        finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        fetchOrder();
        const interval = setInterval(fetchOrder, 5000);
        return () => clearInterval(interval);
    }, [orderId])

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'pending': return '⏳';
            case 'processing': return '👨‍🍳';
            case 'completed': return '✅';
            case 'cancelled': return '❌';
            default: return '📋';
        }
    };

    const getProgressPercentage = (status) => {
        switch(status) {
            case 'pending': return 25;
            case 'processing': return 75;
            case 'completed': return 100;
            default: return 0;
        }
    };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="relative">
            <div className="animate-spin h-16 w-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
          </div>
          <p className="text-lg font-medium text-gray-700">Loading your order...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest updates</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😞</span>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Order Not Found</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={() => router.push('/scanner')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🔍 Scan Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 p-4">
      <div className="max-w-lg mx-auto pt-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🍽️</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Your Order is Being Prepared
            </h1>
            <p className="text-gray-500 mt-2">Track your delicious meal in real-time</p>
          </div>

          {/* Token ID with modern design */}
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Token ID</p>
                <p className="font-bold text-xl text-gray-800">{orderId}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-xl">🎫</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Order Progress</span>
              <span className="text-sm text-gray-500">{getProgressPercentage(order.status)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage(order.status)}%` }}
              ></div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Payment</p>
                  <p className="font-semibold text-green-800">
                    {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  </p>
                </div>
                <span className="text-2xl">{order.paymentStatus === 'paid' ? '💳' : '⏳'}</span>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border ${getStatusColor(order.status)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide opacity-75">Status</p>
                  <p className="font-semibold capitalize">{order.status}</p>
                </div>
                <span className="text-2xl">{getStatusIcon(order.status)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🛒</span>
            Order Items
          </h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={item._id} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">₹{(item.price * item.quantity).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">₹{item.price} each</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-2xl mr-3">💰</span>
                <span className="font-bold text-lg text-gray-800">Total Amount</span>
              </div>
              <span className="font-bold text-2xl text-green-600">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pb-8">
          <button 
            onClick={() => router.push('/customer/menu')}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
          >
            <span className="mr-2">🍽️</span>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;