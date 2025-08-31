-- Create categories table for better category management
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, display_name, description, sort_order) VALUES
    ('all', 'All Products', 'All available products', 0),
    ('beef', 'Beef', 'Fresh beef products', 1),
    ('chicken', 'Chicken', 'Fresh chicken products', 2),
    ('pork', 'Pork', 'Fresh pork products', 3),
    ('seafood', 'Seafood', 'Fresh seafood products', 4);

-- Create indexes
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);