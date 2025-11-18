import { X } from 'lucide-react';
import { useState } from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customer_name: string;
    customer_email: string;
    shipping_address: string;
  }) => void;
  total: number;
}

export function CheckoutModal({ isOpen, onClose, onSubmit, total }: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    shipping_address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Checkout</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.customer_email}
                onChange={(e) =>
                  setFormData({ ...formData, customer_email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Address
              </label>
              <textarea
                required
                value={formData.shipping_address}
                onChange={(e) =>
                  setFormData({ ...formData, shipping_address: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-xl font-bold mb-4">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Place Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
