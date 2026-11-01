import React from 'react';
import { Bell, Sparkles, LogOut, UserCircle2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onOpenAi, onOpenAuth }) {
  const { user, logoutUser } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            {user ? user.email.split('@')[0].toUpperCase() + ' COUNTER' : 'Guest Counter'}
          </h2>
          <p className="text-[11px] text-slate-400">
            {user ? `Role: ${user.role} | Tier: ${user.plan}` : 'Please login to unlock full operations'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenAi}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-3 py-2 rounded-xl transition"
        >
          <Sparkles size={14} className="text-indigo-600" />
          Ask Copilot
        </button>

        {user ? (
          <div className="flex items-center gap-2 border-l pl-3 ml-2 border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <UserCircle2 size={16} className="text-slate-500" />
              <span className="font-semibold">{user.email}</span>
            </div>
            <button
              onClick={logoutUser}
              title="Logout"
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition shadow-sm"
          >
            <LogIn size={15} />
            Login / Register
          </button>
        )}
      </div>
    </header>
  );
}