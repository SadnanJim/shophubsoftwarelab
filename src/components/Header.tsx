import { ShoppingCart, Store } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export function Header({ cartCount, onCartClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Store size={32} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">ShopHub</h1>
          </div>
          <button
            onClick={onCartClick}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ShoppingCart size={28} className="text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
