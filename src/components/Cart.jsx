import React, { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, ShoppingBag, X, Tag, Truck, CreditCard } from 'lucide-react';
import { cartService } from '../services/cartService';

const Cart = ({ cartItems, onRemoveFromCart, onUpdateQuantity, onCheckout, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [showCouponForm, setShowCouponForm] = useState(false);

  // Get cart summary from service
  const getCartSummary = () => {
    return cartService.getCartSummary();
  };

  const summary = getCartSummary();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await onUpdateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await onCheckout();
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setIsLoading(false);
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

  if (cartItems.length === 0) {
    return (
      <div className="cart bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <div className="text-center py-8">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <p className="text-sm text-gray-400">Add some products to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {cartItems.map((item) => {
          const price = item.product.sale_price && item.product.sale_price < item.product.price 
            ? item.product.sale_price 
            : item.product.price;
          
          return (
            <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                             {/* Product Image */}
               <img
                 src={item.product.image_url || 'https://via.placeholder.com/60x60?text=Product'}
                 alt={item.product.name}
                 className="w-12 h-12 object-cover rounded"
                 onError={(e) => {
                   e.target.src = 'https://via.placeholder.com/60x60?text=Product';
                 }}
               />

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.product.name}
                </h4>
                <p className="text-sm text-gray-500">
                  ₹{price.toFixed(2)} × {item.quantity}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  ₹{(price * item.quantity).toFixed(2)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  disabled={item.quantity >= item.product.stock_quantity}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemoveFromCart(item.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Coupon Section */}
      {!summary.coupon && (
        <div className="border-t border-gray-200 pt-4 mb-4">
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
        <div className="border-t border-gray-200 pt-4 mb-4">
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
                    : `$${summary.coupon.discount_value} off`
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
      <div className="border-t border-gray-200 pt-4 mb-4">
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
                  {summary.shipping > 0 ? `$${summary.shipping.toFixed(2)}` : 'FREE'}
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
                  {summary.shipping > 0 ? `$${summary.shipping.toFixed(2)}` : 'FREE'}
                </span>
              </div>
              <p className="text-xs text-gray-500">1-2 business days</p>
            </div>
          </label>
        </div>
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-2 mb-4">
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
          
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>₹{summary.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {isLoading ? (
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
  );
};

export default Cart;
