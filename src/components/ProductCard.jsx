import React, { useState } from 'react';
import { Heart, Star, ShoppingCart, Eye } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onAddToWishlist, onViewDetails, isInWishlist = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await onAddToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      await onAddToWishlist(product.id);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Calculate average rating
  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;

  // Check if product is on sale
  const isOnSale = product.sale_price && product.sale_price < product.price;
  const displayPrice = isOnSale ? product.sale_price : product.price;
  const originalPrice = isOnSale ? product.price : null;

  return (
    <div className="product-card bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Product Image */}
      <div className="relative group">
        <img 
          src={imageError ? 'https://via.placeholder.com/300x300?text=Product' : (product.image_url || 'https://via.placeholder.com/300x300?text=Product')} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-colors ${
            isInWishlist 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </div>
        )}

        {/* Quick View Button */}
        <button
          onClick={() => onViewDetails(product.id)}
          className="absolute bottom-2 left-2 bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Eye className="h-4 w-4 inline mr-1" />
          Quick View
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category.name}
          </span>
        )}

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.short_description || product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">
            ({product.reviews?.length || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              ₹{displayPrice?.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          <span className={`text-xs font-medium ${
            product.stock_quantity > 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {product.stock_quantity > 0 
              ? `In Stock (${product.stock_quantity})` 
              : 'Out of Stock'
            }
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock_quantity === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
