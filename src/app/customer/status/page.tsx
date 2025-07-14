'use client';
import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GET } from '@/services/api';
import { socket } from '@/utils/socket';
import { 
  Clock, 
  ChefHat, 
  CheckCircle, 
  XCircle, 
  FileText, 
  CreditCard, 
  ShoppingBag, 
  DollarSign, 
  UtensilsCrossed, 
  Star,
  MessageSquare,
  RefreshCw,
  QrCode,
  ArrowLeft,
  Sparkles,
  Timer,
  Heart
} from 'lucide-react';

const OrderStatusPage = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  
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
      
      // Calculate estimated time based on status
      if (data.data.order.status === 'pending') {
        setEstimatedTime(15);
      } else if (data.data.order.status === 'processing') {
        setEstimatedTime(8);
      }
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
    if(!orderId) {
      setError('No Order Id in the URL');
      setLoading(false);
      return;
    }
    fetchOrder();

    socket.emit('joinOrderRoom', orderId);

    socket.on('orderUpdateFromWorker', (updatedOrder) => {
      if(updatedOrder._id === orderId) {
        const prevStatus = order?.status;
        setOrder(updatedOrder);
        
        // Trigger confetti when order is completed
        if (prevStatus !== 'completed' && updatedOrder.status === 'completed') {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          setTimeout(() => setShowRating(true), 2000);
        }
        
        console.log('📦 Realtime order update received:', updatedOrder);
      }
    });

    socket.on('connect', () => {
      console.log('✅ Connected to socket server');
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });
    
    return () => {
      socket.off('orderUpdateFromWorker');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [orderId])

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'processing': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'processing': return <ChefHat className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
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

  const getStatusMessage = (status) => {
    switch(status) {
      case 'pending': return 'Order received! We\'re preparing your meal.';
      case 'processing': return 'Your food is being cooked with love!';
      case 'completed': return 'Your order is ready! Enjoy your meal!';
      case 'cancelled': return 'Order has been cancelled.';
      default: return 'Processing your order...';
    }
  };

  const handleRatingSubmit = async () => {
    // Add API call to submit rating
    try {
      // await POST(`/order/rating/${orderId}`, { rating, feedback });
      setShowRating(false);
      // Show thank you message
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
          <div className="relative">
            <RefreshCw className="animate-spin h-16 w-16 text-indigo-600 mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-700">Loading your order...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest updates</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 p-4">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-white/20">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Order Not Found</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={() => router.push('/scanner')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto"
          >
            <QrCode className="w-5 h-5" />
            Scan Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-lg mx-auto pt-8">
        {/* Header Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6 border border-white/20">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <UtensilsCrossed className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              {order?.status === 'completed' ? 'Order Completed!' : 'Your Order is Being Prepared'}
            </h1>
            <p className="text-gray-500 mt-2 flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              {getStatusMessage(order?.status)}
            </p>
          </div>

          {/* Estimated Time */}
          {estimatedTime && order?.status !== 'completed' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Timer className="w-5 h-5" />
                <span className="font-semibold">Estimated Time: {estimatedTime} minutes</span>
              </div>
            </div>
          )}

          {/* Token ID */}
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  Token ID
                </p>
                <p className="font-bold text-xl text-gray-800">{orderId}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Order Progress
              </span>
              <span className="text-sm text-gray-500">{getProgressPercentage(order?.status)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${getProgressPercentage(order?.status)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wide flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Payment
                  </p>
                  <p className="font-semibold text-green-800">
                    {order?.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  </p>
                </div>
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  {order?.paymentStatus === 'paid' ? 
                    <CheckCircle className="w-5 h-5 text-green-500" /> : 
                    <Clock className="w-5 h-5 text-orange-500" />
                  }
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-2xl border ${getStatusColor(order?.status)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide opacity-75">Status</p>
                  <p className="font-semibold capitalize">{order?.status}</p>
                </div>
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  {getStatusIcon(order?.status)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6 border border-white/20">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Order Items
          </h3>
          <div className="space-y-3">
            {order?.items?.map((item, index) => (
              <div key={item._id} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span>Quantity: {item.quantity}</span>
                    </p>
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
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6 border border-white/20">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border-2 border-green-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-bold text-lg text-gray-800">Total Amount</span>
              </div>
              <span className="font-bold text-2xl text-green-600">₹{order?.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Rating Modal */}
        {showRating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/20">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Rate Your Experience</h3>
                <p className="text-gray-600">How was your meal?</p>
              </div>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      rating >= star ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
              
              <div className="mb-6">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your feedback (optional)"
                  className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRating(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleRatingSubmit}
                  disabled={rating === 0}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pb-8 space-y-4">
          {order?.status === 'completed' ? (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => router.push('/customer/menu')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-4 rounded-2xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <UtensilsCrossed className="w-5 h-5" />
                Order Again
              </button>
              <button 
                onClick={() => setShowRating(true)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-4 rounded-2xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <Star className="w-5 h-5" />
                Rate Order
              </button>
            </div>
          ) : (
            <button 
              onClick={() => router.push('/customer/menu')}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Menu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderStatusPage;