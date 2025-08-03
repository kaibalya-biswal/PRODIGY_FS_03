import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Calendar,
  MapPin,
  CreditCard,
  FileText,
  Search,
  Filter,
  Eye,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { orderTrackingService } from '../services/orderTrackingService';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showPublicTracking, setShowPublicTracking] = useState(false);
  const [publicOrderNumber, setPublicOrderNumber] = useState('');
  const [publicEmail, setPublicEmail] = useState('');
  const [publicOrder, setPublicOrder] = useState(null);
  const [publicLoading, setPublicLoading] = useState(false);
  
  const navigate = useNavigate();
  const { orderId } = useParams();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId);
    }
  }, [orderId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to view your orders');
        navigate('/login');
        return;
      }

      const result = await orderTrackingService.loadUserOrders(user.id);
      if (result.success) {
        setOrders(result.data);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId) => {
    try {
      const result = await orderTrackingService.getOrderById(orderId);
      if (result.success) {
        setSelectedOrder(result.data);
      } else {
        toast.error('Failed to load order details');
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const handlePublicTracking = async () => {
    if (!publicOrderNumber.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    try {
      setPublicLoading(true);
      const result = await orderTrackingService.trackOrderByNumber(
        publicOrderNumber.trim(),
        publicEmail.trim() || null
      );
      
      if (result.success) {
        setPublicOrder(result.data);
        toast.success('Order found!');
      } else {
        setPublicOrder(null);
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Failed to track order');
    } finally {
      setPublicLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.status.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const OrderStatusTimeline = ({ order }) => {
    const timeline = orderTrackingService.getOrderStatusTimeline(order);
    const progress = orderTrackingService.calculateOrderProgress(order);

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Order Progress</h3>
          <div className="text-sm text-gray-500">
            {Math.round(progress)}% Complete
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {timeline.map((step, index) => (
            <div key={step.status} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                step.isCompleted 
                  ? 'bg-green-500 text-white' 
                  : step.isCurrent 
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {step.isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step.isCurrent ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium ${
                    step.isCompleted || step.isCurrent ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {step.date.toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${
                  step.isCompleted || step.isCurrent ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const OrderDetails = ({ order }) => {
    const statusInfo = orderTrackingService.formatOrderStatus(order.status);
    const paymentStatusInfo = orderTrackingService.formatPaymentStatus(order.payment_status);
    const estimatedDelivery = orderTrackingService.getEstimatedDelivery(order);

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Order #{order.order_number}</h2>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentStatusInfo.bgColor} ${paymentStatusInfo.color}`}>
              {paymentStatusInfo.label}
            </span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Shipping Address</h4>
                <p className="text-sm text-gray-600">
                  {order.shipping_address?.street}<br />
                  {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Truck className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Shipping Method</h4>
                <p className="text-sm text-gray-600">{order.shipping_method || 'Standard Shipping'}</p>
              </div>
            </div>

            {order.tracking_number && (
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-gray-400" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Tracking Number</h4>
                  <p className="text-sm text-gray-600">{order.tracking_number}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Estimated Delivery</h4>
                <p className="text-sm text-gray-600">
                  {estimatedDelivery.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Payment Method</h4>
                <p className="text-sm text-gray-600">{order.payment_method || 'Credit Card'}</p>
              </div>
            </div>

            {order.notes && (
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={item.product?.image_url || 'https://via.placeholder.com/60x60?text=Product'}
                  alt={item.product_name}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/60x60?text=Product';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {item.product_name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    SKU: {item.product_sku || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ₹{item.total_price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹{item.unit_price.toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">-₹{order.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">₹{order.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">₹{order.shipping_amount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OrderCard = ({ order }) => {
    const statusInfo = orderTrackingService.formatOrderStatus(order.status);
    const progress = orderTrackingService.calculateOrderProgress(order);

    return (
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.order_number}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% Complete</p>
        </div>

        {/* Order Summary */}
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-gray-600">
            {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
          </span>
          <span className="font-medium text-gray-900">
            ₹{order.total_amount.toFixed(2)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedOrder(order)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4 mr-2 inline" />
            View Details
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                to="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
            </div>
            
            <button
              onClick={() => setShowPublicTracking(!showPublicTracking)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Track Public Order
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Public Order Tracking */}
        {showPublicTracking && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Track Your Order</h2>
              <button
                onClick={() => setShowPublicTracking(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  value={publicOrderNumber}
                  onChange={(e) => setPublicOrderNumber(e.target.value)}
                  placeholder="Enter order number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={publicEmail}
                  onChange={(e) => setPublicEmail(e.target.value)}
                  placeholder="Enter email for verification"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handlePublicTracking}
                  disabled={publicLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {publicLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Track Order
                </button>
              </div>
            </div>

            {publicOrder && (
              <div className="border-t border-gray-200 pt-4">
                <OrderDetails order={publicOrder} />
                <OrderStatusTimeline order={publicOrder} />
              </div>
            )}
          </div>
        )}

        {/* My Orders Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
          <button
            onClick={loadOrders}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Orders
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order number or status"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {orders.length === 0 
                ? "You haven't placed any orders yet."
                : "No orders match your current filters."
              }
            </p>
            {orders.length === 0 && (
              <Link
                to="/products"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <OrderDetails order={selectedOrder} />
                <OrderStatusTimeline order={selectedOrder} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking; 