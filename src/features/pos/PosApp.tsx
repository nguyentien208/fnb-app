import React, { useState } from 'react';
import { useFnBStore } from '../../stores/useFnBStore';
import { Table, TableSession, PaymentMethod } from '../../types';
import { VietQRModal } from '../../components/VietQRModal';
import { ReceiptPrinterModal } from '../../components/ReceiptPrinterModal';
import { 
  Monitor, LayoutGrid, Coffee, DollarSign, QrCode, CreditCard, 
  ArrowRightLeft, Layers, Percent, CheckCircle2, Printer, Lock, AlertCircle, Bell, Search, Plus, Scissors, Trash2
} from 'lucide-react';

export const PosApp: React.FC = () => {
  const { 
    floors, tables, categories, products, tableSessions, orders, payments, callWaiters, currentShift,
    openTableSession, processPayment, applyDiscount, transferTable, mergeTables, splitBill, cancelOrderItem,
    resolveCallWaiter, openShift, closeShift, currentUser
  } = useFnBStore();

  const [selectedFloorId, setSelectedFloorId] = useState<string>('all');
  const [selectedTableId, setSelectedTableId] = useState<string>('tbl-a01');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showMergeModal, setShowMergeModal] = useState<boolean>(false);
  const [showSplitModal, setShowSplitModal] = useState<boolean>(false);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showVietQrModal, setShowVietQrModal] = useState<boolean>(false);
  const [showShiftModal, setShowShiftModal] = useState<boolean>(false);

  // Form states
  const [cashReceivedInput, setCashReceivedInput] = useState<string>('');
  const [discountValueInput, setDiscountValueInput] = useState<string>('');
  const [discountReasonInput, setDiscountReasonInput] = useState<string>('Khuyến mãi khai trương');
  const [targetTransferTableId, setTargetTransferTableId] = useState<string>('');
  const [selectedMergeTableIds, setSelectedMergeTableIds] = useState<string[]>([]);
  const [selectedSplitItemIds, setSelectedSplitItemIds] = useState<string[]>([]);
  const [cancelItemReason, setCancelItemReason] = useState<string>('Khách đổi món');

  const currentTable = tables.find(t => t.id === selectedTableId) || tables[0];
  const activeSession = tableSessions.find(s => s.tableId === selectedTableId && (s.status === 'OPEN' || s.status === 'BILL_REQUESTED' || s.status === 'PAYING'));
  const sessionOrders = activeSession ? orders.filter(o => o.tableSessionId === activeSession.id) : [];
  const sessionPayments = activeSession ? payments.filter(p => p.tableSessionId === activeSession.id) : [];

  const pendingCalls = callWaiters.filter(c => c.status === 'PENDING');

  // Filtered tables by floor
  const filteredTables = tables.filter(t => selectedFloorId === 'all' || t.floorId === selectedFloorId);

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSelectTable = (table: Table) => {
    setSelectedTableId(table.id);
    if (table.status === 'AVAILABLE') {
      openTableSession(table.id);
    }
  };

  const handleProcessCashPayment = () => {
    if (!activeSession) return;
    const received = parseFloat(cashReceivedInput) || activeSession.remainingAmount;
    if (received < activeSession.remainingAmount) {
      alert('Số tiền khách đưa không đủ!');
      return;
    }

    const res = processPayment(
      activeSession.id,
      'CASH',
      activeSession.remainingAmount,
      received,
      currentUser.id
    );

    if (res.success) {
      setShowPaymentModal(false);
      setShowReceiptModal(true);
      setCashReceivedInput('');
    }
  };

  const handleApplyDiscountSubmit = () => {
    if (!activeSession) return;
    const disc = parseFloat(discountValueInput) || 0;
    applyDiscount(activeSession.id, disc, discountReasonInput);
    setShowDiscountModal(false);
  };

  const handleTransferTableSubmit = () => {
    if (!targetTransferTableId) return;
    const success = transferTable(selectedTableId, targetTransferTableId);
    if (success) {
      setSelectedTableId(targetTransferTableId);
      setShowTransferModal(false);
    } else {
      alert('Không thể chuyển sang bàn này!');
    }
  };

  const handleMergeTablesSubmit = () => {
    if (selectedMergeTableIds.length === 0) return;
    const success = mergeTables(selectedMergeTableIds, selectedTableId);
    if (success) {
      setShowMergeModal(false);
    } else {
      alert('Gộp bàn không thành công!');
    }
  };

  const handleSplitBillSubmit = () => {
    if (!activeSession || selectedSplitItemIds.length === 0) return;
    const newSplitSession = splitBill(activeSession.id, selectedSplitItemIds);
    if (newSplitSession) {
      setShowSplitModal(false);
      alert(`Đã tách bill ${newSplitSession.sessionNumber} thành công!`);
    }
  };

  const handleVoidItem = (itemId: string) => {
    const reason = prompt('Nhập lý do hủy món khỏi bill:', 'Khách đổi món khác');
    if (reason) {
      cancelOrderItem(itemId, reason);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Banner Alert Bar for Pending Call Waiter / Requests */}
      {pendingCalls.length > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>Có {pendingCalls.length} yêu cầu từ khách tại bàn:</span>
            {pendingCalls.map(call => (
              <span key={call.id} className="bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md">
                {call.tableName} ({call.type})
              </span>
            ))}
          </div>
          <button
            onClick={() => resolveCallWaiter(pendingCalls[0].id)}
            className="text-[11px] font-bold bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg hover:bg-amber-400"
          >
            Đã xử lý
          </button>
        </div>
      )}

      {/* Main POS Workspace Split Grid */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* LEFT COLUMN (Cols 3): Floor Plan & Table Map */}
        <div className="col-span-3 border-r border-slate-800 bg-slate-900/60 p-3 flex flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-orange-400" />
              <span>Sơ Đồ Bàn</span>
            </h3>
            {/* Shift status badge */}
            <button
              onClick={() => setShowShiftModal(true)}
              className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700"
            >
              {currentShift ? 'Ca: Đang Mở' : 'Mở Ca Mới'}
            </button>
          </div>

          {/* Floor selector tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedFloorId('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                selectedFloorId === 'all' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Tất Cả
            </button>
            {floors.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFloorId(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                  selectedFloorId === f.id ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          {/* Table Cards Grid */}
          <div className="grid grid-cols-2 gap-2">
            {filteredTables.map(table => {
              const session = tableSessions.find(s => s.tableId === table.id && (s.status === 'OPEN' || s.status === 'BILL_REQUESTED' || s.status === 'PAYING'));
              const isSelected = table.id === selectedTableId;

              let statusColor = 'bg-slate-900 border-slate-800 text-slate-400';
              if (table.status === 'OCCUPIED' || table.status === 'ORDERING') {
                statusColor = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400';
              } else if (table.status === 'BILL_REQUESTED') {
                statusColor = 'bg-amber-950/40 border-amber-500/50 text-amber-400 animate-pulse';
              }

              return (
                <div
                  key={table.id}
                  onClick={() => handleSelectTable(table)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col justify-between h-20 ${statusColor} ${
                    isSelected ? 'ring-2 ring-orange-500 border-orange-500 shadow-lg' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-xs text-white">{table.name}</span>
                    <span className="text-[9px] font-bold px-1 rounded bg-slate-950/60">{table.capacity}P</span>
                  </div>
                  <div>
                    {session ? (
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] text-slate-400">Total:</span>
                        <span className="font-mono text-xs font-bold text-orange-400">
                          {(session.totalAmount / 1000).toFixed(0)}k
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500">Trống</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MIDDLE COLUMN (Cols 5): Menu Item Quick Picker */}
        <div className="col-span-5 border-r border-slate-800 bg-slate-950 p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm sản phẩm nhanh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedCategoryId === 'all' ? 'bg-slate-200 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Tất Cả
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedCategoryId === cat.id ? 'bg-orange-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Cards List */}
          <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl flex items-center gap-2.5 cursor-pointer transition active:scale-95"
                onClick={() => {
                  const store = useFnBStore.getState();
                  store.addToCart({
                    product,
                    quantity: 1,
                    selectedModifiers: [],
                  });
                  store.submitCustomerOrder(selectedTableId, 'POS Cashier Add');
                }}
              >
                <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="overflow-hidden">
                  <h4 className="font-bold text-xs text-white truncate">{product.name}</h4>
                  <span className="font-mono text-xs font-extrabold text-orange-400">
                    {product.price.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (Cols 4): Active Session Check & Invoice Billing */}
        <div className="col-span-4 bg-slate-900/90 p-4 flex flex-col justify-between overflow-y-auto">
          {activeSession ? (
            <div className="space-y-4">
              {/* Session Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-white">{currentTable.name}</h3>
                  <span className="font-mono text-xs text-slate-400">{activeSession.sessionNumber}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700"
                    title="Chuyển Bàn"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Chuyển</span>
                  </button>
                  <button
                    onClick={() => setShowMergeModal(true)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700"
                    title="Gộp Bàn"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Gộp</span>
                  </button>
                  <button
                    onClick={() => setShowSplitModal(true)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700"
                    title="Tách Bill"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Tách Bill</span>
                  </button>
                </div>
              </div>

              {/* Items List grouped by Rounds */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {sessionOrders.map(order => (
                  <div key={order.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>Round {order.roundNumber} ({order.orderNumber})</span>
                      <span>{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</span>
                    </div>
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <span className={`text-slate-200 font-medium ${item.status === 'CANCELLED' ? 'line-through text-red-500' : ''}`}>
                          {item.quantity}× {item.productNameSnapshot}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-400">{item.subtotal.toLocaleString('vi-VN')} ₫</span>
                          {item.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleVoidItem(item.id)}
                              className="text-slate-500 hover:text-red-400 p-0.5"
                              title="Hủy món khỏi bill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Tạm tính (Subtotal):</span>
                  <span className="text-white font-semibold">{activeSession.subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                {activeSession.discountAmount > 0 && (
                  <div className="flex justify-between text-red-400 font-bold">
                    <span>Chiết khấu ({activeSession.discountReason}):</span>
                    <span>-{activeSession.discountAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Phí dịch vụ (5%):</span>
                  <span className="text-white font-semibold">{activeSession.serviceChargeAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Thuế VAT (8%):</span>
                  <span className="text-white font-semibold">{activeSession.taxAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-white pt-1 border-t border-slate-800">
                  <span>Tổng Cần Thanh Toán:</span>
                  <span className="text-orange-400">{activeSession.totalAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
                {activeSession.paidAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold pt-1">
                    <span>Đã thanh toán:</span>
                    <span>{activeSession.paidAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
              </div>

              {/* POS Billing Actions */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDiscountModal(true)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1"
                  >
                    <Percent className="w-3.5 h-3.5 text-orange-400" />
                    <span>Giảm Giá</span>
                  </button>

                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-400" />
                    <span>In Tạm Tính</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Tiền Mặt (Cash)</span>
                  </button>

                  <button
                    onClick={() => setShowVietQrModal(true)}
                    className="py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5 transition"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>VietQR Bank</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Monitor className="w-12 h-12 text-slate-600" />
              <p className="text-xs">Chọn một bàn có khách trên sơ đồ để mở bill & thanh toán.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: CASH PAYMENT WITH CHANGE CALCULATION */}
      {showPaymentModal && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-white">Thanh Toán Tiền Mặt (Cash)</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Số tiền còn lại:</span>
                <span className="font-extrabold text-orange-400 text-sm">{activeSession.remainingAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div>
                <label className="text-slate-300 font-semibold">Tiền khách đưa:</label>
                <input
                  type="number"
                  placeholder={activeSession.remainingAmount.toString()}
                  value={cashReceivedInput}
                  onChange={(e) => setCashReceivedInput(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white placeholder-slate-600"
                />
              </div>

              {/* Quick Money Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[100000, 200000, 500000].map(val => (
                  <button
                    key={val}
                    onClick={() => setCashReceivedInput(val.toString())}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700"
                  >
                    {val / 1000}k
                  </button>
                ))}
              </div>

              {parseFloat(cashReceivedInput) > activeSession.remainingAmount && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex justify-between font-bold text-emerald-400">
                  <span>Tiền thối lại khách:</span>
                  <span>{(parseFloat(cashReceivedInput) - activeSession.remainingAmount).toLocaleString('vi-VN')} ₫</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs">
                Hủy
              </button>
              <button onClick={handleProcessCashPayment} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs">
                Xác Nhận Thu Tiền
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: APPLY DISCOUNT */}
      {showDiscountModal && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-white">Áp Dụng Chiết Khấu / Giảm Giá</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Số tiền giảm (VND):</label>
                <input
                  type="number"
                  placeholder="VD: 20000"
                  value={discountValueInput}
                  onChange={(e) => setDiscountValueInput(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold">Lý do giảm giá:</label>
                <input
                  type="text"
                  value={discountReasonInput}
                  onChange={(e) => setDiscountReasonInput(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDiscountModal(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs">
                Hủy
              </button>
              <button onClick={handleApplyDiscountSubmit} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-xs">
                Cập Nhật Discount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TRANSFER TABLE */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-white">Chuyển Bàn (Transfer Check)</h3>
            <p className="text-xs text-slate-400">Chuyển toàn bộ bill của {currentTable.name} sang bàn trống khác.</p>

            <select
              value={targetTransferTableId}
              onChange={(e) => setTargetTransferTableId(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold"
            >
              <option value="">-- Chọn bàn đích khả dụng --</option>
              {tables.filter(t => t.status === 'AVAILABLE').map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.capacity} chỗ)</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button onClick={() => setShowTransferModal(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs">
                Hủy
              </button>
              <button onClick={handleTransferTableSubmit} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-xs">
                Chuyển Bàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MERGE TABLES */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-white">Gộp Bàn (Merge Tables)</h3>
            <p className="text-xs text-slate-400">Chọn các bàn muốn gộp chung vào bill bàn {currentTable.name}.</p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {tables.filter(t => t.id !== selectedTableId && t.status !== 'AVAILABLE').map(t => (
                <label key={t.id} className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMergeTableIds.includes(t.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedMergeTableIds([...selectedMergeTableIds, t.id]);
                      else setSelectedMergeTableIds(selectedMergeTableIds.filter(id => id !== t.id));
                    }}
                  />
                  <span>{t.name}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowMergeModal(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs">
                Hủy
              </button>
              <button onClick={handleMergeTablesSubmit} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-xs">
                Gộp Bàn Sau Cùng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: SPLIT BILL */}
      {showSplitModal && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-white">Tách Bill Theo Món (Split Check)</h3>
            <p className="text-xs text-slate-400">Chọn món cần tách ra hóa đơn riêng cho khách lẻ:</p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {sessionOrders.flatMap(o => o.items).map(item => (
                <label key={item.id} className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSplitItemIds.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedSplitItemIds([...selectedSplitItemIds, item.id]);
                      else setSelectedSplitItemIds(selectedSplitItemIds.filter(id => id !== item.id));
                    }}
                  />
                  <span>{item.quantity}× {item.productNameSnapshot} ({item.subtotal.toLocaleString('vi-VN')} ₫)</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowSplitModal(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs">
                Hủy
              </button>
              <button onClick={handleSplitBillSubmit} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-xs">
                Xác Nhận Tách Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIETQR PAYMENT MODAL */}
      {showVietQrModal && activeSession && (
        <VietQRModal
          session={activeSession}
          amountToPay={activeSession.remainingAmount}
          onClose={() => setShowVietQrModal(false)}
          onSuccess={() => {
            setShowVietQrModal(false);
            setShowReceiptModal(true);
          }}
        />
      )}

      {/* RECEIPT PRINTER MODAL */}
      {showReceiptModal && activeSession && (
        <ReceiptPrinterModal
          session={activeSession}
          orders={sessionOrders}
          payments={sessionPayments}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
};
