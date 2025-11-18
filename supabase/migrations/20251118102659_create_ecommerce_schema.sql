/*
  # E-Commerce Database Schema

  ## Overview
  Creates a complete e-commerce database with products, categories, cart, and orders functionality.

  ## New Tables

  ### 1. categories
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text) - Category name
  - `description` (text) - Category description
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. products
  - `id` (uuid, primary key) - Unique product identifier
  - `category_id` (uuid, foreign key) - Reference to categories table
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `price` (numeric) - Product price
  - `image_url` (text) - Product image URL
  - `stock` (integer) - Available stock quantity
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. cart_items
  - `id` (uuid, primary key) - Unique cart item identifier
  - `user_id` (uuid) - User identifier (for authenticated users)
  - `session_id` (text) - Session identifier (for guest users)
  - `product_id` (uuid, foreign key) - Reference to products table
  - `quantity` (integer) - Quantity in cart
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. orders
  - `id` (uuid, primary key) - Unique order identifier
  - `user_id` (uuid) - User identifier
  - `session_id` (text) - Session identifier for guest orders
  - `total_amount` (numeric) - Total order amount
  - `status` (text) - Order status (pending, completed, cancelled)
  - `customer_email` (text) - Customer email address
  - `customer_name` (text) - Customer name
  - `shipping_address` (text) - Shipping address
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. order_items
  - `id` (uuid, primary key) - Unique order item identifier
  - `order_id` (uuid, foreign key) - Reference to orders table
  - `product_id` (uuid, foreign key) - Reference to products table
  - `quantity` (integer) - Quantity ordered
  - `price` (numeric) - Price at time of order
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for products and categories
  - Cart items accessible by session_id or user_id
  - Orders accessible by owner only

  ## Important Notes
  1. Products and categories are publicly readable
  2. Cart items use session_id for guest users and user_id for authenticated users
  3. Orders track both authenticated and guest purchases
  4. Stock management is handled at the application level
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10, 2) NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  total_amount numeric(10, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  shipping_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can view their own cart items by session"
  ON cart_items FOR SELECT
  TO anon, authenticated
  USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR user_id = auth.uid());

CREATE POLICY "Users can insert their own cart items"
  ON cart_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR user_id = auth.uid());

CREATE POLICY "Users can update their own cart items"
  ON cart_items FOR UPDATE
  TO anon, authenticated
  USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR user_id = auth.uid())
  WITH CHECK (session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR user_id = auth.uid());

CREATE POLICY "Users can delete their own cart items"
  ON cart_items FOR DELETE
  TO anon, authenticated
  USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR user_id = auth.uid());

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR user_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR orders.user_id = auth.uid())
    )
  );

INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic devices and gadgets'),
  ('Clothing', 'Fashion and apparel'),
  ('Books', 'Books and literature'),
  ('Home & Garden', 'Home improvement and garden supplies')
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, image_url, stock) VALUES
  ((SELECT id FROM categories WHERE name = 'Electronics'), 'Wireless Headphones', 'High-quality bluetooth headphones with noise cancellation', 99.99, 'https://images.pexels.com/photos/8000618/pexels-photo-8000618.jpeg?auto=compress&cs=tinysrgb&w=400', 50),
  ((SELECT id FROM categories WHERE name = 'Electronics'), 'Smart Watch', 'Fitness tracking smartwatch with heart rate monitor', 199.99, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400', 30),
  ((SELECT id FROM categories WHERE name = 'Clothing'), 'Cotton T-Shirt', 'Comfortable cotton t-shirt in various colors', 24.99, 'https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=400', 100),
  ((SELECT id FROM categories WHERE name = 'Clothing'), 'Denim Jeans', 'Classic fit denim jeans', 59.99, 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400', 75),
  ((SELECT id FROM categories WHERE name = 'Books'), 'Programming Guide', 'Complete guide to modern web development', 39.99, 'https://images.pexels.com/photos/1148399/pexels-photo-1148399.jpeg?auto=compress&cs=tinysrgb&w=400', 40),
  ((SELECT id FROM categories WHERE name = 'Home & Garden'), 'Indoor Plant Pot', 'Ceramic pot for indoor plants', 19.99, 'https://images.pexels.com/photos/4503821/pexels-photo-4503821.jpeg?auto=compress&cs=tinysrgb&w=400', 60)
ON CONFLICT DO NOTHING;