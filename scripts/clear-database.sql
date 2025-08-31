-- Clear all data from database (Updated for new schema)
-- WARNING: This will delete all data!

-- Clear in correct order due to foreign key constraints
-- Clear order items first (references orders and products)
DELETE FROM order_items;

-- Clear orders (references users and addresses)
DELETE FROM orders;

-- Clear products (references suppliers)
DELETE FROM products;

-- Clear categories (standalone table)
DELETE FROM categories WHERE name != 'all'; -- Keep the 'all' category
DELETE FROM categories; -- Clear all categories including 'all'

-- Clear suppliers (references addresses)
DELETE FROM suppliers;

-- Clear users (references addresses)
DELETE FROM users;

-- Clear addresses last (referenced by users, suppliers, and orders)
DELETE FROM addresses;

-- Reset sequences if needed (PostgreSQL auto-increment equivalent)
-- Note: UUIDs don't need sequence reset, but if you had serial columns:
-- ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- Verify tables are empty
SELECT 'addresses' as table_name, count(*) as count FROM addresses
UNION ALL
SELECT 'users' as table_name, count(*) as count FROM users
UNION ALL
SELECT 'suppliers' as table_name, count(*) as count FROM suppliers
UNION ALL
SELECT 'products' as table_name, count(*) as count FROM products
UNION ALL
SELECT 'categories' as table_name, count(*) as count FROM categories
UNION ALL
SELECT 'orders' as table_name, count(*) as count FROM orders
UNION ALL
SELECT 'order_items' as table_name, count(*) as count FROM order_items;