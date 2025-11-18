import { supabase } from '../lib/supabase';
import { CartItem } from '../types';

function getSessionId(): string {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

export async function getCartItems(): Promise<CartItem[]> {
  const sessionId = getSessionId();

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('session_id', sessionId);

  if (error) throw error;
  return data || [];
}

export async function addToCart(productId: string, quantity: number = 1): Promise<void> {
  const sessionId = getSessionId();

  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('session_id', sessionId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existingItem) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ session_id: sessionId, product_id: productId, quantity });

    if (error) throw error;
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<void> {
  if (quantity <= 0) {
    await removeFromCart(cartItemId);
    return;
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);

  if (error) throw error;
}

export async function removeFromCart(cartItemId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);

  if (error) throw error;
}

export async function clearCart(): Promise<void> {
  const sessionId = getSessionId();

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('session_id', sessionId);

  if (error) throw error;
}
