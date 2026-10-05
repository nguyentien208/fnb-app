import React, { useState } from 'react';
import { useFnBStore } from '../stores/useFnBStore';
import { UserRole } from '../types';
import { LoginModal } from './LoginModal';
import { ShieldAlert, Lock, ArrowLeft, LogIn } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  requiredPermission?: string;
  children: React.ReactNode;
  fallbackTab?: () => void;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  requiredPermission,
  children,
  fallbackTab,
}) => {
  const { currentUser } = useFnBStore();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const isRoleAllowed = allowedRoles.includes(currentUser.role) || currentUser.role === 'SUPER_ADMIN';
  const isPermissionAllowed = !requiredPermission || currentUser.permissions.includes('all') || currentUser.permissions.includes(requiredPermission);

  if (!isRoleAllowed || !isPermissionAllowed) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h3 className="font-extrabold text-lg text-white">Yêu Cầu Đăng Nhập Nhân Viên</h3>
            <p className="text-xs text-slate-400 mt-1">
              Phân hệ này dành riêng cho **Nhân viên thu ngân, Phục vụ, Bếp và Quản lý**. Khách hàng chỉ cần quét mã QR tại bàn để đặt món trực tiếp.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-500 text-left space-y-1 font-mono">
            <div>Vai trò hiện tại: {currentUser.role}</div>
            <div>Yêu cầu quyền: {allowedRoles.join(', ')}</div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập Tài Khoản Nhân Viên</span>
            </button>

            {fallbackTab && (
              <button
                onClick={fallbackTab}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay Về Trang Đặt Món QR Bàn</span>
              </button>
            )}
          </div>
        </div>

        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={() => setShowLoginModal(false)}
          />
        )}
      </div>
    );
  }

  return <>{children}</>;
};
