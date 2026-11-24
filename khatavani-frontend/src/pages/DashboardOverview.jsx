// import React, { useState, useEffect } from 'react';
// import { api } from '../api/client';
// import { useAuth } from '../context/AuthContext';
// import {
//   TrendingUp,
//   AlertTriangle,
//   Users,
//   Package,
//   RefreshCw,
//   Award,
//   ShoppingBag,
//   ArrowUpRight,
//   Clock,
//   CheckCircle2,
//   Sparkles,
//   Plus
// } from 'lucide-react';
// import {
//   ResponsiveContainer,
//   ComposedChart,
//   Area,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend
// } from 'recharts';
//
// // Smooth Dynamic Number Counter Component
// function AnimatedMetric({ value, prefix = '', suffix = '', decimals = 0 }) {
//   const [display, setDisplay] = useState(0);
//
//   useEffect(() => {
//     const target = Number(value) || 0;
//     let current = 0;
//     const duration = 550;
//     const stepTime = 20;
//     const totalSteps = duration / stepTime;
//     const increment = target / totalSteps;
//
//     const timer = setInterval(() => {
//       current += increment;
//       if (current >= target) {
//         setDisplay(target);
//         clearInterval(timer);
//       } else {
//         setDisplay(current);
//       }
//     }, stepTime);
//
//     return () => clearInterval(timer);
//   }, [value]);
//
//   return (
//     <span>
//       {prefix}
//       {display.toLocaleString('en-IN', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals
//       })}
//       {suffix}
//     </span>
//   );
// }
//
// export default function DashboardOverview({ onNavigate }) {
//   const { user } = useAuth();
//   const [data, setData] = useState(null);
//   const [daysRange, setDaysRange] = useState(7);
//   const [loading, setLoading] = useState(true);
//   const [barsMounted, setBarsMounted] = useState(false);
//
//   const fetchOverview = async (silent = false) => {
//     if (!silent) setLoading(true);
//     try {
//       const res = await api.getDashboardOverview(daysRange);
//       setData(res.data);
//       // Trigger smooth progress bar fill animation
//       setTimeout(() => setBarsMounted(true), 100);
//     } catch (err) {
//       console.error('Failed to load dashboard overview:', err);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   useEffect(() => {
//     setBarsMounted(false);
//     fetchOverview();
//
//     // Auto-sync live PostgreSQL data every 30 seconds
//     const interval = setInterval(() => fetchOverview(true), 30000);
//     return () => clearInterval(interval);
//   }, [daysRange]);
//
//   if (!data && loading) {
//     return (
//       <div className="p-8 bg-[#FFF8EF] min-h-screen flex items-center justify-center">
//         <div className="bg-white border border-[#DDD3D3] px-6 py-4 rounded-2xl shadow-xs flex items-center gap-3 text-xs font-bold text-[#3A2A2D]">
//           <RefreshCw size={18} className="animate-spin text-[#7A535A]" />
//           <span>Syncing Live Store Analytics & KRAs with PostgreSQL...</span>
//         </div>
//       </div>
//     );
//   }
//
//   const stats = data || {
//     todaySales: 0,
//     pendingUdhaar: 0,
//     lowStockCount: 0,
//     totalSkus: 0,
//     todayBillCount: 0,
//     avgBasketValue: 0,
//     stockHealthPercentage: 100,
//     udhaarCollectionScore: 100,
//     dailyTrends: [],
//     topProducts: [],
//     recentSales: []
//   };
//
//   return (
//     <div className="p-6 lg:p-8 space-y-6 bg-[#FFF8EF] min-h-screen text-[#3A2A2D] transition-all duration-300">
//       {/* Header Bar */}
//       <div className="flex flex-wrap items-center justify-between gap-4">
//         <div>
//           <div className="flex items-center gap-2.5">
//             <h2 className="text-xl font-extrabold tracking-tight text-[#3A2A2D]">
//               Store Performance Overview
//             </h2>
//             <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
//               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
//               LIVE DB
//             </span>
//           </div>
//           <p className="text-xs text-[#5D6B6B] mt-0.5">
//             Live metrics & KRA tracking for{' '}
//             <strong className="text-[#7A535A] font-bold">{user?.shopName || 'Your Store'}</strong>
//           </p>
//         </div>
//
//         <div className="flex items-center gap-2.5">
//           {/* Range Selector */}
//           <div className="bg-[#F1F7F7] border border-[#DDD3D3] rounded-xl p-1 flex text-xs font-bold">
//             {[7, 15, 30].map((d) => (
//               <button
//                 key={d}
//                 onClick={() => setDaysRange(d)}
//                 className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
//                   daysRange === d
//                     ? 'bg-[#7A535A] text-[#FFF8EF] shadow-xs scale-[1.03]'
//                     : 'text-[#5D6B6B] hover:text-[#3A2A2D]'
//                 }`}
//               >
//                 {d}D
//               </button>
//             ))}
//           </div>
//
//           <button
//             onClick={() => fetchOverview(false)}
//             className="group flex items-center gap-1.5 text-xs font-bold bg-[#F1F7F7] border border-[#DDD3D3] px-3.5 py-2 rounded-xl text-[#3A2A2D] hover:bg-[#D5E5E5] active:scale-95 transition-all"
//           >
//             <RefreshCw
//               size={14}
//               className={
//                 loading
//                   ? 'animate-spin text-[#7A535A]'
//                   : 'text-[#5D6B6B] group-hover:rotate-180 transition-transform duration-500'
//               }
//             />
//             Refresh
//           </button>
//         </div>
//       </div>
//
//       {/* Row 1: Primary 4 KPI Cards with Lucide Micro-Interactions */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {/* Card 1: Today's Sales */}
//         <div className="group bg-white p-5 rounded-2xl border border-[#DDD3D3] shadow-xs hover:-translate-y-0.5 hover:border-[#C88A93] transition-all duration-300">
//           <div className="flex items-center justify-between text-[#5D6B6B] mb-2">
//             <span className="text-xs font-bold uppercase tracking-wider">Today's Sales</span>
//             <div className="p-2 rounded-xl bg-[#D5E5E5]/70 text-[#3A2A2D] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
//               <TrendingUp size={16} />
//             </div>
//           </div>
//           <h4 className="text-2xl font-black text-[#3A2A2D]">
//             <AnimatedMetric value={stats.todaySales} prefix="₹" decimals={2} />
//           </h4>
//           <p className="text-[11px] text-[#5D6B6B] mt-1 font-semibold">
//             Calculated from <strong className="text-[#7A535A]">{stats.todayBillCount} bills</strong> today
//           </p>
//         </div>
//
//         {/* Card 2: Low Stock Items */}
//         <div
//           onClick={() => onNavigate && onNavigate('inventory')}
//           className="group bg-[#F7CBCA]/35 p-5 rounded-2xl border border-[#C88A93]/50 shadow-xs cursor-pointer hover:-translate-y-0.5 hover:bg-[#F7CBCA]/60 transition-all duration-300"
//         >
//           <div className="flex items-center justify-between text-[#7A535A] mb-2">
//             <span className="text-xs font-bold uppercase tracking-wider">Low Stock Items</span>
//             <div className="p-2 rounded-xl bg-[#F2D2D4] text-[#7A535A] group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
//               <AlertTriangle size={16} className={stats.lowStockCount > 0 ? 'animate-pulse' : ''} />
//             </div>
//           </div>
//           <h4 className="text-2xl font-black text-[#7A535A]">
//             <AnimatedMetric value={stats.lowStockCount} suffix=" SKUs" />
//           </h4>
//           <p className="text-[11px] text-[#7A535A] mt-1 font-bold flex items-center gap-1">
//             Below minimum threshold{' '}
//             <ArrowUpRight
//               size={13}
//               className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
//             />
//           </p>
//         </div>
//
//         {/* Card 3: Pending Udhaar */}
//         <div
//           onClick={() => onNavigate && onNavigate('udhaar')}
//           className="group bg-white p-5 rounded-2xl border border-[#DDD3D3] shadow-xs cursor-pointer hover:-translate-y-0.5 hover:border-[#C88A93] transition-all duration-300"
//         >
//           <div className="flex items-center justify-between text-[#5D6B6B] mb-2">
//             <span className="text-xs font-bold uppercase tracking-wider">Pending Udhaar</span>
//             <div className="p-2 rounded-xl bg-[#F2D2D4]/70 text-[#7A535A] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
//               <Users size={16} />
//             </div>
//           </div>
//           <h4 className="text-2xl font-black text-[#3A2A2D]">
//             <AnimatedMetric value={stats.pendingUdhaar} prefix="₹" decimals={2} />
//           </h4>
//           <p className="text-[11px] text-[#C88A93] mt-1 font-semibold flex items-center gap-1">
//             Total uncollected credit{' '}
//             <ArrowUpRight
//               size={12}
//               className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
//             />
//           </p>
//         </div>
//
//         {/* Card 4: Total Inventory */}
//         <div
//           onClick={() => onNavigate && onNavigate('inventory')}
//           className="group bg-[#F1F7F7] p-5 rounded-2xl border border-[#B0D7D8] shadow-xs cursor-pointer hover:-translate-y-0.5 hover:border-[#7A535A]/50 transition-all duration-300"
//         >
//           <div className="flex items-center justify-between text-[#5D6B6B] mb-2">
//             <span className="text-xs font-bold uppercase tracking-wider">Total Inventory</span>
//             <div className="p-2 rounded-xl bg-[#D5E5E5] text-[#3A2A2D] group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
//               <Package size={16} />
//             </div>
//           </div>
//           <h4 className="text-2xl font-black text-[#3A2A2D]">
//             <AnimatedMetric value={stats.totalSkus} suffix=" Items" />
//           </h4>
//           <p className="text-[11px] text-[#5D6B6B] mt-1 font-semibold">Registered in your store</p>
//         </div>
//       </div>
//
//       {/* Row 2: Sales & Stock Trend Chart + Shopkeeper KRAs */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
//         {/* Day-Wise Sales & Stock Movement Chart (8 Columns) */}
//         <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#DDD3D3] shadow-xs hover:border-[#C88A93]/60 transition-colors">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h3 className="text-sm font-extrabold text-[#3A2A2D]">Day-Wise Sales & Stock Outflow</h3>
//               <p className="text-[11px] text-[#5D6B6B]">
//                 Daily revenue (₹) vs stock units sold over the last {daysRange} days
//               </p>
//             </div>
//             <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-[#7A535A] bg-[#F2D2D4]/50 px-2.5 py-1 rounded-full">
//               <Sparkles size={11} /> Interactive Chart
//             </span>
//           </div>
//
//           <div className="h-72 w-full">
//             {stats.dailyTrends.length === 0 ? (
//               <div className="h-full flex flex-col items-center justify-center text-xs text-[#5D6B6B] bg-[#F1F7F7]/70 rounded-xl border border-dashed border-[#B0D7D8] space-y-2">
//                 <p className="font-semibold text-[#3A2A2D]">Abhi tak is period mein koi sales record nahi hai.</p>
//                 <button
//                   onClick={() => onNavigate && onNavigate('pos')}
//                   className="inline-flex items-center gap-1 bg-[#7A535A] text-[#FFF8EF] px-3.5 py-1.5 rounded-xl font-bold text-[11px] hover:bg-[#3A2A2D] transition"
//                 >
//                   <Plus size={13} /> Billing Counter se Pehla Bill Banayein
//                 </button>
//               </div>
//             ) : (
//               <ResponsiveContainer width="100%" height="100%">
//                 <ComposedChart data={stats.dailyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
//                   <defs>
//                     <linearGradient id="roseSalesGradient" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#C88A93" stopOpacity={0.35} />
//                       <stop offset="95%" stopColor="#F7CBCA" stopOpacity={0.0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDD3D3" strokeOpacity={0.5} />
//                   <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5D6B6B' }} axisLine={false} tickLine={false} />
//                   <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#7A535A' }} axisLine={false} tickLine={false} />
//                   <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#5D6B6B' }} axisLine={false} tickLine={false} />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: '#FFF8EF',
//                       borderRadius: '12px',
//                       border: '1px solid #DDD3D3',
//                       color: '#3A2A2D',
//                       fontSize: '12px'
//                     }}
//                   />
//                   <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#3A2A2D' }} />
//                   <Area
//                     yAxisId="left"
//                     type="monotone"
//                     dataKey="sales"
//                     name="Sales Revenue (₹)"
//                     stroke="#7A535A"
//                     strokeWidth={2.5}
//                     fillOpacity={1}
//                     fill="url(#roseSalesGradient)"
//                     animationDuration={800}
//                   />
//                   <Bar
//                     yAxisId="right"
//                     dataKey="stockSold"
//                     name="Stock Units Sold"
//                     fill="#B0D7D8"
//                     radius={[6, 6, 0, 0]}
//                     barSize={24}
//                     animationDuration={800}
//                   />
//                 </ComposedChart>
//               </ResponsiveContainer>
//             )}
//           </div>
//         </div>
//
//         {/* Store KRAs Card (4 Columns) */}
//         <div className="lg:col-span-4 bg-[#F1F7F7] p-6 rounded-2xl border border-[#DDD3D3] shadow-xs flex flex-col justify-between group">
//           <div>
//             <div className="flex items-center gap-2 mb-1">
//               <div className="p-1.5 rounded-lg bg-white text-[#7A535A] group-hover:rotate-12 transition-transform">
//                 <Award size={17} />
//               </div>
//               <h3 className="text-sm font-extrabold text-[#3A2A2D]">Store Performance KRAs</h3>
//             </div>
//             <p className="text-[11px] text-[#5D6B6B] mb-5">Key Result Areas & Operational Health</p>
//
//             <div className="space-y-4">
//               {/* KRA 1: Stock Availability Health */}
//               <div>
//                 <div className="flex justify-between text-xs font-bold mb-1.5">
//                   <span className="text-[#3A2A2D]">1. Stock Availability Score</span>
//                   <span className="text-[#5D6B6B]">
//                     <AnimatedMetric value={stats.stockHealthPercentage} suffix="%" />
//                   </span>
//                 </div>
//                 <div className="w-full bg-[#D5E5E5] h-2.5 rounded-full overflow-hidden">
//                   <div
//                     className="bg-[#5D6B6B] h-full rounded-full transition-all duration-700 ease-out"
//                     style={{ width: barsMounted ? `${stats.stockHealthPercentage}%` : '0%' }}
//                   />
//                 </div>
//                 <p className="text-[10px] text-[#5D6B6B] mt-1">Target: &gt;90% items above min threshold</p>
//               </div>
//
//               {/* KRA 2: Credit Control Health */}
//               <div>
//                 <div className="flex justify-between text-xs font-bold mb-1.5">
//                   <span className="text-[#3A2A2D]">2. Credit Limit Safety Index</span>
//                   <span className="text-[#7A535A]">
//                     <AnimatedMetric value={stats.udhaarCollectionScore} suffix="%" />
//                   </span>
//                 </div>
//                 <div className="w-full bg-[#F2D2D4] h-2.5 rounded-full overflow-hidden">
//                   <div
//                     className="bg-[#7A535A] h-full rounded-full transition-all duration-700 ease-out"
//                     style={{ width: barsMounted ? `${stats.udhaarCollectionScore}%` : '0%' }}
//                   />
//                 </div>
//                 <p className="text-[10px] text-[#5D6B6B] mt-1">Measures unutilized vs overdue Udhaar</p>
//               </div>
//
//               {/* KRA 3 & 4 Mini Boxes */}
//               <div className="grid grid-cols-2 gap-3 pt-2">
//                 <div className="p-3 bg-white rounded-xl border border-[#DDD3D3] hover:border-[#C88A93] transition">
//                   <span className="text-[10px] font-bold text-[#5D6B6B] uppercase">Avg Bill Value</span>
//                   <div className="text-base font-black text-[#3A2A2D] mt-0.5">
//                     <AnimatedMetric value={stats.avgBasketValue} prefix="₹" />
//                   </div>
//                 </div>
//                 <div className="p-3 bg-white rounded-xl border border-[#DDD3D3] hover:border-[#C88A93] transition">
//                   <span className="text-[10px] font-bold text-[#5D6B6B] uppercase">Bills Today</span>
//                   <div className="text-base font-black text-[#7A535A] mt-0.5">
//                     <AnimatedMetric value={stats.todayBillCount} suffix=" Bills" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//
//           <div className="mt-5 pt-3 border-t border-[#DDD3D3] flex items-center justify-between text-[11px] text-[#5D6B6B]">
//             <span className="flex items-center gap-1.5 text-[#3A2A2D] font-bold">
//               <CheckCircle2 size={13} className="text-[#7A535A]" /> PostgreSQL Live Sync
//             </span>
//             <span>Auto-updated</span>
//           </div>
//         </div>
//       </div>
//
//       {/* Row 3: Two Backend Data Tables */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
//         {/* Table 1: Top Selling Products */}
//         <div className="lg:col-span-6 bg-white rounded-2xl border border-[#DDD3D3] shadow-xs overflow-hidden">
//           <div className="px-5 py-4 bg-[#F1F7F7]/60 border-b border-[#DDD3D3] flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <ShoppingBag size={16} className="text-[#7A535A]" />
//               <h3 className="text-sm font-extrabold text-[#3A2A2D]">Top Selling Products</h3>
//             </div>
//             <span className="text-[11px] text-[#5D6B6B] font-semibold">By volume sold</span>
//           </div>
//
//           <table className="w-full text-left text-xs">
//             <thead className="bg-[#FFF8EF] text-[#5D6B6B] font-bold uppercase text-[10px] border-b border-[#DDD3D3]">
//               <tr>
//                 <th className="py-3 px-5">Product Name</th>
//                 <th className="py-3 px-4 text-right">Sold Qty</th>
//                 <th className="py-3 px-4 text-right">Revenue</th>
//                 <th className="py-3 px-5 text-right">In Stock</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-[#DDD3D3]/60">
//               {stats.topProducts.length === 0 ? (
//                 <tr>
//                   <td colSpan="4" className="py-8 text-center text-[#5D6B6B]">
//                     No sales data available yet.
//                   </td>
//                 </tr>
//               ) : (
//                 stats.topProducts.map((item, idx) => (
//                   <tr key={idx} className="hover:bg-[#FFF8EF]/80 transition-colors">
//                     <td className="py-3 px-5 font-bold text-[#3A2A2D]">{item.name}</td>
//                     <td className="py-3 px-4 text-right font-extrabold text-[#7A535A]">
//                       {item.soldQty} {item.unit}
//                     </td>
//                     <td className="py-3 px-4 text-right font-semibold text-[#5D6B6B]">
//                       ₹{Number(item.revenue).toFixed(2)}
//                     </td>
//                     <td className="py-3 px-5 text-right">
//                       <span className="font-bold text-[#3A2A2D]">{item.remainingStock}</span>{' '}
//                       <span className="text-[10px] text-[#5D6B6B]">{item.unit}</span>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//
//         {/* Table 2: Recent Counter Bills */}
//         <div className="lg:col-span-6 bg-white rounded-2xl border border-[#DDD3D3] shadow-xs overflow-hidden">
//           <div className="px-5 py-4 bg-[#F1F7F7]/60 border-b border-[#DDD3D3] flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Clock size={16} className="text-[#5D6B6B]" />
//               <h3 className="text-sm font-extrabold text-[#3A2A2D]">Recent Counter Bills</h3>
//             </div>
//             <button
//               onClick={() => onNavigate && onNavigate('pos')}
//               className="group inline-flex items-center gap-1 text-[11px] font-extrabold text-[#7A535A] hover:text-[#3A2A2D] transition"
//             >
//               <Plus size={12} className="group-hover:rotate-90 transition-transform" /> New Bill
//             </button>
//           </div>
//
//           <table className="w-full text-left text-xs">
//             <thead className="bg-[#FFF8EF] text-[#5D6B6B] font-bold uppercase text-[10px] border-b border-[#DDD3D3]">
//               <tr>
//                 <th className="py-3 px-5">Invoice</th>
//                 <th className="py-3 px-4">Customer</th>
//                 <th className="py-3 px-4 text-center">Mode</th>
//                 <th className="py-3 px-5 text-right">Amount</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-[#DDD3D3]/60">
//               {stats.recentSales.length === 0 ? (
//                 <tr>
//                   <td colSpan="4" className="py-8 text-center text-[#5D6B6B]">
//                     No bills generated yet.
//                   </td>
//                 </tr>
//               ) : (
//                 stats.recentSales.map((bill, idx) => (
//                   <tr key={idx} className="hover:bg-[#FFF8EF]/80 transition-colors">
//                     <td className="py-3 px-5">
//                       <div className="font-mono font-bold text-[#3A2A2D]">{bill.invoiceNo}</div>
//                       <div className="text-[10px] text-[#5D6B6B]">{bill.time}</div>
//                     </td>
//                     <td className="py-3 px-4 font-semibold text-[#3A2A2D]">{bill.customerName}</td>
//                     <td className="py-3 px-4 text-center">
//                       <span
//                         className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
//                           bill.paymentMode === 'UDHAAR'
//                             ? 'bg-[#F7CBCA]/60 text-[#7A535A] border-[#C88A93]'
//                             : 'bg-[#D5E5E5] text-[#3A2A2D] border-[#B0D7D8]'
//                         }`}
//                       >
//                         {bill.paymentMode}
//                       </span>
//                     </td>
//                     <td className="py-3 px-5 text-right font-black text-[#3A2A2D]">
//                       ₹{Number(bill.amount).toFixed(2)}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Package,
  RefreshCw,
  Award,
  ShoppingBag,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Sparkles,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Smooth Dynamic Number Counter Component
