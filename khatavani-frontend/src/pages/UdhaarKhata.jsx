import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  BookOpen,
  UserPlus,
  Send,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Users,
  ShieldAlert,
  TrendingDown,
  History,
  Sparkles,
  MailCheck
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

export default function UdhaarKhata() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ text: '', isError: false });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [khataFilter, setKhataFilter] = useState('ALL'); // ALL | OVERDUE | CLEAR

  // Payment Collection & Reminder Audit Log
  const [activityLogs, setActivityLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('khatavani_udhaar_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    creditLimit: '5000',
    currentDue: '0',
    dueDate: ''
  });

  // Receive Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState('');
  const [sendingReminderId, setSendingReminderId] = useState(null);

  const saveActivityLog = (entry) => {
    const updated = [entry, ...activityLogs].slice(0, 15);
    setActivityLogs(updated);
    localStorage.setItem('khatavani_udhaar_logs', JSON.stringify(updated));
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers();
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Helper to check if due date is passed
  const isCustomerOverdue = (c) => {
    if (!c.dueDate || Number(c.currentDue || 0) <= 0) return false;
    const today = new Date().toISOString().split('T')[0];
    return c.dueDate <= today;
  };

  // Add New Customer Handler
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.addCustomer({
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email,
        creditLimit: Number(newCustomer.creditLimit || 5000),
        currentDue: Number(newCustomer.currentDue || 0),
        dueDate: newCustomer.dueDate || null
      });
      setShowAddModal(false);
      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        creditLimit: '5000',
        currentDue: '0',
        dueDate: ''
      });
      setStatusMsg({ text: 'Naya Udhaar Khata successfully create ho gaya!', isError: false });
      fetchCustomers();
    } catch (err) {
      setStatusMsg({
        text: err.response?.data?.message || 'Customer add karne mein error aaya.',
        isError: true
      });
    }
  };

  // Receive Payment Handler
  const openPaymentModal = (customer) => {
    setSelectedCust(customer);
    setReceivedAmount('');
    setShowPayModal(true);
  };

  const handleReceivePayment = async (e) => {
    e.preventDefault();
    if (!selectedCust || !receivedAmount || Number(receivedAmount) <= 0) return;

    try {
      const paid = Number(receivedAmount);
      await api.receivePayment({
        customerId: selectedCust.id,
        amount: paid
      });

      const now = new Date();
      saveActivityLog({
        id: Date.now(),
        type: 'PAYMENT',
        customerName: selectedCust.name,
        amount: paid,
        remaining: Math.max(0, Number(selectedCust.currentDue || 0) - paid),
        date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });

      setStatusMsg({
        text: `₹${paid.toFixed(2)} payment ${selectedCust.name} ke khate se jama ho gayi!`,
        isError: false
      });
      setShowPayModal(false);
      setSelectedCust(null);
      fetchCustomers();
    } catch (err) {
      setStatusMsg({
        text: err.response?.data?.message || 'Payment update fail hui.',
        isError: true
      });
    }
  };

  // Send Manual Reminder Email
  const handleSendReminder = async (customer) => {
    setSendingReminderId(customer.id);
    try {
      if (api.sendReminder) {
        await api.sendReminder(customer.id);
      } else {
        await api.runScheduler?.();
      }

      const now = new Date();
      saveActivityLog({
        id: Date.now(),
        type: 'REMINDER',
        customerName: customer.name,
        amount: Number(customer.currentDue || 0),
        date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });

      setStatusMsg({
        text: `Payment reminder email ${customer.name} (${customer.email || customer.phone}) ko bhej diya gaya!`,
        isError: false
      });
    } catch (err) {
      setStatusMsg({
        text: err.response?.data?.message || 'Reminder bhejne mein samasya aayi.',
        isError: true
      });
    } finally {
      setSendingReminderId(null);
    }
  };

  // Run Auto Scheduler Now
  const handleRunScheduler = async () => {
    try {
      if (api.runScheduler) {
        await api.runScheduler();
      }
      setStatusMsg({
        text: 'Automated Overdue Reminder Scheduler run ho chuka hai! Sabhi overdue grahakon ko email bhej diya gaya.',
        isError: false
      });
    } catch (err) {
      setStatusMsg({
        text: err.response?.data?.message || 'Scheduler trigger fail hua.',
        isError: true
      });
    }
  };

  // Dynamic Calculations for KPIs & Chart
  const totalPendingDue = customers.reduce((sum, c) => sum + Number(c.currentDue || 0), 0);
  const totalCreditLimit = customers.reduce((sum, c) => sum + Number(c.creditLimit || 0), 0);
  const overdueCustomers = customers.filter(isCustomerOverdue);
  const clearCustomersCount = customers.filter((c) => Number(c.currentDue || 0) <= 0).length;
  const utilizationPct =
    totalCreditLimit > 0 ? Math.min(100, Math.round((totalPendingDue / totalCreditLimit) * 100)) : 0;

  // Chart Data: Customer Pending Due vs Remaining Limit
  const chartData = customers.slice(0, 8).map((c) => {
    const due = Number(c.currentDue || 0);
    const limit = Number(c.creditLimit || 0);
    return {
      name: c.name.split(' ')[0],
      pendingDue: due,
      availableLimit: Math.max(0, limit - due)
    };
  });

  // Filtered Table Rows
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const overdue = isCustomerOverdue(c);
    const isClear = Number(c.currentDue || 0) <= 0;

    if (khataFilter === 'OVERDUE') return matchesSearch && overdue;
    if (khataFilter === 'CLEAR') return matchesSearch && isClear;
    return matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-[#FFF8EF] min-h-screen text-[#3A2A2D] transition-all duration-300">
      {/* 1. HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold tracking-tight text-[#3A2A2D]">
              Udhaar Khata (Customer Ledger)
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              AUTO-REMINDER ON
            </span>
          </div>
          <p className="text-xs text-[#5D6B6B] mt-0.5">
            Track pending credits, credit limits, overdue accounts, and instant collections
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCustomers}
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
            <UserPlus size={15} className="group-hover:scale-110 transition-transform" />
            Add Customer Khata
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
              <AlertCircle size={16} className="text-[#7A535A]" />
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

      {/* 2. TOP 4 DYNAMIC UDHAAR KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Pending Udhaar */}
        <div className="group bg-white p-5 rounded-2xl border border-[#DDD3D3] shadow-xs hover:-translate-y-0.5 hover:border-[#C88A93] transition-all duration-300">
          <div className="flex items-center justify-between text-[#5D6B6B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pending Due</span>
            <div className="p-2 rounded-xl bg-[#F2D2D4]/70 text-[#7A535A] group-hover:scale-110 group-hover:rotate-6 transition-transform">
              <IndianRupee size={15} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-[#7A535A]">
            <AnimatedMetric value={totalPendingDue} prefix="₹" decimals={2} />
          </h4>
          <p className="text-[11px] text-[#5D6B6B] mt-1 font-semibold">
            Uncollected across {customers.length} accounts
          </p>
        </div>

        {/* KPI 2: Overdue Accounts */}
        <div
          onClick={() => setKhataFilter(khataFilter === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
          className="group bg-[#F7CBCA]/35 p-5 rounded-2xl border border-[#C88A93]/60 shadow-xs cursor-pointer hover:-translate-y-0.5 hover:bg-[#F7CBCA]/55 transition-all duration-300"
        >
          <div className="flex items-center justify-between text-[#7A535A] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue Accounts</span>
            <div className="p-2 rounded-xl bg-[#F2D2D4] text-[#7A535A] group-hover:scale-110 transition-transform">
              <ShieldAlert size={15} className={overdueCustomers.length > 0 ? 'animate-pulse' : ''} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-[#7A535A]">
            <AnimatedMetric value={overdueCustomers.length} suffix=" Grahak" />
          </h4>
          <p className="text-[11px] text-[#7A535A] mt-1 font-bold">
            {khataFilter === 'OVERDUE' ? 'Showing overdue (Click to reset)' : 'Click to filter overdue'}
          </p>
        </div>

        {/* KPI 3: Credit Limit Utilization */}
        <div className="group bg-[#F1F7F7] p-5 rounded-2xl border border-[#B0D7D8] shadow-xs hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between text-[#5D6B6B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Credit Limit Pool</span>
            <div className="p-2 rounded-xl bg-white text-[#3A2A2D] group-hover:scale-110 transition-transform">
              <TrendingDown size={15} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-[#3A2A2D]">
            <AnimatedMetric value={totalCreditLimit} prefix="₹" />
          </h4>
          <p className="text-[11px] text-[#5D6B6B] mt-1 font-semibold">
            {utilizationPct}% of total credit utilized
          </p>
        </div>

        {/* KPI 4: Registered Khata Accounts */}
        <div
          onClick={() => setKhataFilter(khataFilter === 'CLEAR' ? 'ALL' : 'CLEAR')}
          className="group bg-white p-5 rounded-2xl border border-[#DDD3D3] shadow-xs cursor-pointer hover:-translate-y-0.5 hover:border-[#B0D7D8] transition-all duration-300"
        >
          <div className="flex items-center justify-between text-[#5D6B6B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Khata Accounts</span>
            <div className="p-2 rounded-xl bg-[#D5E5E5] text-[#3A2A2D] group-hover:scale-110 transition-transform">
              <Users size={15} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-[#3A2A2D]">
            <AnimatedMetric value={customers.length} suffix=" Active" />
          </h4>
          <p className="text-[11px] text-emerald-700 mt-1 font-bold">
            {clearCustomersCount} Clear (₹0 Due)
          </p>
        </div>
      </div>

      {/* 3. AUTOMATED BACKEND CRON JOB BANNER (Themed) */}
      <div className="bg-white border border-[#DDD3D3] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F2D2D4]/80 border border-[#C88A93]/40 flex items-center justify-center text-[#7A535A]">
            <Clock size={19} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold text-[#3A2A2D]">Automated Backend Cron Job Active</h4>
              <span className="text-[10px] font-extrabold bg-[#D5E5E5] text-[#3A2A2D] px-2 py-0.5 rounded-full">
                DAILY 9:00 AM
              </span>
            </div>
            <p className="text-[11px] text-[#5D6B6B] mt-0.5">
              Jiss grahak ki Due Date nikal chuki hai (<code className="text-[#7A535A] font-mono">due_date &lt;= CURRENT_DATE</code>), backend scheduler unhe automatically reminder email send karta hai.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunScheduler}
          className="group flex items-center gap-1.5 text-xs font-extrabold bg-[#FFF8EF] hover:bg-[#7A535A] text-[#7A535A] hover:text-[#FFF8EF] border border-[#C88A93] px-4 py-2 rounded-xl transition-all"
        >
          <MailCheck size={14} className="group-hover:scale-110 transition-transform" />
          Run Auto-Scheduler Now
        </button>
      </div>

      {/* 4. VISUAL CREDIT ANALYTICS & COLLECTION TIMELINE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (7 Cols): Customer Credit Utilization Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#DDD3D3] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#3A2A2D]">
                Customer Udhaar vs Available Credit Limit
              </h3>
              <p className="text-[11px] text-[#5D6B6B]">
                Compare pending due amount against remaining credit limit per customer
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7A535A] bg-[#F2D2D4]/60 px-2.5 py-1 rounded-full">
              <Sparkles size={11} /> Credit Exposure
            </span>
          </div>

          <div className="h-60 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#5D6B6B] bg-[#F1F7F7]/60 rounded-xl border border-dashed border-[#B0D7D8]">
                Add customers to view credit exposure chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                    dataKey="pendingDue"
                    name="Pending Udhaar (₹)"
                    fill="#7A535A"
                    radius={[6, 6, 0, 0]}
                    barSize={26}
                  />
                  <Bar
                    dataKey="availableLimit"
                    name="Remaining Limit (₹)"
                    fill="#B0D7D8"
                    radius={[6, 6, 0, 0]}
                    barSize={26}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right (5 Cols): Recent Collections & Reminder Activity Log */}
        <div className="lg:col-span-5 bg-[#F1F7F7] p-6 rounded-2xl border border-[#DDD3D3] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white text-[#7A535A]">
                  <History size={16} />
                </div>
                <h3 className="text-sm font-extrabold text-[#3A2A2D]">Collections & Nudges Log</h3>
              </div>
              <span className="text-[10px] font-bold text-[#5D6B6B] bg-white px-2.5 py-0.5 rounded-full border border-[#DDD3D3]">
                {activityLogs.length} Entries
              </span>
            </div>
            <p className="text-[11px] text-[#5D6B6B] mb-4">
              Kis grahak ne kab payment jama ki ya reminder bheja gaya
            </p>

            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {activityLogs.length === 0 ? (
                <div className="bg-white/80 border border-dashed border-[#B0D7D8] rounded-xl p-5 text-center space-y-1.5">
                  <BookOpen size={18} className="mx-auto text-[#7A535A]" />
                  <p className="text-xs font-bold text-[#3A2A2D]">Abhi tak koi recovery log nahi hai</p>
                  <p className="text-[11px] text-[#5D6B6B]">
                    Neeche kisi bhi grahak par <strong>"Receive Payment"</strong> ya <strong>"Send Reminder"</strong> dabayein — live entry yahan record hogi!
                  </p>
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white border border-[#DDD3D3] rounded-xl p-3 flex items-center justify-between text-xs hover:border-[#C88A93] transition"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[#3A2A2D]">{log.customerName}</span>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            log.type === 'PAYMENT'
                              ? 'bg-[#D5E5E5] text-[#3A2A2D]'
                              : 'bg-[#F2D2D4] text-[#7A535A]'
                          }`}
                        >
                          {log.type === 'PAYMENT' ? 'JAMA / PAID' : 'REMINDER SENT'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#5D6B6B] mt-0.5">
                        {log.date} at {log.time}
                      </div>
                    </div>

                    <div className="text-right">
                      {log.type === 'PAYMENT' ? (
                        <>
                          <div className="font-black text-emerald-700">+₹{log.amount.toFixed(2)}</div>
                          <div className="text-[10px] text-[#5D6B6B]">
                            Baki: ₹{log.remaining.toFixed(0)}
                          </div>
                        </>
                      ) : (
                        <div className="font-bold text-[#7A535A]">Due: ₹{log.amount.toFixed(0)}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DDD3D3] flex items-center justify-between text-[11px] text-[#5D6B6B]">
            <span className="font-bold text-[#3A2A2D]">PostgreSQL Khata Sync</span>
            <span>Real-time</span>
          </div>
        </div>
      </div>

      {/* 5. FILTER BAR & CUSTOMER KHATA LEDGER TABLE */}
      <div className="bg-white border border-[#DDD3D3] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-[#F1F7F7]/60 border-b border-[#DDD3D3] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#7A535A]" />
            <h3 className="text-sm font-extrabold text-[#3A2A2D]">
              Customer Credit Directory ({filteredCustomers.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-56">
              <Search size={13} className="absolute left-3 top-2.5 text-[#5D6B6B]" />
              <input
                type="text"
                placeholder="Search name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#DDD3D3] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#3A2A2D] focus:outline-none focus:border-[#7A535A]"
              />
            </div>

            <div className="bg-white border border-[#DDD3D3] rounded-xl p-1 flex text-[11px] font-bold">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'OVERDUE', label: 'Overdue' },
                { id: 'CLEAR', label: 'Clear (₹0)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setKhataFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    khataFilter === tab.id
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
                <th className="py-3.5 px-5">Customer Name</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">Credit Limit Usage</th>
                <th className="py-3.5 px-4 text-right">Pending Due (Udhaar)</th>
                <th className="py-3.5 px-4 text-center">Due Date</th>
                <th className="py-3.5 px-4 text-center">Reminder Action</th>
                <th className="py-3.5 px-5 text-center">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD3D3]/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-[#5D6B6B]">
                    Koi customer record nahi mila. Upar "+ Add Customer Khata" se add karein.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const due = Number(c.currentDue || 0);
                  const limit = Number(c.creditLimit || 5000);
                  const pct = limit > 0 ? Math.min(100, Math.round((due / limit) * 100)) : 0;
                  const overdue = isCustomerOverdue(c);

                  return (
                    <tr key={c.id} className="hover:bg-[#FFF8EF]/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-extrabold text-[#3A2A2D]">{c.name}</div>
                        <div className="text-[10px] text-[#5D6B6B]">{c.email || 'No email added'}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#5D6B6B]">{c.phone}</td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                          <span className="text-[#5D6B6B]">₹{limit.toFixed(0)} Limit</span>
                          <span className="text-[#7A535A]">{pct}% used</span>
                        </div>
                        <div className="w-28 bg-[#F1F7F7] h-1.5 rounded-full overflow-hidden border border-[#DDD3D3]/50">
                          <div
                            className={`h-full rounded-full ${pct > 80 ? 'bg-[#7A535A]' : 'bg-[#B0D7D8]'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-sm">
                        <span className={due > 0 ? 'text-[#7A535A]' : 'text-emerald-700'}>
                          ₹{due.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-[#3A2A2D]">
                            {c.dueDate || 'Not Set'}
                          </span>
                          {overdue && (
                            <span className="bg-[#F7CBCA]/80 text-[#7A535A] border border-[#C88A93] px-2 py-0.5 rounded-full text-[9px] font-extrabold">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleSendReminder(c)}
                          disabled={due <= 0 || sendingReminderId === c.id}
                          className="group inline-flex items-center gap-1.5 bg-[#F1F7F7] hover:bg-[#7A535A] disabled:opacity-40 text-[#3A2A2D] hover:text-[#FFF8EF] border border-[#DDD3D3] px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all"
                        >
                          <Send
                            size={12}
                            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                          />
                          {sendingReminderId === c.id ? 'Sending...' : 'Send Reminder'}
                        </button>
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => openPaymentModal(c)}
                          disabled={due <= 0}
                          className="inline-flex items-center gap-1.5 bg-[#D5E5E5] hover:bg-emerald-700 disabled:opacity-40 text-[#3A2A2D] hover:text-white border border-[#B0D7D8] px-3.5 py-1.5 rounded-xl font-extrabold text-[11px] transition-all shadow-2xs"
                        >
                          Receive Payment
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#3A2A2D]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[#DDD3D3]">
            <h3 className="text-base font-extrabold text-[#3A2A2D] mb-4">Add New Customer Khata</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5D6B6B] font-bold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Verma"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5D6B6B] font-bold mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5D6B6B] font-bold mb-1">Email (For Reminders)</label>
                  <input
                    type="email"
                    placeholder="customer@gmail.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5D6B6B] font-bold mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    required
                    value={newCustomer.creditLimit}
                    onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: e.target.value })}
                    className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5D6B6B] font-bold mb-1">Opening Udhaar (₹)</label>
                  <input
                    type="number"
                    value={newCustomer.currentDue}
                    onChange={(e) => setNewCustomer({ ...newCustomer, currentDue: e.target.value })}
                    className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#5D6B6B] font-bold mb-1">Promised Due Date</label>
                <input
                  type="date"
                  value={newCustomer.dueDate}
                  onChange={(e) => setNewCustomer({ ...newCustomer, dueDate: e.target.value })}
                  className="w-full bg-[#F1F7F7]/70 border border-[#DDD3D3] rounded-xl px-3 py-2 text-[#3A2A2D]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#DDD3D3] rounded-xl text-[#5D6B6B] font-bold hover:bg-[#F1F7F7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7A535A] hover:bg-[#3A2A2D] text-[#FFF8EF] font-extrabold rounded-xl"
                >
                  Create Khata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {showPayModal && selectedCust && (
        <div className="fixed inset-0 bg-[#3A2A2D]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-[#DDD3D3]">
            <h3 className="text-base font-extrabold text-[#3A2A2D] mb-1">Receive Udhaar Payment</h3>
            <p className="text-xs text-[#5D6B6B] mb-4">
              Grahak: <strong className="text-[#3A2A2D]">{selectedCust.name}</strong> • Pending:{' '}
              <strong className="text-[#7A535A]">₹{Number(selectedCust.currentDue).toFixed(2)}</strong>
            </p>
            <form onSubmit={handleReceivePayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5D6B6B] font-bold mb-1">Jama Raashi (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={Number(selectedCust.currentDue)}
                  required
                  placeholder="Enter received amount..."
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  className="w-full bg-[#FFF8EF] border border-[#C88A93] rounded-xl px-3 py-2.5 text-sm font-extrabold text-[#3A2A2D]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 border border-[#DDD3D3] rounded-xl text-[#5D6B6B] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7A535A] hover:bg-[#3A2A2D] text-[#FFF8EF] font-extrabold rounded-xl"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}