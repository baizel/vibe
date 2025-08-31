-- Initialize database with mock data (Updated for new schema)
-- This script adds sample data to the database with proper relationships
-- This version resets data before inserting (no ON CONFLICT)

-- Clear tables first (reset auto-increment IDs and cascade to children)
TRUNCATE TABLE order_items, orders, products, suppliers, users, addresses, categories RESTART IDENTITY CASCADE;

-- Insert sample addresses
INSERT INTO addresses (id, street, city, state, postal_code, country, label) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '123 Main Street', 'London', 'England', 'SW1A 1AA', 'United Kingdom', 'Head Office'),
    ('550e8400-e29b-41d4-a716-446655440002', '456 Oak Avenue', 'Manchester', 'England', 'M1 1AA', 'United Kingdom', 'Customer Address'),
    ('550e8400-e29b-41d4-a716-446655440003', '789 Farm Road', 'Yorkshire', 'England', 'YO1 9AA', 'United Kingdom', 'Supplier Address'),
    ('550e8400-e29b-41d4-a716-446655440004', '321 Market Street', 'Birmingham', 'England', 'B1 1AA', 'United Kingdom', 'Supplier Address'),
    ('550e8400-e29b-41d4-a716-446655440005', '654 High Street', 'Liverpool', 'England', 'L1 1AA', 'United Kingdom', 'Driver Address');

