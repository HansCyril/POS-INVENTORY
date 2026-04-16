-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
  change_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access
DROP POLICY IF EXISTS "Allow public access categories" ON categories;
CREATE POLICY "Allow public access categories" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access products" ON products;
CREATE POLICY "Allow public access products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access sales" ON sales;
CREATE POLICY "Allow public access sales" ON sales FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access sale_items" ON sale_items;
CREATE POLICY "Allow public access sale_items" ON sale_items FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);

-- Insert sample categories
INSERT INTO categories (name, color) VALUES 
  ('Electronics', '#3B82F6'),
  ('Food & Beverages', '#10B981'),
  ('Clothing', '#F59E0B'),
  ('Office Supplies', '#8B5CF6')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, sku, price, cost, stock, min_stock, category_id, description) VALUES
  ('Laptop', 'LAP-001', 999.99, 500.00, 10, 2, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), 'High-performance laptop'),
  ('Wireless Mouse', 'MOU-001', 29.99, 10.00, 50, 10, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), 'Ergonomic wireless mouse'),
  ('Coffee', 'COF-001', 3.99, 1.50, 100, 20, (SELECT id FROM categories WHERE name = 'Food & Beverages' LIMIT 1), 'Premium coffee'),
  ('T-Shirt', 'TSH-001', 19.99, 5.00, 30, 5, (SELECT id FROM categories WHERE name = 'Clothing' LIMIT 1), 'Cotton t-shirt'),
  ('Notebook', 'NTB-001', 2.99, 0.50, 200, 50, (SELECT id FROM categories WHERE name = 'Office Supplies' LIMIT 1), 'A5 notebook')
ON CONFLICT (sku) DO NOTHING;
