import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  ShoppingBag,
  Receipt,
  UserPlus,
  Sparkles,
  Clock,
  Smartphone,
  Banknote,
  BookOpen,
  Printer,
  RefreshCw,
  TrendingUp,
  Layers,
  Zap,
  ArrowUpRight
} from 'lucide-react';

// Smooth Animated Number Hook (Overview jaisa live counting effect)
function AnimatedNumber({ value, prefix = '', decimals = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    let start = 0;
    const duration = 500;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}
    </span>
  );
}

export default function BillingPOS() {
  const { user } = useAuth();

  // Dynamic Backend States
  const [availableProducts, setAvailableProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [todayStats, setTodayStats] = useState({
    sales: 0,
    bills: 0,
    lowStockCount: 0,
    totalSkus: 0
  });

  // Loading & Animation States
  const [initialLoading, setInitialLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [justAddedId, setJustAddedId] = useState(null);

  // Search & Selection States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState(1);

  // Cart & Payment States
  const [cartItems, setCartItems] = useState([]);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [cashReceived, setCashReceived] = useState('');

  // Quick New Udhaar Customer Form
  const [showQuickCustForm, setShowQuickCustForm] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', phone: '', email: '' });

  // Status & Receipt Modal
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', isError: false });
  const [lastReceipt, setLastReceipt] = useState(null);

  // Page Open Hote Hi Live Data Load Karein
  const loadTerminalData = async (isManual = false) => {
    if (isManual) setSyncing(true);
    try {
      const [prodRes, custRes, dashRes] = await Promise.all([
        api.getProducts(),
        api.getCustomers(),
        api.getDashboardOverview(7)
      ]);
      setAvailableProducts(prodRes.data || []);
      setCustomers(custRes.data || []);
      if (dashRes.data) {
        setRecentBills(dashRes.data.recentSales || []);
        setTodayStats({
          sales: dashRes.data.todaySales || 0,
          bills: dashRes.data.todayBillCount || 0,
          lowStockCount: dashRes.data.lowStockCount || 0,
          totalSkus: dashRes.data.totalSkus || (prodRes.data?.length || 0)
        });
      }
    } catch (err) {
      console.error('Terminal data load error:', err);
    } finally {
      setInitialLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadTerminalData();
  }, []);

  // Add Product to Cart with Lucide Visual Pop Feedback
  const addProductToCart = (product, addQty = 1) => {
    if (!product) return;
    if (Number(product.stockQuantity) <= 0) {
      setStatusMsg({ text: `${product.name} out of stock hai!`, isError: true });
      return;
    }

    setStatusMsg({ text: '', isError: false });
    const existingIndex = cartItems.findIndex((i) => i.productId === product.id);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].quantity + Number(addQty);
      if (newQty > Number(product.stockQuantity)) {
        setStatusMsg({
          text: `Sirf ${product.stockQuantity} ${product.unit} stock mein available hai!`,
          isError: true
        });
        return;
      }
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].subtotal = newQty * Number(product.sellingPrice);
      setCartItems(updated);
    } else {
      if (Number(addQty) > Number(product.stockQuantity)) {
        setStatusMsg({
          text: `Sirf ${product.stockQuantity} ${product.unit} stock mein available hai!`,
          isError: true
        });
        return;
      }
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          maxStock: Number(product.stockQuantity),
          rate: Number(product.sellingPrice),
          quantity: Number(addQty),
          subtotal: Number(addQty) * Number(product.sellingPrice)
        }
      ]);
    }

    // Trigger quick card flash animation
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 450);
  };

  const handleDropdownAdd = () => {
    if (!selectedProductId) return;
    const prod = availableProducts.find((p) => p.id === Number(selectedProductId));
    addProductToCart(prod, qty);
    setSelectedProductId('');
    setQty(1);
  };

  const updateCartQty = (index, delta) => {
    const updated = [...cartItems];
    const item = updated[index];
    const nextQty = item.quantity + delta;

    if (nextQty <= 0) {
      setCartItems(cartItems.filter((_, i) => i !== index));
      return;
    }
    if (nextQty > item.maxStock) {
      setStatusMsg({ text: `Max available stock: ${item.maxStock} ${item.unit}`, isError: true });
      return;
    }
    item.quantity = nextQty;
    item.subtotal = nextQty * item.rate;
    setCartItems(updated);
  };

  const handleQuickCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addCustomer({
        name: newCust.name,
        phone: newCust.phone,
        email: newCust.email,
        currentDue: 0,
        creditLimit: 5000
      });
      const updatedCusts = await api.getCustomers();
      setCustomers(updatedCusts.data || []);
      if (res.data?.id) setSelectedCustomerId(String(res.data.id));
      setNewCust({ name: '', phone: '', email: '' });
      setShowQuickCustForm(false);
      setStatusMsg({ text: 'Naya Udhaar Grahak add ho gaya!', isError: false });
    } catch (err) {
      setStatusMsg({ text: err.response?.data?.message || 'Customer add fail hua', isError: true });
    }
  };

  // Calculations
  const subtotalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const finalPayable = Math.max(0, subtotalAmount - Number(discount || 0));
  const changeToReturn = cashReceived ? Math.max(0, Number(cashReceived) - finalPayable) : 0;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setStatusMsg({ text: 'Pehle cart mein kam se kam 1 item add karein.', isError: true });
      return;
    }
    if (paymentMode === 'UDHAAR' && !selectedCustomerId) {
      setStatusMsg({ text: 'Udhaar bill ke liye Customer select ya add karein.', isError: true });
      return;
    }

    setSubmitting(true);
    setStatusMsg({ text: '', isError: false });

    const payload = {
      customerId: selectedCustomerId ? Number(selectedCustomerId) : null,
      paymentMode: paymentMode,
      discountAmount: Number(discount || 0),
      items: cartItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity
      }))
    };

    try {
      const res = await api.createSale(payload);
      const custObj = customers.find((c) => c.id === Number(selectedCustomerId));

      setLastReceipt({
        invoiceNo: res.data?.invoiceNo || `INV-${Date.now().toString().slice(-5)}`,
        customerName: custObj ? custObj.name : 'Walk-in Customer',
        paymentMode,
        items: [...cartItems],
        subtotal: subtotalAmount,
        discount: Number(discount || 0),
        total: finalPayable,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });

      setCartItems([]);
      setDiscount(0);
      setCashReceived('');
      setStatusMsg({ text: 'Bill generate ho gaya aur PostgreSQL stock update ho chuka hai!', isError: false });
      loadTerminalData(true);
    } catch (err) {
      setStatusMsg({
        text: err.response?.data?.message || 'Billing fail hui. Kripya dobara try karein.',
        isError: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQuickProducts = availableProducts
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 8);

  // Smooth Loading State (Overview Page Jaisa)
  if (initialLoading) {
    return (
      <div className="p-8 bg-[#FFF8EF] min-h-screen flex items-center justify-center">
        <div className="bg-white border border-[#DDD3D3] px-6 py-4 rounded-2xl shadow-xs flex items-center gap-3 text-xs font-bold text-[#3A2A2D]">
          <RefreshCw size={18} className="animate-spin text-[#7A535A]" />
          <span>Syncing Live POS Counter & Inventory with PostgreSQL...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-[#FFF8EF] min-h-screen text-[#3A2A2D] transition-all duration-300">
      {/* 1. TOP REGISTERED SHOP COUNTER & ANIMATED LIVE SHIFT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Shop Counter Identity Card (5 Cols) */}
        <div className="md:col-span-5 bg-white border border-[#DDD3D3] rounded-2xl p-5 shadow-xs hover:border-[#C88A93] transition-all duration-300 group flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F2D2D4]/70 border border-[#C88A93]/40 flex items-center justify-center text-[#7A535A] group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
              <Store size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C88A93]">
                  Active POS Counter
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE
                </span>
              </div>
              <h2 className="text-base font-extrabold text-[#3A2A2D] mt-0.5">
                {user?.shopName || 'Anshul Kiryana store'}
              </h2>
              <p className="text-[11px] text-[#5D6B6B]">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Live Metric Card 1: Today's Counter Collection */}
        <div className="md:col-span-3 bg-white border border-[#DDD3D3] rounded-2xl p-5 shadow-xs hover:-translate-y-0.5 hover:border-[#B0D7D8] transition-all duration-300 group">
          <div className="flex items-center justify-between text-[#5D6B6B] mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Sales</span>
            <div className="p-1.5 rounded-lg bg-[#D5E5E5]/70 text-[#3A2A2D] group-hover:scale-110 transition-transform">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="text-xl font-black text-[#3A2A2D]">
            <AnimatedNumber value={todayStats.sales} prefix="₹" decimals={2} />
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <Zap size={11} /> Live counter collection
          </p>
        </div>

        {/* Live Metric Card 2: Bills Generated Today */}
        <div className="md:col-span-2 bg-white border border-[#DDD3D3] rounded-2xl p-5 shadow-xs hover:-translate-y-0.5 hover:border-[#C88A93] transition-all duration-300 group">
          <div className="flex items-center justify-between text-[#5D6B6B] mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Bills</span>
            <div className="p-1.5 rounded-lg bg-[#F2D2D4]/70 text-[#7A535A] group-hover:rotate-12 transition-transform">
              <Receipt size={15} />
            </div>
          </div>
          <div className="text-xl font-black text-[#7A535A]">
            <AnimatedNumber value={todayStats.bills} /> Bills
          </div>
          <p className="text-[11px] text-[#5D6B6B] font-medium mt-1">Generated today</p>
        </div>

        {/* Live Metric Card 3: Ready SKUs */}
        <div className="md:col-span-2 bg-[#F1F7F7] border border-[#B0D7D8] rounded-2xl p-5 shadow-xs hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center justify-between text-[#5D6B6B] mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Catalog</span>
            <div className="p-1.5 rounded-lg bg-white text-[#3A2A2D] group-hover:scale-110 transition-transform">
              <Layers size={15} />
            </div>
          </div>
          <div className="text-xl font-black text-[#3A2A2D]">
            <AnimatedNumber value={availableProducts.length} /> SKUs
          </div>
          <p className="text-[11px] text-[#5D6B6B] font-medium mt-1">
            {todayStats.lowStockCount} Low stock
          </p>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: LEFT CHECKOUT + RIGHT PAYMENT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDE (8 Cols): Product Selector, Quick-Pick Cards & Cart */}
        <div className="lg:col-span-8 space-y-5">
          {/* Checkout Terminal Card */}
          <div className="bg-white border border-[#DDD3D3] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F7F7] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F1F7F7] text-[#7A535A]">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#3A2A2D]">Checkout Terminal</h3>
                  <p className="text-xs text-[#5D6B6B]">
                    Select item from dropdown or tap Quick-Pick cards below
                  </p>
                </div>
              </div>

              <button
                onClick={() => loadTerminalData(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#3A2A2D] bg-[#F1F7F7] hover:bg-[#D5E5E5] px-3.5 py-2 rounded-xl transition group"
              >
                <RefreshCw
                  size={13}
                  className={`text-[#7A535A] ${syncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}
                />
                {syncing ? 'Syncing...' : 'Sync Stock'}
              </button>
            </div>

            {/* Dropdown + Qty + Add Button */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-1 bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#3A2A2D] focus:outline-none focus:border-[#7A535A] transition"
              >
                <option value="">-- Choose Product from Live Inventory ({availableProducts.length}) --</option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id} disabled={Number(p.stockQuantity) <= 0}>
                    {p.name} — ₹{p.sellingPrice} (Stock: {p.stockQuantity} {p.unit})
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-20 bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2.5 text-xs font-extrabold text-center text-[#3A2A2D]"
                />
                <button
                  onClick={handleDropdownAdd}
                  className="flex items-center gap-1.5 bg-[#7A535A] hover:bg-[#3A2A2D] active:scale-95 text-[#FFF8EF] font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs group"
                >
                  <Plus size={15} className="group-hover:rotate-90 transition-transform duration-200" />
                  Add Item
                </button>
              </div>
            </div>

            {/* Cart Items Table / Empty State */}
            <div className="border border-[#DDD3D3]/80 rounded-2xl overflow-hidden">
              {cartItems.length === 0 ? (
                <div className="py-10 px-4 text-center bg-[#F1F7F7]/40 space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#F2D2D4]/70 text-[#7A535A] flex items-center justify-center mx-auto animate-bounce">
                    <ShoppingBag size={22} />
                  </div>
                  <p className="text-xs font-extrabold text-[#3A2A2D]">Cart abhi khali hai</p>
                  <p className="text-[11px] text-[#5D6B6B]">
                    Upar dropdown se item select karein ya neeche Fast-Moving cards par tap karein
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F1F7F7] text-[#5D6B6B] font-bold uppercase text-[10px] border-b border-[#DDD3D3]">
                    <tr>
                      <th className="py-3 px-4">Item Name</th>
                      <th className="py-3 px-3 text-right">Rate</th>
                      <th className="py-3 px-3 text-center">Quantity</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F7F7]">
                    {cartItems.map((item, idx) => (
                      <tr
                        key={item.productId}
                        className="hover:bg-[#FFF8EF]/70 transition-colors duration-150"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#3A2A2D]">{item.name}</div>
                          <div className="text-[10px] text-[#5D6B6B]">
                            Available: {item.maxStock} {item.unit}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-[#5D6B6B]">
                          ₹{item.rate.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => updateCartQty(idx, -1)}
                              className="w-6 h-6 rounded-lg bg-[#F1F7F7] hover:bg-[#F7CBCA] active:scale-90 text-[#3A2A2D] flex items-center justify-center font-bold transition"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-extrabold text-[#3A2A2D] w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty(idx, 1)}
                              className="w-6 h-6 rounded-lg bg-[#F1F7F7] hover:bg-[#D5E5E5] active:scale-90 text-[#3A2A2D] flex items-center justify-center font-bold transition"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-[#3A2A2D]">
                          ₹{item.subtotal.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setCartItems(cartItems.filter((_, i) => i !== idx))}
                            className="p-1.5 rounded-lg text-[#C88A93] hover:text-rose-600 hover:bg-rose-50 transition"
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

          {/* Quick-Pick Fast Moving Items Grid with Lucide Hover & Tap Effects */}
          <div className="bg-white border border-[#DDD3D3] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#F2D2D4]/70 text-[#7A535A]">
                  <Sparkles size={15} className="animate-pulse" />
                </div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#3A2A2D]">
                  Quick-Pick Store Items (1-Click Add)
                </h4>
              </div>

              <div className="relative w-52">
                <Search size={13} className="absolute left-3 top-2.5 text-[#5D6B6B]" />
                <input
                  type="text"
                  placeholder="Search quick items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F1F7F7] border border-[#DDD3D3] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#3A2A2D] focus:outline-none focus:border-[#7A535A]"
                />
              </div>
            </div>

            {filteredQuickProducts.length === 0 ? (
              <p className="text-xs text-[#5D6B6B] py-4 text-center">
                Inventory mein products add karein taaki yahan live quick-pick cards dikhein.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {filteredQuickProducts.map((prod) => {
                  const isOut = Number(prod.stockQuantity) <= 0;
                  const isLow = Number(prod.stockQuantity) <= Number(prod.minThreshold || 5);
                  const isFlashing = justAddedId === prod.id;

                  return (
                    <button
                      key={prod.id}
                      disabled={isOut}
                      onClick={() => addProductToCart(prod, 1)}
                      className={`group text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                        isOut
                          ? 'bg-slate-50 border-[#DDD3D3] opacity-50 cursor-not-allowed'
                          : isFlashing
                          ? 'bg-[#D5E5E5] border-[#7A535A] scale-95 shadow-inner'
                          : 'bg-[#FFF8EF]/70 hover:bg-[#F2D2D4]/40 border-[#DDD3D3] hover:border-[#C88A93] hover:-translate-y-0.5 shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              isOut
                                ? 'bg-slate-200 text-slate-600'
                                : isLow
                                ? 'bg-[#F7CBCA] text-[#7A535A]'
                                : 'bg-[#D5E5E5] text-[#3A2A2D]'
                            }`}
                          >
                            {isOut ? 'OUT' : `${prod.stockQuantity} ${prod.unit}`}
                          </span>
                          <span className="w-5 h-5 rounded-full bg-white border border-[#DDD3D3] flex items-center justify-center text-[#7A535A] group-hover:bg-[#7A535A] group-hover:text-white group-hover:rotate-90 transition-all duration-200">
                            <Plus size={11} />
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#3A2A2D] line-clamp-1">{prod.name}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-extrabold text-[#7A535A]">
                          ₹{Number(prod.sellingPrice).toFixed(2)}
                        </p>
                        {isFlashing && (
                          <span className="text-[10px] font-extrabold text-emerald-700">+1 Added</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE (4 Cols): Payment, Customer & Balance Calculator */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-[#DDD3D3] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#F1F7F7] pb-3">
              <h3 className="text-base font-extrabold text-[#3A2A2D]">Payment & Customer</h3>
              <span className="text-[10px] font-bold text-[#5D6B6B] bg-[#F1F7F7] px-2.5 py-1 rounded-full">
                {cartItems.length} Items
              </span>
            </div>

            {/* Payment Mode Selector with Lucide Icon Animations */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5D6B6B] block mb-2">
                Payment Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CASH', label: 'CASH', icon: Banknote },
                  { id: 'UPI', label: 'UPI', icon: Smartphone },
                  { id: 'UDHAAR', label: 'UDHAAR', icon: BookOpen }
                ].map((mode) => {
                  const Icon = mode.icon;
                  const active = paymentMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMode(mode.id)}
                      className={`group py-2.5 px-2 rounded-xl text-xs font-extrabold border flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                        active
                          ? 'bg-[#7A535A] text-[#FFF8EF] border-[#7A535A] shadow-sm scale-[1.02]'
                          : 'bg-[#F1F7F7]/60 text-[#5D6B6B] border-[#DDD3D3] hover:bg-[#D5E5E5]/60'
                      }`}
                    >
                      <Icon
                        size={16}
                        className={active ? 'scale-110 transition-transform' : 'group-hover:scale-110 transition-transform'}
                      />
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer Selector + Quick Add Option */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5D6B6B]">
                  Customer (Grahak) {paymentMode === 'UDHAAR' && <span className="text-rose-600">*</span>}
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickCustForm(!showQuickCustForm)}
                  className="text-[11px] font-bold text-[#7A535A] hover:underline flex items-center gap-1"
                >
                  <UserPlus size={12} /> {showQuickCustForm ? 'Close' : '+ New Customer'}
                </button>
              </div>

              {showQuickCustForm ? (
                <form
                  onSubmit={handleQuickCreateCustomer}
                  className="p-3.5 bg-[#FFF8EF] border border-[#C88A93] rounded-xl space-y-2.5 text-xs mb-2 transition-all"
                >
                  <input
                    type="text"
                    required
                    placeholder="Grahak ka Naam *"
                    value={newCust.name}
                    onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                    className="w-full bg-white border border-[#DDD3D3] rounded-lg px-2.5 py-1.5"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number *"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    className="w-full bg-white border border-[#DDD3D3] rounded-lg px-2.5 py-1.5"
                  />
                  <input
                    type="email"
                    placeholder="Email (For Udhaar Reminders)"
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    className="w-full bg-white border border-[#DDD3D3] rounded-lg px-2.5 py-1.5"
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#7A535A] hover:bg-[#3A2A2D] text-[#FFF8EF] font-bold py-1.5 rounded-lg text-xs transition"
                  >
                    Save & Select Customer
                  </button>
                </form>
              ) : (
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2.5 text-xs font-medium text-[#3A2A2D] focus:outline-none focus:border-[#7A535A]"
                >
                  <option value="">-- Regular / Walk-in Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) — Due: ₹{Number(c.currentDue || 0).toFixed(0)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Bill Summary Box */}
            <div className="bg-[#F1F7F7]/80 border border-[#D5E5E5] rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-[#5D6B6B]">
                <span>Subtotal Amount</span>
                <span className="font-bold text-[#3A2A2D]">₹{subtotalAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-[#5D6B6B]">
                <span>Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-20 bg-white border border-[#DDD3D3] rounded-lg px-2 py-1 text-right font-bold text-[#3A2A2D]"
                />
              </div>

              <div className="pt-2.5 border-t border-[#D5E5E5] flex items-center justify-between">
                <span className="font-extrabold text-sm text-[#3A2A2D]">Final Payable</span>
                <span className="font-black text-lg text-[#7A535A]">₹{finalPayable.toFixed(2)}</span>
              </div>
            </div>

            {/* Cash Change Calculator */}
            {paymentMode === 'CASH' && finalPayable > 0 && (
              <div className="bg-[#FFF8EF] border border-[#DDD3D3] rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#5D6B6B] block">Cash Received (₹)</span>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-24 mt-1 bg-white border border-[#DDD3D3] rounded-lg px-2 py-1 font-bold text-[#3A2A2D]"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#5D6B6B] block">Return Change</span>
                  <span className="text-sm font-extrabold text-emerald-700">
                    ₹{changeToReturn.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Status Alert */}
            {statusMsg.text && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 border transition-all ${
                  statusMsg.isError
                    ? 'bg-[#F7CBCA]/60 border-[#C88A93] text-[#3A2A2D]'
                    : 'bg-[#D5E5E5]/70 border-[#B0D7D8] text-[#3A2A2D]'
                }`}
              >
                {statusMsg.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} className="text-emerald-700" />}
                <span className="font-medium">{statusMsg.text}</span>
              </div>
            )}

            {/* Primary Checkout CTA */}
            <button
              onClick={handleCheckout}
              disabled={submitting || cartItems.length === 0}
              className="group w-full bg-[#7A535A] hover:bg-[#3A2A2D] active:scale-[0.99] disabled:opacity-50 text-[#FFF8EF] font-extrabold py-3.5 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Receipt size={16} className="group-hover:rotate-6 transition-transform" />
              {submitting ? 'Processing Bill...' : 'Complete Bill & Minus Stock'}
              <ArrowUpRight size={14} className="opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Last Generated Mini Receipt Card */}
          {lastReceipt && (
            <div className="bg-white border-2 border-dashed border-[#C88A93] rounded-2xl p-4 text-xs space-y-2 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#F1F7F7] pb-2">
                <span className="font-extrabold text-[#7A535A]">Last Receipt: {lastReceipt.invoiceNo}</span>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 text-[11px] font-bold bg-[#F1F7F7] px-2.5 py-1 rounded-lg text-[#3A2A2D] hover:bg-[#D5E5E5] transition"
                >
                  <Printer size={12} /> Print
                </button>
              </div>
              <div className="flex justify-between text-[#5D6B6B]">
                <span>
                  Customer: <strong className="text-[#3A2A2D]">{lastReceipt.customerName}</strong>
                </span>
                <span className="font-bold text-[#7A535A]">{lastReceipt.paymentMode}</span>
              </div>
              <div className="flex justify-between font-extrabold text-[#3A2A2D] pt-1">
                <span>Paid Amount ({lastReceipt.items.length} items)</span>
                <span>₹{lastReceipt.total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM CARD: RECENT COUNTER BILLS LOG (Dynamic Live Feed) */}
      <div className="bg-white border border-[#DDD3D3] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#F1F7F7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#7A535A]" />
            <h3 className="text-sm font-extrabold text-[#3A2A2D]">Recent Counter Bills</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 size={12} /> Live PostgreSQL Synced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1F7F7] text-[#5D6B6B] font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-6">Invoice No</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4 text-center">Payment Mode</th>
                <th className="py-3 px-4 text-center">Time</th>
                <th className="py-3 px-6 text-right">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F7F7]">
              {recentBills.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-[#5D6B6B]">
                    Abhi tak koi bill generate nahi hua hai. Upar se pehla bill banayein!
                  </td>
                </tr>
              ) : (
                recentBills.map((bill, index) => (
                  <tr key={index} className="hover:bg-[#FFF8EF]/70 transition-colors">
                    <td className="py-3 px-6 font-mono font-bold text-[#3A2A2D]">{bill.invoiceNo}</td>
                    <td className="py-3 px-4 font-semibold text-[#3A2A2D]">{bill.customerName}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          bill.paymentMode === 'UDHAAR'
                            ? 'bg-[#F7CBCA] text-[#3A2A2D]'
                            : 'bg-[#D5E5E5] text-[#3A2A2D]'
                        }`}
                      >
                        {bill.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-[#5D6B6B]">{bill.time}</td>
                    <td className="py-3 px-6 text-right font-extrabold text-[#7A535A]">
                      ₹{Number(bill.amount).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}