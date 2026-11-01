import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BookOpen,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenAi }) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'pos', label: 'Billing Counter', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory Stock', icon: Package },
    { id: 'udhaar', label: 'Udhaar Khata', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 min-h-screen">
      <div>
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <span className="font-extrabold text-lg">K</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">Khatavani<span className="text-indigo-600">.ai</span></h1>
            <span className="text-xs text-slate-400 font-medium tracking-wide">Retail OS v1.0</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50/80 text-indigo-700 shadow-sm shadow-indigo-100/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* AI Copilot Action Badge */}
        <div className="mt-8 px-2">
          <button
            onClick={onOpenAi}
            className="w-full relative overflow-hidden group bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white p-3.5 rounded-2xl shadow-lg shadow-indigo-200/60 hover:shadow-indigo-300/80 transition-all text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-100">Store Copilot</span>
              <Sparkles size={16} className="text-amber-300 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-white/95">Ask Khatavani AI</p>
            <p className="text-[11px] text-indigo-100/80">"Aaj kitni sale hui?"</p>
          </button>
        </div>
      </div>

      {/* Plan Tier Badge */}
      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span className="text-xs font-semibold text-slate-700">Pro Tier Active</span>
        </div>
        <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
          7D TRIAL
        </span>
      </div>
    </aside>
  );
}