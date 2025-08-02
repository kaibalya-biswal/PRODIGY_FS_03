import { supabase, dbHelpers } from './supabaseClient';
import toast from 'react-hot-toast';

class CartService {
  constructor() {
    this.cartItems = [];
    this.coupon = null;
    this.shippingMethod = 'standard';
    this.taxRate = 0.08; // 8% tax rate
  }

  // Load cart items for a user
  async loadCart(userId) {
    try {
      const { data, error } = await dbHelpers.getCartItems(userId);
      if (error) throw error;
      
      this.cartItems = data || [];
      return { success: true, data: this.cartItems };
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart items');
      return { success: false, error };
    }
  }

  // Add item to cart
  async addToCart(userId, product, quantity = 1, options = {}) {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to add items to cart');
        return { success: false, error: 'Authentication required' };
      }

      // Check inventory
      if (product.stock_quantity < quantity) {
        toast.error(`Only ${product.stock_quantity} items available in stock`);
        return { success: false, error: 'Insufficient stock' };
      }

      // Check if item already exists in cart
      const existingItem = this.cartItems.find(item => item.product_id === product.id);
      
      if (existingItem) {
        // Update quantity if item exists
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock_quantity) {
          toast.error(`Cannot add more items. Only ${product.stock_quantity} available`);
          return { success: false, error: 'Insufficient stock' };
        }
        
        const { error } = await dbHelpers.updateCartItem(existingItem.id, newQuantity);
        if (error) throw error;
        
