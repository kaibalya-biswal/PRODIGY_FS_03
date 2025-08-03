
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './components/Cart';
import CartPage from './pages/CartPage';
import OrderTracking from './pages/OrderTracking';
import Checkout from './pages/Checkout';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import { useState } from 'react';

function App() {
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  const handleCartClick = () => {
    setShowCart(!showCart);
  };

  const handleWishlistClick = () => {
    setShowWishlist(!showWishlist);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header
            cartItemsCount={cartItems.length}
            wishlistCount={wishlistItems.length}
            onCartClick={handleCartClick}
            onWishlistClick={handleWishlistClick}
          />
          
          <main className="flex-1">
                    <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrderTracking />} />
          <Route path="/orders/:orderId" element={<OrderTracking />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<div className="p-8 text-center">Profile page coming soon...</div>} />
        </Routes>
          </main>

          {/* Cart Sidebar */}
          {showCart && (
            <Cart
              onClose={() => setShowCart(false)}
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          )}

          {/* Wishlist Sidebar */}
          {showWishlist && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowWishlist(false)} />
                <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
                  <div className="w-screen max-w-md">
                    <div className="h-full flex flex-col bg-white shadow-xl">
                      <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <h2 className="text-lg font-medium text-gray-900">Wishlist</h2>
                          <button
                            onClick={() => setShowWishlist(false)}
                            className="ml-3 h-7 flex items-center"
                          >
                            <span className="sr-only">Close panel</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-8">
                          {wishlistItems.length === 0 ? (
                            <p className="text-gray-500 text-center">Your wishlist is empty</p>
                          ) : (
                            <div>Wishlist items will be displayed here</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
