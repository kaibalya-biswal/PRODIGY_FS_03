import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Heart, Star } from 'lucide-react';
import { supabase, dbHelpers } from '../services/supabaseClient';
import ProductCard from '../components/ProductCard';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      // Load all categories
      const { data: cats, error: catError } = await dbHelpers.getCategories();
      if (catError) throw catError;
      
      setCategories(cats || []);

      // Load products for each category
      const productsByCategory = {};
      for (const category of cats || []) {
        const { data: products, error: prodError } = await dbHelpers.getProducts({
          category: category.id,
          limit: 4 // Show 4 products per category
        });
        
        if (!prodError && products) {
          productsByCategory[category.id] = products;
        }
      }
      
      setCategoryProducts(productsByCategory);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to add items to cart');
        return;
      }

      const { error } = await dbHelpers.addToCart(user.id, product.id, 1);
      if (error) throw error;
      
      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to add items to wishlist');
        return;
      }

      const { error } = await dbHelpers.addToWishlist(user.id, productId);
      if (error) throw error;
      
      alert('Added to wishlist successfully!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add item to wishlist');
    }
  };

  const getProductCount = (categoryId) => {
    return categoryProducts[categoryId]?.length || 0;
  };

  const getFeaturedProducts = (categoryId) => {
    const products = categoryProducts[categoryId] || [];
    return products.filter(product => product.is_featured).slice(0, 2);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of products organized by category. Find exactly what you're looking for with our comprehensive catalog.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-blue-100 text-sm mb-3">{category.description}</p>
                    <div className="flex items-center text-sm">
                      <span className="bg-blue-500 bg-opacity-30 px-2 py-1 rounded-full">
                        {getProductCount(category.id)} products
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Products */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Featured Products</h4>
                  <div className="space-y-3">
                    {getFeaturedProducts(category.id).map((product) => (
                      <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h5>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-blue-600">
                              ₹{product.sale_price || product.price}
                            </span>
                            {product.sale_price && (
                              <span className="text-xs text-gray-500 line-through">
                                ₹{product.price}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {product.average_rating > 0 && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600 ml-1">
                                {product.average_rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Actions */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/products?category=${category.slug}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                    >
                      View all {category.name} products
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddToCart(getFeaturedProducts(category.id)[0])}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Add to cart"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAddToWishlist(getFeaturedProducts(category.id)[0]?.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Add to wishlist"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Statistics */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Category Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold text-lg">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {getProductCount(category.id)} products
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Browse our complete product catalog or use our search feature to find exactly what you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              Browse All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories; 