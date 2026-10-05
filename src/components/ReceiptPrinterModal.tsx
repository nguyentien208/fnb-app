import React from 'react';
import { useFnBStore } from '../stores/useFnBStore';
import { TableSession, Order, Payment } from '../types';
import { Printer, X, Check, Utensils } from 'lucide-react';

interface ReceiptPrinterModalProps {
  session: TableSession;
  orders: Order[];
  payments: Payment[];
  onClose: () => void;
}

export const ReceiptPrinterModal: React.FC<ReceiptPrinterModalProps> = ({
  session,
  orders,
  payments,
  onClose,
}) => {
  const { tenant, branch, currentUser } = useFnBStore();

  const handlePrint = () => {
    window.print();
  };

  const allItems = orders.flatMap(o => o.items);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col my-8">
        {/* Header bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-sm text-slate-100">In Hóa Đơn Thanh Toán (Receipt)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Thermal Preview Sheet */}
        <div className="p-6 bg-slate-950 flex flex-col items-center">
          <div className="bg-white text-slate-900 font-mono text-xs p-6 rounded-lg w-full max-w-[340px] shadow-xl border border-slate-200 printable-receipt space-y-3">
            {/* Restaurant Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3">
              <h2 className="font-bold text-base uppercase tracking-wider text-black">{tenant.name}</h2>
              <p className="text-[11px] text-slate-600">{branch.name}</p>
              <p className="text-[10px] text-slate-500">{branch.address}</p>
              <p className="text-[10px] text-slate-500">ĐT: {branch.phone} • MST: {branch.taxNumber}</p>
            </div>

            {/* Bill Meta */}
            <div className="text-[11px] space-y-1 border-b border-dashed border-slate-400 pb-2">
              <div className="flex justify-between font-bold">
                <span>HÓA ĐƠN BÁN HÀNG</span>
                <span>{session.sessionNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Bàn / Vị trí:</span>
                <span className="font-bold text-black">{session.tableNameSnapshot}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Giờ mở:</span>
                <span>{new Date(session.openedAt).toLocaleTimeString('vi-VN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Thu ngân:</span>
                <span>{currentUser.name}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border-b border-dashed border-slate-400 pb-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-300 text-[10px] font-bold">
                    <th className="py-1">TÊN MÓN</th>
                    <th className="py-1 text-center">SL</th>
                    <th className="py-1 text-right">Đ.GIÁ</th>
                    <th className="py-1 text-right">T.TIỀN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allItems.map((item, idx) => (
                    <tr key={idx} className="text-[11px]">
                      <td className="py-1.5 font-sans font-medium text-slate-900 pr-1">
                        <div>{item.productNameSnapshot}</div>
                        {item.selectedModifiers.length > 0 && (
                          <div className="text-[9px] text-slate-500">
                            {item.selectedModifiers.map(m => m.modifierName).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                      <td className="py-1.5 text-right">{item.unitPriceSnapshot.toLocaleString('vi-VN')}</td>
                      <td className="py-1.5 text-right font-bold">{item.subtotal.toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Calculation */}
            <div className="space-y-1 text-[11px] pt-1 border-b border-dashed border-slate-400 pb-3">
              <div className="flex justify-between">
                <span>Tạm tính (Subtotal):</span>
                <span>{session.subtotal.toLocaleString('vi-VN')} ₫</span>
              </div>
              {session.discountAmount > 0 && (
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Chiết khấu ({session.discountReason || 'Discount'}):</span>
                  <span>-{session.discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Phí dịch vụ ({branch.serviceChargeRate}%):</span>
                <span>{session.serviceChargeAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Thuế VAT ({branch.vatRate}%):</span>
                <span>{session.taxAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold border-t border-slate-400 pt-1.5 text-black">
                <span>TỔNG CỘNG:</span>
                <span>{session.totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            {/* Payments Summary */}
            <div className="text-[11px] space-y-1 pt-1 border-b border-dashed border-slate-400 pb-2">
              <div className="font-bold text-[10px] text-slate-500 uppercase">Hình thức thanh toán:</div>
              {payments.map((p, idx) => (
                <div key={idx} className="flex justify-between font-medium">
                  <span>{p.paymentMethod === 'VIETQR' ? 'VietQR / Banking' : p.paymentMethod} ({p.transactionCode})</span>
                  <span>{p.amount.toLocaleString('vi-VN')} ₫</span>
                </div>
              ))}
              {payments.some(p => p.changeAmount > 0) && (
                <div className="flex justify-between text-slate-600">
                  <span>Tiền thối lại:</span>
                  <span>{payments.reduce((acc, p) => acc + p.changeAmount, 0).toLocaleString('vi-VN')} ₫</span>
                </div>
              )}
            </div>

            {/* Receipt Footer */}
            <div className="text-center pt-2 text-[10px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-800">CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!</p>
              <p>Powered by GourmetOS SaaS F&B Platform</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex gap-3 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold text-xs transition"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>In Hóa Đơn Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
