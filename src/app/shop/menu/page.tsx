'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GET, POST } from '@/services/api';
import { X, Edit3, Trash2, AlertTriangle, Save, Package, DollarSign, Hash } from 'lucide-react';
import EditModal from '@/modals/EditModal';
import DeleteModal from '@/modals/DeleteModal';
import { useSelector } from 'react-redux';
import { RootState } from "@/lib/store";
interface MenuItem {
    _id?: string;
    name: string;
    price: { $numberDecimal: string } | number;
    unit: string;
    category?: string;
    description?: string;
}

const UNIT_OPTIONS = [
    { value: 'piece', label: '🍪 Piece', category: 'Count' },
    { value: 'dozen', label: '🥚 Dozen', category: 'Count' },
    { value: 'packet', label: '📦 Packet', category: 'Count' },
    { value: 'g', label: '⚖️ Gram', category: 'Weight' },
    { value: 'kg', label: '🏋️ Kilogram', category: 'Weight' },
    { value: 'ml', label: '🧪 Milliliter', category: 'Volume' },
    { value: 'litre', label: '🫗 Litre', category: 'Volume' },
    { value: 'unit', label: '🔢 Unit', category: 'Volume' },
    { value: 'custom', label: '✏️ Custom', category: 'Volume' },
];

const CATEGORY_COLORS = {
    'Cakes': { bg: 'from-pink-400 to-rose-400', text: 'text-pink-600', icon: '🎂' },
    'Ice Cream': { bg: 'from-blue-400 to-cyan-400', text: 'text-blue-600', icon: '🍨' },
    'Chocolates': { bg: 'from-amber-400 to-orange-400', text: 'text-amber-600', icon: '🍫' },
    'Candies': { bg: 'from-red-400 to-pink-400', text: 'text-red-600', icon: '🍬' },
    'Cookies': { bg: 'from-yellow-400 to-amber-400', text: 'text-yellow-600', icon: '🍪' },
    'Beverages': { bg: 'from-green-400 to-teal-400', text: 'text-green-600', icon: '🥤' },
    'default': { bg: 'from-purple-400 to-indigo-400', text: 'text-purple-600', icon: '🍯' }
};

