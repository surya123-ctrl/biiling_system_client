'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { GET } from '@/services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Star, Calendar,
  Download, RefreshCw, BarChart3, Activity, Package, Target, IndianRupee, Clock
} from 'lucide-react';

const Page = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // State Management
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [heatMapData, setHeatMapData] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [showAllCustomers, setShowAllCustomers] = useState(false);

  // Filters and UI State
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [chartType, setChartType] = useState('bar');
  const [selectedHeatMapMetric, setSelectedHeatMapMetric] = useState('revenue');

  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    activeCustomers: 0,
    avgOrderValue: 0,
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    todayRevenue: 0,
    growthRate: 0,
    topCategory: '',
    totalItems: 0
  });

  // --- DATA FETCHING ---

  const fetchDashboardData = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      // Pass the selectedPeriod to the API call
      const response = await GET(`/shop-dashboard/top-items/${user._id}?period=${selectedPeriod}`);

      if (response.success && response.data) {
        const { data } = response;
        const topItems = data.topSellingItems || [];
        const activeCustomersList = data.activeCustomers || [];

        setChartData(topItems);
        setAllCustomers(activeCustomersList);

        // Calculate comprehensive stats
        const totalRevenue = topItems.reduce((sum, item) => sum + parseFloat(item.totalRevenue?.$numberDecimal || '0'), 0);
        const totalQuantity = topItems.reduce((sum, item) => sum + (item.quantitySold || 0), 0);
        const dailyRev = parseFloat(data.dailyRevenue?.$numberDecimal || data.dailyRevenue || '0');
        const weeklyRev = parseFloat(data.weeklyRevenue?.$numberDecimal || data.weeklyRevenue || '0');
        const monthlyRev = parseFloat(data.monthlyRevenue?.$numberDecimal || data.monthlyRevenue || '0');
        const todayRev = parseFloat(data.todayRevenue?.$numberDecimal || data.todayRevenue || '0');

        setDashboardStats({
          totalOrders: totalQuantity,
          activeCustomers: activeCustomersList.length,
          avgOrderValue: totalQuantity > 0 ? totalRevenue / totalQuantity : 0,
          dailyRevenue: dailyRev,
          weeklyRevenue: weeklyRev,
          monthlyRevenue: monthlyRev,
          todayRevenue: todayRev,
          growthRate: data.growthRate || 0,
          topCategory: topItems[0]?.name || 'N/A',
          totalItems: topItems.length
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Consider setting an error state to show a message to the user
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatMapData = async () => {
    if (!user?._id) return;
    try {
      const response = await GET(`/shop-dashboard/revernue-by-hour/${user._id}`);
      if (response.success && response.data) {
        const processedData = response.data.map(item => ({
          hour: `${item.hour}:00`, // Format hour for display
          revenue: parseFloat(item.revenue.$numberDecimal || item.revenue || '0'),
          orders: item.orders || 0
        }));
        setHeatMapData(processedData);
      }
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'user') {
      router.push('/login');
    } else {
      fetchDashboardData();
      fetchHeatMapData(); // This can be fetched independently
    }
  }, [user?._id, isAuthenticated, selectedPeriod]); // Re-fetch when user or period changes

  // --- DERIVED DATA & CONSTANTS ---
  const enhancedChartData = chartData.map((item, index) => ({
    ...item,
    revenue: parseFloat(item.totalRevenue?.$numberDecimal || item.totalRevenue || '0'),
    fill: `hsl(${(index * 360) / chartData.length}, 70%, 60%)`,
    revenuePerUnit: item.quantitySold > 0 ?
      parseFloat(item.totalRevenue?.$numberDecimal || item.totalRevenue || '0') / item.quantitySold : 0
  }));

  const customersToShow = showAllCustomers ? allCustomers : allCustomers.slice(0, 6);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ff6b6b', '#4ecdc4'];
  const totalRevenue = enhancedChartData.reduce((sum, item) => sum + item.revenue, 0);

  // --- CUSTOM TOOLTIPS ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-blue-600 flex items-center gap-1"><Package className="w-3 h-3" />Units Sold: <span className="font-semibold">{payload[0].value}</span></p>
            <p className="text-green-600 flex items-center gap-1"><IndianRupee className="w-3 h-3" />Revenue: <span className="font-semibold">₹{data.revenue.toLocaleString()}</span></p>
            <p className="text-purple-600 flex items-center gap-1"><Target className="w-3 h-3" />Per Unit: <span className="font-semibold">₹{data.revenuePerUnit.toFixed(2)}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  const HeatmapTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-800 mb-2">{`Hour: ${label}`}</p>
          <div className="space-y-1">
            <p className="text-green-600 flex items-center gap-1"><IndianRupee className="w-3 h-3" />Revenue: <span className="font-semibold">₹{data.revenue.toLocaleString()}</span></p>
            <p className="text-blue-600 flex items-center gap-1"><ShoppingBag className="w-3 h-3" />Orders: <span className="font-semibold">{data.orders}</span></p>
          </div>
        </div>
      );
    }
    return null;
  }

  // --- CHART RENDERING FUNCTIONS ---
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={enhancedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
        <defs><linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0.3} /></linearGradient></defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} interval={0} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="quantitySold" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} strokeWidth={1} stroke="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie data={enhancedChartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={120} fill="#8884d8" dataKey="quantitySold" strokeWidth={2} stroke="#fff">
          {enhancedChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={enhancedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
        <defs><linearGradient id="colorGradientArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} /></linearGradient></defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} interval={0} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="quantitySold" stroke="#6366f1" fill="url(#colorGradientArea)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderHeatMapChart = () => {
    if (!heatMapData || heatMapData.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-80 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Clock className="w-8 h-8 text-gray-400" /></div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Hourly Data</h3>
          <p className="text-sm text-center max-w-md">Hourly sales data will appear here once you have transactions throughout the day.</p>
        </div>
      )
    }

    const getColor = (value, metric) => {
      const values = heatMapData.map(d => d[metric]);
      const max = Math.max(...values);
      const min = Math.min(...values);
      if (max === min) return metric === 'revenue' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.5)';
      const intensity = (value - min) / (max - min);
      return metric === 'revenue' ? `rgba(34, 197, 94, ${0.2 + intensity * 0.8})` : `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`;
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={heatMapData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<HeatmapTooltip />} />
          <Bar dataKey={selectedHeatMapMetric}>
            {heatMapData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry[selectedHeatMapMetric], selectedHeatMapMetric)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // --- MAIN RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
          <RefreshCw className="animate-spin h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching your shop analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-8">
      {/* Dashboard Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-indigo-600" />Shop Dashboard
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2"><Activity className="w-4 h-4" />Track your shop performance and insights</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchDashboardData} className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"><RefreshCw className="w-4 h-4" />Refresh</button>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"><Download className="w-4 h-4" />Export</button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Today</p><p className="text-2xl font-bold text-green-600">₹{dashboardStats.todayRevenue.toLocaleString()}</p><p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" />Current day</p></div><div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><DollarSign className="w-6 h-6 text-green-600" /></div></div></div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Weekly</p><p className="text-2xl font-bold text-blue-600">₹{dashboardStats.weeklyRevenue.toLocaleString()}</p><p className="text-xs text-blue-500 flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" />Last 7 days</p></div><div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><TrendingUp className="w-6 h-6 text-blue-600" /></div></div></div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Monthly</p><p className="text-2xl font-bold text-purple-600">₹{dashboardStats.monthlyRevenue.toLocaleString()}</p><p className="text-xs text-purple-500 flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" />Last 30 days</p></div><div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"><IndianRupee className="w-6 h-6 text-purple-600" /></div></div></div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Units</p><p className="text-2xl font-bold text-orange-600">{dashboardStats.totalOrders}</p><p className="text-xs text-orange-500 flex items-center gap-1 mt-1"><Package className="w-3 h-3" />{dashboardStats.totalItems} items</p></div><div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-orange-600" /></div></div></div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Customers</p><p className="text-2xl font-bold text-cyan-600">{dashboardStats.activeCustomers}</p><p className="text-xs text-cyan-500 flex items-center gap-1 mt-1"><Users className="w-3 h-3" />Active buyers</p></div><div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center"><Users className="w-6 h-6 text-cyan-600" /></div></div></div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Growth</p><p className={`text-2xl font-bold ${dashboardStats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>{dashboardStats.growthRate >= 0 ? '+' : ''}{dashboardStats.growthRate}%</p><p className={`text-xs flex items-center gap-1 mt-1 ${dashboardStats.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>{dashboardStats.growthRate >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}vs last period</p></div><div className={`w-12 h-12 rounded-full flex items-center justify-center ${dashboardStats.growthRate >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>{dashboardStats.growthRate >= 0 ? <TrendingUp className="w-6 h-6 text-green-600" /> : <TrendingDown className="w-6 h-6 text-red-600" />}</div></div></div>
      </div>

      {/* Chart Controls & Main Chart */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4"><h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><BarChart3 className="w-5 h-5" />Sales Analytics</h2><div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{dashboardStats.totalItems} Products</div></div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2"><span className="text-sm text-gray-600">Chart:</span><select value={chartType} onChange={(e) => setChartType(e.target.value)} className="bg-white border text-purple-500 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="bar">Bar</option><option value="pie">Pie</option><option value="area">Area</option></select></div>
                <div className="flex items-center gap-2"><span className="text-sm text-gray-600">Period:</span><select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="bg-white border text-purple-500 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option><option value="1y">Last year</option></select></div>
              </div>
            </div>
          </div>
          <div className="p-6">
            {chartData.length > 0 ? (
              <div>
                <div className="mb-6"><h3 className="text-lg font-semibold text-gray-800 mb-2">Top Selling Items</h3><p className="text-sm text-gray-600">Performance of your best-sellers • Total Revenue: ₹{totalRevenue.toLocaleString()}</p></div>
                {chartType === 'bar' && renderBarChart()}
                {chartType === 'pie' && renderPieChart()}
                {chartType === 'area' && renderAreaChart()}
              </div>
            ) : (<div className="flex flex-col justify-center items-center h-96 text-gray-400"><div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"><BarChart3 className="w-10 h-10 text-gray-400" /></div><h3 className="text-lg font-semibold text-gray-600 mb-2">No Sales Data Yet</h3><p className="text-sm text-center max-w-md">Start selling items to see your analytics here. Your sales performance will be displayed once you have order data.</p></div>)}
          </div>
        </div>
      </div>

      {/* Hourly Performance Heatmap */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div><h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Activity className="w-5 h-5" />Hourly Performance</h3><p className="text-sm text-gray-600 mt-1">Track sales patterns throughout the day to identify peak hours</p></div>
            <div className="flex items-center gap-2"><span className="text-sm text-gray-600">View:</span><select value={selectedHeatMapMetric} onChange={(e) => setSelectedHeatMapMetric(e.target.value)} className="bg-white border text-purple-500 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="revenue">Revenue</option><option value="orders">Orders</option></select></div>
          </div>
          {renderHeatMapChart()}
        </div>
      </div>

      {/* Detailed Performance & Customers */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Detailed Performance Table */}
        {chartData.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Package className="w-5 h-5" />Detailed Performance</h3></div>
            <div className="overflow-x-auto"><table className="w-full">
              <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank & Item</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                {enhancedChartData.slice(0, 5).map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : index === 2 ? 'bg-gradient-to-br from-orange-600 to-red-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500'}`}>{index + 1}</div><div><span className="font-medium text-gray-800">{item.name}</span></div></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-2"><span className="text-sm font-semibold text-gray-800">{item.quantitySold}</span><span className="text-xs text-gray-500">units</span></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-semibold text-green-600">₹{item.revenue.toLocaleString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )}
        {/* Recent Active Customers */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Users className="w-5 h-5" />Recent Customers<span className="text-sm font-normal text-gray-500">({allCustomers.length})</span></h3></div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customersToShow.map((customer) => (
                <div key={customer._id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-white font-semibold text-sm">{customer.customer.charAt(0).toUpperCase()}</span></div><div className="flex-1"><p className="font-medium text-gray-800 truncate">{customer.customer}</p><p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(customer.lastOrderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p></div></div></div>
              ))}
            </div>
            {allCustomers.length > 6 && (
              <div className="mt-4 text-center"><button onClick={() => setShowAllCustomers(!showAllCustomers)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">{showAllCustomers ? 'Show less' : `View all ${allCustomers.length} customers →`}</button></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
};

export default Page;