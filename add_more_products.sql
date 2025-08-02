-- =====================================================
-- ADD MORE PRODUCTS TO E-COMMERCE PLATFORM
-- Adding 5 new categories with 5 products each (25 total products)
-- =====================================================

-- =====================================================
-- 1. ADD NEW CATEGORIES
-- =====================================================

INSERT INTO categories (name, description, slug) VALUES
('Kitchen & Dining', 'Kitchen appliances, cookware, and dining essentials', 'kitchen-dining'),
('Fitness & Wellness', 'Fitness equipment, supplements, and wellness products', 'fitness-wellness'),
('Pet Supplies', 'Pet food, toys, and accessories for all types of pets', 'pet-supplies'),
('Office & Stationery', 'Office supplies, stationery, and workspace essentials', 'office-stationery'),
('Outdoor & Camping', 'Camping gear, outdoor equipment, and adventure supplies', 'outdoor-camping');

-- =====================================================
-- 2. ADD PRODUCTS FOR KITCHEN & DINING CATEGORY
-- =====================================================

INSERT INTO products (name, description, short_description, price, sale_price, category_id, stock_quantity, image_url, is_featured, tags) VALUES
('Stainless Steel Cookware Set', 'Professional 10-piece stainless steel cookware set with non-stick coating', 'Professional cookware set with 10 pieces', 199.99, 159.99, (SELECT id FROM categories WHERE slug = 'kitchen-dining'), 30, 'https://via.placeholder.com/400x400?text=Cookware+Set', true, ARRAY['cookware', 'stainless steel', 'professional']),
('Smart Coffee Maker', 'Programmable coffee maker with built-in grinder and thermal carafe', 'Smart coffee maker with grinder', 89.99, NULL, (SELECT id FROM categories WHERE slug = 'kitchen-dining'), 45, 'https://via.placeholder.com/400x400?text=Coffee+Maker', false, ARRAY['coffee', 'smart', 'programmable']),
('Ceramic Dinnerware Set', 'Elegant 16-piece ceramic dinnerware set in white', 'Elegant 16-piece dinnerware set', 79.99, 64.99, (SELECT id FROM categories WHERE slug = 'kitchen-dining'), 60, 'https://via.placeholder.com/400x400?text=Dinnerware+Set', true, ARRAY['dinnerware', 'ceramic', 'elegant']),
('Kitchen Knife Set', 'Professional 8-piece knife set with wooden block', 'Professional 8-piece knife set', 129.99, NULL, (SELECT id FROM categories WHERE slug = 'kitchen-dining'), 25, 'https://via.placeholder.com/400x400?text=Knife+Set', false, ARRAY['knives', 'professional', 'kitchen']),
('Food Processor', 'Multi-functional food processor with 8-cup capacity', 'Multi-functional food processor', 149.99, 119.99, (SELECT id FROM categories WHERE slug = 'kitchen-dining'), 35, 'https://via.placeholder.com/400x400?text=Food+Processor', true, ARRAY['food processor', 'multi-functional', 'kitchen']);

-- =====================================================
-- 3. ADD PRODUCTS FOR FITNESS & WELLNESS CATEGORY
-- =====================================================

