import { supabase } from '../lib/supabase';
import { Order, OrderItem, CartItem } from '../types';
import { clearCart } from './cart';

function getSessionId(): string {
  return localStorage.getItem('session_id') || crypto.randomUUID();
}

interface OrderData {
  customer_name: string;
  customer_email: string;
  shipping_address: string;
}

export async function createOrder(
  cartItems: CartItem[],
  orderData: OrderData
): Promise<Order> {
  const sessionId = getSessionId();
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      session_id: sessionId,
      total_amount: totalAmount,
      status: 'pending',
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      shipping_address: orderData.shipping_address,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.product?.price || 0,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  await clearCart();

  return order;
}

export async function getOrders(): Promise<Order[]> {
  const sessionId = getSessionId();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('order_id', orderId);

  if (error) throw error;
  return data || [];
}
