import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Store,
  CheckCircle2,
  PackageSearch
} from 'lucide-react';

export default function BillingPOS() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cart state
  const [cart, setCart] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [statusMsg, setStatusMsg] = useState({ text: '', isError: false });

  const refreshStoreData = async () => {
    setLoading(true);
    try {
      const prodRes = await api.getProducts();
      if (prodRes && Array.isArray(prodRes.data)) {
        setProducts(prodRes.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.warn("Products sync status:", err.response?.status);
      setProducts([]);
    }

    try {
      const custRes = await api.getCustomers();
      if (custRes && Array.isArray(custRes.data)) {
        setCustomers(custRes.data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.warn("Customers sync status:", err.response?.status);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStoreData();
  }, []);

  const handleAddToCart = () => {
    if (!selectedProductId) return;
    const item = products.find((p) => p.id === Number(selectedProductId));
    if (!item) return;

    if (Number(quantity) > Number(item.stockQuantity)) {
      alert(`Sirf ${item.stockQuantity} ${item.unit} stock bacha hai!`);
      return;
    }

    const existingIndex = cart.findIndex((c) => c.productId === item.id);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += Number(quantity);
      newCart[existingIndex].subtotal = newCart[existingIndex].quantity * item.sellingPrice;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          productId: item.id,
          name: item.name,
          unit: item.unit,
          availableStock: item.stockQuantity,
          sellingPrice: item.sellingPrice,
          quantity: Number(quantity),
          subtotal: Number(quantity) * item.sellingPrice,
        },
      ]);
    }
    setSelectedProductId('');
    setQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => cart.reduce((acc, curr) => acc + curr.subtotal, 0);
  const subtotal = calculateSubtotal();
  const netPayable = Math.max(0, subtotal - Number(discountAmount || 0));

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart khali hai! Pehle items add karein.");
      return;
    }

    if (paymentMode === 'UDHAAR' && !selectedCustomerId) {
      alert("Udhaar bill ke liye customer select karna anivarya hai!");
      return;
    }

    try {
      await api.createSale({
        customerId: selectedCustomerId ? Number(selectedCustomerId) : null,
        paymentMode: paymentMode,
        discountAmount: Number(discountAmount || 0),
        items: cart.map((c) => ({
          productId: c.productId,
          quantity: c.quantity,
        })),
      });

      setStatusMsg({
        text: `Bill ban gaya! Stock kam kar diya gaya hai. Net Amount: ₹${netPayable.toFixed(2)}`,
        isError: false,
      });
      setCart([]);
      setSelectedCustomerId('');
      setDiscountAmount(0);
      refreshStoreData();
    } catch (err) {
      setStatusMsg({
        text: err.response?.data?.message || err.message || 'Checkout fail ho gaya.',
        isError: true,
      });
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Shop Bar Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Store size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Shop Counter</div>
            <h3 className="text-base font-extrabold text-slate-800">{user?.shopName || 'Kirana Store'}</h3>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Operator Email</span>
            <span className="font-semibold text-slate-700">{user?.email}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Security Role</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-md text-[10px]">
              {user?.role || 'ROLE_SHOPKEEPER'}
            </span>
          </div>
        </div>
      </div>

      {statusMsg.text && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMsg.isError
              ? 'bg-rose-50 border border-rose-200 text-rose-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}
        >
          <CheckCircle2 size={16} />
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Product Selection & Cart */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-800">Checkout Terminal</h2>
            <p className="text-xs text-slate-400">Available stock aur samaan ki quantity calculate karein</p>
          </div>

          {/* Product selector bar */}
          <div className="flex gap-2">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={products.length === 0}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">
                {products.length === 0 ? '-- Dukaan me abhi koi samaan nahi hai --' : '-- Choose Product --'}
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.stockQuantity} {p.unit}) - ₹{p.sellingPrice}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0.1"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 text-center font-bold"
            />

            <button
              onClick={handleAddToCart}
              disabled={!selectedProductId || products.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Plus size={15} /> Add Item
            </button>
          </div>

          {/* Cart Table or Empty Store State */}
          <div className="border border-slate-100 rounded-xl overflow-hidden min-h-[160px]">
            {products.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <PackageSearch size={32} className="mx-auto text-slate-300" />
                <h4 className="text-xs font-bold text-slate-600">Aapki dukan me abhi koi product registered nahi hai</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Pehle left menu ke <strong>"Inventory Stock"</strong> tab me jaakar <strong>"+ Add New SKU"</strong> se samaan add karein.
                </p>
              </div>
            ) : cart.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Cart khali hai. Upar se product select karke quantity add karein.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3 text-center">Available in DB</th>
                    <th className="py-2.5 px-3 text-center">Billed Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                    <th className="py-2.5 px-3 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">
                        {item.availableStock} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">₹{item.sellingPrice}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{item.subtotal.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Customer & Payment Settlement */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">Payment & Customer</h2>

          {/* Payment Mode Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Payment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['CASH', 'UPI', 'UDHAAR'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    paymentMode === mode
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Customer (Grahak) {paymentMode === 'UDHAAR' && <span className="text-rose-500">*</span>}
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
            >
              <option value="">
                {customers.length === 0 ? '-- Koi grahak registered nahi hai --' : '-- Regular / Walk-in Customer --'}
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - Due: ₹{c.currentDue}
                </option>
              ))}
            </select>
          </div>

          {/* Financial Calculation */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Amount</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 items-center">
              <span>Discount</span>
              <div className="flex items-center gap-1">
                <span>₹</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-16 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-right font-bold text-xs"
                />
              </div>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
              <span className="font-bold text-slate-800">Final Payable</span>
              <span className="text-base font-extrabold text-indigo-600">₹{netPayable.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs shadow-md shadow-indigo-100 transition"
          >
            Complete Bill & Minus Stock
          </button>
        </div>
      </div>
    </div>
  );
}