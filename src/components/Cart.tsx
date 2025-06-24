import React, { useEffect, useState } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from "@/lib/store";
import { POST } from '../services/api'
import { useRouter } from 'next/navigation';
import CustomerDetailsModal from './CustomerDetailModal';
interface CartItem {
  _id: string;
  name: string;
  price: { $numberDecimal: string } | number;
  unit: string;
  category?: string;
  description?: string;
  quantity?: number;
}

interface CartProps {
  isOpen: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  removeFromCart: (id: string) => void;
  addToCart: (id: string) => void;
  clearFromCart: (id: string) => void;
  clearCart: () => void;
}

const Cart: React.FC<CartProps> = ({
  isOpen,
  cartItems,
  onClose,
  removeFromCart,
  addToCart,
  clearFromCart,
  clearCart,
}) => {
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [orderId, setOrderId] = useState('');
  const getPrice = (price: { $numberDecimal: string } | number): number => {
        return typeof price === 'object' && '$numberDecimal' in price
            ? parseFloat(price.$numberDecimal)
            : Number(price);
    };
  const total = cartItems.reduce((sum, item) => {
    const price = getPrice(item.price)
    return sum + (price * (item.quantity || 1))
  }, 0)
  const handleCheckout: any = async () => {
    console.log("Surya")
    if (!isAuthenticated) {
      alert("⚠️ Please scan SLIP-START first");
      return;
    }
    // if(!checkingOut) return;
    setCheckingOut(true);
    try {
      const cartArray = cartItems.map(item => ({
        itemId: item._id,
        quantity: item.quantity
      }));
      const payload = {
        token: user.token,
        shopId: user.shopId,
        slipId: user.slipId,
        userId: user._id,
        cartArray
      }
      console.log(payload)
      const data = await POST('/order/proceed-checkout', payload);
      console.log(data);
      if(data.success === true) {
        // router.push(`/customer/payment?customerId=${user._id}&orderId=${data.data.orderId}&amount=${data.data.totalAmount.toFixed(2)}`);
        setAmount(data.data.totalAmount);
        setOrderId(data.data.orderId);
        setIsModalOpen(true);
        
      }
      else {
        alert('Failed to place order');
      }
    }
    catch(error) {
      console.error(error)
    }
    finally {
      setCheckingOut(false);
    }
  }
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
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
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 max-h-96">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm">Add some delicious items!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md">
                        <ShoppingCart size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</h3>
                        <p className="text-gray-600 text-xs">{item.unit}</p>
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
                  {cartItems.length > 0 && (
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
            {/* Footer Placeholder */}
            {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              {/* Total Summary */}
              <div className="text-black flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-green-600">₹{(total).toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 ${
                  checkingOut
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-300'
                }`}
              >
                {checkingOut ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>Proceed to Checkout</span>
                  </>
                )}
              </button>
            </div>
          )}
          </div>
        </div>
      )}
      {
        isModalOpen && (
          <CustomerDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} amount={amount} orderId={orderId} />
        )
      }
    </>
  );
};

export default Cart;