import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Tag, Truck, CreditCard, Heart } from 'lucide-react';
import { supabase, dbHelpers } from '../services/supabaseClient';
import { cartService } from '../services/cartService';
import toast from 'react-hot-toast';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCartData();
  }, []);

  const loadCartData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to view your cart');
        navigate('/login');
        return;
      }

      // Load cart items
      const { data: cart } = await dbHelpers.getCartItems(user.id);
      setCartItems(cart || []);

      // Load wishlist items
      const { data: wishlist } = await dbHelpers.getWishlist(user.id);
      setWishlistItems(wishlist || []);

      // Load cart into service
      await cartService.loadCart(user.id);
    } catch (error) {
      console.error('Error loading cart data:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const result = await cartService.updateQuantity(itemId, newQuantity);
      if (result.success) {
        setCartItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      const result = await cartService.removeFromCart(itemId);
      if (result.success) {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to add items to wishlist');
        return;
      }

      const isInWishlist = wishlistItems.some(item => item.product_id === productId);
      
      if (isInWishlist) {
        await dbHelpers.removeFromWishlist(user.id, productId);
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        toast.success('Removed from wishlist');
      } else {
        await dbHelpers.addToWishlist(user.id, productId);
        setWishlistItems(prev => [...prev, { product_id: productId }]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    const result = await cartService.applyCoupon(couponCode.trim());
    if (result.success) {
      setCouponCode('');
      setShowCouponForm(false);
    }
  };

  const handleRemoveCoupon = () => {
    cartService.removeCoupon();
  };

  const handleShippingMethodChange = (method) => {
    setShippingMethod(method);
    cartService.setShippingMethod(method);
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to checkout');
        navigate('/login');
        return;
      }

      // Validate cart
      const validation = cartService.validateCartForCheckout();
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      // For now, redirect to a checkout page (you can implement this later)
      toast.success('Redirecting to checkout...');
      navigate('/checkout');
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Failed to proceed to checkout');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  // Get cart summary
  const getCartSummary = () => {
    return cartService.getCartSummary();
  };

  const summary = getCartSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-lg text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Continue Shopping
              </Link>
              <Link
                to="/categories"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/products"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <button
              onClick={handleContinueShopping}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Cart Items</h2>
              
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const price = item.product.sale_price && item.product.sale_price < item.product.price 
                    ? item.product.sale_price 
                    : item.product.price;
                  const isInWishlist = wishlistItems.some(wish => wish.product_id === item.product_id);
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      {/* Product Image */}
                      <img
                        src={item.product.image_url || 'https://via.placeholder.com/80x80?text=Product'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=Product';
                        }}
                      />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {item.product.category?.name}
                        </p>
                        
                        {/* Price */}
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-gray-900">
                            ₹{price.toFixed(2)}
                          </span>
                          {item.product.sale_price && item.product.sale_price < item.product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{item.product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center text-lg font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                          disabled={item.quantity >= item.product.stock_quantity}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAddToWishlist(item.product_id)}
                          className={`p-2 rounded-full transition-colors ${
                            isInWishlist 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                          title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove from cart"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{(price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Coupon Section */}
              {!summary.coupon && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowCouponForm(!showCouponForm)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <Tag className="h-4 w-4 mr-1" />
                    Have a coupon?
                  </button>
                  
                  {showCouponForm && (
                    <div className="mt-3 flex space-x-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Applied Coupon */}
              {summary.coupon && (
                <div className="mb-6">
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {summary.coupon.name} applied
                        </p>
                        <p className="text-xs text-green-600">
                          {summary.coupon.discount_type === 'percentage' 
                            ? `${summary.coupon.discount_value}% off`
                            : `₹${summary.coupon.discount_value} off`
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Shipping Method */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Shipping Method</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={(e) => handleShippingMethodChange(e.target.value)}
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Standard Shipping</span>
                        <span className="text-sm font-medium">
                          {summary.shipping > 0 ? `₹${summary.shipping.toFixed(2)}` : 'FREE'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">3-5 business days</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={(e) => handleShippingMethodChange(e.target.value)}
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Express Shipping</span>
                        <span className="text-sm font-medium">
                          {summary.shipping > 0 ? `₹${summary.shipping.toFixed(2)}` : 'FREE'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">1-2 business days</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{summary.subtotal.toFixed(2)}</span>
                </div>
                
                {summary.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-₹{summary.discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium">₹{summary.tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className={`font-medium ${summary.shipping === 0 ? 'text-green-600' : ''}`}>
                    {summary.shipping === 0 ? 'FREE' : `₹${summary.shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{summary.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isCheckingOut ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </>
                )}
              </button>

              {/* Free Shipping Notice */}
              {summary.subtotal < 50 && summary.shipping > 0 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add ₹{(50 - summary.subtotal).toFixed(2)} more for free shipping!
                </p>
              )}

              {/* Express Shipping Notice */}
              {summary.subtotal < 100 && shippingMethod === 'express' && summary.shipping > 0 && (
                <p className="text-xs text-gray-500 text-center mt-1">
                  Add ₹{(100 - summary.subtotal).toFixed(2)} more for free express shipping!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 