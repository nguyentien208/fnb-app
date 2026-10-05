import React, { useState } from 'react';
import { useFnBStore } from '../stores/useFnBStore';
import { UserRole } from '../types';
import { LoginModal } from './LoginModal';
import { 
  QrCode, Utensils, ChefHat, Monitor, ShieldCheck, 
  Building2, Users, Bell, LogIn, LogOut, UserCheck
} from 'lucide-react';

interface HeaderNavProps {
  currentTab: 'customer' | 'pos' | 'kds' | 'admin';
  setCurrentTab: (tab: 'customer' | 'pos' | 'kds' | 'admin') => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ currentTab, setCurrentTab }) => {
  const { tenant, branch, currentUser, setRole, callWaiters, orders } = useFnBStore();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const pendingCalls = callWaiters.filter(c => c.status === 'PENDING').length;
  const newOrders = orders.filter(o => o.status === 'SUBMITTED' || o.status === 'PREPARING').length;

  const isStaffLoggedIn = currentUser.role !== 'CUSTOMER';

  const handleLogout = () => {
    setRole('CUSTOMER');
    setCurrentTab('customer');
  };

  return (
    <>
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand & Organization info */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base tracking-tight">{tenant.name}</span>
                  <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Nhà Hàng & Bếp
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Đồng bộ trực tuyến
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{branch.name}</span>
                </div>
              </div>
            </div>

            {/* Mobile login button */}
            <div className="md:hidden">
              {isStaffLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="p-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold border border-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-2.5 py-1 bg-orange-500 text-white rounded-lg text-xs font-bold shadow-md"
                >
                  Đăng Nhập
                </button>
              )}
            </div>
          </div>

          {/* System Module Switcher (Customer, POS, KDS, Admin) */}
          <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 w-full md:w-auto justify-center">
            <button
              onClick={() => setCurrentTab('customer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'customer'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Customer QR</span>
            </button>

            <button
              onClick={() => setCurrentTab('pos')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                currentTab === 'pos'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>POS Thu Ngân</span>
              {pendingCalls > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center animate-pulse">
                  {pendingCalls}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('kds')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                currentTab === 'kds'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>KDS Bếp</span>
              {newOrders > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {newOrders}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'admin'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Center</span>
            </button>
          </nav>

          {/* User Auth Status / Login Modal Button (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isStaffLoggedIn ? (
              <div className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-200 leading-none">{currentUser.name}</span>
                  <span className="text-[10px] text-orange-400 font-semibold leading-none mt-1">{currentUser.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-1 text-slate-400 hover:text-red-400 transition"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="py-2 px-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Nhân Viên</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(role) => {
            setShowLoginModal(false);
            if (role === 'CASHIER' || role === 'WAITER') setCurrentTab('pos');
            else if (role === 'KITCHEN') setCurrentTab('kds');
            else if (role === 'SUPER_ADMIN' || role === 'BRANCH_MANAGER' || role === 'TENANT_ADMIN') setCurrentTab('admin');
          }}
        />
      )}
    </>
  );
};
