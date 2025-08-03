import { supabase, dbHelpers } from './supabaseClient';
import toast from 'react-hot-toast';

class OrderTrackingService {
  constructor() {
    this.orders = [];
    this.currentUser = null;
  }

  // Load user's orders
  async loadUserOrders(userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              image_url,
              sku
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      this.orders = data || [];
      return { success: true, data: this.orders };
    } catch (error) {
      console.error('Error loading orders:', error);
      return { success: false, error: error.message };
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              image_url,
              sku,
              description
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting order:', error);
      return { success: false, error: error.message };
    }
  }

  // Get order by order number
  async getOrderByNumber(orderNumber) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              image_url,
              sku,
              description
            )
          )
        `)
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting order:', error);
      return { success: false, error: error.message };
    }
  }

  // Get order status timeline
  getOrderStatusTimeline(order) {
    const statuses = [
      { status: 'pending', label: 'Order Placed', description: 'Your order has been placed successfully' },
      { status: 'confirmed', label: 'Order Confirmed', description: 'Your order has been confirmed and is being processed' },
      { status: 'processing', label: 'Processing', description: 'Your order is being prepared for shipment' },
      { status: 'shipped', label: 'Shipped', description: 'Your order has been shipped and is on its way' },
      { status: 'delivered', label: 'Delivered', description: 'Your order has been delivered successfully' }
    ];

    const currentStatusIndex = statuses.findIndex(s => s.status === order.status);
    
    return statuses.map((status, index) => ({
      ...status,
      isCompleted: index <= currentStatusIndex,
      isCurrent: index === currentStatusIndex,
      date: this.getStatusDate(order, status.status)
    }));
  }

  // Get estimated delivery date
  getEstimatedDelivery(order) {
    if (order.estimated_delivery) {
      return new Date(order.estimated_delivery);
    }
    
    // Calculate estimated delivery based on order date and status
    const orderDate = new Date(order.created_at);
    const status = order.status;
    
    let daysToAdd = 7; // Default 7 days
    
    switch (status) {
      case 'pending':
      case 'confirmed':
        daysToAdd = 7;
        break;
      case 'processing':
        daysToAdd = 5;
        break;
      case 'shipped':
        daysToAdd = 2;
        break;
      case 'delivered':
        return orderDate;
      default:
        daysToAdd = 7;
    }
    
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
    return estimatedDate;
  }

  // Get status date (placeholder - in real app, you'd track status changes)
  getStatusDate(order, status) {
    const orderDate = new Date(order.created_at);
    
    switch (status) {
      case 'pending':
        return orderDate;
      case 'confirmed':
        return new Date(orderDate.getTime() + 24 * 60 * 60 * 1000); // +1 day
      case 'processing':
        return new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days
      case 'shipped':
        return new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 days
      case 'delivered':
        return new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000); // +5 days
      default:
        return orderDate;
    }
  }

  // Format order status for display
  formatOrderStatus(status) {
    const statusMap = {
      'pending': { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      'confirmed': { label: 'Confirmed', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      'processing': { label: 'Processing', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      'shipped': { label: 'Shipped', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
      'delivered': { label: 'Delivered', color: 'text-green-600', bgColor: 'bg-green-100' },
      'cancelled': { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-100' },
      'refunded': { label: 'Refunded', color: 'text-gray-600', bgColor: 'bg-gray-100' }
    };
    
    return statusMap[status] || statusMap['pending'];
  }

  // Format payment status
  formatPaymentStatus(status) {
    const statusMap = {
      'pending': { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      'paid': { label: 'Paid', color: 'text-green-600', bgColor: 'bg-green-100' },
      'failed': { label: 'Failed', color: 'text-red-600', bgColor: 'bg-red-100' },
      'refunded': { label: 'Refunded', color: 'text-gray-600', bgColor: 'bg-gray-100' }
    };
    
    return statusMap[status] || statusMap['pending'];
  }

  // Calculate order progress percentage
  calculateOrderProgress(order) {
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / statuses.length) * 100;
  }

  // Track order by number (public tracking)
  async trackOrderByNumber(orderNumber, email = null) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              image_url,
              sku
            )
          )
        `)
        .eq('order_number', orderNumber);

      // If email provided, also check user email
      if (email) {
        query = query.eq('user_id', (await this.getUserIdByEmail(email))?.id);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error tracking order:', error);
      return { success: false, error: 'Order not found or access denied' };
    }
  }

  // Get user ID by email (for public tracking)
  async getUserIdByEmail(email) {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      
      const user = data.users.find(u => u.email === email);
      return user ? { id: user.id } : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  // Cancel order
  async cancelOrder(orderId, reason = '') {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          notes: reason ? `Cancelled: ${reason}` : 'Order cancelled by customer'
        })
        .eq('id', orderId)
        .select();

      if (error) throw error;
      
      toast.success('Order cancelled successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
      return { success: false, error: error.message };
    }
  }

  // Request refund
  async requestRefund(orderId, reason = '') {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'refunded',
          notes: reason ? `Refund requested: ${reason}` : 'Refund requested by customer'
        })
        .eq('id', orderId)
        .select();

      if (error) throw error;
      
      toast.success('Refund request submitted successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Error requesting refund:', error);
      toast.error('Failed to submit refund request');
      return { success: false, error: error.message };
    }
  }

  // Get all orders for admin
  async getAllOrders(filters = {}) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              image_url,
              sku
            )
          ),
          user_profiles (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.orderNumber) {
        query = query.ilike('order_number', `%${filters.orderNumber}%`);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting all orders:', error);
      return { success: false, error: error.message };
    }
  }

  // Update order status (admin function)
  async updateOrderStatus(orderId, status, trackingNumber = null, estimatedDelivery = null) {
    try {
      const updateData = { status };
      
      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }
      if (estimatedDelivery) {
        updateData.estimated_delivery = estimatedDelivery;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select();

      if (error) throw error;
      
      toast.success('Order status updated successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      return { success: false, error: error.message };
    }
  }
}

export const orderTrackingService = new OrderTrackingService(); 