import React, { useState, useEffect } from 'react';
import { useFnBStore } from '../../stores/useFnBStore';
import { KitchenStation, OrderItemStatus } from '../../types';
import { ChefHat, Clock, CheckCircle2, Flame, RefreshCw, Volume2, AlertTriangle, Coffee } from 'lucide-react';

export const KdsApp: React.FC = () => {
  const { orders, updateOrderItemStatus, tables, tableSessions } = useFnBStore();
  const [selectedStation, setSelectedStation] = useState<KitchenStation | 'ALL'>('ALL');
  const [soundAlertEnabled, setSoundAlertEnabled] = useState<boolean>(true);

  // Extract all un-served order items across active orders
  const allItems = orders.flatMap(order => {
    const session = tableSessions.find(s => s.id === order.tableSessionId);
    const table = session ? tables.find(t => t.id === session.tableId) : null;
    
    return order.items.map(item => ({
      ...item,
      orderNumber: order.orderNumber,
      roundNumber: order.roundNumber,
      tableName: table?.name || session?.tableNameSnapshot || 'Take Away',
      orderCreatedAt: order.createdAt,
    }));
  }).filter(item => item.status !== 'SERVED' && item.status !== 'CANCELLED');

  // Filter by Station
  const filteredItems = allItems.filter(item => selectedStation === 'ALL' || item.kitchenStation === selectedStation);

  // Play audio tone on new order
  useEffect(() => {
    if (soundAlertEnabled && filteredItems.some(i => i.status === 'PENDING')) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }
  }, [filteredItems.length]);

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-slate-100 p-4 flex flex-col gap-4">
      {/* KDS Header Controls */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Kitchen Display System (KDS)</h2>
            <p className="text-xs text-slate-400">Hiển thị món chế biến realtime theo trạm</p>
          </div>
        </div>

        {/* Station Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedStation('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedStation === 'ALL' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất Cả Stations ({allItems.length})
          </button>
          <button
            onClick={() => setSelectedStation('BAR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedStation === 'BAR' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quầy Pha Chế (Bar)
          </button>
          <button
            onClick={() => setSelectedStation('KITCHEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedStation === 'KITCHEN' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bếp Chính (Kitchen)
          </button>
          <button
            onClick={() => setSelectedStation('DESSERT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedStation === 'DESSERT' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bánh & Tráng Miệng
          </button>
        </div>

        {/* Mute Sound Alert Button */}
        <button
          onClick={() => setSoundAlertEnabled(!soundAlertEnabled)}
          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
            soundAlertEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{soundAlertEnabled ? 'Âm Báo: Bật' : 'Âm Báo: Tắt'}</span>
        </button>
      </div>

      {/* Ticket Grid View */}
      {filteredItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-3 py-20">
          <CheckCircle2 className="w-16 h-16 text-emerald-500/40" />
          <h3 className="font-extrabold text-lg text-slate-400">Tất Cả Món Đã Hoàn Thành!</h3>
          <p className="text-xs">Không có ticket nào cần chế biến trong trạm này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const elapsedMins = Math.floor((Date.now() - new Date(item.orderCreatedAt).getTime()) / 60000);
            const isLate = elapsedMins > 10;

            let cardBg = 'bg-slate-900 border-slate-800';
            if (item.status === 'PREPARING') cardBg = 'bg-amber-950/30 border-amber-500/50';
            if (item.status === 'READY') cardBg = 'bg-emerald-950/30 border-emerald-500/50';

            return (
              <div key={item.id} className={`border rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-xl ${cardBg}`}>
                {/* Ticket Top Meta */}
                <div className="space-y-2 border-b border-slate-800/80 pb-3">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-lg text-white">{item.tableName}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isLate ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-300'
                    }`}>
                      <Clock className="w-3 h-3 inline mr-1" />
                      {elapsedMins} phút
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>{item.orderNumber} (Round {item.roundNumber})</span>
                    <span className="text-orange-400 font-bold uppercase">{item.kitchenStation}</span>
                  </div>
                </div>

                {/* Main Product & Modifiers Detail */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-base text-white">{item.productNameSnapshot}</h4>
                    <span className="w-8 h-8 rounded-lg bg-orange-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                      ×{item.quantity}
                    </span>
                  </div>

                  {item.selectedModifiers.length > 0 && (
                    <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60 text-xs text-amber-300 space-y-0.5">
                      {item.selectedModifiers.map((m, idx) => (
                        <div key={idx}>• {m.modifierName}</div>
                      ))}
                    </div>
                  )}

                  {item.note && (
                    <p className="text-xs font-semibold text-red-400 italic bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                      Ghi chú: "{item.note}"
                    </p>
                  )}
                </div>

                {/* Ticket Action Status Button */}
                <div className="pt-2">
                  {item.status === 'PENDING' || item.status === 'CONFIRMED' ? (
                    <button
                      onClick={() => updateOrderItemStatus(item.id, 'PREPARING')}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                    >
                      <Flame className="w-4 h-4" />
                      <span>Bắt Đầu Chế Biến</span>
                    </button>
                  ) : item.status === 'PREPARING' ? (
                    <button
                      onClick={() => updateOrderItemStatus(item.id, 'READY')}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Hoàn Thành (Ready)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => updateOrderItemStatus(item.id, 'SERVED')}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Đã Giao Phục Vụ (Served)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
