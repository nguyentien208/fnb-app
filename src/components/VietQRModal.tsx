import React, { useState, useEffect } from 'react';
import { useFnBStore } from '../stores/useFnBStore';
import { TableSession } from '../types';
import { QrCode, CheckCircle2, Copy, RefreshCw, X, ShieldCheck, AlertCircle } from 'lucide-react';

interface VietQRModalProps {
  session: TableSession;
  amountToPay: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const VietQRModal: React.FC<VietQRModalProps> = ({
  session,
  amountToPay,
  onClose,
  onSuccess,
}) => {
  const { branch, processPayment, currentUser } = useFnBStore();
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  const bank = branch.bankAccount;
  const memoText = `CHUYEN KHOAN ${session.sessionNumber} ${session.tableNameSnapshot.replace(/\s+/g, '')}`;

  // VietQR Quick Image Payload URL (NAPAS standard)
  const vietQrUrl = `https://img.vietqr.io/image/MBBANK-${bank.accountNo}-compact2.png?amount=${amountToPay}&addInfo=${encodeURIComponent(memoText)}&accountName=${encodeURIComponent(bank.accountName)}`;

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(memoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateWebhook = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = processPayment(
        session.id,
        'VIETQR',
        amountToPay,
        amountToPay,
        currentUser.id,
        `VQR-${Math.floor(1000000 + Math.random() * 9000000)}`
      );

      setIsVerifying(false);
      if (res.success) {
        setPaidSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Thanh Toán Chuyển Khoản VietQR</h3>
              <p className="text-xs text-slate-400">{session.tableNameSnapshot} • {session.sessionNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center gap-4 text-center">
          {paidSuccess ? (
            <div className="py-8 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-extrabold text-xl text-emerald-400">Giao Dịch Thành Công!</h4>
              <p className="text-sm text-slate-300">Đã ghi nhận thanh toán VietQR cho hoá đơn {session.sessionNumber}.</p>
            </div>
          ) : (
            <>
              {/* QR Image Box */}
              <div className="bg-white p-3 rounded-2xl shadow-inner border border-slate-700 relative group">
                <img
                  src={vietQrUrl}
                  alt="VietQR Code"
                  className="w-56 h-56 object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback to stylized SVG placeholder if image generator API is slow
                    e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(memoText + ' - ' + amountToPay + 'VND')}`;
                  }}
                />
                <div className="absolute inset-0 bg-slate-950/70 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4">
                  <p className="text-xs text-slate-200 font-medium">Quét QR từ App Ngân Hàng hoặc MoMo / ZaloPay để thanh toán</p>
                </div>
              </div>

              {/* Amount Display */}
              <div className="bg-slate-950/70 border border-slate-800 w-full p-3 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Số tiền thanh toán:</span>
                <span className="font-extrabold text-lg text-orange-400">{amountToPay.toLocaleString('vi-VN')} ₫</span>
              </div>

              {/* Banking Transfer Details */}
              <div className="w-full bg-slate-800/40 rounded-xl p-3 border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="font-semibold text-white">{bank.bankName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <span className="font-mono font-bold text-orange-400">{bank.accountNo}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <span className="font-semibold text-white">{bank.accountName}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700/60">
                  <span className="text-slate-400">Nội dung CK:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-400">
                    <span>{memoText}</span>
                    <button
                      onClick={handleCopyMemo}
                      className="p-1 text-slate-400 hover:text-white transition"
                      title="Sao chép nội dung"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Webhook Verification Trigger */}
              <div className="w-full pt-2">
                <button
                  onClick={handleSimulateWebhook}
                  disabled={isVerifying}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang kiểm tra kết quả ngân hàng...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Xác Nhận Đã Nhận Tiền (Simulate Webhook)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3 text-slate-500" />
                  Tự động xác nhận giao dịch 24/7 qua Webhook ngân hàng
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
