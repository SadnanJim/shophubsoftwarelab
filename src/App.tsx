import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { CheckoutModal } from './components/CheckoutModal';
import { getCategories, getProducts } from './api/products';
import { getCartItems, addToCart, updateCartItemQuantity, removeFromCart } from './api/cart';
import { createOrder } from './api/orders';
import { Category, Product, CartItem } from './types';

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  async function loadData() {
    try {
      const [categoriesData, cartData] = await Promise.all([
        getCategories(),
        getCartItems(),
      ]);
      setCategories(categoriesData);
      setCartItems(cartData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const productsData = await getProducts(selectedCategory || undefined);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  async function handleAddToCart(productId: string) {
    try {
      await addToCart(productId, 1);
      const updatedCart = await getCartItems();
      setCartItems(updatedCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
  }

  async function handleUpdateQuantity(cartItemId: string, quantity: number) {
    try {
      await updateCartItemQuantity(cartItemId, quantity);
      const updatedCart = await getCartItems();
      setCartItems(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  async function handleRemoveItem(cartItemId: string) {
    try {
      await removeFromCart(cartItemId);
      const updatedCart = await getCartItems();
      setCartItems(updatedCart);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  async function handleCheckout(orderData: {
    customer_name: string;
    customer_email: string;
    shipping_address: string;
  }) {
    try {
      await createOrder(cartItems, orderData);
      setCartItems([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to place order');
    }
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No products found in this category</p>
          </div>
        )}
      </main>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSubmit={handleCheckout}
        total={cartTotal}
      />
    </div>
  );
}

export default App;