INSERT INTO products (name, description, short_description, price, sale_price, category_id, stock_quantity, image_url, is_featured, tags) VALUES
('Dumbbell Set', 'Adjustable dumbbell set with weight range 5-50 lbs', 'Adjustable dumbbell set 5-50 lbs', 299.99, 249.99, (SELECT id FROM categories WHERE slug = 'fitness-wellness'), 20, 'https://via.placeholder.com/400x400?text=Dumbbell+Set', true, ARRAY['dumbbells', 'fitness', 'adjustable']),
('Protein Powder', 'Whey protein powder with 25g protein per serving', 'Whey protein powder 25g per serving', 49.99, NULL, (SELECT id FROM categories WHERE slug = 'fitness-wellness'), 80, 'https://via.placeholder.com/400x400?text=Protein+Powder', false, ARRAY['protein', 'supplement', 'fitness']),
('Resistance Bands Set', 'Set of 5 resistance bands with different resistance levels', 'Set of 5 resistance bands', 24.99, 19.99, (SELECT id FROM categories WHERE slug = 'fitness-wellness'), 100, 'https://via.placeholder.com/400x400?text=Resistance+Bands', true, ARRAY['resistance bands', 'fitness', 'home workout']),
('Foam Roller', 'High-density foam roller for muscle recovery and massage', 'High-density foam roller', 34.99, NULL, (SELECT id FROM categories WHERE slug = 'fitness-wellness'), 75, 'https://via.placeholder.com/400x400?text=Foam+Roller', false, ARRAY['foam roller', 'recovery', 'massage']),
('Fitness Tracker', 'Smart fitness tracker with heart rate monitor and GPS', 'Smart fitness tracker with GPS', 199.99, 179.99, (SELECT id FROM categories WHERE slug = 'fitness-wellness'), 40, 'https://via.placeholder.com/400x400?text=Fitness+Tracker', true, ARRAY['fitness tracker', 'smart', 'GPS']);

-- =====================================================
-- 4. ADD PRODUCTS FOR PET SUPPLIES CATEGORY
-- =====================================================

INSERT INTO products (name, description, short_description, price, sale_price, category_id, stock_quantity, image_url, is_featured, tags) VALUES
('Premium Dog Food', 'High-quality dry dog food with real meat and vegetables', 'Premium dry dog food with real meat', 59.99, 49.99, (SELECT id FROM categories WHERE slug = 'pet-supplies'), 50, 'https://via.placeholder.com/400x400?text=Dog+Food', true, ARRAY['dog food', 'premium', 'natural']),
('Cat Scratching Post', 'Multi-level cat tree with scratching posts and platforms', 'Multi-level cat tree with scratching posts', 89.99, NULL, (SELECT id FROM categories WHERE slug = 'pet-supplies'), 30, 'https://via.placeholder.com/400x400?text=Cat+Tree', false, ARRAY['cat tree', 'scratching post', 'multi-level']),
('Pet Carrier', 'Comfortable pet carrier for small dogs and cats', 'Comfortable pet carrier for small pets', 39.99, 34.99, (SELECT id FROM categories WHERE slug = 'pet-supplies'), 45, 'https://via.placeholder.com/400x400?text=Pet+Carrier', true, ARRAY['pet carrier', 'travel', 'comfortable']),
('Interactive Pet Toys', 'Set of 5 interactive toys for dogs and cats', 'Set of 5 interactive pet toys', 29.99, NULL, (SELECT id FROM categories WHERE slug = 'pet-supplies'), 60, 'https://via.placeholder.com/400x400?text=Pet+Toys', false, ARRAY['pet toys', 'interactive', 'entertainment']),
('Pet Grooming Kit', 'Complete grooming kit with brush, nail clippers, and shampoo', 'Complete pet grooming kit', 44.99, 39.99, (SELECT id FROM categories WHERE slug = 'pet-supplies'), 35, 'https://via.placeholder.com/400x400?text=Grooming+Kit', true, ARRAY['grooming', 'pet care', 'complete kit']);

-- =====================================================
-- 5. ADD PRODUCTS FOR OFFICE & STATIONERY CATEGORY
-- =====================================================

