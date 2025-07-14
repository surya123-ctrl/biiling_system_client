"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { GET, POST } from '@/services/api';
import { socket } from '@/utils/socket';
import {
    Package,
    Clock,
    Search,
    Filter,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    User,
    Phone,
    ShoppingBag,
    CreditCard,
    TrendingUp,
    BarChart3,
    Eye,
    ChevronRight,
    Star,
    MapPin,
    Calendar,
    DollarSign,
    Zap,
    Activity
} from 'lucide-react';

const OrderQueuePage = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    console.log(user, isAuthenticated)
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('processing');
    const [paymentFilter, setPaymentFilter] = useState('paid');
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Enhanced socket order update handler with visual feedback
    const handleSocketOrderUpdate = (data) => {
        console.log('📥 Order updated:', data.order);
        
        setOrders(prev => {
            // Check if order already exists in the list
            const orderExists = prev.some(o => o._id === data.order._id);
            
            if (orderExists) {
                // Update existing order and mark it as recently updated
                return prev.map(o => 
                    o._id === data.order._id 
                        ? { ...data.order, isUpdated: true } 
                        : o
                );
            } else {
                // Add new order to the list and mark as updated
                return [...prev, { ...data.order, isUpdated: true }];
            }
        });
        
        // Remove the update indicator after 3 seconds
        setTimeout(() => {
            setOrders(prev => prev.map(o => 
                o._id === data.order._id 
                    ? { ...o, isUpdated: false } 
                    : o
            ));
        }, 3000);
        
        // Optional: Show console message for debugging
        console.log(`✅ Order ${data.order.orderId || data.order._id.slice(-6)} updated to ${data.order.status}`);
    };

    // Socket connection and event handling
    useEffect(() => {
        if(!user?._id) return;
        
        // Join shop room for real-time updates
        socket.emit('joinShopRoom', user?._id);
        
        // Listen for order updates
        socket.on('orderUpdate', handleSocketOrderUpdate);
        
        // Debug socket connection
        socket.on('connect', () => {
            console.log('✅ Connected to socket server');
        });
        
        socket.on('disconnect', () => {
            console.log('❌ Disconnected from socket server');
        });
        
        return () => {
            socket.off('orderUpdate');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [user?._id]);

    // Authentication check
    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'user') {
            router.push('/login');
        }
    }, [isAuthenticated, user?.role, router]);

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await GET(`/menu/getProcessingOrders/${user?._id}?status=${statusFilter}&paymentStatus=${paymentFilter}`);
            console.log('📊 Fetched orders:', response);
            
            if (response.success === true) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            setError('Failed to fetch orders');
            console.error('Error in fetching orders: ', error);
        } finally {
            setLoading(false);
        }
    };

    // Mark order as completed
    const markOrderCompleted = async (order) => {
        console.log("🔄 Marking order as completed:", order);
        try {
            setUpdatingOrder(order._id);
            const response = await POST('/order/update-status', { 
                status: 'completed', 
                paymentStatus: 'paid', 
                orderId: order._id
            });

            if (response.success === true) {
                // Update local state immediately for better UX
                setOrders(prev => prev.map(o =>
                    o._id === order._id
                        ? { ...o, status: 'completed', paymentStatus: 'paid' }
                        : o
                ));
                console.log('✅ Order marked as completed successfully');
            } else {
                setError(response.message || 'Failed to update order');
            }
        } catch (err) {
            setError('Failed to update order');
            console.error('❌ Error updating order:', err);
        } finally {
            setUpdatingOrder(null);
        }
    };

    // Utility functions
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (paymentStatus) => {
        return paymentStatus === 'paid'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'processing': return <Activity className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    // Enhanced filtering logic
    const filteredOrders = orders.filter(order => {
        // Apply status filter
        if (statusFilter && order.status !== statusFilter) {
            return false;
        }
        
        // Apply payment filter
        if (paymentFilter && order.paymentStatus !== paymentFilter) {
            return false;
        }
        
        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const orderId = order.orderId || order._id.slice(-6);
            const customerName = order.customerId?.name || '';
            
            return orderId.toLowerCase().includes(searchLower) ||
                   customerName.toLowerCase().includes(searchLower);
        }
        
        return true;
    });

    // Calculate order statistics
    const orderStats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        completed: orders.filter(o => o.status === 'completed').length,
        unpaid: orders.filter(o => o.paymentStatus === 'unpaid').length,
    };

    // Debug logging
    useEffect(() => {
        console.log('📈 Orders state updated:', orders.length, 'total orders');
        console.log('🔍 Filtered orders:', filteredOrders.length, 'visible orders');
        console.log('🎛️ Current filters:', { statusFilter, paymentFilter, searchTerm });
    }, [orders, filteredOrders, statusFilter, paymentFilter, searchTerm]);

    // Fetch orders when component mounts or filters change
    useEffect(() => {
        if (isAuthenticated && user?.role === 'user') {
            fetchOrders();
        }
    }, [isAuthenticated, user?.role, statusFilter, paymentFilter]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Animated Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-block p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl mb-4">
                        <Package className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-2">
                        Order Queue
                    </h1>
                    <p className="text-gray-600 text-lg">Manage and process customer orders with style</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="flex justify-center mb-2">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-purple-600">{orderStats.total}</div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="flex justify-center mb-2">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="text-2xl font-bold text-amber-600">{orderStats.pending}</div>
                        <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="flex justify-center mb-2">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{orderStats.processing}</div>
                        <div className="text-sm text-gray-600">Processing</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="flex justify-center mb-2">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{orderStats.completed}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="flex justify-center mb-2">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="text-2xl font-bold text-red-600">{orderStats.unpaid}</div>
                        <div className="text-sm text-gray-600">Unpaid</div>
                    </div>
                </div>

                {/* Enhanced Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Search Orders
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by order ID or customer..."
                                className="text-purple-500 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Order Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="text-purple-500 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Payment Status
                            </label>
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="text-purple-500 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                            >
                                <option value="">All Payments</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                &nbsp;
                            </label>
                            <button
                                onClick={fetchOrders}
                                disabled={loading}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Refreshing...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-5 h-5" />
                                        Refresh Orders
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-gradient-to-r from-red-100 to-pink-100 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 shadow-lg animate-pulse">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Orders List */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Package className="w-8 h-8 text-purple-600" />
                            Orders ({filteredOrders.length})
                        </h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                            <p className="text-gray-500 text-lg">Loading your orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-16">
                            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-xl text-gray-500 mb-2">No orders found</p>
                            <p className="text-gray-400">Orders will appear here when customers place them</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredOrders.map((order, index) => (
                                <div
                                    key={order._id}
                                    className={`relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 hover:border-purple-200 ${
                                        order.isUpdated ? 'ring-2 ring-green-400 shadow-green-200' : ''
                                    }`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {/* Updated Order Indicator */}
                                    {order.isUpdated && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                            Updated
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                                #{order.orderId?.slice(-2) || order._id.slice(-2)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-800">
                                                    Order #{order.orderId || order._id.slice(-6)}
                                                </h3>
                                                <p className="text-gray-500 flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <span className={`px-4 py-2 text-sm font-bold rounded-full ${getStatusColor(order.status)} transform hover:scale-105 transition-all duration-200 flex items-center gap-2`}>
                                                {getStatusIcon(order.status)}
                                                {order.status.toUpperCase()}
                                            </span>
                                            <span className={`px-4 py-2 text-sm font-bold rounded-full ${getPaymentStatusColor(order.paymentStatus)} transform hover:scale-105 transition-all duration-200 flex items-center gap-2`}>
                                                <CreditCard className="w-4 h-4" />
                                                {order.paymentStatus.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <ShoppingBag className="w-5 h-5" />
                                            Order Items
                                        </h4>
                                        <div className="bg-gray-50/80 rounded-xl p-4 space-y-3">
                                            {order.items?.map((item, itemIndex) => (
                                                <div key={itemIndex} className="flex justify-between items-center bg-white/80 rounded-lg p-3 shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {item.quantity}
                                                        </div>
                                                        <span className="font-medium text-gray-800">{item.name}</span>
                                                    </div>
                                                    <span className="font-bold text-purple-600 flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4" />
                                                        ₹{item.price * item.quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    {order.customerId && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <User className="w-5 h-5" />
                                                Customer Information
                                            </h4>
                                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        {order.customerId.name?.charAt(0) || <User className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                            <User className="w-4 h-4" />
                                                            {order.customerId.name}
                                                        </p>
                                                        <p className="text-gray-600 flex items-center gap-1">
                                                            <Phone className="w-4 h-4" />
                                                            {order.customerId.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Total and Actions */}
                                    <div className="flex justify-between items-center pt-4 border-t-2 border-gray-100">
                                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                                            <DollarSign className="w-6 h-6 text-purple-600" />
                                            Total: ₹{order.totalAmount}
                                        </div>
                                        <div className="flex gap-3">
                                            {order.status !== 'completed' && (
                                                <button
                                                    onClick={() => markOrderCompleted(order)}
                                                    disabled={updatingOrder === order._id}
                                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                                                >
                                                    {updatingOrder === order._id ? (
                                                        <>
                                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-5 h-5" />
                                                            Mark Complete
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            {order.status === 'completed' && (
                                                <div className="px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl font-semibold flex items-center gap-2">
                                                    <Star className="w-5 h-5" />
                                                    Order Completed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Enhanced Footer */}
                <div className="text-center mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <User className="w-6 h-6 text-purple-600" />
                        <span className="text-lg font-semibold text-gray-700">
                            {user?.name} ({user?.email})
                        </span>
                    </div>
                    <p className="text-gray-500 flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4" />
                        Managing orders for your sweet shop with professional tools
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
            `}</style>
        </div>
    );
};

export default OrderQueuePage;