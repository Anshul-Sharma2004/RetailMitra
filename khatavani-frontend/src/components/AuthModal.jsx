import React, { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  Store,
  Phone,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [authMode, setAuthMode] = useState('LOGIN');
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    shopName: '',
    phone: '',
    otp: '',
    newPassword: '',
    role: 'ROLE_SHOPKEEPER'
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'LOGIN') {
        const res = await api.login({
          email: formData.email,
          password: formData.password
        });
        loginUser(res.data);
        if (onSuccess) onSuccess(); // <-- Trigger redirect to main POS page
        onClose();
      } else if (authMode === 'REGISTER') {
        const res = await api.register({
          email: formData.email,
          password: formData.password,
          shopName: formData.shopName,
          phone: formData.phone,
          role: 'ROLE_SHOPKEEPER'
        });
        loginUser(res.data, { shopName: formData.shopName });
        if (onSuccess) onSuccess(); // <-- Trigger redirect to main POS page
        onClose();
      } else if (authMode === 'FORGOT_STEP_1') {
        await api.forgotPassword(formData.email);
        setSuccessMsg(`OTP sent to: ${formData.email}`);
        setAuthMode('FORGOT_STEP_2');
      } else if (authMode === 'FORGOT_STEP_2') {
        await api.resetPassword({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword
        });
        setSuccessMsg('Password changed successfully! Please login with your new password.');
        setAuthMode('LOGIN');
        setFormData({ ...formData, password: '', otp: '', newPassword: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
        {/* Top Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-200 mb-3">
            K
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {authMode === 'LOGIN' && 'Shopkeeper Login'}
            {authMode === 'REGISTER' && 'Register New Shop'}
            {authMode === 'FORGOT_STEP_1' && 'Reset Password'}
            {authMode === 'FORGOT_STEP_2' && 'Enter Verification Code'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {authMode === 'LOGIN' && 'Login to access your store counter & ledger'}
            {authMode === 'REGISTER' && '7 Days Free Trial with Khatavani.ai Retail OS'}
            {authMode === 'FORGOT_STEP_1' && 'Enter registered email to receive verification OTP'}
            {authMode === 'FORGOT_STEP_2' && 'Enter 6-digit OTP received on email'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-600 text-xs">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700 text-xs">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {authMode === 'REGISTER' && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Dukaan Ka Naam (Shop Name)
                </label>
                <div className="relative mt-1">
                  <Store className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="Sharma Daily Mart"
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Mobile Number
                </label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            </>
          )}

          {authMode !== 'FORGOT_STEP_2' && (
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Shopkeeper Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  placeholder="sharma.kirana@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          {(authMode === 'LOGIN' || authMode === 'REGISTER') && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                {authMode === 'LOGIN' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('FORGOT_STEP_1');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] text-indigo-600 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-indigo-600 transition focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} className="text-indigo-600" /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {authMode === 'FORGOT_STEP_2' && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Enter 6-Digit OTP
                </label>
                <div className="relative mt-1">
                  <KeyRound className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    maxLength="6"
                    required
                    placeholder="123456"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 tracking-widest font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Create New Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Naya password daalein"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-indigo-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} className="text-indigo-600" /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-100 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              authMode === 'LOGIN' ? 'Login to Store Counter' :
              authMode === 'REGISTER' ? 'Register Shop & Start Free Trial' :
              authMode === 'FORGOT_STEP_1' ? 'Send Verification OTP' : 'Set New Password & Login'
            )}
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="mt-5 text-center">
          {authMode === 'LOGIN' && (
            <button
              type="button"
              onClick={() => { setAuthMode('REGISTER'); setError(''); setSuccessMsg(''); }}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Nayi Dukaan Hai? Register New Store
            </button>
          )}
          {authMode === 'REGISTER' && (
            <button
              type="button"
              onClick={() => { setAuthMode('LOGIN'); setError(''); setSuccessMsg(''); }}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Pehle se account hai? Login here
            </button>
          )}
          {(authMode === 'FORGOT_STEP_1' || authMode === 'FORGOT_STEP_2') && (
            <button
              type="button"
              onClick={() => { setAuthMode('LOGIN'); setError(''); setSuccessMsg(''); }}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-indigo-600 font-semibold transition"
            >
              <ArrowLeft size={13} /> Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}