INSERT INTO products (name, description, short_description, price, sale_price, category_id, stock_quantity, image_url, is_featured, tags) VALUES
('Ergonomic Office Chair', 'Adjustable ergonomic office chair with lumbar support', 'Adjustable ergonomic office chair', 299.99, 249.99, (SELECT id FROM categories WHERE slug = 'office-stationery'), 25, 'https://via.placeholder.com/400x400?text=Office+Chair', true, ARRAY['office chair', 'ergonomic', 'adjustable']),
('Premium Pen Set', 'Set of 5 premium ballpoint pens with elegant design', 'Set of 5 premium ballpoint pens', 24.99, NULL, (SELECT id FROM categories WHERE slug = 'office-stationery'), 100, 'https://via.placeholder.com/400x400?text=Pen+Set', false, ARRAY['pens', 'premium', 'ballpoint']),
('Desk Organizer', 'Multi-compartment desk organizer for office supplies', 'Multi-compartment desk organizer', 34.99, 29.99, (SELECT id FROM categories WHERE slug = 'office-stationery'), 70, 'https://via.placeholder.com/400x400?text=Desk+Organizer', true, ARRAY['desk organizer', 'office supplies', 'multi-compartment']),
('Notebook Set', 'Set of 3 high-quality notebooks with different sizes', 'Set of 3 high-quality notebooks', 19.99, NULL, (SELECT id FROM categories WHERE slug = 'office-stationery'), 120, 'https://via.placeholder.com/400x400?text=Notebook+Set', false, ARRAY['notebooks', 'paper', 'writing']),
('USB Desk Lamp', 'LED desk lamp with USB charging port and adjustable brightness', 'LED desk lamp with USB charging', 49.99, 44.99, (SELECT id FROM categories WHERE slug = 'office-stationery'), 55, 'https://via.placeholder.com/400x400?text=Desk+Lamp', true, ARRAY['desk lamp', 'LED', 'USB charging']);

-- =====================================================
-- 6. ADD PRODUCTS FOR OUTDOOR & CAMPING CATEGORY
-- =====================================================

INSERT INTO products (name, description, short_description, price, sale_price, category_id, stock_quantity, image_url, is_featured, tags) VALUES
('4-Person Camping Tent', 'Waterproof 4-person camping tent with rainfly', 'Waterproof 4-person camping tent', 199.99, 179.99, (SELECT id FROM categories WHERE slug = 'outdoor-camping'), 20, 'https://via.placeholder.com/400x400?text=Camping+Tent', true, ARRAY['camping tent', 'waterproof', '4-person']),
('Portable Camping Stove', 'Compact camping stove with fuel canister', 'Compact camping stove with fuel', 79.99, NULL, (SELECT id FROM categories WHERE slug = 'outdoor-camping'), 35, 'https://via.placeholder.com/400x400?text=Camping+Stove', false, ARRAY['camping stove', 'portable', 'compact']),
('Hiking Backpack', '60L hiking backpack with multiple compartments', '60L hiking backpack with compartments', 129.99, 109.99, (SELECT id FROM categories WHERE slug = 'outdoor-camping'), 30, 'https://via.placeholder.com/400x400?text=Hiking+Backpack', true, ARRAY['hiking backpack', '60L', 'multiple compartments']),
('Sleeping Bag', 'Comfortable sleeping bag rated for 20°F weather', 'Comfortable sleeping bag 20°F rated', 89.99, NULL, (SELECT id FROM categories WHERE slug = 'outdoor-camping'), 40, 'https://via.placeholder.com/400x400?text=Sleeping+Bag', false, ARRAY['sleeping bag', 'comfortable', '20°F rated']),
('Portable Water Filter', 'Lightweight water filter for outdoor activities', 'Lightweight portable water filter', 59.99, 49.99, (SELECT id FROM categories WHERE slug = 'outdoor-camping'), 25, 'https://via.placeholder.com/400x400?text=Water+Filter', true, ARRAY['water filter', 'portable', 'lightweight']);

-- =====================================================
-- 7. ADD SAMPLE REVIEWS FOR NEW PRODUCTS
-- =====================================================

-- Add some sample reviews for the new products (these will be linked to existing users)
INSERT INTO reviews (user_id, product_id, rating, title, comment) VALUES
-- Kitchen & Dining reviews
((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM products WHERE name = 'Stainless Steel Cookware Set' LIMIT 1), 5, 'Excellent Quality', 'This cookware set is amazing! The quality is outstanding and it cooks evenly.'),
((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM products WHERE name = 'Smart Coffee Maker' LIMIT 1), 4, 'Great Coffee Maker', 'Love the programmable feature and the built-in grinder. Makes perfect coffee every time.'),