-- Insert sample users (referencing addresses)
INSERT INTO users (id, email, first_name, last_name, role, is_verified, gdpr_consent, address_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440011', 'admin@freshtrio.com', 'Admin', 'User', 'ADMIN', true, true, '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440012', 'customer@example.com', 'John', 'Doe', 'CUSTOMER', true, true, '550e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440013', 'driver@freshtrio.com', 'Jane', 'Smith', 'DRIVER', true, true, '550e8400-e29b-41d4-a716-446655440005');

-- Insert sample suppliers (referencing addresses)
INSERT INTO suppliers (id, name, contact_email, contact_phone, address_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440021', 'Yorkshire Farms Ltd', 'contact@yorkshirefarms.co.uk', '+44 1904 123456', '550e8400-e29b-41d4-a716-446655440003'),
    ('550e8400-e29b-41d4-a716-446655440022', 'Birmingham Butchers', 'info@birminghambutchers.co.uk', '+44 121 234567', '550e8400-e29b-41d4-a716-446655440004');

-- Insert sample products (referencing suppliers)
INSERT INTO products (id, name, description, category, price, unit, image_url, supplier_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440061', 'Premium Beef Ribeye', 'Fresh, high-quality ribeye steak perfect for grilling', 'beef', 28.99, 'kg', 'https://via.placeholder.com/200x120/FF6B6B/FFFFFF?text=Ribeye', '550e8400-e29b-41d4-a716-446655440021'),
    ('550e8400-e29b-41d4-a716-446655440062', 'Free Range Chicken Breast', 'Organic chicken breast fillets, hormone-free', 'chicken', 12.99, 'kg', 'https://via.placeholder.com/200x120/4ECDC4/FFFFFF?text=Chicken', '550e8400-e29b-41d4-a716-446655440021'),
    ('550e8400-e29b-41d4-a716-446655440063', 'Fresh Salmon Fillet', 'Wild-caught salmon fillets, rich in omega-3', 'seafood', 24.99, 'kg', 'https://via.placeholder.com/200x120/45B7D1/FFFFFF?text=Salmon', '550e8400-e29b-41d4-a716-446655440022'),
    ('550e8400-e29b-41d4-a716-446655440064', 'Pork Tenderloin', 'Lean pork tenderloin cuts, perfect for roasting', 'pork', 16.99, 'kg', 'https://via.placeholder.com/200x120/F7DC6F/FFFFFF?text=Pork', '550e8400-e29b-41d4-a716-446655440021'),
    ('550e8400-e29b-41d4-a716-446655440065', 'Ground Beef 80/20', 'Fresh ground beef, 80% lean, perfect for burgers', 'beef', 8.99, 'kg', 'https://via.placeholder.com/200x120/FF6B6B/FFFFFF?text=Ground+Beef', '550e8400-e29b-41d4-a716-446655440021'),
    ('550e8400-e29b-41d4-a716-446655440066', 'Chicken Thighs', 'Juicy chicken thighs with skin, bone-in', 'chicken', 9.99, 'kg', 'https://via.placeholder.com/200x120/4ECDC4/FFFFFF?text=Thighs', '550e8400-e29b-41d4-a716-446655440021'),
    ('550e8400-e29b-41d4-a716-446655440067', 'Fresh Cod Fillet', 'White fish fillet, mild flavor, great for frying', 'seafood', 18.99, 'kg', 'https://via.placeholder.com/200x120/45B7D1/FFFFFF?text=Cod', '550e8400-e29b-41d4-a716-446655440022'),
    ('550e8400-e29b-41d4-a716-446655440068', 'Pork Chops', 'Bone-in pork chops, center cut, premium quality', 'pork', 14.99, 'kg', 'https://via.placeholder.com/200x120/F7DC6F/FFFFFF?text=Pork+Chops', '550e8400-e29b-41d4-a716-446655440021'),
    ('550e8400-e29b-41d4-a716-446655440069', 'Lamb Shoulder', 'Tender lamb shoulder, perfect for slow cooking', 'lamb', 22.99, 'kg', 'https://via.placeholder.com/200x120/E74C3C/FFFFFF?text=Lamb', '550e8400-e29b-41d4-a716-446655440021'),
    ('550e8400-e29b-41d4-a716-446655440070', 'Fresh Tuna Steaks', 'Sushi-grade tuna steaks, perfect for searing', 'seafood', 32.99, 'kg', 'https://via.placeholder.com/200x120/3498DB/FFFFFF?text=Tuna', '550e8400-e29b-41d4-a716-446655440022'),
    ('550e8400-e29b-41d4-a716-446655440071', 'Chicken Wings', 'Fresh chicken wings, perfect for BBQ', 'chicken', 7.99, 'kg', 'https://via.placeholder.com/200x120/2ECC71/FFFFFF?text=Wings', '550e8400-e29b-41d4-a716-446655440021'),
    ('550e8400-e29b-41d4-a716-446655440072', 'Beef Short Ribs', 'Marbled short ribs, ideal for braising', 'beef', 19.99, 'kg', 'https://via.placeholder.com/200x120/E67E22/FFFFFF?text=Ribs', '550e8400-e29b-41d4-a716-446655440021');

-- Insert sample orders (referencing users and addresses)
INSERT INTO orders (id, user_id, address_id, delivery_date, status, total_amount, payment_method, payment_status, special_instructions) VALUES
    ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', '2024-09-05', 'PENDING', 58.97, 'cash_on_delivery', 'PENDING', 'Please deliver before 2 PM'),
    ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', '2024-09-03', 'DELIVERED', 24.99, 'cash_on_delivery', 'COMPLETED', 'Thanks for the excellent service!');

-- Insert sample order items (referencing orders and products)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price) VALUES
    ('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440061', 1.0, 28.99, 28.99),
    ('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440062', 2.0, 12.99, 25.98),
    ('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440071', 0.5, 7.99, 4.00),
    ('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440063', 1.0, 24.99, 24.99);

-- Insert sample categories
INSERT INTO categories (id, name, display_name, description, sort_order) VALUES
    ('550e8400-e29b-41d4-a716-446655440052', 'beef', 'Beef', 'Fresh beef products', 1),
    ('550e8400-e29b-41d4-a716-446655440053', 'chicken', 'Chicken', 'Fresh chicken products', 2),
    ('550e8400-e29b-41d4-a716-446655440054', 'pork', 'Pork', 'Fresh pork products', 3),
    ('550e8400-e29b-41d4-a716-446655440055', 'seafood', 'Seafood', 'Fresh seafood products', 4),
    ('550e8400-e29b-41d4-a716-446655440056', 'lamb', 'Lamb', 'Fresh lamb products', 5);
