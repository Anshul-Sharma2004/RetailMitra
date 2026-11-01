import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  Package,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ArrowUpCircle,
  CheckCircle2
} from 'lucide-react';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ text: '', isError: false });

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
      console.error("Products fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 1. Refill Button Click: Data Auto-fill in Modal
  const openRefillForItem = (product) => {
    setRefillItem({
      ...product
    });
    setAddedStockQty('');
    setShowRefillModal(true);
  };

  // 2. Submit Refill: Increases Stock Quantity in Database
  const handleConfirmRefill = async (e) => {
    e.preventDefault();
    if (!refillItem || !addedStockQty || Number(addedStockQty) <= 0) {
      alert("Kripya valid refill quantity enter karein!");
      return;
    }

    try {
      const currentQty = Number(refillItem.stockQuantity);
      const refillQty = Number(addedStockQty);
      const newTotalStock = currentQty + refillQty;

      // Backend PUT /products/{id} API Call
      await api.updateProduct(refillItem.id, {
        name: refillItem.name,
        barcode: refillItem.barcode,
        unit: refillItem.unit,
        costPrice: Number(refillItem.costPrice),
        sellingPrice: Number(refillItem.sellingPrice),
        stockQuantity: newTotalStock,
        minThreshold: Number(refillItem.minThreshold)
      });

      setStatusMsg({
        text: `Stock Refilled! ${refillItem.name} me +${refillQty} ${refillItem.unit} add ho gaye. Total Stock: ${newTotalStock}`,
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
    const confirmDelete = window.confirm(`Kya aap sach me "${name}" ko inventory se permanently delete karna chahte hain?`);
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await api.deleteProduct(id);
      setStatusMsg({
        text: `Product "${name}" successfully delete ho gaya!`,
        isError: false
      });
      // Instant UI update
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
      await api.addProduct({
        ...newProd,
        costPrice: Number(newProd.costPrice),
        sellingPrice: Number(newProd.sellingPrice),
        stockQuantity: Number(newProd.stockQuantity),
        minThreshold: Number(newProd.minThreshold),
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
      setStatusMsg({ text: 'Naya product inventory me successfully add ho gaya!', isError: false });
    } catch (err) {
      alert('Error adding product: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Inventory Ledger & Stock Refill</h2>
          <p className="text-xs text-slate-400">Manage real-time shop stock levels and instant replenishment</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchProducts}
            className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition shadow-sm"
          >
            <Plus size={15} /> Add New SKU
          </button>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 ${
          statusMsg.isError ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg({ text: '', isError: false })}
            className="text-[10px] font-bold underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Inventory Table with Refill & Delete Actions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Item Details</th>
              <th className="py-3.5 px-4">Barcode</th>
              <th className="py-3.5 px-4 text-right">Cost Price</th>
              <th className="py-3.5 px-4 text-right">Selling Price</th>
              <th className="py-3.5 px-4 text-center">Available Stock</th>
              <th className="py-3.5 px-4 text-center">Alert Status</th>
              <th className="py-3.5 px-4 text-center">Stock Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  No products registered in your store inventory yet.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isLow = Number(p.stockQuantity) <= Number(p.minThreshold);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{p.name}</div>
                      <div className="text-[10px] text-slate-400">Unit: {p.unit}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{p.barcode || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-right text-slate-600">₹{Number(p.costPrice).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">₹{Number(p.sellingPrice).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800 text-sm">{p.stockQuantity}</span>
                      <span className="text-[10px] text-slate-400 ml-1 font-semibold">{p.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          <AlertTriangle size={11} /> LOW STOCK
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                          IN STOCK
                        </span>
                      )}
                    </td>

                    {/* Stock Refill & Delete Action Triggers */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openRefillForItem(p)}
                          className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl font-bold text-[11px] transition shadow-xs"
                        >
                          <ArrowUpCircle size={14} /> Refill Stock
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          disabled={deletingId === p.id}
                          title="Delete Product"
                          className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition disabled:opacity-50"
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

      {/* Auto-filled Refill Modal */}
      {showRefillModal && refillItem && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle className="text-indigo-600" size={20} />
              <h3 className="text-base font-bold text-slate-800">Refill Stock for Shop</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Item data automatically fetched from row</p>

            <form onSubmit={handleConfirmRefill} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  disabled
                  value={refillItem.name}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Barcode / SKU</label>
                  <input
                    type="text"
                    disabled
                    value={refillItem.barcode || 'N/A'}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-mono cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Current Stock in DB</label>
                  <input
                    type="text"
                    disabled
                    value={`${refillItem.stockQuantity} ${refillItem.unit}`}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-indigo-700 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl">
                <label className="block text-indigo-950 font-bold mb-1">
                  Kitna Stock Dukaan Me Add Karna Hai? (+ Qty)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    placeholder="e.g. 10"
                    value={addedStockQty}
                    onChange={(e) => setAddedStockQty(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="font-bold text-indigo-600 px-2">{refillItem.unit}</span>
                </div>
                {addedStockQty && Number(addedStockQty) > 0 && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-2">
                    ✔ Total naya stock hoga: <strong className="font-bold">{Number(refillItem.stockQuantity) + Number(addedStockQty)} {refillItem.unit}</strong>
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefillModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition"
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
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-4">Register New SKU in Inventory</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortune Mustard Oil 1L"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Barcode / SKU</label>
                  <input
                    type="text"
                    placeholder="890123456001"
                    value={newProd.barcode}
                    onChange={(e) => setNewProd({ ...newProd, barcode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Unit</label>
                  <select
                    value={newProd.unit}
                    onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
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
                  <label className="block text-slate-600 font-semibold mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="120.00"
                    value={newProd.costPrice}
                    onChange={(e) => setNewProd({ ...newProd, costPrice: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={newProd.sellingPrice}
                    onChange={(e) => setNewProd({ ...newProd, sellingPrice: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Initial Stock Qty</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="20.00"
                    value={newProd.stockQuantity}
                    onChange={(e) => setNewProd({ ...newProd, stockQuantity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Min Threshold Alert</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5.00"
                    value={newProd.minThreshold}
                    onChange={(e) => setNewProd({ ...newProd, minThreshold: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm"
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