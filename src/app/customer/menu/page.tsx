'use client'
import React, { useState, useEffect } from 'react';
import Cart from '@/components/Cart'; // Adjust path based on your project structure
import { ShoppingCart, Search, Package, Plus, Minus, Trash2, X } from 'lucide-react';
import { GET } from '@/services/api';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import { useRouter } from 'next/navigation';
interface MenuItem {
  _id: string;
  name: string;
  price: { $numberDecimal: string } | number;
  unit: string;
  category?: string;
  description?: string;
}

const CustomerMenu = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const shopId = user?.shopId;
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if(!isAuthenticated) {
      alert("⚠️ No token found. Please scan again.");
      router.push("/scanner")
    }
    console.log(isAuthenticated, user)
  }, [isAuthenticated])

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await GET(`/customer/menu/${shopId}?itemState=active`);
      console.log('API Response:', data); // For debugging
      if (data && data.data && data.data.menuItems) {
        setMenuItems(data.data.menuItems);
        setFilteredItems(data.data.menuItems);
      } else {
        console.warn('Unexpected API response structure:', data);
        setMenuItems([]);
        setFilteredItems([]);
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching menu items:', err);
      setError(err.message || 'Failed to fetch menu items');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);
  
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, menuItems]);

  // Cart handlers
  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const clearFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const getCartItems = () => {
    return Object.entries(cart).map(([itemId, quantity]) => {
      const item = menuItems.find(item => item._id === itemId);
      return { ...item, quantity };
    }).filter(item => item._id); // Remove undefined items
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const getPrice = (price: { $numberDecimal: string } | number): number => {
        return typeof price === 'object' && '$numberDecimal' in price
            ? parseFloat(price.$numberDecimal)
            : Number(price);
    };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delicious items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchMenuItems}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 relative">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fresh Market</h1>
              <p className="text-gray-600">Quality groceries delivered fresh</p>
            </div>
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors shadow-lg"
              >
                <ShoppingCart className="w-6 h-6" />
              </button>
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                  {getTotalItems()}
                </span>
              )}
            </div>
          </div>
          {/* Mobile Search Bar */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Menu Items Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'Our Fresh Products'}
          </h2>
          <p className="text-gray-600">
            {searchTerm 
              ? `Found ${filteredItems.length} ${filteredItems.length === 1 ? 'item' : 'items'}` 
              : 'Handpicked quality items for your daily needs'
            }
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <div key={item._id} className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/30 p-6 transition-all duration-300 hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 ${item.category === 'Personal Care' 
                    ? 'bg-gradient-to-br from-pink-500 to-rose-600' 
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  } rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-2">{item.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${item.category === 'Personal Care' 
                      ? 'bg-pink-100 text-pink-700' 
                      : 'bg-green-100 text-green-700'
                    } font-medium mt-1 inline-block`}>
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-md"></div>
              </div>
              {item.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
              )}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    ₹{getPrice(item.price)}
                  </span>
                  <span className="text-sm text-gray-500">
                    per {item.unit}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {cart[item._id] ? (
                  <div className="flex-1 flex items-center justify-between bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-3 shadow-md">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors font-bold"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold text-white text-lg min-w-[20px] text-center">
                      {cart[item._id]}
                    </span>
                    <button
                      onClick={() => addToCart(item._id)}
                      className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors font-bold"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item._id)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <ShoppingCart size={16} className="group-hover:scale-110 transition-transform" />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {filteredItems.length === 0 && searchTerm && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-3xl flex items-center justify-center text-white shadow-lg mx-auto mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No items found</h3>
            <p className="text-gray-500 text-lg">Try searching with different keywords</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
        {menuItems.length === 0 && !searchTerm && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-lg mx-auto mb-6">
              <Package size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No items available</h3>
            <p className="text-gray-500 text-lg">Check back later for fresh products!</p>
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && !isCartOpen && (
        <div className="fixed bottom-6 right-6">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center space-x-2 animate-bounce"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">View Cart ({getTotalItems()})</span>
          </button>
        </div>
      )}

      {/* Cart Component */}
      <Cart
        isOpen={isCartOpen}
        cartItems={getCartItems()}
        onClose={() => setIsCartOpen(false)}
        removeFromCart={removeFromCart}
        addToCart={addToCart}
        clearFromCart={clearFromCart}
        clearCart={clearCart}
      />
    </div>
  );
};

export default CustomerMenu;