import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Star, ShoppingCart, Heart, Eye, 
  Plus, Minus, CheckCircle, Truck, Shield, RefreshCw
} from 'lucide-react';
import { supabase, dbHelpers } from '../services/supabaseClient';
import { reviewService } from '../services/reviewService';
import { cartService } from '../services/cartService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import ReviewStats from '../components/ReviewStats';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      
      // Load product details
      const { data: productData, error: productError } = await dbHelpers.getProduct(productId);
      if (productError) throw productError;
      setProduct(productData);

      // Load reviews
      const { data: reviewsData } = await reviewService.getProductReviews(productId);
      if (reviewsData) setReviews(reviewsData);

      // Load review statistics
      const { data: statsData } = await reviewService.getReviewStats(productId);
      if (statsData) setReviewStats(statsData);

      // Load user's review if logged in
      if (user) {
        const { data: userReviewData } = await reviewService.getUserReview(user.id, productId);
        setUserReview(userReviewData);

        // Check if user can review
        const { canReview: canUserReview } = await reviewService.canUserReview(user.id, productId);
        setCanReview(canUserReview);
      }

    } catch (error) {
      console.error('Error loading product details:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await cartService.addToCart(user.id, productId, quantity);
      toast.success('Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleReviewSubmit = async (formData) => {
    if (!user) {
      toast.error('Please login to write a review');
      return;
    }

    setReviewLoading(true);
    try {
      const result = await reviewService.addReview(user.id, productId, formData);
      if (result.success) {
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: '', comment: '' });
        await loadProductDetails(); // Reload reviews
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewUpdate = async (formData) => {
    if (!userReview) return;

    setReviewLoading(true);
    try {
      const result = await reviewService.updateReview(userReview.id, formData);
      if (result.success) {
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: '', comment: '' });
        await loadProductDetails(); // Reload reviews
      }
    } catch (error) {
      console.error('Error updating review:', error);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewDelete = async () => {
    if (!userReview) return;

    if (window.confirm('Are you sure you want to delete your review?')) {
      try {
        const result = await reviewService.deleteReview(userReview.id);
        if (result.success) {
          setUserReview(null);
          await loadProductDetails(); // Reload reviews
        }
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewService.markReviewHelpful(reviewId);
      await loadProductDetails(); // Reload reviews
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const handleReportReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to report this review?')) {
      try {
        await reviewService.reportReview(reviewId);
        await loadProductDetails(); // Reload reviews
      } catch (error) {
        console.error('Error reporting review:', error);
      }
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading product details...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isOnSale = product.sale_price && product.sale_price < product.price;
  const displayPrice = isOnSale ? product.sale_price : product.price;
  const originalPrice = isOnSale ? product.price : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{product.name}</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-white rounded-lg overflow-hidden">
              <img
                src={product.gallery_images?.[selectedImage] || product.image_url || 'https://via.placeholder.com/600x600?text=No+Image'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
                }}
              />
            </div>
            
            {/* Thumbnail Images */}
            {product.gallery_images && product.gallery_images.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {product.gallery_images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/120x120?text=No+Image';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {renderStars(reviewStats?.averageRating || 0, 'h-5 w-5')}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {reviewStats?.totalReviews || 0} reviews
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{displayPrice?.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ₹{originalPrice.toFixed(2)}
                  </span>
                )}
                {isOnSale && (
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                    {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || product.short_description || 'No description available.'}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                product.stock_quantity > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.stock_quantity > 0 
                  ? `In Stock (${product.stock_quantity})` 
                  : 'Out of Stock'
                }
              </span>
              
              {product.sku && (
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={product.stock_quantity > 0 && quantity >= product.stock_quantity}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
              
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Heart className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Quality Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              {user && canReview && !userReview && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Write a Review
                </button>
              )}
            </div>

            {/* Review Statistics */}
            <ReviewStats stats={reviewStats} />

            {/* Review Form */}
            {showReviewForm && (
              <div className="mb-6">
                <ReviewForm
                  onSubmit={userReview ? handleReviewUpdate : handleReviewSubmit}
                  onCancel={() => {
                    setShowReviewForm(false);
                    setReviewForm({ rating: 5, title: '', comment: '' });
                  }}
                  initialData={userReview}
                  loading={reviewLoading}
                  title={userReview ? 'Edit Your Review' : 'Write a Review'}
                />
              </div>
            )}



            {/* Reviews List */}
            <ReviewList
              reviews={reviews}
              onMarkHelpful={handleMarkHelpful}
              onReport={handleReportReview}
              onEdit={(review) => {
                setReviewForm({
                  rating: review.rating,
                  title: review.title || '',
                  comment: review.comment || ''
                });
                setShowReviewForm(true);
              }}
              onDelete={handleReviewDelete}
              showUserActions={!!user}
              currentUserId={user?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 