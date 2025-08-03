-- Add sample reviews to the database
-- This script adds reviews for various products to test the review functionality

-- First, let's get some product IDs and user IDs to work with
-- Note: You'll need to replace these UUIDs with actual IDs from your database

-- Sample reviews for products
INSERT INTO reviews (user_id, product_id, rating, title, comment, is_verified_purchase, is_helpful_count, created_at) VALUES
-- Reviews for first product (assuming it exists)
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 5, 'Excellent Quality!', 'This product exceeded my expectations. The quality is outstanding and it arrived quickly. Highly recommend!', true, 3, NOW() - INTERVAL '5 days'),
('00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 4, 'Great Value', 'Good product for the price. Fast shipping and good customer service.', true, 1, NOW() - INTERVAL '3 days'),
('00000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 3, 'Decent Product', 'The product is okay, but could be better. Shipping was slow.', false, 0, NOW() - INTERVAL '1 day'),

-- Reviews for second product
('00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 5, 'Amazing!', 'This is exactly what I was looking for. Perfect fit and great quality.', true, 5, NOW() - INTERVAL '7 days'),
('00000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 4, 'Very Satisfied', 'Good product, meets expectations. Would buy again.', true, 2, NOW() - INTERVAL '4 days'),

-- Reviews for third product
('00000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 5, 'Outstanding!', 'This product is fantastic! Great quality and fast delivery.', true, 4, NOW() - INTERVAL '6 days'),
('00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 4, 'Good Purchase', 'Happy with this purchase. Good value for money.', true, 1, NOW() - INTERVAL '2 days'),

-- Reviews for fourth product
('00000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 3, 'Average', 'The product is okay, nothing special but gets the job done.', false, 0, NOW() - INTERVAL '8 days'),
('00000000-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 2, 'Disappointed', 'Not what I expected. Quality could be better.', false, 0, NOW() - INTERVAL '5 days'),

-- Reviews for fifth product
('00000000-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 5, 'Perfect!', 'Absolutely love this product! Best purchase I\'ve made.', true, 6, NOW() - INTERVAL '10 days'),
('00000000-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', 4, 'Great Product', 'Very happy with this purchase. Good quality and fast shipping.', true, 3, NOW() - INTERVAL '9 days'),
('00000000-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', 5, 'Excellent!', 'This product is amazing! Highly recommend to everyone.', true, 4, NOW() - INTERVAL '7 days');

-- Note: You'll need to replace the UUIDs above with actual product and user IDs from your database
-- To get actual IDs, you can run:
-- SELECT id FROM products LIMIT 5;
-- SELECT id FROM auth.users LIMIT 3;

-- Then update the INSERT statements with the actual UUIDs 