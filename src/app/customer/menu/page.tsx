'use client'
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Clock, Package, X, Plus, Minus, Trash2, Search } from 'lucide-react';
import { GET } from '@/services/api';
interface MenuItem {
    _id?: string;
    name: string;
    price: { $numberDecimal: string } | number;
    unit: string;
    category?: string;
    description?: string;
}
const CustomerMenu = () => {
   const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // API call using GET function
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await GET(`/customer/menu/6835b0030cbbf44b1be4beac?itemState=active`);
      
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

  // Filter items based on search term
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

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(item => item._id === itemId);
      if (item) {
        return total + (getPrice(item.price) * quantity);
      }
      return total;
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const getCartItems = () => {
    return Object.entries(cart).map(([itemId, quantity]) => {
      const item = menuItems.find(item => item._id === itemId);
      return { ...item, quantity };
    }).filter(item => item._id); // Filter out undefined items
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
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      
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

      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700 font-medium">
                {getTotalItems()} items in cart
              </span>
            </div>
            <span className="text-green-700 font-bold text-lg">
              ₹{getCartTotal().toFixed(2)}
            </span>
          </div>
        </div>
      )}

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
            <div
              key={item._id}
              className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/30 p-6 transition-all duration-300 hover:scale-105"
              style={{
                animationDelay: `${index * 0.05}s`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
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

              {/* Add to Cart Controls */}
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

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          ></div>
          
          {/* Cart Panel */}
          <div 
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl"
            style={{ animation: 'slideInRight 0.3s ease-out' }}
          >
            {/* Cart Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 max-h-96">
              {getCartItems().length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm">Add some delicious items!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getCartItems().map((item) => (
                    <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md">
                        <Package size={20} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</h3>
                        <p className="text-gray-600 text-xs">₹{getPrice(item.price).toFixed(2)} / {item.unit}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-gray-800 min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item._id)}
                          className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => clearFromCart(item._id)}
                          className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors ml-2"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {getCartItems().length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full mt-4 py-2 px-4 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                    >
                      Clear All Items
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {getCartItems().length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-green-600">₹{getCartTotal().toFixed(2)}</span>
                </div>
                
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
};

export default CustomerMenu;