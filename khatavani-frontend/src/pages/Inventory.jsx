import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  Package,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ArrowUpCircle,
  CheckCircle2,
  Search,
  TrendingUp,
  IndianRupee,
  History,
  Layers,
  Filter,
  Sparkles,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Smooth Animated Metric Counter
function AnimatedMetric({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    let current = 0;
    const duration = 500;
    const stepTime = 20;
    const increment = target / (duration / stepTime);

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}
      {suffix}
    </span>
  );
}

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ text: '', isError: false });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL | LOW | HEALTHY

  // Refill History Log (Persisted in localStorage + Live Updated)
  const [refillLogs, setRefillLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('khatavani_refill_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Add SKU Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    barcode: '',
    unit: 'KG',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: '',
    minThreshold: '5.00'
  });

  // Refill / Restock Modal States
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [refillItem, setRefillItem] = useState(null);
  const [addedStockQty, setAddedStockQty] = useState('');

  const saveRefillLog = (entry) => {
    const updated = [entry, ...refillLogs].slice(0, 15);
    setRefillLogs(updated);
    localStorage.setItem('khatavani_refill_logs', JSON.stringify(updated));
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts();
      if (res && Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Products fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 1. Refill Button Click: Data Auto-fill in Modal
  const openRefillForItem = (product) => {
    setRefillItem({ ...product });
    setAddedStockQty('');
    setShowRefillModal(true);
  };

  // 2. Submit Refill: Increases Stock Quantity in DB & Records Refill Timestamp
  const handleConfirmRefill = async (e) => {
    e.preventDefault();
    if (!refillItem || !addedStockQty || Number(addedStockQty) <= 0) {
      alert('Kripya valid refill quantity enter karein!');
      return;
    }

    try {
      const currentQty = Number(refillItem.stockQuantity);
      const refillQty = Number(addedStockQty);
      const newTotalStock = currentQty + refillQty;

      await api.updateProduct(refillItem.id, {
        name: refillItem.name,
        barcode: refillItem.barcode,
        unit: refillItem.unit,
        costPrice: Number(refillItem.costPrice),
        sellingPrice: Number(refillItem.sellingPrice),
        stockQuantity: newTotalStock,
        minThreshold: Number(refillItem.minThreshold)
      });

      const now = new Date();
      saveRefillLog({
        id: Date.now(),
        productId: refillItem.id,
        name: refillItem.name,
        unit: refillItem.unit,
        addedQty: refillQty,
        previousQty: currentQty,
        newTotal: newTotalStock,
        type: 'REFILL',
        date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });

      setStatusMsg({
        text: `Stock Refilled! ${refillItem.name} mein +${refillQty} ${refillItem.unit} add ho gaye. Total: ${newTotalStock} ${refillItem.unit}`,
        isError: false
      });

      setShowRefillModal(false);
      setRefillItem(null);
      fetchProducts();
    } catch (err) {
      setStatusMsg({
        text: err.response?.data?.message || err.message || 'Stock refill update fail hua.',
        isError: true
      });
    }
  };

  // 3. Delete Product Handler
  const handleDeleteProduct = async (id, name) => {
    const confirmDelete = window.confirm(
      `Kya aap sach mein "${name}" ko inventory se permanently delete karna chahte hain?`
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await api.deleteProduct(id);
      setStatusMsg({
        text: `Product "${name}" successfully delete ho gaya!`,
        isError: false
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setStatusMsg({
        text: err.response?.data?.message || err.message || 'Product delete nahi ho paya!',
        isError: true
      });
    } finally {
      setDeletingId(null);
    }
  };

  // 4. Create New SKU in Store
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addProduct({
        ...newProd,
        costPrice: Number(newProd.costPrice),
        sellingPrice: Number(newProd.sellingPrice),
        stockQuantity: Number(newProd.stockQuantity),
        minThreshold: Number(newProd.minThreshold)
      });

      const now = new Date();
      saveRefillLog({
        id: Date.now(),
        productId: res.data?.id || Date.now(),
        name: newProd.name,
        unit: newProd.unit,
        addedQty: Number(newProd.stockQuantity),
        previousQty: 0,
        newTotal: Number(newProd.stockQuantity),
        type: 'NEW_SKU',
        date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });

      setShowAddModal(false);
      setNewProd({
        name: '',
        barcode: '',
        unit: 'KG',
        costPrice: '',
        sellingPrice: '',
        stockQuantity: '',
        minThreshold: '5.00'
      });
      fetchProducts();
      setStatusMsg({ text: 'Naya product inventory mein successfully add ho gaya!', isError: false });
    } catch (err) {
      alert('Error adding product: ' + (err.response?.data?.message || err.message));
    }
  };

  // Dynamic Calculations for KPIs & Charts
  const totalCostValuation = products.reduce(
    (sum, p) => sum + Number(p.stockQuantity || 0) * Number(p.costPrice || 0),
    0
  );
  const totalRetailValuation = products.reduce(
    (sum, p) => sum + Number(p.stockQuantity || 0) * Number(p.sellingPrice || 0),
    0
  );
  const lowStockItems = products.filter(
    (p) => Number(p.stockQuantity) <= Number(p.minThreshold)
  );
  const healthyStockCount = products.length - lowStockItems.length;

  // Chart Data: Available Stock vs Alert Threshold
  const chartData = products.slice(0, 8).map((p) => ({
    name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
    available: Number(p.stockQuantity || 0),
    threshold: Number(p.minThreshold || 0)
  }));

  // Filtered Products for Ledger Table
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    const isLow = Number(p.stockQuantity) <= Number(p.minThreshold);

    if (stockFilter === 'LOW') return matchesSearch && isLow;
    if (stockFilter === 'HEALTHY') return matchesSearch && !isLow;
    return matchesSearch;
  });

  // Helper to get last refill info for a specific product
  const getLastRefillForProduct = (product) => {
    const found = refillLogs.find(
      (log) => log.productId === product.id || log.name === product.name
    );
    if (found) return `${found.date}, ${found.time} (+${found.addedQty} ${found.unit})`;
    if (product.updatedAt) {
      return new Date(product.updatedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    return 'Initial Stock';
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-[#FFF8EF] min-h-screen text-[#3A2A2D] transition-all duration-300">
      {/* 1. HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold tracking-tight text-[#3A2A2D]">
              Inventory Ledger & Stock Refill
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE STOCK
            </span>
          </div>
          <p className="text-xs text-[#5D6B6B] mt-0.5">
            Manage real-time shop stock levels, profit margins, and instant replenishment history
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProducts}
            className="group flex items-center gap-1.5 text-xs font-bold bg-[#F1F7F7] border border-[#DDD3D3] px-3.5 py-2.5 rounded-xl text-[#3A2A2D] hover:bg-[#D5E5E5] active:scale-95 transition-all"
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? 'animate-spin text-[#7A535A]'
                  : 'text-[#5D6B6B] group-hover:rotate-180 transition-transform duration-500'
              }
            />
            Refresh
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="group flex items-center gap-1.5 text-xs font-bold bg-[#7A535A] hover:bg-[#3A2A2D] active:scale-95 text-[#FFF8EF] px-4 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Plus size={15} className="group-hover:rotate-90 transition-transform duration-200" />
            Add New SKU
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMsg.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between gap-2 border ${
            statusMsg.isError
              ? 'bg-[#F7CBCA]/60 border-[#C88A93] text-[#3A2A2D]'
              : 'bg-[#D5E5E5]/80 border-[#B0D7D8] text-[#3A2A2D]'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {statusMsg.isError ? (
              <AlertTriangle size={16} className="text-[#7A535A]" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-700" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg({ text: '', isError: false })}
            className="text-[11px] font-bold underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. TOP 4 DYNAMIC INVENTORY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Stock Cost Valuation */}
        <div className="group bg-white p-5 rounded-2xl border border-[#DDD3D3] shadow-xs hover:-translate-y-0.5 hover:border-[#C88A93] transition-all duration-300">
          <div className="flex items-center justify-between text-[#5D6B6B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Stock Cost Value</span>
            <div className="p-2 rounded-xl bg-[#D5E5E5]/70 text-[#3A2A2D] group-hover:scale-110 group-hover:rotate-6 transition-transform">
              <IndianRupee size={15} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-[#3A2A2D]">
            <AnimatedMetric value={totalCostValuation} prefix="₹" decimals={2} />
          </h4>
          <p className="text-[11px] text-[#5D6B6B] mt-1 font-semibold">
            Invested capital in {products.length} SKUs
          </p>
        </div>

        {/* KPI 2: Projected Retail Value */}
        <div className="group bg-[#F1F7F7] p-5 rounded-2xl border border-[#B0D7D8] shadow-xs hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between text-[#5D6B6B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Retail Sale Value</span>
            <div className="p-2 rounded-xl bg-white text-[#7A535A] group-hover:scale-110 group-hover:-rotate-6 transition-transform">
              <TrendingUp size={15} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-[#7A535A]">
            <AnimatedMetric value={totalRetailValuation} prefix="₹" decimals={2} />
          </h4>
          <p className="text-[11px] text-emerald-700 mt-1 font-bold">
            Est. Profit: ₹{Math.max(0, totalRetailValuation - totalCostValuation).toFixed(0)}
          </p>
        </div>

        {/* KPI 3: Low / Out of Stock Alert */}
        <div
          onClick={() => setStockFilter(stockFilter === 'LOW' ? 'ALL' : 'LOW')}
          className="group bg-[#F7CBCA]/35 p-5 rounded-2xl border border-[#C88A93]/60 shadow-xs cursor-pointer hover:-translate-y-0.5 hover:bg-[#F7CBCA]/55 transition-all duration-300"
        >
          <div className="flex items-center justify-between text-[#7A535A] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Needs Refill</span>
            <div className="p-2 rounded-xl bg-[#F2D2D4] text-[#7A535A] group-hover:scale-110 transition-transform">
              <AlertTriangle size={15} className={lowStockItems.length > 0 ? 'animate-pulse' : ''} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-[#7A535A]">
            <AnimatedMetric value={lowStockItems.length} suffix=" SKUs" />
          </h4>
          <p className="text-[11px] text-[#7A535A] mt-1 font-bold">
            {stockFilter === 'LOW' ? 'Showing low stock (Click to reset)' : 'Click to filter low stock'}
          </p>
        </div>

        {/* KPI 4: Healthy Stock SKUs */}
        <div
          onClick={() => setStockFilter(stockFilter === 'HEALTHY' ? 'ALL' : 'HEALTHY')}
          className="group bg-white p-5 rounded-2xl border border-[#DDD3D3] shadow-xs cursor-pointer hover:-translate-y-0.5 hover:border-[#B0D7D8] transition-all duration-300"
        >
          <div className="flex items-center justify-between text-[#5D6B6B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Healthy Stock</span>
            <div className="p-2 rounded-xl bg-[#D5E5E5] text-[#3A2A2D] group-hover:scale-110 transition-transform">
              <Layers size={15} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-[#3A2A2D]">
            <AnimatedMetric value={healthyStockCount} suffix=" Items" />
          </h4>
          <p className="text-[11px] text-[#5D6B6B] mt-1 font-semibold">Above minimum threshold</p>
        </div>
      </div>

      {/* 3. VISUAL ANALYTICS & REFILL HISTORY TIMELINE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (7 Cols): Stock Level vs Alert Threshold Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#DDD3D3] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#3A2A2D]">
                Stock Availability vs Minimum Threshold
              </h3>
              <p className="text-[11px] text-[#5D6B6B]">
                Compare live available stock against reorder alert level per SKU
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7A535A] bg-[#F2D2D4]/60 px-2.5 py-1 rounded-full">
              <Sparkles size={11} /> Live Graph
            </span>
          </div>

          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#5D6B6B] bg-[#F1F7F7]/60 rounded-xl border border-dashed border-[#B0D7D8]">
                Add products to visualize stock levels vs threshold.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDD3D3" strokeOpacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5D6B6B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#5D6B6B' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF8EF',
                      borderRadius: '12px',
                      border: '1px solid #DDD3D3',
                      color: '#3A2A2D',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar
                    dataKey="available"
                    name="Available Stock"
                    fill="#7A535A"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  />
                  <Bar
                    dataKey="threshold"
                    name="Min Alert Level"
                    fill="#B0D7D8"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right (5 Cols): Stock Refill & Activity Log ("Kaunsa Item Kab Refill Hua") */}
        <div className="lg:col-span-5 bg-[#F1F7F7] p-6 rounded-2xl border border-[#DDD3D3] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white text-[#7A535A]">
                  <History size={16} />
                </div>
                <h3 className="text-sm font-extrabold text-[#3A2A2D]">Stock Refill & Restock Log</h3>
              </div>
              <span className="text-[10px] font-bold text-[#5D6B6B] bg-white px-2.5 py-0.5 rounded-full border border-[#DDD3D3]">
                {refillLogs.length} Logs
              </span>
            </div>
            <p className="text-[11px] text-[#5D6B6B] mb-4">
              Kaunsa item kab aur kitna refill hua (Live Audit Trail)
            </p>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {refillLogs.length === 0 ? (
                <div className="bg-white/80 border border-dashed border-[#B0D7D8] rounded-xl p-5 text-center space-y-1.5">
                  <Clock size={18} className="mx-auto text-[#7A535A]" />
                  <p className="text-xs font-bold text-[#3A2A2D]">Abhi tak koi refill record nahi hai</p>
                  <p className="text-[11px] text-[#5D6B6B]">
                    Neeche table mein kisi bhi item par <strong>"Refill Stock"</strong> dabayein — date, time aur added qty yahan turant record hogi!
                  </p>
                </div>
              ) : (
                refillLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white border border-[#DDD3D3] rounded-xl p-3 flex items-center justify-between text-xs hover:border-[#C88A93] transition"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[#3A2A2D]">{log.name}</span>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            log.type === 'REFILL'
                              ? 'bg-[#D5E5E5] text-[#3A2A2D]'
                              : 'bg-[#F2D2D4] text-[#7A535A]'
                          }`}
                        >
                          {log.type === 'REFILL' ? 'REFILLED' : 'NEW ITEM'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#5D6B6B] mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> {log.date} at {log.time}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-emerald-700">
                        +{log.addedQty} {log.unit}
                      </div>
                      <div className="text-[10px] text-[#5D6B6B] font-semibold">
                        Total: {log.newTotal} {log.unit}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DDD3D3] flex items-center justify-between text-[11px] text-[#5D6B6B]">
            <span className="font-bold text-[#3A2A2D]">Instant DB Replenishment</span>
            <span>Auto-logged</span>
          </div>
        </div>
      </div>

      {/* 4. FILTER BAR + UPGRADED INVENTORY LEDGER TABLE */}
      <div className="bg-white border border-[#DDD3D3] rounded-2xl overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="px-6 py-4 bg-[#F1F7F7]/60 border-b border-[#DDD3D3] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-[#7A535A]" />
            <h3 className="text-sm font-extrabold text-[#3A2A2D]">
              Complete Store Inventory ({filteredProducts.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-56">
              <Search size={13} className="absolute left-3 top-2.5 text-[#5D6B6B]" />
              <input
                type="text"
                placeholder="Search item or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#DDD3D3] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#3A2A2D] focus:outline-none focus:border-[#7A535A]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="bg-white border border-[#DDD3D3] rounded-xl p-1 flex text-[11px] font-bold">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'LOW', label: 'Low Stock' },
                { id: 'HEALTHY', label: 'In Stock' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStockFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    stockFilter === tab.id
                      ? 'bg-[#7A535A] text-[#FFF8EF]'
                      : 'text-[#5D6B6B] hover:text-[#3A2A2D]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8EF] border-b border-[#DDD3D3] text-[#5D6B6B] font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Item Details</th>
                <th className="py-3.5 px-4">Barcode</th>
                <th className="py-3.5 px-4 text-right">Cost / Selling</th>
                <th className="py-3.5 px-4 text-center">Margin</th>
                <th className="py-3.5 px-4 text-center">Available Stock</th>
                <th className="py-3.5 px-4">Last Refill Info</th>
                <th className="py-3.5 px-4 text-center">Alert Status</th>
                <th className="py-3.5 px-5 text-center">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD3D3]/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-[#5D6B6B]">
                    Koi product nahi mila. Upar "+ Add New SKU" se item register karein.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = Number(p.stockQuantity) <= Number(p.minThreshold);
                  const cost = Number(p.costPrice || 0);
                  const sell = Number(p.sellingPrice || 0);
                  const marginPct = cost > 0 ? Math.round(((sell - cost) / cost) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#FFF8EF]/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#3A2A2D]">{p.name}</div>
                        <div className="text-[10px] text-[#5D6B6B]">
                          Unit: {p.unit} • Min Alert: {p.minThreshold}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#5D6B6B] font-mono text-[11px]">
                        {p.barcode || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-extrabold text-[#3A2A2D]">₹{sell.toFixed(2)}</div>
                        <div className="text-[10px] text-[#5D6B6B]">Cost: ₹{cost.toFixed(2)}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F1F7F7] text-[#3A2A2D] border border-[#D5E5E5]">
                          +{marginPct}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-black text-[#3A2A2D] text-sm">{p.stockQuantity}</span>
                        <span className="text-[10px] text-[#5D6B6B] ml-1 font-bold">{p.unit}</span>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-[#5D6B6B] font-medium">
                        {getLastRefillForProduct(p)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 bg-[#F7CBCA]/70 text-[#7A535A] border border-[#C88A93] px-2.5 py-0.5 rounded-full font-extrabold text-[10px]">
                            <AlertTriangle size={11} /> LOW STOCK
                          </span>
                        ) : (
                          <span className="bg-[#D5E5E5] text-[#3A2A2D] border border-[#B0D7D8] px-2.5 py-0.5 rounded-full font-extrabold text-[10px]">
                            IN STOCK
                          </span>
                        )}
                      </td>

                      {/* Stock Refill & Delete Action Triggers */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openRefillForItem(p)}
                            className="group inline-flex items-center gap-1.5 bg-[#F2D2D4]/70 hover:bg-[#7A535A] text-[#7A535A] hover:text-[#FFF8EF] border border-[#C88A93] px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all shadow-2xs"
                          >
                            <ArrowUpCircle
                              size={14}
                              className="group-hover:-translate-y-0.5 transition-transform"
                            />
                            Refill Stock
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            disabled={deletingId === p.id}
                            title="Delete Product"
                            className="p-1.5 rounded-xl border border-[#DDD3D3] bg-[#FFF8EF] text-[#C88A93] hover:bg-rose-600 hover:text-white hover:border-rose-600 transition disabled:opacity-50"
                          >
                            <Trash2 size={14} className={deletingId === p.id ? 'animate-spin' : ''} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto-filled Refill Modal */}
      {showRefillModal && refillItem && (
        <div className="fixed inset-0 bg-[#3A2A2D]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[#DDD3D3]">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-[#F2D2D4] text-[#7A535A]">
                <ArrowUpCircle size={18} />
              </div>
              <h3 className="text-base font-extrabold text-[#3A2A2D]">Refill Stock for Shop</h3>
            </div>
            <p className="text-xs text-[#5D6B6B] mb-4">Item data automatically fetched from row</p>

            <form onSubmit={handleConfirmRefill} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#5D6B6B] font-bold mb-1">Product Name</label>
                <input
                  type="text"
                  disabled
                  value={refillItem.name}
                  className="w-full bg-[#F1F7F7] border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D] font-bold cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5D6B6B] font-bold mb-1">Barcode / SKU</label>
                  <input
                    type="text"
                    disabled
                    value={refillItem.barcode || 'N/A'}
                    className="w-full bg-[#F1F7F7] border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D] font-mono cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[#5D6B6B] font-bold mb-1">Current Stock in DB</label>
                  <input
                    type="text"
                    disabled
                    value={`${refillItem.stockQuantity} ${refillItem.unit}`}
                    className="w-full bg-[#F1F7F7] border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#7A535A] font-extrabold cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="bg-[#FFF8EF] border border-[#C88A93] p-3.5 rounded-xl">
                <label className="block text-[#3A2A2D] font-extrabold mb-1">
                  Kitna Stock Dukaan Mein Add Karna Hai? (+ Qty)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    placeholder="e.g. 25"
                    value={addedStockQty}
                    onChange={(e) => setAddedStockQty(e.target.value)}
                    className="w-full bg-white border border-[#DDD3D3] rounded-xl px-3 py-2.5 text-sm font-extrabold text-[#3A2A2D] focus:outline-none focus:border-[#7A535A]"
                  />
                  <span className="font-extrabold text-[#7A535A] px-2">{refillItem.unit}</span>
                </div>
                {addedStockQty && Number(addedStockQty) > 0 && (
                  <p className="text-[11px] text-emerald-700 font-bold mt-2">
                    ✔ Total naya stock hoga:{' '}
                    <strong>
                      {Number(refillItem.stockQuantity) + Number(addedStockQty)} {refillItem.unit}
                    </strong>
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefillModal(false)}
                  className="px-4 py-2 border border-[#DDD3D3] rounded-xl text-[#5D6B6B] font-bold hover:bg-[#F1F7F7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#7A535A] hover:bg-[#3A2A2D] text-[#FFF8EF] font-extrabold rounded-xl shadow-xs transition"
                >
                  Confirm & Increase Stock in DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add SKU Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#3A2A2D]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-[#DDD3D3]">
            <h3 className="text-base font-extrabold text-[#3A2A2D] mb-4">
              Register New SKU in Inventory
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5D6B6B] font-bold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortune Mustard Oil 1L"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5D6B6B] font-bold mb-1">Barcode / SKU</label>
                  <input
                    type="text"
                    placeholder="890123456001"
                    value={newProd.barcode}
                    onChange={(e) => setNewProd({ ...newProd, barcode: e.target.value })}
                    className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5D6B6B] font-bold mb-1">Unit</label>
                  <select
                    value={newProd.unit}
                    onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                    className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D]"
                  >
                    <option value="KG">KG</option>
                    <option value="LITRE">LITRE</option>
                    <option value="PACKET">PACKET</option>
                    <option value="PIECE">PIECE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5D6B6B] font-bold mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="120.00"
                    value={newProd.costPrice}
                    onChange={(e) => setNewProd({ ...newProd, costPrice: e.target.value })}
                    className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5D6B6B] font-bold mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={newProd.sellingPrice}
                    onChange={(e) => setNewProd({ ...newProd, sellingPrice: e.target.value })}
                    className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5D6B6B] font-bold mb-1">Initial Stock Qty</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="20.00"
                    value={newProd.stockQuantity}
                    onChange={(e) => setNewProd({ ...newProd, stockQuantity: e.target.value })}
                    className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5D6B6B] font-bold mb-1">Min Threshold Alert</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5.00"
                    value={newProd.minThreshold}
                    onChange={(e) => setNewProd({ ...newProd, minThreshold: e.target.value })}
                    className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D]"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#DDD3D3] rounded-xl text-[#5D6B6B] font-bold hover:bg-[#F1F7F7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7A535A] hover:bg-[#3A2A2D] text-[#FFF8EF] font-extrabold rounded-xl shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}