const ShopMenuPage = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');

    // Fetch menu items on load
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const data = await GET(`/menu/getMenu/${user?._id}`);
                setItems(data.data.items || []);
                console.log(items)
            } catch (error) {
                console.error('Error fetching menu:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    // Handle Add Item
    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !unit) return alert('Please fill in required fields.');

        try {
            const newItem = { shopId: user?._id, name, price: parseFloat(price), unit, description };
            const data = await POST(`/menu/add`, newItem);
            setItems((prev) => [...prev, data.data.item]);
            setShowModal(false);
            resetForm();
        } catch (err) {
            console.error(err);
            alert('Error adding item.');
        }
    };
    const handleEdit = (updatedItem: MenuItem) => {
        setItems(prev => prev.map(item =>
            item._id === updatedItem._id ? updatedItem : item
        ));
    };

    const handleDelete = (_id: string) => {
        setItems(prev => prev.filter(item => item._id !== _id));
    };


    const resetForm = () => {
        setName('');
        setPrice('');
        setUnit('');
        setDescription('');
    };

    // Get numeric price
    const getPrice = (price: { $numberDecimal: string } | number): number => {
        return typeof price === 'object' && '$numberDecimal' in price
            ? parseFloat(price.$numberDecimal)
            : Number(price);
    };

    // Filter and sort items
    const filteredItems = items
        .filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price':
                    return getPrice(a.price) - getPrice(b.price);
                case 'category':
                    return (a.category || '').localeCompare(b.category || '');
                default:
                    return a.name.localeCompare(b.name);
            }
        });

    // Unique categories
    const categories = ['all', ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))];
    const totalValue = items.reduce((sum, item) => sum + getPrice(item.price), 0);
    const avgPrice = items.length > 0 ? totalValue / items.length : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Enhanced Header */}
            <header className="bg-white/90 backdrop-blur-lg border-b border-white/40 sticky top-0 z-10 shadow-lg shadow-blue-500/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex flex-col items-center text-center gap-6 lg:flex-row lg:items-center lg:justify-between lg:text-left">

                        {/* Left Section - Logo and Title */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="relative shrink-0">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <span className="text-2xl">🧾</span>
                                </div>
                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">✓</span>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Menu Management
                                </h1>
                                <p className="text-gray-600 text-sm sm:text-base mt-1 flex items-center gap-2 justify-center sm:justify-start">
                                    <span>🍬</span> Manage your sweet shop inventory
                                </p>
                            </div>
                        </div>

                        {/* Right Section - Buttons */}
                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                            {/* Add Item Button */}
                            {/* <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                            >
                                <span className="text-lg">➕</span>
                                <span>Add Item</span>
                            </button> */}
                            <button
                                onClick={() => setShowModal(true)}
                                type="submit"
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                <span>✨</span> Add Item
                            </button>
                            {/* Back to Dashboard Button */}
                            <Link href="/admin/dashboard">
                                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-gray-800 bg-white/70 backdrop-blur-md border border-gray-200 shadow-md hover:shadow-lg hover:bg-white transition-all duration-200 text-sm sm:text-base">
                                    <span className="text-lg">←</span>
                                    <span>Dashboard</span>
                                </button>
                            </Link>
                        </div>

                    </div>
                </div>
            </header>


            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Enhanced Stats & Controls */}
                <section className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-8">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard index="1" label="Total Items" value={items.length} color="indigo" icon="📦" />
                            <StatCard index="2" label="Total Value" value={`₹${totalValue.toFixed(0)}`} color="emerald" icon="💰" />
                            <StatCard index="3" label="Categories" value={categories.length - 1} color="purple" icon="🏷️" />
                            <StatCard index="4" label="Avg Price" value={`₹${avgPrice.toFixed(0)}`} color="orange" icon="📊" />
                        </div>

                        {/* Controls */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                {/* Search */}
                                <div className="relative flex-1 min-w-64">
                                    <input
                                        type="text"
                                        placeholder="Search delicious treats..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/90 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm text-purple-500"
                                    />
                                    <span className="absolute left-4 top-4 text-gray-400 text-lg">🔍</span>
                                </div>

                                {/* View Toggle */}
                                <div className="flex bg-gray-100/80 rounded-xl p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'grid'
                                            ? 'bg-white text-indigo-600 shadow-md'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        ⊞ Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'list'
                                            ? 'bg-white text-indigo-600 shadow-md'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        ☰ List
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {/* Category Filter */}
                                {categories.length > 1 && (
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-4 py-3 bg-white/90 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm text-purple-500"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat === 'all' ? '🌟 All Categories' : `${CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]?.icon || '🏷️'} ${cat}`}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {/* Sort Options */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-3 bg-white/90 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm text-purple-500"
                                >
                                    <option value="name">📝 Sort by Name</option>
                                    <option value="price">💰 Sort by Price</option>
                                    <option value="category">🏷️ Sort by Category</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col justify-center items-center py-20">
                        <div className="relative mb-6">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animate-reverse"></div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Menu</h3>
                        <p className="text-gray-600">Preparing your delicious inventory...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && items.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                            <span className="text-6xl">🍯</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Menu Awaits</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                            Start building your sweet empire! Add delicious treats and watch your menu come to life.
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-10 py-4 rounded-2xl font-bold hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105 text-lg"
                        >
                            🍭 Create Your First Item
                        </button>
                    </motion.div>
                )}

                {/* No Results State */}
                {!loading && items.length > 0 && filteredItems.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="text-6xl mb-6">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-3">No matches found</h3>
                        <p className="text-gray-500 text-lg">Try adjusting your search or explore different categories</p>
                    </motion.div>
                )}

                {/* Menu Display */}
                {!loading && filteredItems.length > 0 && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={viewMode}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={
                                viewMode === 'grid'
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                    : "space-y-4"
                            }
                        >
                            {filteredItems.map((item, index) => (
                                <MenuItemCard
                                    key={item._id}
                                    item={item}
                                    getPrice={getPrice}
                                    viewMode={viewMode}
                                    index={index}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* Result Summary */}
                {!loading && filteredItems.length > 0 && (
                    <div className="text-center py-6">
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-white/30">
                            <span className="text-sm font-medium text-gray-700">
                                Showing {filteredItems.length} of {items.length} items
                            </span>
                            {searchTerm && (
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                    "{searchTerm}"
                                </span>
                            )}
                            {selectedCategory !== 'all' && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                    {selectedCategory}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Enhanced Modal */}
            <AnimatePresence>
                {showModal && (
                    <AddItemModal
                        onClose={() => setShowModal(false)}
                        onSubmit={handleAddItem}
                        name={name}
                        setName={setName}
                        price={price}
                        setPrice={setPrice}
                        unit={unit}
                        setUnit={setUnit}
                        description={description}
                        setDescription={setDescription}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Enhanced Helper Components

const StatCard = ({
    index,
    label,
    value,
    color,
    icon,
}: {
    index: string,
    label: string;
    value: string | number;
    color: 'indigo' | 'emerald' | 'purple' | 'orange';
    icon: string;
}) => {
    const colorClasses = {
        indigo: { bg: 'from-indigo-500 to-blue-500', text: 'text-indigo-600' },
        emerald: { bg: 'from-emerald-500 to-teal-500', text: 'text-emerald-600' },
        purple: { bg: 'from-purple-500 to-pink-500', text: 'text-purple-600' },
        orange: { bg: 'from-orange-500 to-red-500', text: 'text-orange-600' },
    };

    return (
        <div key={index} className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color].bg} rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <span>{icon}</span>
                </div>
            </div>
            <div className={`text-2xl font-bold ${colorClasses[color].text} mb-1`}>{value}</div>
            <div className="text-sm text-gray-600 font-medium">{label}</div>
        </div>
    );
};

const MenuItemCard = ({
    item,
    getPrice,
    viewMode,
    index,
    onEdit,
    onDelete
}: {
    item: MenuItem;
    getPrice: (price: any) => number;
    viewMode: 'grid' | 'list';
    index: number;
    onEdit: (updatedItem: MenuItem) => void;
    onDelete: (id: string) => void;
}) => {
    const categoryStyle = CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default;
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleEdit = (updatedItem: MenuItem) => {
        onEdit(updatedItem);
        setShowEditModal(false);
    };

    const confirmDelete = () => {
        if (item._id) onDelete(item._id);
        setShowDeleteModal(false);
    };
    if (viewMode === 'list') {
        return (
            <div key={index}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-white/30 p-6 transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <div className={`w-14 h-14 bg-gradient-to-br ${categoryStyle.bg} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                <span className="text-xl">{categoryStyle.icon}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800 text-xl mb-1">{item.name}</h3>
                                <div className="flex items-center gap-3">
                                    {item.category && (
                                        <span className={`text-xs ${categoryStyle.text} bg-white px-3 py-1 rounded-full font-medium shadow-sm`}>
                                            {item.category}
                                        </span>
                                    )}
                                    <span className="text-sm text-gray-500">per {item.unit}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-3xl font-bold text-indigo-600">₹{getPrice(item.price).toFixed(2)}</div>
                                <div className="text-sm text-gray-500">per {item.unit}</div>
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg">
                                    ✏️
                                </button>
                                <button className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                    {item.description && (
                        <p className="text-gray-600 mt-4 pl-18">{item.description}</p>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div key={index}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/30 p-6 transition-all duration-300 hover:scale-105"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h3>
                        </div>
                    </div>
                    <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-md"></div>
                </div>

                {item.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                )}

                <div className="bg-gradient-to-br from-gray-50 to-gray-100/80 rounded-2xl p-4 mb-4 border border-gray-200/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-2xl font-bold text-indigo-600">
                                ₹{getPrice(item.price).toFixed(2)}
                            </span>
                            <span className="text-gray-500 text-sm ml-1">/ {item.unit}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500 font-medium">Unit</div>
                            <div className="text-sm font-bold text-gray-700 capitalize">{item.unit}</div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                    >
                        <Edit3 size={16} className="group-hover:scale-110 transition-transform" />
                        Edit
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                    >
                        <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                        Delete
                    </button>
                </div>
            </motion.div>

            <AnimatePresence>
                <EditModal
                    item={item}
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleEdit}
                />
                <DeleteModal
                    item={item}
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                />
            </AnimatePresence>
        </div>
    );
};

const AddItemModal = ({
    onClose,
    onSubmit,
    name,
    setName,
    price,
    setPrice,
    unit,
    setUnit,
    category,
    setCategory,
    description,
    setDescription,
}: any) => {
    const [selectedUnitCategory, setSelectedUnitCategory] = useState('');
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    const unitCategories = ['Count', 'Weight', 'Volume', 'Package', 'Portion'];
    const filteredUnits = selectedUnitCategory
        ? UNIT_OPTIONS.filter(option => option.category === selectedUnitCategory)
        : UNIT_OPTIONS;

    const handleUnitSelect = (unitValue: string) => {
        setUnit(unitValue);
        setShowUnitDropdown(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                    onClick={onClose}
                >
                    ✕
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Add New Menu Item</h2>
                    <p className="text-gray-600">Create a delicious addition to your sweet shop</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Item Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Item Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Chocolate Fudge Brownie"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-purple-500"
                                required
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="99.99"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-purple-500"
                                required
                            />
                        </div>

                        {/* Enhanced Unit Selector */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Unit <span className="text-red-500">*</span>
                            </label>

                            {/* Unit Category Filter */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedUnitCategory('')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedUnitCategory === ''
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                {unitCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setSelectedUnitCategory(cat)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedUnitCategory === cat
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                                    placeholder="Select or type unit"
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer text-purple-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showUnitDropdown ? '▲' : '▼'}
                                </button>

                                {/* Unit Dropdown */}
                                {showUnitDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                                        {filteredUnits.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleUnitSelect(option.value)}
                                                className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                                            >
                                                <span className="text-lg">{option.label.split(' ')[0]}</span>
                                                <div>
                                                    <div className="font-medium text-gray-800">{option.value}</div>
                                                    <div className="text-xs text-gray-500">{option.category}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your delicious treat..."
                            rows={4}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none text-purple-500"
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <span>✨</span> Add Item
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default ShopMenuPage;