import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getProductById(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