function AnimatedMetric({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    let current = 0;
    const duration = 550;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = target / totalSteps;

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

export default function DashboardOverview({ onNavigate }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [daysRange, setDaysRange] = useState(7);
  const [loading, setLoading] = useState(true);
  const [barsMounted, setBarsMounted] = useState(false);

  const fetchOverview = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [overviewRes, custRes] = await Promise.all([
        api.getDashboardOverview(daysRange),
        api.getCustomers().catch(() => ({ data: [] }))
      ]);

      const overviewData = overviewRes.data || {};
      const customersList = Array.isArray(custRes.data) ? custRes.data : [];

      // Live Pending Udhaar & Credit Score calculation directly from customers if backend returns 0
      const livePendingUdhaar = customersList.reduce(
        (sum, c) => sum + Number(c.currentDue || 0),
        0
      );
      const liveTotalLimit = customersList.reduce(
        (sum, c) => sum + Number(c.creditLimit || 0),
        0
      );

      const finalPendingUdhaar =
        Number(overviewData.pendingUdhaar) > 0
          ? Number(overviewData.pendingUdhaar)
          : livePendingUdhaar;

      const finalUdhaarScore =
        liveTotalLimit > 0
          ? Math.max(0, Math.round(100 - (finalPendingUdhaar / liveTotalLimit) * 100))
          : overviewData.udhaarCollectionScore ?? 100;

      setData({
        ...overviewData,
        pendingUdhaar: finalPendingUdhaar,
        udhaarCollectionScore: finalUdhaarScore
      });

      setTimeout(() => setBarsMounted(true), 100);
    } catch (err) {
      console.error('Failed to load dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setBarsMounted(false);
    fetchOverview();

    // Auto-sync live PostgreSQL data every 30 seconds
    const interval = setInterval(() => fetchOverview(true), 30000);
    return () => clearInterval(interval);
  }, [daysRange]);

  if (!data && loading) {
    return (
      <div className="p-8 bg-[#FFF8EF] min-h-screen flex items-center justify-center">
        <div className="bg-white border border-[#DDD3D3] px-6 py-4 rounded-2xl shadow-xs flex items-center gap-3 text-xs font-bold text-[#3A2A2D]">
          <RefreshCw size={18} className="animate-spin text-[#7A535A]" />
          <span>Syncing Live Store Analytics & KRAs with PostgreSQL...</span>
        </div>
      </div>
    );
  }

  const stats = data || {
    todaySales: 0,
    pendingUdhaar: 0,
    lowStockCount: 0,
    totalSkus: 0,
    todayBillCount: 0,
    avgBasketValue: 0,
    stockHealthPercentage: 100,
    udhaarCollectionScore: 100,
    dailyTrends: [],
    topProducts: [],
    recentSales: []
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-[#FFF8EF] min-h-screen text-[#3A2A2D] transition-all duration-300">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold tracking-tight text-[#3A2A2D]">
              Store Performance Overview
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE DB
            </span>
          </div>
          <p className="text-xs text-[#5D6B6B] mt-0.5">
            Live metrics & KRA tracking for{' '}
            <strong className="text-[#7A535A] font-bold">{user?.shopName || 'Your Store'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Range Selector */}
          <div className="bg-[#F1F7F7] border border-[#DDD3D3] rounded-xl p-1 flex text-xs font-bold">
            {[7, 15, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDaysRange(d)}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  daysRange === d
                    ? 'bg-[#7A535A] text-[#FFF8EF] shadow-xs scale-[1.03]'
                    : 'text-[#5D6B6B] hover:text-[#3A2A2D]'
                }`}
              >
                {d}D
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchOverview(false)}
            className="group flex items-center gap-1.5 text-xs font-bold bg-[#F1F7F7] border border-[#DDD3D3] px-3.5 py-2 rounded-xl text-[#3A2A2D] hover:bg-[#D5E5E5] active:scale-95 transition-all"
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
        </div>
      </div>

      {/* Row 1: Primary 4 KPI Cards with Lucide Micro-Interactions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="group bg-white p-5 rounded-2xl border border-[#DDD3D3] shadow-xs hover:-translate-y-0.5 hover:border-[#C88A93] transition-all duration-300">
          <div className="flex items-center justify-between text-[#5D6B6B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Sales</span>
            <div className="p-2 rounded-xl bg-[#D5E5E5]/70 text-[#3A2A2D] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <TrendingUp size={16} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-[#3A2A2D]">
            <AnimatedMetric value={stats.todaySales} prefix="₹" decimals={2} />
          </h4>
          <p className="text-[11px] text-[#5D6B6B] mt-1 font-semibold">
            Calculated from <strong className="text-[#7A535A]">{stats.todayBillCount} bills</strong> today
          </p>
        </div>

        {/* Card 2: Low Stock Items */}
        <div
          onClick={() => onNavigate && onNavigate('inventory')}
          className="group bg-[#F7CBCA]/35 p-5 rounded-2xl border border-[#C88A93]/50 shadow-xs cursor-pointer hover:-translate-y-0.5 hover:bg-[#F7CBCA]/60 transition-all duration-300"
        >
          <div className="flex items-center justify-between text-[#7A535A] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock Items</span>
            <div className="p-2 rounded-xl bg-[#F2D2D4] text-[#7A535A] group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
              <AlertTriangle size={16} className={stats.lowStockCount > 0 ? 'animate-pulse' : ''} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-[#7A535A]">
            <AnimatedMetric value={stats.lowStockCount} suffix=" SKUs" />
          </h4>
          <p className="text-[11px] text-[#7A535A] mt-1 font-bold flex items-center gap-1">
            Below minimum threshold{' '}
            <ArrowUpRight
              size={13}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </p>
        </div>

        {/* Card 3: Pending Udhaar */}
        <div
          onClick={() => onNavigate && onNavigate('udhaar')}
          className="group bg-white p-5 rounded-2xl border border-[#DDD3D3] shadow-xs cursor-pointer hover:-translate-y-0.5 hover:border-[#C88A93] transition-all duration-300"
        >
          <div className="flex items-center justify-between text-[#5D6B6B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Udhaar</span>
            <div className="p-2 rounded-xl bg-[#F2D2D4]/70 text-[#7A535A] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Users size={16} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-[#3A2A2D]">
            <AnimatedMetric value={stats.pendingUdhaar} prefix="₹" decimals={2} />
          </h4>
          <p className="text-[11px] text-[#C88A93] mt-1 font-semibold flex items-center gap-1">
            Total uncollected credit{' '}
            <ArrowUpRight
              size={12}
              className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
            />
          </p>
        </div>

        {/* Card 4: Total Inventory */}
        <div
          onClick={() => onNavigate && onNavigate('inventory')}
          className="group bg-[#F1F7F7] p-5 rounded-2xl border border-[#B0D7D8] shadow-xs cursor-pointer hover:-translate-y-0.5 hover:border-[#7A535A]/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between text-[#5D6B6B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Inventory</span>
            <div className="p-2 rounded-xl bg-[#D5E5E5] text-[#3A2A2D] group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
              <Package size={16} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-[#3A2A2D]">
            <AnimatedMetric value={stats.totalSkus} suffix=" Items" />
          </h4>
          <p className="text-[11px] text-[#5D6B6B] mt-1 font-semibold">Registered in your store</p>
        </div>
      </div>

      {/* Row 2: Sales & Stock Trend Chart + Shopkeeper KRAs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Day-Wise Sales & Stock Movement Chart (8 Columns) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#DDD3D3] shadow-xs hover:border-[#C88A93]/60 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#3A2A2D]">Day-Wise Sales & Stock Outflow</h3>
              <p className="text-[11px] text-[#5D6B6B]">
                Daily revenue (₹) vs stock units sold over the last {daysRange} days
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-[#7A535A] bg-[#F2D2D4]/50 px-2.5 py-1 rounded-full">
              <Sparkles size={11} /> Interactive Chart
            </span>
          </div>

          <div className="h-72 w-full">
            {stats.dailyTrends.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-[#5D6B6B] bg-[#F1F7F7]/70 rounded-xl border border-dashed border-[#B0D7D8] space-y-2">
                <p className="font-semibold text-[#3A2A2D]">Abhi tak is period mein koi sales record nahi hai.</p>
                <button
                  onClick={() => onNavigate && onNavigate('pos')}
                  className="inline-flex items-center gap-1 bg-[#7A535A] text-[#FFF8EF] px-3.5 py-1.5 rounded-xl font-bold text-[11px] hover:bg-[#3A2A2D] transition"
                >
                  <Plus size={13} /> Billing Counter se Pehla Bill Banayein
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.dailyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="roseSalesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C88A93" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#F7CBCA" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDD3D3" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5D6B6B' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#7A535A' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#5D6B6B' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF8EF',
                      borderRadius: '12px',
                      border: '1px solid #DDD3D3',
                      color: '#3A2A2D',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#3A2A2D' }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    name="Sales Revenue (₹)"
                    stroke="#7A535A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#roseSalesGradient)"
                    animationDuration={800}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="stockSold"
                    name="Stock Units Sold"
                    fill="#B0D7D8"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                    animationDuration={800}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Store KRAs Card (4 Columns) */}
        <div className="lg:col-span-4 bg-[#F1F7F7] p-6 rounded-2xl border border-[#DDD3D3] shadow-xs flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-white text-[#7A535A] group-hover:rotate-12 transition-transform">
                <Award size={17} />
              </div>
              <h3 className="text-sm font-extrabold text-[#3A2A2D]">Store Performance KRAs</h3>
            </div>
            <p className="text-[11px] text-[#5D6B6B] mb-5">Key Result Areas & Operational Health</p>

            <div className="space-y-4">
              {/* KRA 1: Stock Availability Health */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-[#3A2A2D]">1. Stock Availability Score</span>
                  <span className="text-[#5D6B6B]">
                    <AnimatedMetric value={stats.stockHealthPercentage} suffix="%" />
                  </span>
                </div>
                <div className="w-full bg-[#D5E5E5] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#5D6B6B] h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: barsMounted ? `${stats.stockHealthPercentage}%` : '0%' }}
                  />
                </div>
                <p className="text-[10px] text-[#5D6B6B] mt-1">Target: &gt;90% items above min threshold</p>
              </div>

              {/* KRA 2: Credit Control Health */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-[#3A2A2D]">2. Credit Limit Safety Index</span>
                  <span className="text-[#7A535A]">
                    <AnimatedMetric value={stats.udhaarCollectionScore} suffix="%" />
                  </span>
                </div>
                <div className="w-full bg-[#F2D2D4] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7A535A] h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: barsMounted ? `${stats.udhaarCollectionScore}%` : '0%' }}
                  />
                </div>
                <p className="text-[10px] text-[#5D6B6B] mt-1">Measures unutilized vs overdue Udhaar</p>
              </div>

              {/* KRA 3 & 4 Mini Boxes */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-[#DDD3D3] hover:border-[#C88A93] transition">
                  <span className="text-[10px] font-bold text-[#5D6B6B] uppercase">Avg Bill Value</span>
                  <div className="text-base font-black text-[#3A2A2D] mt-0.5">
                    <AnimatedMetric value={stats.avgBasketValue} prefix="₹" />
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#DDD3D3] hover:border-[#C88A93] transition">
                  <span className="text-[10px] font-bold text-[#5D6B6B] uppercase">Bills Today</span>
                  <div className="text-base font-black text-[#7A535A] mt-0.5">
                    <AnimatedMetric value={stats.todayBillCount} suffix=" Bills" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#DDD3D3] flex items-center justify-between text-[11px] text-[#5D6B6B]">
            <span className="flex items-center gap-1.5 text-[#3A2A2D] font-bold">
              <CheckCircle2 size={13} className="text-[#7A535A]" /> PostgreSQL Live Sync
            </span>
            <span>Auto-updated</span>
          </div>
        </div>
      </div>

      {/* Row 3: Two Backend Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Table 1: Top Selling Products */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#DDD3D3] shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-[#F1F7F7]/60 border-b border-[#DDD3D3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#7A535A]" />
              <h3 className="text-sm font-extrabold text-[#3A2A2D]">Top Selling Products</h3>
            </div>
            <span className="text-[11px] text-[#5D6B6B] font-semibold">By volume sold</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8EF] text-[#5D6B6B] font-bold uppercase text-[10px] border-b border-[#DDD3D3]">
              <tr>
                <th className="py-3 px-5">Product Name</th>
                <th className="py-3 px-4 text-right">Sold Qty</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-5 text-right">In Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD3D3]/60">
              {stats.topProducts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-[#5D6B6B]">
                    No sales data available yet.
                  </td>
                </tr>
              ) : (
                stats.topProducts.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FFF8EF]/80 transition-colors">
                    <td className="py-3 px-5 font-bold text-[#3A2A2D]">{item.name}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#7A535A]">
                      {item.soldQty} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[#5D6B6B]">
                      ₹{Number(item.revenue).toFixed(2)}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <span className="font-bold text-[#3A2A2D]">{item.remainingStock}</span>{' '}
                      <span className="text-[10px] text-[#5D6B6B]">{item.unit}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table 2: Recent Counter Bills */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#DDD3D3] shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-[#F1F7F7]/60 border-b border-[#DDD3D3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#5D6B6B]" />
              <h3 className="text-sm font-extrabold text-[#3A2A2D]">Recent Counter Bills</h3>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('pos')}
              className="group inline-flex items-center gap-1 text-[11px] font-extrabold text-[#7A535A] hover:text-[#3A2A2D] transition"
            >
              <Plus size={12} className="group-hover:rotate-90 transition-transform" /> New Bill
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8EF] text-[#5D6B6B] font-bold uppercase text-[10px] border-b border-[#DDD3D3]">
              <tr>
                <th className="py-3 px-5">Invoice</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">Mode</th>
                <th className="py-3 px-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD3D3]/60">
              {stats.recentSales.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-[#5D6B6B]">
                    No bills generated yet.
                  </td>
                </tr>
              ) : (
                stats.recentSales.map((bill, idx) => (
                  <tr key={idx} className="hover:bg-[#FFF8EF]/80 transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-mono font-bold text-[#3A2A2D]">{bill.invoiceNo}</div>
                      <div className="text-[10px] text-[#5D6B6B]">{bill.time}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#3A2A2D]">{bill.customerName}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          bill.paymentMode === 'UDHAAR'
                            ? 'bg-[#F7CBCA]/60 text-[#7A535A] border-[#C88A93]'
                            : 'bg-[#D5E5E5] text-[#3A2A2D] border-[#B0D7D8]'
                        }`}
                      >
                        {bill.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-black text-[#3A2A2D]">
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