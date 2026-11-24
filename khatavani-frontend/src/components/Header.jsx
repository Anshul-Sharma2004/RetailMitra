// import React from 'react';
// import { Bell, Sparkles, LogOut, UserCircle2, LogIn } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
//
// export default function Header({ onOpenAi, onOpenAuth }) {
//   const { user, logoutUser } = useAuth();
//
//   return (
//     <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
//       <div className="flex items-center gap-4">
//         <div>
//           <h2 className="text-sm font-bold text-slate-800">
//             {user ? user.email.split('@')[0].toUpperCase() + ' COUNTER' : 'Guest Counter'}
//           </h2>
//           <p className="text-[11px] text-slate-400">
//             {user ? `Role: ${user.role} | Tier: ${user.plan}` : 'Please login to unlock full operations'}
//           </p>
//         </div>
//       </div>
//
//       <div className="flex items-center gap-3">
//         <button
//           onClick={onOpenAi}
//           className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-3 py-2 rounded-xl transition"
//         >
//           <Sparkles size={14} className="text-indigo-600" />
//           Ask Copilot
//         </button>
//
//         {user ? (
//           <div className="flex items-center gap-2 border-l pl-3 ml-2 border-slate-200">
//             <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
//               <UserCircle2 size={16} className="text-slate-500" />
//               <span className="font-semibold">{user.email}</span>
//             </div>
//             <button
//               onClick={logoutUser}
//               title="Logout"
//               className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition"
//             >
//               <LogOut size={16} />
//             </button>
//           </div>
//         ) : (
//           <button
//             onClick={onOpenAuth}
//             className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition shadow-sm"
//           >
//             <LogIn size={15} />
//             Login / Register
//           </button>
//         )}
//       </div>
//     </header>
//   );
// }


import React from 'react';
import { Sparkles, LogOut, UserCircle2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onOpenAi, onOpenAuth }) {
  const { user, logoutUser } = useAuth();

  // Raw enums ko clean user-friendly labels mein format karne ke helpers
  const formatRole = (role) => {
    if (!role) return 'Shopkeeper';
    return role
      .replace('ROLE_', '')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatPlan = (plan) => {
    if (!plan) return 'Free Trial';
    return plan
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <header className="h-16 bg-[#F1F7F7] border-b border-[#DDD3D3] px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-extrabold text-[#3A2A2D] tracking-tight">
              {user ? user.shopName || `${user.email.split('@')[0].toUpperCase()} COUNTER` : 'Guest Counter'}
            </h2>

            {user && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D5E5E5] text-[#3A2A2D] border border-[#B0D7D8]">
                <span>{formatRole(user.role)}</span>
                <span className="text-[#7A535A]">•</span>
                <span className="text-[#7A535A]">{formatPlan(user.plan)}</span>
              </span>
            )}
          </div>

          <p className="text-[11px] text-[#5D6B6B] mt-0.5">
            {user ? 'Live counter synchronized with PostgreSQL' : 'Please login to unlock full store operations'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenAi}
          className="flex items-center gap-1.5 text-xs font-bold text-[#3A2A2D] bg-[#F2D2D4] border border-[#C88A93] hover:bg-[#F7CBCA] px-3.5 py-2 rounded-xl transition shadow-xs"
        >
          <Sparkles size={14} className="text-[#7A535A]" />
          Ask Copilot
        </button>

        {user ? (
          <div className="flex items-center gap-2 border-l pl-3 ml-1 border-[#DDD3D3]">
            <div className="flex items-center gap-1.5 text-xs text-[#3A2A2D] bg-white px-3 py-1.5 rounded-xl border border-[#DDD3D3]">
              <UserCircle2 size={16} className="text-[#5D6B6B]" />
              <span className="font-semibold">{user.email}</span>
            </div>
            <button
              onClick={logoutUser}
              title="Logout"
              className="p-2 rounded-xl text-[#7A535A] hover:bg-[#F7CBCA]/60 transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 text-xs font-bold text-[#FFF8EF] bg-[#7A535A] hover:bg-[#3A2A2D] px-4 py-2 rounded-xl transition shadow-xs"
          >
            <LogIn size={15} />
            Login / Register
          </button>
        )}
      </div>
    </header>
  );
}