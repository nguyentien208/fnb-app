import React, { useState, useEffect } from 'react';
import { useFnBStore, CartItemInput } from '../../stores/useFnBStore';
import { Product, ModifierGroup, Modifier, CallWaiterType } from '../../types';
import { VietQRModal } from '../../components/VietQRModal';
import { QrScannerModal } from '../../components/QrScannerModal';
import { 
  QrCode, ShoppingBag, Utensils, Coffee, Bell, CheckCircle2, 
  Clock, Plus, Minus, Search, ChevronRight, X, AlertCircle, FileText, Sparkles, Camera, Lock, Flame, Truck
} from 'lucide-react';

interface CustomerAppProps {
  initialTableId?: string;
  isDirectScan?: boolean;
}

export const CustomerApp: React.FC<CustomerAppProps> = ({ initialTableId, isDirectScan }) => {
  const { 
    tables, getTableByQrToken, getActiveSessionByTableId, getOrdersBySessionId, openTableSession,
    categories, products, modifierGroups, customerCart, addToCart, removeFromCart, clearCart,
    submitCustomerOrder, customerCallWaiter, customerRequestBill
  } = useFnBStore();

  const [selectedTableId, setSelectedTableId] = useState<string>(initialTableId || 'tbl-a01');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals & Drawers
  const [showQrScanner, setShowQrScanner] = useState<boolean>(false);
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, Modifier>>({});
  const [itemNote, setItemNote] = useState<string>('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCallWaiterOpen, setIsCallWaiterOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'bill'>('menu');
  const [showVietQrModal, setShowVietQrModal] = useState<boolean>(false);

  useEffect(() => {
    if (initialTableId) {
      setSelectedTableId(initialTableId);
      openTableSession(initialTableId);
    }
  }, [initialTableId, openTableSession]);

  const currentTable = tables.find(t => t.id === selectedTableId) || tables[0];
  const activeSession = getActiveSessionByTableId(currentTable.id);
  const sessionOrders = activeSession ? getOrdersBySessionId(activeSession.id) : [];

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleQrTokenResolved = (token: string) => {
    const table = getTableByQrToken(token);
    if (table) {
      setSelectedTableId(table.id);
      openTableSession(table.id);
      alert(`Đã giải mã QR và mở thực đơn cho ${table.name}!`);
    } else {
      alert('Mã QR Code không hợp lệ!');
    }
  };

  const handleOpenProductModal = (product: Product) => {
    setActiveProductModal(product);
    setItemQty(1);
    setItemNote('');

    const initialMods: Record<string, Modifier> = {};
    product.modifierGroupIds.forEach(groupId => {
      const group = modifierGroups.find(g => g.id === groupId);
      if (group && group.selectionType === 'SINGLE') {
        const def = group.modifiers.find(m => m.isDefault) || group.modifiers[0];
        if (def) initialMods[groupId] = def;
      }
    });
    setSelectedModifiers(initialMods);
  };

  const handleAddToCart = () => {
    if (!activeProductModal) return;

    const modifierList = Object.values(selectedModifiers).map(m => ({
      modifierId: m.id,
      modifierName: m.name,
      price: m.price,
    }));

    const cartInput: CartItemInput = {
      product: activeProductModal,
      quantity: itemQty,
      note: itemNote,
      selectedModifiers: modifierList,
    };

    addToCart(cartInput);
    setActiveProductModal(null);
  };

  const handleCartSubmitOrder = () => {
    const idempotencyKey = `idemp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const res = submitCustomerOrder(selectedTableId, 'Khách đặt qua QR App Mobile', idempotencyKey);
    if (res.success) {
      setIsCartOpen(false);
      setActiveTab('orders');
    } else {
      alert(res.message || 'Lỗi khi nộp order!');
    }
  };

  const handleCallWaiterAction = (type: CallWaiterType) => {
    customerCallWaiter(selectedTableId, type);
    setIsCallWaiterOpen(false);
    alert('Đã gửi yêu cầu đến nhân viên phục vụ!');
  };

  const handleRequestBillAction = () => {
    if (activeSession) {
      customerRequestBill(activeSession.id);
      setActiveTab('bill');
    }
  };

  // Cart financial calculations
  const cartSubtotal = customerCart.reduce((sum, item) => {
    const modPrice = item.selectedModifiers.reduce((acc, m) => acc + m.price, 0);
    return sum + (item.product.price + modPrice) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 max-w-md mx-auto relative shadow-2xl border-x border-slate-800">
      {/* Table Badge Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold shadow-inner">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white">{currentTable.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                currentTable.status === 'OCCUPIED' || currentTable.status === 'ORDERING'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {currentTable.status}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Mã bàn: {currentTable.code} • Sức chứa: {currentTable.capacity} người</p>
          </div>
        </div>

        {isDirectScan ? (
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-xl text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Đã Khóa Bàn</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowQrScanner(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded-xl border border-slate-700 transition"
              title="Quét Mã QR Bàn Khác"
            >
              <Camera className="w-4 h-4" />
            </button>
            <select
              value={selectedTableId}
              onChange={(e) => {
                setSelectedTableId(e.target.value);
                openTableSession(e.target.value);
              }}
              className="bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 rounded-xl px-2 py-1.5 focus:outline-none"
            >
              {tables.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.capacity}P)</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main View Tab Switcher Header */}
      <div className="p-3 bg-slate-900/60 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between">
        <div className="flex gap-1 w-full bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'menu' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Thực Đơn
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition relative ${
              activeTab === 'orders' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Đơn Của Bàn
            {sessionOrders.length > 0 && (
              <span className="ml-1 bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[10px] rounded-full font-extrabold">
                {sessionOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('bill')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'bill' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hóa Đơn
          </button>
        </div>
      </div>

      {/* VIEW 1: MENU */}
      {activeTab === 'menu' && (
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn, thức uống..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-200 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Tất Cả
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-1">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => handleOpenProductModal(product)}
                className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 p-3 rounded-2xl flex gap-3 cursor-pointer transition active:scale-[0.99]"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="font-bold text-sm text-white line-clamp-1">{product.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-extrabold text-sm text-orange-400">
                      {product.price.toLocaleString('vi-VN')} ₫
                    </span>
                    <button className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold hover:bg-orange-500 hover:text-white transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: ORDERS HISTORY WITH REALTIME DISH SERVING STATUS & ELAPSED WAIT TIMER */}
      {activeTab === 'orders' && (
        <div className="p-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Phiên Hiện Tại</span>
              <h3 className="font-extrabold text-base text-white">{activeSession?.sessionNumber || 'Chưa mở session'}</h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">Tổng Tiền Bàn</span>
              <p className="font-extrabold text-base text-orange-400">
                {(activeSession?.totalAmount || 0).toLocaleString('vi-VN')} ₫
              </p>
            </div>
          </div>

          {sessionOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Utensils className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs">Chưa có đơn hàng nào được gửi cho bàn này.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionOrders.map(order => {
                const elapsedMins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                const isSlow = elapsedMins > 10;

                return (
                  <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          Round {order.roundNumber}
                        </span>
                        <span className="font-mono text-xs font-bold text-white">{order.orderNumber}</span>
                      </div>

                      {/* Customer Wait Time Indicator Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isSlow ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' :
                        elapsedMins > 5 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>Đã chờ: {elapsedMins} phút</span>
                      </span>
                    </div>

                    {/* Order Items with Dish Serving Tracker */}
                    <div className="space-y-3">
                      {order.items.map(item => {
                        let statusBadge = (
                          <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Đã nhận - Chờ bếp</span>
                          </span>
                        );
                        if (item.status === 'PREPARING') {
                          statusBadge = (
                            <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-400 animate-bounce" />
                              <span>Đang chế biến</span>
                            </span>
                          );
                        } else if (item.status === 'READY') {
                          statusBadge = (
                            <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Truck className="w-3 h-3 text-blue-400 animate-pulse" />
                              <span>Đang lên món ra bàn</span>
                            </span>
                          );
                        } else if (item.status === 'SERVED') {
                          statusBadge = (
                            <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Đã lên món 🍽️</span>
                            </span>
                          );
                        } else if (item.status === 'CANCELLED') {
                          statusBadge = (
                            <span className="text-[10px] font-bold bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                              Đã hủy món
                            </span>
                          );
                        }

                        return (
                          <div key={item.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                            <div className="flex justify-between items-start text-xs">
                              <span className="font-bold text-slate-200">{item.quantity}× {item.productNameSnapshot}</span>
                              <span className="font-bold text-orange-400">{item.subtotal.toLocaleString('vi-VN')} ₫</span>
                            </div>
                            {item.selectedModifiers.length > 0 && (
                              <p className="text-[10px] text-slate-400">
                                {item.selectedModifiers.map(m => m.modifierName).join(', ')}
                              </p>
                            )}

                            {/* Dish Serving Status Progress Line */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                              <span className="text-[10px] text-slate-500">Trạng thái món:</span>
                              {statusBadge}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: BILL & PAYMENT */}
      {activeTab === 'bill' && activeSession && (
        <div className="p-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="text-center border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400">Hóa Đơn Tạm Tính</span>
              <h3 className="font-extrabold text-2xl text-orange-400 mt-1">
                {activeSession.totalAmount.toLocaleString('vi-VN')} ₫
              </h3>
              <p className="text-xs text-slate-500 mt-1">{activeSession.tableNameSnapshot} • {activeSession.sessionNumber}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tạm tính món:</span>
                <span className="text-white font-semibold">{activeSession.subtotal.toLocaleString('vi-VN')} ₫</span>
              </div>
              {activeSession.discountAmount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Chiết khấu:</span>
                  <span className="font-bold">-{activeSession.discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Phí dịch vụ:</span>
                <span className="text-white font-semibold">{activeSession.serviceChargeAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Thuế VAT:</span>
                <span className="text-white font-semibold">{activeSession.taxAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={() => setShowVietQrModal(true)}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-xs transition"
              >
                <QrCode className="w-4 h-4" />
                <span>Thanh Toán Ngay Qua VietQR</span>
              </button>

              <button
                onClick={handleRequestBillAction}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-xs transition"
              >
                Yêu Cầu Nhân Viên Đến Thu Tiền Mặt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 z-30 flex items-center gap-2">
        <button
          onClick={() => setIsCallWaiterOpen(true)}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700 transition"
          title="Gọi Nhân Viên"
        >
          <Bell className="w-5 h-5 animate-pulse" />
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          disabled={customerCart.length === 0}
          className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-between text-xs transition"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Giỏ Món ({customerCart.length})</span>
          </div>
          <span className="font-extrabold">{cartSubtotal.toLocaleString('vi-VN')} ₫</span>
        </button>
      </div>

      {/* MODAL: PRODUCT CUSTOMIZATION */}
      {activeProductModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-5 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <img src={activeProductModal.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                <div>
                  <h3 className="font-bold text-base text-white">{activeProductModal.name}</h3>
                  <span className="font-extrabold text-orange-400 text-sm">
                    {activeProductModal.price.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
              <button onClick={() => setActiveProductModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modifiers List */}
            {activeProductModal.modifierGroupIds.map(groupId => {
              const group = modifierGroups.find(g => g.id === groupId);
              if (!group) return null;
              return (
                <div key={group.id} className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-300">{group.name}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {group.modifiers.map(mod => {
                      const isSelected = selectedModifiers[group.id]?.id === mod.id;
                      return (
                        <button
                          key={mod.id}
                          onClick={() => setSelectedModifiers({ ...selectedModifiers, [group.id]: mod })}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition flex justify-between ${
                            isSelected
                              ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span>{mod.name}</span>
                          {mod.price > 0 && <span>+{mod.price / 1000}k</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Note & Quantity */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300">Ghi chú cho bếp/pha chế:</label>
              <input
                type="text"
                placeholder="VD: Ít đường, nhiều đá, không hành..."
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setItemQty(Math.max(1, itemQty - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm w-4 text-center">{itemQty}</span>
                <button
                  onClick={() => setItemQty(itemQty + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 transition"
              >
                Thêm Vào Giỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: CART SUMMARY & SUBMIT */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-sm p-0">
          <div className="bg-slate-900 border-t border-slate-800 w-full max-w-md rounded-t-3xl max-h-[80vh] overflow-y-auto p-5 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Giỏ Hàng Của Bàn</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {customerCart.map((item, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs text-white">{item.quantity}× {item.product.name}</h4>
                    {item.selectedModifiers.length > 0 && (
                      <p className="text-[10px] text-slate-400">{item.selectedModifiers.map(m => m.modifierName).join(', ')}</p>
                    )}
                    {item.note && <p className="text-[10px] text-amber-400 italic">"{item.note}"</p>}
                  </div>
                  <button onClick={() => removeFromCart(idx)} className="text-slate-500 hover:text-red-400 text-xs">
                    Xóa
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-sm text-white">
                <span>Tổng cộng:</span>
                <span className="text-orange-400">{cartSubtotal.toLocaleString('vi-VN')} ₫</span>
              </div>
              <button
                onClick={handleCartSubmitOrder}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 transition"
              >
                Xác Nhận Gửi Đơn Đặt Món
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CALL WAITER OPTIONS */}
      {isCallWaiterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xs rounded-2xl p-5 space-y-3 text-center">
            <h3 className="font-bold text-sm text-white">Gọi Phục Vụ Tại Bàn</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCallWaiterAction('WAITER')}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 text-slate-200"
              >
                Phục Vụ Hỗ Trợ
              </button>
              <button
                onClick={() => handleCallWaiterAction('WATER')}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 text-slate-200"
              >
                Xin Thêm Nước
              </button>
              <button
                onClick={() => handleCallWaiterAction('UTENSILS')}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 text-slate-200"
              >
                Xin Thêm Dụng Cụ
              </button>
              <button
                onClick={() => handleCallWaiterAction('BILL')}
                className="p-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/30"
              >
                Tính Tiền
              </button>
            </div>
            <button onClick={() => setIsCallWaiterOpen(false)} className="text-xs text-slate-500 mt-2">Hủy</button>
          </div>
        </div>
      )}

      {/* QR CAMERA SCANNER MODAL */}
      {showQrScanner && (
        <QrScannerModal
          onSelectTableToken={handleQrTokenResolved}
          onClose={() => setShowQrScanner(false)}
        />
      )}

      {/* VIETQR PAYMENT MODAL */}
      {showVietQrModal && activeSession && (
        <VietQRModal
          session={activeSession}
          amountToPay={activeSession.remainingAmount || activeSession.totalAmount}
          onClose={() => setShowVietQrModal(false)}
          onSuccess={() => {
            setShowVietQrModal(false);
            alert('Thanh toán thành công! Cảm ơn Quý khách.');
          }}
        />
      )}
    </div>
  );
};