        existingItem.quantity = newQuantity;
      } else {
        // Add new item to cart
        const { error } = await dbHelpers.addToCart(userId, product.id, quantity, options);
        if (error) throw error;
        
        // Reload cart to get the new item
        await this.loadCart(userId);
      }

      toast.success(`${product.name} added to cart`);
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
      return { success: false, error };
    }
  }

  // Update cart item quantity
  async updateQuantity(cartItemId, newQuantity) {
    try {
      if (newQuantity < 1) {
        toast.error('Quantity must be at least 1');
        return { success: false, error: 'Invalid quantity' };
      }

      const item = this.cartItems.find(item => item.id === cartItemId);
      if (!item) {
        toast.error('Item not found in cart');
        return { success: false, error: 'Item not found' };
      }

      // Check stock
      if (newQuantity > item.product.stock_quantity) {
        toast.error(`Only ${item.product.stock_quantity} items available in stock`);
        return { success: false, error: 'Insufficient stock' };
      }

      const { error } = await dbHelpers.updateCartItem(cartItemId, newQuantity);
      if (error) throw error;

      // Update local state
      item.quantity = newQuantity;
      
      toast.success('Cart updated');
      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update cart');
      return { success: false, error };
    }
  }

  // Remove item from cart
  async removeFromCart(cartItemId) {
    try {
      const { error } = await dbHelpers.removeFromCart(cartItemId);
      if (error) throw error;

      // Remove from local state
      this.cartItems = this.cartItems.filter(item => item.id !== cartItemId);
      
      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
      return { success: false, error };
    }
  }

  // Clear entire cart
  async clearCart(userId) {
    try {
      const { error } = await dbHelpers.clearCart(userId);
      if (error) throw error;

      this.cartItems = [];
      this.coupon = null;
      
      toast.success('Cart cleared');
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      return { success: false, error };
    }
  }

  // Apply coupon
  async applyCoupon(code) {
    try {
      const subtotal = this.calculateSubtotal();
      const { data, error } = await dbHelpers.validateCoupon(code, subtotal);
      
      if (error) throw error;
      
      if (!data) {
        toast.error('Invalid coupon code');
        return { success: false, error: 'Invalid coupon' };
      }

      this.coupon = data;
      toast.success(`Coupon applied: ${data.name}`);
      return { success: true, data };
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon');
      return { success: false, error };
    }
  }

  // Remove coupon
  removeCoupon() {
    this.coupon = null;
    toast.success('Coupon removed');
    return { success: true };
  }

  // Calculate subtotal
  calculateSubtotal() {
    return this.cartItems.reduce((total, item) => {
      const price = item.product.sale_price && item.product.sale_price < item.product.price 
        ? item.product.sale_price 
        : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }

  // Calculate tax
  calculateTax() {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscount();
    return (subtotal - discount) * this.taxRate;
  }

  // Calculate shipping
  calculateShipping() {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscount();
    const taxableAmount = subtotal - discount;

    if (this.shippingMethod === 'express') {
      return taxableAmount > 100 ? 0 : 15.99;
    } else if (this.shippingMethod === 'standard') {
      return taxableAmount > 50 ? 0 : 5.99;
    }
    
    return 0; // Free shipping
  }

  // Calculate discount
  calculateDiscount() {
    if (!this.coupon) return 0;
    
    const subtotal = this.calculateSubtotal();
    
    if (this.coupon.discount_type === 'percentage') {
      const discount = subtotal * (this.coupon.discount_value / 100);
      return this.coupon.maximum_discount_amount 
        ? Math.min(discount, this.coupon.maximum_discount_amount)
        : discount;
    } else {
      return this.coupon.discount_value;
    }
  }

  // Calculate total
  calculateTotal() {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscount();
    const tax = this.calculateTax();
    const shipping = this.calculateShipping();
    
    return subtotal - discount + tax + shipping;
  }

  // Get cart summary
  getCartSummary() {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscount();
    const tax = this.calculateTax();
    const shipping = this.calculateShipping();
    const total = this.calculateTotal();

    return {
      itemCount: this.cartItems.length,
      totalItems: this.cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      discount,
      tax,
      shipping,
      total,
      coupon: this.coupon,
      shippingMethod: this.shippingMethod
    };
  }

  // Set shipping method
  setShippingMethod(method) {
    this.shippingMethod = method;
    return { success: true };
  }

  // Check if cart is valid for checkout
  validateCartForCheckout() {
    if (this.cartItems.length === 0) {
      return { valid: false, error: 'Cart is empty' };
    }

    // Check stock for all items
    for (const item of this.cartItems) {
      if (item.quantity > item.product.stock_quantity) {
        return { 
          valid: false, 
          error: `${item.product.name} only has ${item.product.stock_quantity} items in stock` 
        };
      }
    }

    return { valid: true };
  }

  // Prepare order data
  prepareOrderData(userId, shippingAddress, billingAddress, paymentMethod) {
    const summary = this.getCartSummary();
    
    const orderItems = this.cartItems.map(item => {
      const price = item.product.sale_price && item.product.sale_price < item.product.price 
        ? item.product.sale_price 
        : item.product.price;
      
      return {
        product_id: item.product_id,
        product_name: item.product.name,
        product_sku: item.product.sku,
        quantity: item.quantity,
        unit_price: price,
        total_price: price * item.quantity,
        selected_options: item.selected_options
      };
    });

    return {
      userId,
      subtotal: summary.subtotal,
      taxAmount: summary.tax,
      shippingAmount: summary.shipping,
      discountAmount: summary.discount,
      totalAmount: summary.total,
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod: summary.shippingMethod,
      couponCode: summary.coupon?.code,
      items: orderItems
    };
  }

  // Create order
  async createOrder(userId, orderData) {
    try {
      const { data, error } = await dbHelpers.createOrder(userId, orderData);
      if (error) throw error;

      // Clear cart after successful order
      await this.clearCart(userId);
      
      toast.success('Order placed successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order');
      return { success: false, error };
    }
  }

  // Get cart items count
  getCartItemsCount() {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Check if item is in cart
  isItemInCart(productId) {
    return this.cartItems.some(item => item.product_id === productId);
  }

  // Get item quantity in cart
  getItemQuantity(productId) {
    const item = this.cartItems.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  }
}

export const cartService = new CartService(); 