'use client';
import React, {useState, useEffect} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GET, POST } from '@/services/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const razorpayOrderId = searchParams.get('razorpayOrderId');
  const orderId = searchParams.get('orderId');
  console.log('--------Order id:', orderId);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const data = await GET(`/razorpay/order-details?orderId=${razorpayOrderId}`);
      console.log("Order details:", data);
      
      if(data.success === true) {
        setOrder(data.data);
        setLoading(false);
      } else {
        setError("Failed to fetch order details");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to fetch order details");
      setLoading(false);
    }
  };

  useEffect(() => {
    if(!razorpayOrderId) {
      setError("Order ID not found");
      setLoading(false);
      return;
    }
    fetchOrderDetails();
  }, [razorpayOrderId]);

  const initializePayment = () => {
    if (!order || paymentInitiated) return;

    // Check if Razorpay script is already loaded
    if (window.Razorpay) {
      openRazorpay();
      return;
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      setError("Failed to load payment gateway");
    };
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      openRazorpay();
    };
    document.head.appendChild(script);
  };

  const openRazorpay = () => {
    if (!window.Razorpay) {
      console.error("Razorpay not loaded");
      setError("Payment gateway not available");
      return;
    }

    setPaymentInitiated(true);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: order.notes?.name || 'Payment',
      description: 'Payment for your order',
      order_id: order.orderId || order.id, // Handle different response formats
      handler: async (response) => {
        console.log("Payment successful:", response);
        console.log(orderId)
        if (!orderId) {
          console.error("Order ID not found in state");
          return;
        }

        try {
          const data = await POST('/order/update-status', {
            status: 'processing',
            paymentStatus: 'paid',
            orderId: orderId // Use state value directly
          });
          console.log('------Status update------', data);
          
          // Redirect to queue page after successful status update
          if (data.success) {
            // Option 1: Redirect to queue page with order ID
            router.push(`/customer/status?orderId=${orderId}`);
            
            // Option 2: Alternative - redirect to queue page with razorpay order ID
            // router.push(`/queue?razorpayOrderId=${razorpayOrderId}`);
            
            // Option 3: Simple queue page redirect
            // router.push('/queue');
          } else {
            console.error('Status update failed');
            alert('Payment successful but status update failed. Please contact support.');
          }
        } catch (err) {
          console.error('Status update failed:', err);
          alert('Payment successful but status update failed. Please contact support.');
        }
      },

      prefill: {
        name: order.notes?.name || '',
        email: order.notes?.email || '',
        contact: order.notes?.phone || ''
      },
      theme: { 
        color: "#8b5cf6" 
      },
      modal: {
        ondismiss: function() {
          console.log("Payment modal dismissed");
          setPaymentInitiated(false);
        }
      }
    };

    console.log("Razorpay options:", options);

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error("Payment failed:", response.error);
        alert('Payment failed: ' + response.error.description);
        setPaymentInitiated(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Error opening Razorpay:", err);
      setError("Failed to open payment gateway");
      setPaymentInitiated(false);
    }
  };

  useEffect(() => {
    if (order && !paymentInitiated) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        initializePayment();
      }, 500);
    }
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-purple-600">Loading payment details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <div className="text-red-600">Invalid or expired payment session.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Complete Your Payment</h2>
        <p className="mb-2 text-black">Order Amount: <span className="font-semibold">₹{order.amount / 100}</span></p>
        <p className="mb-2 text-black">Name: {order.notes?.name}</p>
        <p className="mb-2 text-black">Email: {order.notes?.email}</p>
        <p className="mb-6 text-black">Phone: {order.notes?.phone}</p>
        
        {!paymentInitiated && (
          <button 
            onClick={initializePayment}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 mb-4"
          >
            Open Payment Gateway
          </button>
        )}
        
        {paymentInitiated && (
          <div className="text-green-600 mb-4">Payment gateway is opening...</div>
        )}
        
        <div className="text-gray-500 text-sm">
          {!paymentInitiated ? (
            <>The Razorpay payment window will open automatically.<br />
            If not, click the button above to try again.</>
          ) : (
            "Please complete your payment in the popup window."
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;