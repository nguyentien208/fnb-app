import React, { useState } from 'react';
import { useFnBStore } from '../../stores/useFnBStore';
import { Product, KitchenStation } from '../../types';
import { 
  BarChart3, Utensils, QrCode, Package, Users, FileText, 
  TrendingUp, DollarSign, ShoppingBag, Plus, Trash2, Edit, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, Printer, Wifi, Globe
} from 'lucide-react';

export const AdminApp: React.FC = () => {
  const { 
    tenant, branch, products, categories, tables, ingredients, tableSessions, orders, payments, auditLogs, floors,
    addProduct, updateProduct, deleteProduct, addCategory, deleteCategory, addTable, deleteTable, updateIngredientStock
  } = useFnBStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'tables' | 'inventory' | 'rbac' | 'audit'>('dashboard');

  // Network Host IP configuration for real phone scanning
  const detectedIp = window.location.hostname === 'localhost' ? '192.168.11.107' : window.location.hostname;
  const detectedPort = window.location.port || '3000';
  const [networkHost, setNetworkHost] = useState<string>(`${detectedIp}:${detectedPort}`);

  // New Product Modal Form state
  const [showAddProdModal, setShowAddProdModal] = useState<boolean>(false);
  const [prodName, setProdName] = useState<string>('');
  const [prodPrice, setProdPrice] = useState<string>('');
  const [prodCost, setProdCost] = useState<string>('');
  const [prodCategory, setProdCategory] = useState<string>(categories[0]?.id || '');
  const [prodStation, setProdStation] = useState<KitchenStation>('BAR');
  const [prodImg, setProdImg] = useState<string>('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80');

  // New Category Modal Form state
  const [showAddCatModal, setShowAddCatModal] = useState<boolean>(false);
  const [catName, setCatName] = useState<string>('');
  const [catIcon, setCatIcon] = useState<string>('Utensils');

  // New Table Modal Form state
  const [showAddTableModal, setShowAddTableModal] = useState<boolean>(false);
  const [tableName, setTableName] = useState<string>('');
  const [tableCapacity, setTableCapacity] = useState<number>(4);
  const [tableFloorId, setTableFloorId] = useState<string>(useFnBStore.getState().floors[0]?.id || 'floor-01');

  // Calculated Metrics
  const totalRevenue = payments.filter(p => p.status === 'SUCCESS').reduce((acc, p) => acc + p.amount, 0);
  const totalOrders = tableSessions.length;
  const activeTablesCount = tables.filter(t => t.status !== 'AVAILABLE').length;

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;

    addProduct({
      tenantId: tenant.id,
      branchId: branch.id,
      categoryId: prodCategory,
      name: prodName,
      slug: prodName.toLowerCase().replace(/\s+/g, '-'),
      sku: `PROD-${Math.floor(100 + Math.random() * 900)}`,
      description: 'Món ăn/thức uống mới bổ sung vào thực đơn',
      image: prodImg,
      price: parseFloat(prodPrice),
      costPrice: parseFloat(prodCost) || 0,
      kitchenStation: prodStation,
      status: 'AVAILABLE',
      modifierGroupIds: ['modgrp-size', 'modgrp-ice'],
    });

    setShowAddProdModal(false);
    setProdName('');
    setProdPrice('');
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    addCategory({
      tenantId: tenant.id,
      branchId: branch.id,
      name: catName,
      slug: catName.toLowerCase().replace(/\s+/g, '-'),
      icon: catIcon,
      sortOrder: categories.length + 1,
    });

    setShowAddCatModal(false);
    setCatName('');
  };

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName) return;

    addTable({
      tenantId: tenant.id,
      branchId: branch.id,
      floorId: tableFloorId,
      name: tableName,
      code: tableName.toUpperCase().replace(/\s+/g, ''),
      capacity: Number(tableCapacity) || 4,
      status: 'AVAILABLE',
      sortOrder: tables.length + 1,
      active: true,
    });

    setShowAddTableModal(false);
    setTableName('');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* Admin Module Navigation Header */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Trung Tâm Quản Lý Nhà Hàng</h2>
            <p className="text-xs text-slate-400">Quản lý Thực đơn, Bàn ăn & Báo cáo Doanh thu • {tenant.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'dashboard' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'menu' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Thực Đơn</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'tables' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Bàn & Mã QR Bàn</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'inventory' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Kho & Công Thức</span>
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'rbac' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Nhân Viên & RBAC</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit Log</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DASHBOARD METRICS & ADVANCED ANALYTICS */}
      {activeTab === 'dashboard' && (() => {
        // Detailed Analytics Computations
        const activeOrders = orders.filter(o => o.status !== 'CANCELLED');
        const successfulPayments = payments.filter(p => p.status === 'SUCCESS');

        // Top Selling Dishes Computation
        const itemSalesMap: Record<string, { name: string; totalQty: number; totalRevenue: number; image?: string }> = {};
        activeOrders.forEach(order => {
          order.items.forEach(item => {
            if (item.status === 'CANCELLED') return;
            const product = products.find(p => p.id === item.productId);
            if (!itemSalesMap[item.productId]) {
              itemSalesMap[item.productId] = {
                name: item.productNameSnapshot,
                totalQty: 0,
                totalRevenue: 0,
                image: product?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80',
              };
            }
            itemSalesMap[item.productId].totalQty += item.quantity;
            itemSalesMap[item.productId].totalRevenue += item.subtotal;
          });
        });
        const topSellingDishes = Object.values(itemSalesMap)
          .sort((a, b) => b.totalQty - a.totalQty)
          .slice(0, 5);

        // Hourly Revenue Breakdown (0h - 23h)
        const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
          const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
          const countOrders = activeOrders.filter(o => new Date(o.createdAt).getHours() === hour).length;
          const totalAmount = activeOrders
            .filter(o => new Date(o.createdAt).getHours() === hour)
            .reduce((sum, o) => sum + o.subtotal, 0);
          return { hourLabel, countOrders, totalAmount };
        });
        const maxHourlyRevenue = Math.max(...hourlyStats.map(h => h.totalAmount), 1);

        // Revenue Breakdown by Payment Method
        const paymentMethodMap: Record<string, number> = {
          CASH: 0,
          VIETQR: 0,
          BANK_TRANSFER: 0,
          CARD: 0,
        };
        successfulPayments.forEach(p => {
          paymentMethodMap[p.paymentMethod] = (paymentMethodMap[p.paymentMethod] || 0) + p.amount;
        });

        // Average Order Value (AOV)
        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        return (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Tổng Doanh Thu</span>
                  <h3 className="font-extrabold text-xl text-emerald-400 mt-1">
                    {totalRevenue.toLocaleString('vi-VN')} ₫
                  </h3>
                  <span className="text-[10px] text-emerald-500 font-bold">+12.5% so với hôm qua</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Tổng Số Đơn Bàn</span>
                  <h3 className="font-extrabold text-xl text-white mt-1">{totalOrders} lượt</h3>
                  <span className="text-[10px] text-slate-400 font-medium">Phiên bàn mở</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Giá Trị TB/Đơn (AOV)</span>
                  <h3 className="font-extrabold text-xl text-orange-400 mt-1">
                    {avgOrderValue.toLocaleString('vi-VN')} ₫
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">TB trên từng phiên</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Bàn Đang Sử Dụng</span>
                  <h3 className="font-extrabold text-xl text-amber-400 mt-1">
                    {activeTablesCount} / {tables.length}
                  </h3>
                  <span className="text-[10px] text-amber-400 font-bold">Công suất: {Math.round((activeTablesCount / tables.length) * 100)}%</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Kho Cảnh Báo Tồn</span>
                  <h3 className="font-extrabold text-xl text-red-400 mt-1">
                    {ingredients.filter(i => i.currentStock <= i.minStockLevel).length} NL
                  </h3>
                  <span className="text-[10px] text-red-400 font-bold">Cần nhập thêm</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Charts & Analytical Breakdown Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Hourly Revenue Distribution Bar Chart (Cols 7) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-orange-400" />
                      <span>Biểu Đồ Doanh Thu Theo Khung Giờ Trong Ngày</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Phân tích giờ cao điểm và phân bổ doanh thu</p>
                  </div>
                  <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                    24h Realtime
                  </span>
                </div>

                <div className="h-48 flex items-end gap-1.5 pt-4 pb-2 px-2 overflow-x-auto">
                  {hourlyStats.filter((_, idx) => idx >= 7 && idx <= 23).map(h => {
                    const heightPercent = Math.max(8, Math.round((h.totalAmount / maxHourlyRevenue) * 100));
                    return (
                      <div key={h.hourLabel} className="flex-1 flex flex-col items-center gap-1 group relative min-w-[24px]">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-slate-950 text-white text-[10px] font-mono px-2 py-1 rounded-lg border border-slate-700 pointer-events-none whitespace-nowrap z-20 shadow-xl transition">
                          {h.hourLabel}: {h.totalAmount.toLocaleString('vi-VN')} ₫ ({h.countOrders} đơn)
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-orange-600 to-amber-400 rounded-t-md group-hover:from-orange-500 group-hover:to-amber-300 transition-all shadow-md"
                        />
                        <span className="text-[9px] font-mono text-slate-400">{h.hourLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Selling Dishes Table (Cols 5) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-emerald-400" />
                    <span>Top Món Bán Chạy Nhất</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">Xếp theo số lượng</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {topSellingDishes.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">Chưa có dữ liệu bán món trong phiên này.</p>
                  ) : (
                    topSellingDishes.map((dish, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center ${
                            idx === 0 ? 'bg-amber-500 text-slate-950' :
                            idx === 1 ? 'bg-slate-300 text-slate-950' :
                            idx === 2 ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <img src={dish.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                          <div>
                            <h4 className="font-bold text-xs text-white line-clamp-1">{dish.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">Đã bán: <strong className="text-emerald-400">{dish.totalQty} phần</strong></span>
                          </div>
                        </div>
                        <span className="font-bold text-xs text-orange-400 font-mono">
                          {dish.totalRevenue.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Breakdown & Shift Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <span>Cơ Cấu Doanh Thu Theo Phương Thức Thanh Toán</span>
                </h3>

                <div className="space-y-3">
                  {Object.entries(paymentMethodMap).map(([method, amount]) => {
                    const percent = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                    return (
                      <div key={method} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300">{method === 'CASH' ? 'Tiền Mặt (Cash)' : method === 'VIETQR' ? 'Chuyển Khoản VietQR' : method}</span>
                          <span className="text-white font-mono">{amount.toLocaleString('vi-VN')} ₫ ({percent}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            style={{ width: `${percent}%` }}
                            className={`h-full rounded-full transition-all ${
                              method === 'CASH' ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-500 to-amber-400'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  <span>Tổng Quan Ca Làm Việc Hiện Tại (Cash Control)</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Tiền đầu ca (Tiền thối ban đầu):</span>
                    <span className="font-bold text-white font-mono">
                      {(useFnBStore.getState().currentShift?.startingCash || 0).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Doanh thu tiền mặt thu được:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {paymentMethodMap['CASH'].toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Dự kiến tiền trong két ca này:</span>
                    <span className="font-extrabold text-orange-400 font-mono text-sm">
                      {((useFnBStore.getState().currentShift?.startingCash || 0) + paymentMethodMap['CASH']).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 2: MENU & PRODUCTS & CATEGORIES CRUD */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Categories Manager Header Card */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white">Danh Mục Thực Đơn ({categories.length})</h3>
                <p className="text-xs text-slate-400 mt-0.5">Quản lý nhóm phân loại món ăn & thức uống</p>
              </div>
              <button
                onClick={() => setShowAddCatModal(true)}
                className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-orange-400 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Danh Mục Mới</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map(cat => (
                <div key={cat.id} className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{cat.name}</span>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-slate-500 hover:text-red-400 transition"
                    title="Xóa danh mục"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Products List Table */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-white">Danh Sách Món Ăn & Thức Uống ({products.length})</h3>
              <button
                onClick={() => setShowAddProdModal(true)}
                className="py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Món Mới</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2">MÓN ÁN</th>
                    <th className="py-2">SKU</th>
                    <th className="py-2">DANH MỤC</th>
                    <th className="py-2">GIÁ BÁN</th>
                    <th className="py-2">STATION</th>
                    <th className="py-2 text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map(prod => {
                    const cat = categories.find(c => c.id === prod.categoryId);
                    return (
                      <tr key={prod.id}>
                        <td className="py-3 flex items-center gap-3">
                          <img src={prod.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <span className="font-bold text-white block">{prod.name}</span>
                            <span className="text-[10px] text-slate-500">{prod.description}</span>
                          </div>
                        </td>
                        <td className="py-3 font-mono text-slate-400">{prod.sku}</td>
                        <td className="py-3 text-slate-300 font-semibold">{cat?.name || 'Khác'}</td>
                        <td className="py-3 font-bold text-orange-400">{prod.price.toLocaleString('vi-VN')} ₫</td>
                        <td className="py-3">
                          <span className="text-[10px] font-extrabold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                            {prod.kitchenStation}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => deleteProduct(prod.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition"
                            title="Xóa món"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TABLES & REAL PHONE QR CODE GENERATOR */}
      {activeTab === 'tables' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-orange-400" />
                <span>Quản Lý Bàn Ăn & Mã QR Đặt Món Dán Tại Bàn</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Thêm bàn mới, quản lý sơ đồ và tạo mã QR cho khách quét tự đặt món trên điện thoại.</p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowAddTableModal(true)}
                className="py-2 px-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 whitespace-nowrap transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Bàn Mới</span>
              </button>

              {/* Network Host IP Setting Box for Phone Scanning */}
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs w-full md:w-auto">
                <Wifi className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-400 font-semibold whitespace-nowrap">IP Wi-Fi:</span>
                <input
                  type="text"
                  value={networkHost}
                  onChange={(e) => setNetworkHost(e.target.value)}
                  placeholder="192.168.11.107:3000"
                  className="bg-slate-900 text-emerald-400 font-mono font-bold px-2 py-1 rounded-lg border border-slate-700 w-36 text-center"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tables.map(tbl => {
              // Ensure QR payload uses full http://{IP}:{PORT}/?q={TOKEN} so phone camera can scan & open directly!
              const protocol = window.location.protocol;
              const directQrUrl = `${protocol}//${networkHost}/?q=${tbl.qrToken}`;

              return (
                <div key={tbl.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(directQrUrl)}`}
                      alt={`QR ${tbl.name}`}
                      className="w-24 h-24 rounded-xl bg-white p-1.5 flex-shrink-0 shadow-md border border-slate-300"
                    />
                    <div className="space-y-1 overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-white">{tbl.name}</h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{tbl.capacity}P</span>
                        </div>
                        <button
                          onClick={() => deleteTable(tbl.id)}
                          className="text-slate-500 hover:text-red-400 transition"
                          title="Xóa bàn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 truncate">Token: {tbl.qrToken}</p>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-block">
                        Trạng thái: {tbl.status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex gap-2">
                    <a
                      href={directQrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Mở Thử Link Bàn Này</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY & RECIPES */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-base text-white">Tồn Kho Nguyên Liệu & Định Lượng Bán Món</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2">TÊN NGUYÊN LIỆU</th>
                  <th className="py-2">TỒN KHO HIỆN TẠI</th>
                  <th className="py-2">ĐƠN VỊ</th>
                  <th className="py-2">ĐƠN GIÁ / ĐƠN VỊ</th>
                  <th className="py-2">CẢNH BÁO MỨC THẤP</th>
                  <th className="py-2 text-right">NHẬP / XUẤT KHO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ingredients.map(ing => (
                  <tr key={ing.id}>
                    <td className="py-3 font-bold text-white">{ing.name}</td>
                    <td className="py-3 font-mono font-bold text-orange-400">{ing.currentStock}</td>
                    <td className="py-3 text-slate-400">{ing.unit}</td>
                    <td className="py-3">{ing.costPerUnit.toLocaleString('vi-VN')} ₫</td>
                    <td className="py-3">
                      {ing.currentStock <= ing.minStockLevel ? (
                        <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                          Dưới Định Mức ({ing.minStockLevel})
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500">An toàn</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => updateIngredientStock(ing.id, 5, 'Nhập thêm từ NCC')}
                        className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-lg text-[10px] border border-slate-700"
                      >
                        + Thêm 5 {ing.unit}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: STAFF & RBAC */}
      {activeTab === 'rbac' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-base text-white">Danh Sách Tài Khoản & Phân Quyền Hạt Nhân (RBAC)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {useFnBStore.getState().users.map(u => (
              <div key={u.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-white">{u.name}</h4>
                  <span className="text-[10px] font-extrabold bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20">
                    {u.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{u.email} • {u.phone}</p>
                <div className="pt-2 text-[10px] text-slate-500 font-mono">
                  Permissions: {u.permissions.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-base text-white">Nhật Ký Hệ Thống (Audit Trail Logs)</h3>
          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/70 text-xs flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-400">{log.userName}</span>
                    <span className="text-[10px] font-mono bg-slate-800 px-1.5 rounded text-slate-300">{log.action}</span>
                  </div>
                  <p className="text-slate-300 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(log.createdAt).toLocaleTimeString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {showAddProdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleAddProductSubmit} className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-white">Thêm Món Ăn Mới</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Tên món:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Cà Phê Muối Sài Gòn"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold">Giá bán (₫):</label>
                  <input
                    type="number"
                    required
                    placeholder="39000"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold">Giá vốn (₫):</label>
                  <input
                    type="number"
                    placeholder="12000"
                    value={prodCost}
                    onChange={(e) => setProdCost(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Danh mục:</label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Trạm Chế Biến (Station):</label>
                <select
                  value={prodStation}
                  onChange={(e) => setProdStation(e.target.value as KitchenStation)}
                  className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="BAR">Quầy Pha Chế (Bar)</option>
                  <option value="KITCHEN">Bếp Chính (Kitchen)</option>
                  <option value="DESSERT">Bánh & Tráng Miệng (Dessert)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAddProdModal(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs">
                Hủy
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-xs">
                Lưu Món Mới
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleAddCategorySubmit} className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white">Thêm Danh Mục Mới</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Tên danh mục:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nước Ép & Sinh Tố"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowAddCatModal(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs">
                Hủy
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-orange-500/20">
                Tạo Danh Mục
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD TABLE */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleAddTableSubmit} className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white">Thêm Bàn Mới & Tự Động Tạo Mã QR</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Tên bàn:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bàn A05"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Khu vực / Tầng:</label>
                <select
                  value={tableFloorId}
                  onChange={(e) => setTableFloorId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold"
                >
                  {floors.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Sức chứa (Số người):</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={50}
                  value={tableCapacity}
                  onChange={(e) => setTableCapacity(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowAddTableModal(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs">
                Hủy
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-orange-500/20">
                Tạo Bàn & Mã QR
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
