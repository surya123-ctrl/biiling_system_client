'use client';
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ProfilePage() {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState('profile');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8 items-center">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="mb-8">
                    <h1 className="text-center text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Admin Profile
                    </h1>
                    <p className="text-gray-600 text-lg text-center">Manage your account settings and preferences</p>
                </motion.div>

                {/* Profile Header Card */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8 relative overflow-hidden"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full -translate-y-16 translate-x-16"></div>
                    
                    <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl ring-4 ring-white/50">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                {user?.name || 'Admin User'}
                            </h2>
                            <p className="text-lg text-gray-600 mb-4">{user?.email}</p>
                            
                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                <span className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-semibold">
                                    🛡️ {user?.role || 'admin'}
                                </span>
                                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                    ✅ Verified
                                </span>
                                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                    🌟 Active
                                </span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-col gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                ✏️ Edit Profile
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition-all duration-200"
                            >
                                📋 View Activity
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div variants={itemVariants} className="mb-8">
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/20">
                        <div className="flex gap-2">
                            {[
                                { id: 'profile', label: '👤 Profile', icon: '👤' },
                                { id: 'security', label: '🔒 Security', icon: '🔒' },
                                { id: 'activity', label: '📊 Activity', icon: '📊' },
                                { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="hidden md:inline">{tab.label}</span>
                                    <span className="md:hidden text-xl">{tab.icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Content Based on Active Tab */}
                <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {activeTab === 'profile' && (
                        <>
                            {/* Personal Information */}
                            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                                        <span className="text-white text-xl">👤</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">Personal Information</h3>
                                </div>
                                
                                <div className="space-y-6">
                                    {[
                                        { label: 'Full Name', value: user?.name || 'Surya Pratap Singh', icon: '🏷️' },
                                        { label: 'Email Address', value: user?.email || 'suryatomar303@gmail.com', icon: '📧' },
                                        { label: 'Phone Number', value: user?.phone || '+91 9876543210', icon: '📱' },
                                        { label: 'Role', value: user?.role || 'admin', icon: '🎭' }
                                    ].map((item, index) => (
                                        <div key={index} className="group">
                                            <div className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-2xl group-hover:bg-gray-100/80 transition-colors duration-200">
                                                <span className="text-xl">{item.icon}</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
                                                    <p className="font-semibold text-gray-800">{item.value}</p>
                                                </div>
                                                <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <span className="text-gray-400 hover:text-indigo-500">✏️</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="space-y-6">
                                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                                            <span className="text-white text-xl">📊</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800">Account Stats</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                                            <div className="text-3xl font-bold text-blue-600 mb-1">156</div>
                                            <div className="text-sm text-gray-600">Total Logins</div>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                                            <div className="text-3xl font-bold text-purple-600 mb-1">24</div>
                                            <div className="text-sm text-gray-600">Days Active</div>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                                            <div className="text-3xl font-bold text-green-600 mb-1">12</div>
                                            <div className="text-sm text-gray-600">Shops Managed</div>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
                                            <div className="text-3xl font-bold text-orange-600 mb-1">98%</div>
                                            <div className="text-sm text-gray-600">Uptime</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'security' && (
                        <>
                            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                                        <span className="text-white text-xl">🔒</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">Security Settings</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="p-6 border-2 border-green-200 bg-green-50 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">✅</span>
                                            <h4 className="font-semibold text-gray-800">Account Protection</h4>
                                        </div>
                                        <p className="text-gray-600 mb-4">Your account is secured with email authentication.</p>
                                        <div className="flex gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                                            >
                                                🔑 Change Password
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="px-4 py-2 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                                            >
                                                📱 Setup 2FA
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                                        <span className="text-white text-xl">🛡️</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">Privacy Controls</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    {[
                                        { title: 'Profile Visibility', status: 'Private', icon: '👁️' },
                                        { title: 'Activity Tracking', status: 'Enabled', icon: '📍' },
                                        { title: 'Email Notifications', status: 'On', icon: '📧' }
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{item.icon}</span>
                                                <span className="font-medium">{item.title}</span>
                                            </div>
                                            <span className="text-sm text-gray-600 font-medium">{item.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'activity' && (
                        <div className="lg:col-span-2">
                            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                                        <span className="text-white text-xl">📈</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">Recent Activity</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    {[
                                        { action: 'Logged in from Chrome, Windows 11', time: 'Just now', type: 'login', icon: '✅' },
                                        { action: 'Updated shop menu items', time: '2 hours ago', type: 'update', icon: '🍰' },
                                        { action: 'Added new shop location', time: '1 day ago', type: 'create', icon: '🏪' },
                                        { action: 'Changed profile settings', time: 'May 25, 2025', type: 'settings', icon: '⚙️' },
                                        { action: 'Exported sales report', time: 'May 23, 2025', type: 'export', icon: '📊' }
                                    ].map((activity, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-2xl hover:bg-gray-100/80 transition-colors duration-200"
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                                                activity.type === 'login' ? 'bg-green-100' :
                                                activity.type === 'update' ? 'bg-blue-100' :
                                                activity.type === 'create' ? 'bg-purple-100' :
                                                activity.type === 'settings' ? 'bg-orange-100' :
                                                'bg-indigo-100'
                                            }`}>
                                                {activity.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{activity.action}</p>
                                                <p className="text-sm text-gray-500">{activity.time}</p>
                                            </div>
                                            <button className="text-gray-400 hover:text-indigo-500 transition-colors">
                                                <span className="text-lg">›</span>
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="lg:col-span-2">
                            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center">
                                        <span className="text-white text-xl">⚙️</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">App Settings</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { category: 'Theme', options: ['Light', 'Dark', 'Auto'], current: 'Light', icon: '🎨' },
                                        { category: 'Language', options: ['English', 'Hindi', 'Spanish'], current: 'English', icon: '🌐' },
                                        { category: 'Timezone', options: ['IST', 'UTC', 'EST'], current: 'IST', icon: '🕐' },
                                        { category: 'Currency', options: ['INR', 'USD', 'EUR'], current: 'INR', icon: '💰' }
                                    ].map((setting, index) => (
                                        <div key={index} className="p-6 bg-gray-50/80 rounded-2xl">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-2xl">{setting.icon}</span>
                                                <h4 className="font-semibold text-gray-800">{setting.category}</h4>
                                            </div>
                                            <select className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                                {setting.options.map(option => (
                                                    <option key={option} value={option} selected={option === setting.current}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}