-- Fitness & Wellness reviews
((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM products WHERE name = 'Dumbbell Set' LIMIT 1), 5, 'Perfect for Home Workouts', 'These adjustable dumbbells are perfect for my home gym. Great quality and easy to adjust.'),
((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM products WHERE name = 'Protein Powder' LIMIT 1), 4, 'Great Taste and Quality', 'The protein powder tastes great and mixes well. No clumps and good quality protein.'),

-- Pet Supplies reviews
((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM products WHERE name = 'Premium Dog Food' LIMIT 1), 5, 'My Dog Loves It', 'My dog absolutely loves this food. His coat is shinier and he has more energy.'),
((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM products WHERE name = 'Cat Scratching Post' LIMIT 1), 4, 'Cats Love It', 'My cats spend hours on this cat tree. Great quality and sturdy construction.'),

-- Office & Stationery reviews
((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM products WHERE name = 'Ergonomic Office Chair' LIMIT 1), 5, 'Comfortable All Day', 'This chair is incredibly comfortable for long work days. The lumbar support is perfect.'),
((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM products WHERE name = 'Premium Pen Set' LIMIT 1), 4, 'Smooth Writing', 'These pens write smoothly and have a nice weight to them. Great for everyday use.'),

-- Outdoor & Camping reviews
((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM products WHERE name = '4-Person Camping Tent' LIMIT 1), 5, 'Great Tent', 'This tent is easy to set up and kept us dry during a rainstorm. Perfect for family camping.'),
((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM products WHERE name = 'Hiking Backpack' LIMIT 1), 4, 'Comfortable and Spacious', 'This backpack is comfortable to wear and has plenty of space for all my gear.');

-- =====================================================
-- 8. ADD SAMPLE COUPONS FOR NEW CATEGORIES
-- =====================================================

INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_order_amount, usage_limit, valid_until) VALUES
('KITCHEN15', 'Kitchen & Dining Sale', '15% off all kitchen and dining products', 'percentage', 15.00, 100.00, 200, NOW() + INTERVAL '3 months'),
('FITNESS20', 'Fitness & Wellness Sale', '20% off fitness and wellness products', 'percentage', 20.00, 75.00, 150, NOW() + INTERVAL '3 months'),
('PET10', 'Pet Supplies Discount', '10% off all pet supplies', 'percentage', 10.00, 50.00, 300, NOW() + INTERVAL '6 months'),
('OFFICE25', 'Office & Stationery Sale', '25% off office and stationery products', 'percentage', 25.00, 50.00, 100, NOW() + INTERVAL '2 months'),
('OUTDOOR30', 'Outdoor & Camping Sale', '30% off outdoor and camping gear', 'percentage', 30.00, 100.00, 75, NOW() + INTERVAL '4 months');

-- =====================================================
-- SUMMARY
-- =====================================================

-- Total new products added: 25
-- Categories added: 5 (Kitchen & Dining, Fitness & Wellness, Pet Supplies, Office & Stationery, Outdoor & Camping)
-- Products per category: 5
-- Sample reviews added: 10
-- New coupons added: 5

-- The new products include:
-- - Kitchen & Dining: Cookware set, coffee maker, dinnerware set, knife set, food processor
-- - Fitness & Wellness: Dumbbell set, protein powder, resistance bands, foam roller, fitness tracker
-- - Pet Supplies: Dog food, cat tree, pet carrier, pet toys, grooming kit
-- - Office & Stationery: Office chair, pen set, desk organizer, notebook set, desk lamp
-- - Outdoor & Camping: Camping tent, camping stove, hiking backpack, sleeping bag, water filter

-- All products include:
-- - Realistic pricing with some sale prices
-- - Appropriate stock quantities
-- - Featured products for each category
-- - Relevant tags for search functionality
-- - Sample reviews for customer feedback
-- - Category-specific coupons for promotions

-- =====================================================
-- END OF PRODUCT ADDITION SCRIPT
-- ===================================================== 