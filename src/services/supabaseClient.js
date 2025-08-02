// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const dbHelpers = {
  // Product operations
  async getProducts(filters = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(name, slug),
        reviews:reviews(*)
      `)
      .eq('is_active', true);
    
    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }
    
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    
    if (filters.featured) {
      query = query.eq('is_featured', true);
    }
    
    if (filters.sortBy) {
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    return { data, error };
  },
  
  async getProduct(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name, slug),
        reviews:reviews(*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    return { data, error };
  },
  
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    return { data, error };
  },
  
  // Cart operations
  async getCartItems(userId) {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId);
    
    return { data, error };
  },
  
  async addToCart(userId, productId, quantity = 1, options = {}) {
    // First check if item already exists in cart
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      return { data: null, error: checkError };
    }
    
    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity;
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);
      
      return { data, error };
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity: quantity,
          selected_options: options
        });
      
      return { data, error };
    }
  },
  
  async updateCartItem(cartItemId, quantity) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);
    
    return { data, error };
  },
  
  async removeFromCart(cartItemId) {
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);
    
    return { data, error };
  },
  
  async clearCart(userId) {
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    return { data, error };
  },
  
  // Order operations
  async createOrder(userId, orderData) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        subtotal: orderData.subtotal,
        tax_amount: orderData.taxAmount || 0,
        shipping_amount: orderData.shippingAmount || 0,
        discount_amount: orderData.discountAmount || 0,
        total_amount: orderData.totalAmount,
        shipping_address: orderData.shippingAddress,
        billing_address: orderData.billingAddress,
        shipping_method: orderData.shippingMethod,
        payment_method: orderData.paymentMethod,
        notes: orderData.notes
      })
      .select()
      .single();
    
    if (orderError) return { data: null, error: orderError };
    
    // Add order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      selected_options: item.selected_options
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    return { data: order, error: itemsError };
  },
  
  async getOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  // Review operations
  async addReview(userId, productId, reviewData) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        product_id: productId,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        order_id: reviewData.orderId
      });
    
    return { data, error };
  },
  
  async getProductReviews(productId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:user_profiles(first_name, last_name)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  // Wishlist operations
  async addToWishlist(userId, productId) {
    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: userId,
        product_id: productId
      });
    
    return { data, error };
  },
  
  async removeFromWishlist(userId, productId) {
    const { data, error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    
    return { data, error };
  },
  
  async getWishlist(userId) {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId);
    
    return { data, error };
  },
  
  // Support operations
  async createSupportTicket(userId, ticketData) {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        subject: ticketData.subject,
        message: ticketData.message,
        priority: ticketData.priority || 'medium',
        category: ticketData.category,
        order_id: ticketData.orderId
      });
    
    return { data, error };
  },
  
  async getSupportTickets(userId) {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  // Coupon operations
  async validateCoupon(code, orderAmount) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .gte('valid_from', new Date().toISOString())
      .lte('valid_until', new Date().toISOString())
      .single();
    
    if (error || !data) {
      return { valid: false, error: 'Invalid coupon code' };
    }
    
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      return { valid: false, error: 'Coupon usage limit reached' };
    }
    
    if (orderAmount < data.minimum_order_amount) {
      return { valid: false, error: `Minimum order amount of $${data.minimum_order_amount} required` };
    }
    
    return { valid: true, coupon: data };
  }
};
