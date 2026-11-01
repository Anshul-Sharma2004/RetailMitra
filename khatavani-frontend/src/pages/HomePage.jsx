import React from 'react';
import {
  Sparkles,
  ShoppingCart,
  BookOpen,
  TrendingUp,
  BellRing,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Bot,
  Layers,
  Database,
  BarChart3,
  Clock
} from 'lucide-react';

export default function HomePage({ onOpenAuth }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800">
      {/* Top Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-200">
              K
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">Khatavani<span className="text-indigo-600">.ai</span></span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">Retail OS</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition">How it Works</a>
            <a href="#pricing" className="hover:text-indigo-600 transition">Pricing Plans</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3.5 py-2 transition"
            >
              Sign In
            </button>
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition shadow-sm shadow-indigo-200"
            >
              Start Free Trial <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/60 px-3.5 py-1.5 rounded-full text-indigo-700 text-xs font-bold shadow-xs">
            <Sparkles size={14} className="text-indigo-600 animate-pulse" />
            <span>Autonomous AI Retail Engine for Indian Kirana Stores</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Apni Kirana Dukan Ko Banayein <br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Smart, Autonomous & 100% Digital
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            Ultra-fast barcode billing, real-time PostgreSQL stock tracking, automated Udhaar Khata reminder emails, aur Hinglish AI Copilot jo dukaan ka har hisaab bataye.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition"
            >
              Register Shop & Get 7 Days Free Trial
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition"
            >
              Live Counter Demo
            </button>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> No Credit Card Required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Instant 2-Minute Setup</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> PostgreSQL ACID Secure</span>
          </div>
        </div>

        {/* Hero Interactive App Preview Mockup */}
        <div className="max-w-6xl mx-auto mt-12 bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/80 shadow-2xl shadow-indigo-100/50">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-xs font-mono text-slate-400 ml-2">khatavani-counter.local</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                ● Live Synchronized
              </span>
            </div>

            {/* Simulated Workspace Preview */}
            <div className="grid grid-cols-12 gap-4 text-left">
              <div className="col-span-12 lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Checkout Counter</span>
                  <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-md">Stock Auto-Decrement Active</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-semibold text-slate-800">Fortune Mustard Oil (1L)</span>
                    <span className="text-slate-500">2 Units &times; ₹165</span>
                    <span className="font-bold text-slate-900">₹330.00</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-semibold text-slate-800">Basmati Rice (1kg)</span>
                    <span className="text-slate-500">1 Unit &times; ₹220</span>
                    <span className="font-bold text-slate-900">₹220.00</span>
                  </div>
                </div>
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Final Payable (Mode: UDHAAR)</span>
                  <span className="text-base font-extrabold text-indigo-600">₹550.00</span>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-5 rounded-2xl shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">AI Store Copilot</span>
                  <Bot size={18} className="text-amber-300" />
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl text-xs space-y-1.5 border border-white/10">
                  <p className="text-indigo-100 text-[11px]">"Bhai Fortune Oil kitna bacha hai?"</p>
                  <p className="font-medium text-white text-[11px]">"Dukan me 6 LITRE Fortune Oil bacha hai. Stock safe limit me hai!"</p>
                </div>
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold">
                  <Clock size={13} />
                  <span>Sub-second database verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-indigo-600">Pure Enterprise Features</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Khatavani.ai Kyun Chunein?</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Chhote kirana store se lekar bade multi-counter mart tak sabhi ke liye tayar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <ShoppingCart size={20} />
              </div>
              <h4 className="text-base font-bold text-slate-800">Instant Billing Counter</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bill generate hote hi backend database se stock automatically kam hota hai. Cash, UPI aur Udhaar payments seamlessly split hote hain[cite: 4].
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <BookOpen size={20} />
              </div>
              <h4 className="text-base font-bold text-slate-800">Udhaar Khata & Auto Mail</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Grahak ka hisaab-kitab rakhein. Button dabate hi current time par ya roz subah scheduled cron job se overdue email reminder automatically fire hota hai[cite: 4, 13].
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Bot size={20} />
              </div>
              <h4 className="text-base font-bold text-slate-800">OpenRouter AI Copilot</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tool Calling ke zariye AI natural Hinglish me seedha PostgreSQL DB se live stock aur daily sales report calculate karke deta hai[cite: 4, 10].
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Tiers Section */}
      <section id="pricing" className="py-20 px-6 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-indigo-600">Simple Transparent Pricing</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Vyapaar Ke Anusaar Plans</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Shuruat karein 7-day fully unlocked free trial ke sath.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Trial */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trial Tier</span>
                <h4 className="text-xl font-extrabold text-slate-900 mt-1">7 Days Free Trial</h4>
                <div className="mt-3 text-3xl font-black text-slate-900">₹0 <span className="text-xs text-slate-400 font-medium">/ 7 din</span></div>
                <p className="text-xs text-slate-500 mt-2">Dukaan setup karein aur system ke features bina kisi rukawat ke explore karein[cite: 1, 3].</p>
                <div className="mt-5 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Full POS Billing Terminal</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Live Inventory Refill</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Udhaar Khata Reminders</div>
                </div>
              </div>
              <button
                onClick={onOpenAuth}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition"
              >
                Start Free Trial
              </button>
            </div>

            {/* Smart Dukan */}
            <div className="bg-white p-7 rounded-3xl border-2 border-indigo-600 shadow-xl shadow-indigo-100/60 space-y-5 relative flex flex-col justify-between">
              <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Popular
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Smart Dukan</span>
                <h4 className="text-xl font-extrabold text-slate-900 mt-1">Vyapar Growth</h4>
                <div className="mt-3 text-3xl font-black text-slate-900">₹499 <span className="text-xs text-slate-400 font-medium">/ month</span></div>
                <p className="text-xs text-slate-500 mt-2">Active retail counters aur daily high-volume Udhaar recovery ke liye[cite: 1, 3].</p>
                <div className="mt-5 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Unlimited SKUs & Products</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Automated Daily Due Reminders</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> In-App Payment Receipts</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> WhatsApp & Email Delivery</div>
                </div>
              </div>
              <button
                onClick={onOpenAuth}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs shadow-md shadow-indigo-100 transition"
              >
                Get Started Now
              </button>
            </div>

            {/* AI Copilot */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Enterprise AI</span>
                <h4 className="text-xl font-extrabold text-slate-900 mt-1">Khatavani Copilot</h4>
                <div className="mt-3 text-3xl font-black text-slate-900">₹999 <span className="text-xs text-slate-400 font-medium">/ month</span></div>
                <p className="text-xs text-slate-500 mt-2">LLM Tool Calling, proactive procurement aur deep store analytics ke saath[cite: 1, 3].</p>
                <div className="mt-5 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> All Smart Dukan Features</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 24/7 Hinglish AI Copilot</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 1-Click Wholesale Restock Order</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Daily/Monthly PDF Reports</div>
                </div>
              </div>
              <button
                onClick={onOpenAuth}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition"
              >
                Upgrade to Copilot
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 px-6 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-600 mb-1">Khatavani.ai &copy; 2026. All rights reserved.</p>
        <p>Built for modern Indian retail & Kirana ecosystem. Powered by Spring Boot, PostgreSQL & Spring AI[cite: 1, 2, 4].</p>
      </footer>
    </div>
  );
}