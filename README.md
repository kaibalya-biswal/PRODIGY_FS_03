# StoreFront - E-commerce Platform

A modern, full-featured e-commerce platform built with React, Supabase, and Tailwind CSS.

**Developer:** [Kaibalya Biswal](https://github.com/kaibalya-biswal)

## 🚀 Features

- **User Authentication** - Sign up, login, and profile management
- **Product Catalog** - Browse products by category with search and filtering
- **Shopping Cart** - Add items, manage quantities, apply coupons
- **Wishlist** - Save favorite products for later
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - Live cart and inventory updates
- **Indian Rupee Pricing** - All prices displayed in ₹

## 🛠️ Tech Stack

- **Frontend**: React.js, React Router DOM
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PRODIGY_FS_03
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   Run the SQL commands in `database_setup.sql` in your Supabase SQL editor

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗂️ Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth)
├── pages/          # Page components
├── services/       # API and business logic
└── assets/         # Static assets
```

## 🎯 Key Pages

- **Home** (`/`) - Landing page with featured products
- **Products** (`/products`) - Product catalog with search/filter
- **Categories** (`/categories`) - Browse by product category
- **Cart** (`/cart`) - Shopping cart and checkout
- **Login/Register** (`/login`, `/register`) - User authentication

## 💰 Pricing

All prices are displayed in **Indian Rupees (₹)** throughout the application.

## 🔧 Development

- **Port**: Runs on `http://localhost:5174` (or next available port)
- **Hot Reload**: Enabled for development
- **ESLint**: Configured for code quality

## 📝 License

This project is part of the Prodigy Frontend Development program.
