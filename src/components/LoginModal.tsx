import React, { useState } from 'react';
import { useFnBStore } from '../stores/useFnBStore';
import { UserRole } from '../types';
import { LogIn, Lock, Mail, ShieldCheck, UserCheck, Key, Utensils, X } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const { users, setRole, logAudit } = useFnBStore();
  const [email, setEmail] = useState<string>('cashier@gourmetos.com');
  const [password, setPassword] = useState<string>('123456');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const demoAccounts = [
    { email: 'admin@gourmetos.com', role: 'SUPER_ADMIN' as UserRole, label: 'Quản Lý / Owner', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { email: 'cashier@gourmetos.com', role: 'CASHIER' as UserRole, label: 'Thu Ngân (POS)', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { email: 'kitchen@gourmetos.com', role: 'KITCHEN' as UserRole, label: 'Bếp / Pha Chế (KDS)', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { email: 'waiter@gourmetos.com', role: 'WAITER' as UserRole, label: 'Nhân Viên Phục Vụ', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      setRole(matchedUser.role);
      logAudit('STAFF_LOGIN', 'User', matchedUser.id, `Đăng nhập hệ thống với vai trò ${matchedUser.role}`);
      onLoginSuccess(matchedUser.role);
    } else {
      setErrorMessage('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  const handleQuickLogin = (demoEmail: string, role: UserRole) => {
    setEmail(demoEmail);
    setPassword('123456');
    setRole(role);
    logAudit('STAFF_LOGIN', 'User', demoEmail, `Đăng nhập nhanh với vai trò ${role}`);
    onLoginSuccess(role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Đăng Nhập Nhân Viên</h3>
              <p className="text-xs text-slate-400">GourmetOS Staff & Management Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs text-red-400 text-center font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email / Tài khoản nhân viên:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cashier@gourmetos.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-medium focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mật khẩu:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-medium focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-xs transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập Nhân Viên</span>
            </button>
          </form>

          {/* Quick Demo Accounts Picker */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block text-center">Đăng nhập nhanh tài khoản mẫu:</span>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => handleQuickLogin(acc.email, acc.role)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between ${acc.color}`}
                >
                  <div className="truncate">
                    <span className="block truncate">{acc.label}</span>
                    <span className="text-[10px] font-mono opacity-70 truncate block">{acc.email.split('@')[0]}</span>
                  </div>
                  <UserCheck className="w-4 h-4 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
