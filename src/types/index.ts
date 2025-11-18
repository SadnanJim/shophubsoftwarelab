export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id?: string;
  session_id?: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id?: string;
  session_id?: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  customer_email: string;
  customer_name: string;
  shipping_address: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
}
