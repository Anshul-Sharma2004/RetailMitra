import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './api/client';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BillingPOS from './pages/BillingPOS';
import Inventory from './pages/Inventory';
import UdhaarKhata from './pages/UdhaarKhata';
import AiChatModal from './components/AiChatModal';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import { TrendingUp, AlertTriangle, Users, Package, RefreshCw } from 'lucide-react';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pos');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Dynamic Live Stats State
  const [stats, setStats] = useState({
    todaySales: 0,
    lowStockCount: 0,
    pendingUdhaar: 0,
    totalSkus: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Load stats whenever Dashboard tab is clicked or user logs in
  const fetchDashboardStats = async () => {
    if (!user) return;
    setStatsLoading(true);
    try {
      const res = await api.getDashboardStats();
      if (res && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [user, activeTab]);

  if (!user) {
    return (
      <>
        <HomePage onOpenAuth={() => setIsAuthOpen(true)} />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={() => {
            setIsAuthOpen(false);
            setActiveTab('pos');
          }}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAi={() => setIsAiOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenAi={() => setIsAiOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'pos' && <BillingPOS />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'udhaar' && <UdhaarKhata />}

          {/* Real-time Dynamic Store Performance Overview */}
          {activeTab === 'dashboard' && (
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Store Performance Overview</h2>
                  <p className="text-xs text-slate-400">
                    Live metrics for <strong className="text-slate-700">{user.shopName || user.email}</strong>
                  </p>
                </div>
                <button
                  onClick={fetchDashboardStats}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                >
                  <RefreshCw size={14} className={statsLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Today's Sales */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Today's Sales</span>
                    <TrendingUp size={16} className="text-emerald-500" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800">
                    ₹{Number(stats.todaySales || 0).toFixed(2)}
                  </h4>
                  <p className="text-[11px] text-emerald-600 mt-1 font-medium">Calculated from today's bills</p>
                </div>

                {/* 2. Low Stock Items */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Low Stock Items</span>
                    <AlertTriangle size={16} className="text-rose-500" />
                  </div>
                  <h4 className="text-2xl font-bold text-rose-600">
                    {stats.lowStockCount} SKUs
                  </h4>
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">Below minimum threshold</p>
                </div>

                {/* 3. Pending Udhaar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Pending Udhaar</span>
                    <Users size={16} className="text-amber-500" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800">
                    ₹{Number(stats.pendingUdhaar || 0).toFixed(2)}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">Total uncollected credit</p>
                </div>

                {/* 4. Total Store SKUs */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Total Inventory</span>
                    <Package size={16} className="text-indigo-500" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800">
                    {stats.totalSkus} Items
                  </h4>
                  <p className="text-[11px] text-indigo-600 mt-1 font-medium">Registered in your store</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <AiChatModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}