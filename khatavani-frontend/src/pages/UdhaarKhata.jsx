import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  BookOpen,
  UserPlus,
  Mail,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';

export default function UdhaarKhata() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

  // Modals state
  const [showAddCust, setShowAddCust] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  const [custForm, setCustForm] = useState({
    name: '',
    phone: '',
    email: '',
    currentDue: '0.00',
    creditLimit: '5000.00',
    dueDate: ''
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers();
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 1. Instant Email Trigger (Current Time per turant email bhejna)
  const handleSendInstantEmail = async (customer) => {
    if (!customer.email) {
      setStatusMessage({
        text: `${customer.name} ka Email ID registered nahi hai! Email bhejne ke liye email zaroori hai.`,
        isError: true
      });
      return;
    }

    setSendingEmailId(customer.id);
    setStatusMessage({ text: '', isError: false });

    try {
      const res = await api.sendInstantReminder(customer.id);
      setStatusMessage({
        text: `Reminder email successfully bhej di gayi: ${customer.email}`,
        isError: false
      });
    } catch (err) {
      setStatusMessage({
        text: err.response?.data?.message || err.message || 'Email send fail hui.',
        isError: true
      });
    } finally {
      setSendingEmailId(null);
    }
  };

  // 2. Trigger Auto Scheduler Cron Job Manually
  const handleTriggerCronJob = async () => {
    try {
      await api.triggerAutoCronJob();
      setStatusMessage({
        text: "Auto-scheduler execute hua: Due date expired grahakon ko automated mails fire ho gayi!",
        isError: false
      });
    } catch (err) {
      setStatusMessage({ text: "Scheduler run error: " + err.message, isError: true });
    }
  };

  // 3. Receive Udhaar Payment
  const handleReceivePayment = async (e) => {
    e.preventDefault();
    if (!selectedCust || !payAmount) return;
    try {
      await api.receivePayment({
        customerId: selectedCust.id,
        amountPaid: Number(payAmount)
      });
      setShowPayModal(false);
      setPayAmount('');
      fetchCustomers();
      setStatusMessage({ text: "Payment receive ho gayi aur balance update ho gaya!", isError: false });
    } catch (err) {
      setStatusMessage({ text: 'Error: ' + err.message, isError: true });
    }
  };

  // 4. Add Customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.addCustomer({
        ...custForm,
        currentDue: Number(custForm.currentDue),
        creditLimit: Number(custForm.creditLimit),
        dueDate: custForm.dueDate ? custForm.dueDate : null
      });
      setShowAddCust(false);
      setCustForm({ name: '', phone: '', email: '', currentDue: '0.00', creditLimit: '5000.00', dueDate: '' });
      fetchCustomers();
      setStatusMessage({ text: "Naya grahak khata successfully open ho gaya!", isError: false });
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Top Header & Automated Scheduler Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Udhaar Khata (Customer Ledger)</h2>
          <p className="text-xs text-slate-400">Track pending credits, credit limits, and collections</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchCustomers}
            className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddCust(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition shadow-sm"
          >
            <UserPlus size={15} /> Add Customer Khata
          </button>
        </div>
      </div>

      {/* Backend Auto-Scheduler Status Card */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/40 border border-indigo-100/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <Clock size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-800">Automated Backend Cron Job Active</h4>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                DAILY 9:00 AM
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Jiss grahak ki Due Date nikal chuki hai (`due_date &le; CURRENT_DATE`), backend scheduler unhe automatically reminder email send karta hai.
            </p>
          </div>
        </div>

        <button
          onClick={handleTriggerCronJob}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 px-3.5 py-2 rounded-xl transition shadow-sm"
        >
          <Mail size={14} /> Run Auto-Scheduler Now
        </button>
      </div>

      {/* Status Notifications */}
      {statusMessage.text && (
        <div
          className={`flex items-center gap-2 text-xs p-3 rounded-xl ${
            statusMessage.isError
              ? 'bg-rose-50 border border-rose-200 text-rose-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}
        >
          {statusMessage.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Customer Ledger Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-4">Contact Phone</th>
              <th className="py-3 px-4 text-right">Credit Limit</th>
              <th className="py-3 px-4 text-right">Pending Due (Udhaar)</th>
              <th className="py-3 px-4 text-center">Due Date</th>
              <th className="py-3 px-4 text-center">Reminder Action</th>
              <th className="py-3 px-4 text-center">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  No customers found in ledger. Add a customer to track udhaar.
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const isOverdue = c.dueDate && new Date(c.dueDate) <= new Date() && Number(c.currentDue) > 0;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.email || 'No email attached'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{c.phone}</td>
                    <td className="py-3.5 px-4 text-right text-slate-600">₹{Number(c.creditLimit).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                      ₹{Number(c.currentDue).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                          {c.dueDate || 'No Date'}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded-md font-bold">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Instant Email Send Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleSendInstantEmail(c)}
                        disabled={sendingEmailId === c.id || Number(c.currentDue) <= 0}
                        title="Send Reminder Email Right Now"
                        className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl text-[11px] font-bold transition disabled:opacity-40"
                      >
                        <Send size={12} className={sendingEmailId === c.id ? 'animate-spin' : ''} />
                        {sendingEmailId === c.id ? "Sending..." : "Send Reminder"}
                      </button>
                    </td>

                    {/* Receive Payment Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => { setSelectedCust(c); setShowPayModal(true); }}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl text-[11px] font-bold transition"
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

      {/* Receive Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-1">Receive Udhaar Payment</h3>
            <p className="text-xs text-slate-500 mb-4">Customer: <strong className="text-slate-800">{selectedCust?.name}</strong></p>
            <form onSubmit={handleReceivePayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm">
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCust && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-4">Open New Customer Khata</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Ramesh Kumar"
                  value={custForm.name}
                  onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="9811122233"
                    value={custForm.phone}
                    onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email (For Reminders)</label>
                  <input
                    type="email"
                    required
                    placeholder="anshulsrma1911@gmail.com"
                    value={custForm.email}
                    onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={custForm.creditLimit}
                    onChange={(e) => setCustForm({ ...custForm, creditLimit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={custForm.dueDate}
                    onChange={(e) => setCustForm({ ...custForm, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCust(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                  Register Khata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}