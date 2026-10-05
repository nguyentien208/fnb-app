import { create } from 'zustand';
import { 
  Tenant, Branch, User, Floor, Table, TableSession, Category, Product, ModifierGroup, 
  Order, OrderItem, Payment, CallWaiter, Shift, Ingredient, AuditLog, KitchenStation, OrderItemStatus, PaymentMethod 
} from '../types';
import { initialTenant, initialBranch, initialUsers, initialFloors, initialTables, initialCategories, initialModifierGroups, initialProducts, initialIngredients } from '../services/mockData';

export interface CartItemInput {
  product: Product;
  quantity: number;
  note?: string;
  selectedModifiers: {
    modifierId: string;
    modifierName: string;
    price: number;
  }[];
}

interface FnBState {
  // Config & Multi-Tenant Context
  tenant: Tenant;
  branch: Branch;
  currentUser: User;
  users: User[];
  
  // Base Data
  floors: Floor[];
  tables: Table[];
  categories: Category[];
  modifierGroups: ModifierGroup[];
  products: Product[];
  ingredients: Ingredient[];

  // Active Transactional Data
  tableSessions: TableSession[];
  orders: Order[];
  payments: Payment[];
  callWaiters: CallWaiter[];
  currentShift: Shift | null;
  auditLogs: AuditLog[];
  processedIdempotencyKeys: Set<string>;
  
  // Active Customer QR Context
  activeQrToken: string | null;
  customerCart: CartItemInput[];

  // Audio Alerts Counter for KDS & Waiter
  lastNotificationSound: string | null;

  // Realtime WS connection status
  isRealtimeConnected: boolean;

  // Actions
  initRealtimeSync: () => void;
  broadcastStateSync: () => void;
  setRole: (role: User['role']) => void;
  setActiveQrToken: (token: string | null) => void;

  // Customer Actions
  addToCart: (item: CartItemInput) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  submitCustomerOrder: (tableId: string, note?: string, idempotencyKey?: string) => { success: boolean; order?: Order; message?: string };
  customerCallWaiter: (tableId: string, type: CallWaiter['type']) => void;
  customerRequestBill: (tableSessionId: string) => void;

  // POS & Staff Actions
  openTableSession: (tableId: string, guestCount?: number) => TableSession;
  confirmOrder: (orderId: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  cancelOrderItem: (orderItemId: string, reason: string) => void;
  updateOrderItemStatus: (orderItemId: string, status: OrderItemStatus) => void;
  resolveCallWaiter: (callId: string) => void;
  
  // Table Advanced (Transfer, Merge, Split Bill)
  transferTable: (sourceTableId: string, targetTableId: string) => boolean;
  mergeTables: (sourceTableIds: string[], targetTableId: string) => boolean;
  splitBill: (tableSessionId: string, orderItemIdsToSplit: string[]) => TableSession | null;

  // POS Billing & Payment
  applyDiscount: (tableSessionId: string, amount: number, reason: string) => void;
  processPayment: (
    tableSessionId: string, 
    paymentMethod: PaymentMethod, 
    amount: number, 
    receivedAmount: number, 
    cashierId: string,
    transactionCode?: string
  ) => { success: boolean; payment?: Payment; message?: string };

  // Shift Management
  openShift: (startingCash: number) => void;
  closeShift: (endingCashActual: number) => Shift;

  // Admin CRUD
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  addTable: (table: Omit<Table, 'id' | 'qrToken'>) => void;
  deleteTable: (id: string) => void;
  updateIngredientStock: (id: string, delta: number, note: string) => void;

  // Utilities
  getTableByQrToken: (token: string) => Table | undefined;
  getActiveSessionByTableId: (tableId: string) => TableSession | undefined;
  getOrdersBySessionId: (sessionId: string) => Order[];
  getPaymentsBySessionId: (sessionId: string) => Payment[];
  logAudit: (action: string, entityType: string, entityId: string, details: string) => void;
}

// Pre-create 1 initial active session on Table A01
const demoSessionId = 'session-demo-a01';
const demoSession: TableSession = {
  id: demoSessionId,
  tenantId: initialTenant.id,
  branchId: initialBranch.id,
  tableId: 'tbl-a01',
  tableNameSnapshot: 'Bàn A01',
  sessionNumber: 'SES-00892',
  status: 'OPEN',
  openedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  guestCount: 2,
  subtotal: 138000,
  discountAmount: 0,
  serviceChargeAmount: 6900,
  taxAmount: 11040,
  totalAmount: 155940,
  paidAmount: 0,
  remainingAmount: 155940,
};

const demoOrder1: Order = {
  id: 'ord-001',
  tenantId: initialTenant.id,
  branchId: initialBranch.id,
  tableSessionId: demoSessionId,
  orderNumber: 'ORD-0012',
  roundNumber: 1,
  status: 'PREPARING',
  subtotal: 108000,
  notes: 'Cho ít đá trà sữa giúp em',
  createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  items: [
    {
      id: 'ord-item-01',
      orderId: 'ord-001',
      productId: 'prod-03',
      productNameSnapshot: 'Trà Sữa Ô Long Nướng Macchiato',
      unitPriceSnapshot: 45000,
      quantity: 2,
      subtotal: 90000,
      kitchenStation: 'BAR',
      status: 'PREPARING',
      selectedModifiers: [
        { modifierId: 'mod-size-m', modifierName: 'Size M', price: 0 },
        { modifierId: 'mod-sugar-50', modifierName: '50% Đường', price: 0 },
        { modifierId: 'mod-ice-less', modifierName: 'Ít đá (50%)', price: 0 },
      ]
    },
    {
      id: 'ord-item-02',
      orderId: 'ord-001',
      productId: 'prod-02',
      productNameSnapshot: 'Bạc Xỉu Sương Mù',
      unitPriceSnapshot: 38000,
      quantity: 1,
      subtotal: 38000,
      kitchenStation: 'BAR',
      status: 'READY',
      selectedModifiers: [
        { modifierId: 'mod-size-m', modifierName: 'Size M', price: 0 },
      ]
    }
  ]
};

let socketClient: WebSocket | null = null;

export const useFnBStore = create<FnBState>((set, get) => ({
  tenant: initialTenant,
  branch: initialBranch,
  currentUser: initialUsers[0],
  users: initialUsers,

  floors: initialFloors,
  tables: initialTables,
  categories: initialCategories,
  modifierGroups: initialModifierGroups,
  products: initialProducts,
  ingredients: initialIngredients,

  tableSessions: [demoSession],
  orders: [demoOrder1],
  payments: [],
  callWaiters: [
    {
      id: 'call-001',
      tenantId: initialTenant.id,
      branchId: initialBranch.id,
      tableId: 'tbl-a01',
      tableName: 'Bàn A01',
      tableSessionId: demoSessionId,
      type: 'WATER',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    }
  ],
  currentShift: {
    id: 'shift-001',
    tenantId: initialTenant.id,
    branchId: initialBranch.id,
    userId: initialUsers[1].id,
    userName: initialUsers[1].name,
    openedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    startingCash: 2000000,
    endingCashExpected: 2000000,
    status: 'OPEN',
  },
  auditLogs: [
    {
      id: 'log-001',
      tenantId: initialTenant.id,
      userName: 'Nguyễn Văn Admin',
      action: 'SYSTEM_INIT',
      entityType: 'System',
      entityId: 'tenant-001',
      details: 'Khởi tạo hệ thống F&B Multi-tenant kèm Realtime WebSocket Server',
      createdAt: new Date().toISOString(),
    }
  ],
  processedIdempotencyKeys: new Set<string>(),

  activeQrToken: 'token-table-a01-sec789',
  customerCart: [],
  lastNotificationSound: null,
  isRealtimeConnected: false,

  initRealtimeSync: () => {
    if (socketClient && socketClient.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      socketClient = new WebSocket(`${protocol}//${host}/ws`);

      socketClient.onopen = () => {
        console.log('⚡ Connected to GourmetOS Realtime Sync WebSocket Server');
        set({ isRealtimeConnected: true });
      };

      socketClient.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'STATE_SYNC' && data.payload) {
            const p = data.payload;
            set((state) => ({
              tableSessions: p.tableSessions || state.tableSessions,
              orders: p.orders || state.orders,
              payments: p.payments || state.payments,
              tables: p.tables || state.tables,
              callWaiters: p.callWaiters || state.callWaiters,
              ingredients: p.ingredients || state.ingredients,
              auditLogs: p.auditLogs || state.auditLogs,
              lastNotificationSound: 'UPDATE_EVENT',
            }));
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      socketClient.onclose = () => {
        set({ isRealtimeConnected: false });
        setTimeout(() => get().initRealtimeSync(), 3000); // Reconnect
      };
    } catch (err) {
      console.warn('WebSocket init error:', err);
    }
  },

  broadcastStateSync: () => {
    const currentState = {
      tableSessions: get().tableSessions,
      orders: get().orders,
      payments: get().payments,
      tables: get().tables,
      callWaiters: get().callWaiters,
      ingredients: get().ingredients,
      auditLogs: get().auditLogs,
    };

    // Send over WebSocket
    if (socketClient && socketClient.readyState === WebSocket.OPEN) {
      socketClient.send(JSON.stringify({ type: 'SYNC_ACTION', payload: currentState }));
    }

    // Also fallback POST to REST API /api/v1/state/sync
    fetch('/api/v1/state/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentState),
    }).catch(err => console.warn('Sync POST error:', err));
  },

  setRole: (role) => {
    const user = get().users.find(u => u.role === role) || {
      ...get().currentUser,
      role,
    };
    set({ currentUser: user });
  },

  setActiveQrToken: (token) => set({ activeQrToken: token }),

  addToCart: (item) => set((state) => ({ customerCart: [...state.customerCart, item] })),
  
  removeFromCart: (index) => set((state) => ({
    customerCart: state.customerCart.filter((_, i) => i !== index)
  })),

  clearCart: () => set({ customerCart: [] }),

  getTableByQrToken: (token) => {
    return get().tables.find(t => t.qrToken === token);
  },

  getActiveSessionByTableId: (tableId) => {
    return get().tableSessions.find(s => s.tableId === tableId && (s.status === 'OPEN' || s.status === 'BILL_REQUESTED' || s.status === 'PAYING'));
  },

  getOrdersBySessionId: (sessionId) => {
    return get().orders.filter(o => o.tableSessionId === sessionId);
  },

  getPaymentsBySessionId: (sessionId) => {
    return get().payments.filter(p => p.tableSessionId === sessionId);
  },

  logAudit: (action, entityType, entityId, details) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      tenantId: get().tenant.id,
      userName: get().currentUser.name,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }));
  },

  openTableSession: (tableId, guestCount = 2) => {
    const table = get().tables.find(t => t.id === tableId);
    if (!table) throw new Error('Table not found');

    let existing = get().getActiveSessionByTableId(tableId);
    if (existing) return existing;

    const newSessionId = `session-${Date.now()}`;
    const newSessionNumber = `SES-${Math.floor(10000 + Math.random() * 90000)}`;

    const newSession: TableSession = {
      id: newSessionId,
      tenantId: get().tenant.id,
      branchId: get().branch.id,
      tableId,
      tableNameSnapshot: table.name,
      sessionNumber: newSessionNumber,
      status: 'OPEN',
      openedAt: new Date().toISOString(),
      guestCount,
      subtotal: 0,
      discountAmount: 0,
      serviceChargeAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
    };

    set((state) => ({
      tableSessions: [newSession, ...state.tableSessions],
      tables: state.tables.map(t => t.id === tableId ? { ...t, status: 'OCCUPIED' } : t),
    }));

    get().logAudit('OPEN_SESSION', 'TableSession', newSessionId, `Mở phiên làm việc tại ${table.name}`);
    get().broadcastStateSync();
    return newSession;
  },

  submitCustomerOrder: (tableId, note, idempotencyKey) => {
    if (idempotencyKey && get().processedIdempotencyKeys.has(idempotencyKey)) {
      return { success: false, message: 'Đơn hàng này đã được xử lý (Duplicate Idempotency Key)!' };
    }

    const cart = get().customerCart;
    if (cart.length === 0) return { success: false, message: 'Giỏ hàng đang trống!' };

    const table = get().tables.find(t => t.id === tableId);
    if (!table) return { success: false, message: 'Không tìm thấy thông tin bàn!' };

    let session = get().getActiveSessionByTableId(tableId);
    if (!session) {
      session = get().openTableSession(tableId);
    }

    if (session.status === 'PAID' || session.status === 'CLOSED') {
      return { success: false, message: 'Bàn này đã hoàn tất thanh toán. Vui lòng liên hệ nhân viên để mở bàn mới!' };
    }

    const existingOrders = get().getOrdersBySessionId(session.id);
    const roundNumber = existingOrders.length + 1;

    let orderSubtotal = 0;
    const orderItems: OrderItem[] = cart.map((cartItem, idx) => {
      const modifierSum = cartItem.selectedModifiers.reduce((acc, m) => acc + m.price, 0);
      const unitPriceWithMod = cartItem.product.price + modifierSum;
      const itemSubtotal = unitPriceWithMod * cartItem.quantity;
      orderSubtotal += itemSubtotal;

      return {
        id: `ord-item-${Date.now()}-${idx}`,
        orderId: '',
        productId: cartItem.product.id,
        productNameSnapshot: cartItem.product.name,
        unitPriceSnapshot: cartItem.product.price,
        quantity: cartItem.quantity,
        subtotal: itemSubtotal,
        note: cartItem.note,
        kitchenStation: cartItem.product.kitchenStation,
        status: 'PENDING',
        selectedModifiers: cartItem.selectedModifiers,
      };
    });

    const newOrderId = `ord-${Date.now()}`;
    const newOrderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: newOrderId,
      tenantId: get().tenant.id,
      branchId: get().branch.id,
      tableSessionId: session.id,
      orderNumber: newOrderNumber,
      roundNumber,
      status: 'SUBMITTED',
      subtotal: orderSubtotal,
      notes: note,
      createdAt: new Date().toISOString(),
      items: orderItems.map(item => ({ ...item, orderId: newOrderId })),
    };

    if (idempotencyKey) {
      get().processedIdempotencyKeys.add(idempotencyKey);
    }

    const updatedSubtotal = session.subtotal + orderSubtotal;
    const branch = get().branch;
    const serviceCharge = Math.round((updatedSubtotal - session.discountAmount) * (branch.serviceChargeRate / 100));
    const tax = Math.round((updatedSubtotal - session.discountAmount + serviceCharge) * (branch.vatRate / 100));
    const totalAmount = updatedSubtotal - session.discountAmount + serviceCharge + tax;
    const remainingAmount = Math.max(0, totalAmount - session.paidAmount);

    set((state) => ({
      orders: [newOrder, ...state.orders],
      tableSessions: state.tableSessions.map(s => s.id === session.id ? {
        ...s,
        subtotal: updatedSubtotal,
        serviceChargeAmount: serviceCharge,
        taxAmount: tax,
        totalAmount,
        remainingAmount,
        status: 'OPEN',
      } : s),
      tables: state.tables.map(t => t.id === tableId ? { ...t, status: 'ORDERING' } : t),
      customerCart: [],
      lastNotificationSound: 'NEW_ORDER',
    }));

    get().logAudit('SUBMIT_ORDER', 'Order', newOrderId, `Gửi Order Round ${roundNumber} (${newOrderNumber}) tại ${table.name}`);
    get().broadcastStateSync();
    return { success: true, order: newOrder };
  },

  customerCallWaiter: (tableId, type) => {
    const table = get().tables.find(t => t.id === tableId);
    if (!table) return;

    const session = get().getActiveSessionByTableId(tableId);
    const newCall: CallWaiter = {
      id: `call-${Date.now()}`,
      tenantId: get().tenant.id,
      branchId: get().branch.id,
      tableId,
      tableName: table.name,
      tableSessionId: session?.id || '',
      type,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      callWaiters: [newCall, ...state.callWaiters],
      lastNotificationSound: 'CALL_WAITER',
    }));
    get().broadcastStateSync();
  },

  customerRequestBill: (tableSessionId) => {
    const session = get().tableSessions.find(s => s.id === tableSessionId);
    if (!session) return;

    set((state) => ({
      tableSessions: state.tableSessions.map(s => s.id === tableSessionId ? { ...s, status: 'BILL_REQUESTED' } : s),
      tables: state.tables.map(t => t.id === session.tableId ? { ...t, status: 'BILL_REQUESTED' } : t),
      lastNotificationSound: 'BILL_REQUEST',
    }));
    get().logAudit('REQUEST_BILL', 'TableSession', tableSessionId, `Khách yêu cầu thanh toán cho ${session.tableNameSnapshot}`);
    get().broadcastStateSync();
  },

  confirmOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.map(o => o.id === orderId ? {
        ...o,
        status: 'CONFIRMED',
        items: o.items.map(item => ({ ...item, status: 'CONFIRMED' }))
      } : o)
    }));
    get().broadcastStateSync();
  },

  cancelOrder: (orderId, reason) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;

    set((state) => ({
      orders: state.orders.map(o => o.id === orderId ? {
        ...o,
        status: 'CANCELLED',
        items: o.items.map(item => ({ ...item, status: 'CANCELLED' }))
      } : o)
    }));

    get().logAudit('CANCEL_ORDER', 'Order', orderId, `Hủy order ${order.orderNumber}. Lý do: ${reason}`);
    get().broadcastStateSync();
  },

  cancelOrderItem: (orderItemId, reason) => {
    set((state) => ({
      orders: state.orders.map(order => {
        const item = order.items.find(i => i.id === orderItemId);
        if (!item) return order;

        const updatedItems = order.items.map(i => i.id === orderItemId ? { ...i, status: 'CANCELLED' as OrderItemStatus } : i);
        return { ...order, items: updatedItems };
      })
    }));

    get().logAudit('CANCEL_ORDER_ITEM', 'OrderItem', orderItemId, `Hủy món khỏi bill. Lý do: ${reason}`);
    get().broadcastStateSync();
  },

  updateOrderItemStatus: (orderItemId, status) => {
    const ordersList = get().orders;
    let targetItemName: string | null = null;
    ordersList.forEach(o => {
      const found = o.items.find(i => i.id === orderItemId);
      if (found) targetItemName = found.productNameSnapshot;
    });

    if (targetItemName && (status === 'PREPARING' || status === 'READY')) {
      const ingredientsList = get().ingredients;
      if (ingredientsList.length > 0) {
        get().updateIngredientStock(ingredientsList[0].id, -0.1, `Trừ kho khi chế biến ${targetItemName}`);
      }
    }

    set((state) => ({
      orders: state.orders.map(order => {
        let hasItem = order.items.some(i => i.id === orderItemId);
        if (!hasItem) return order;

        const updatedItems = order.items.map(item => item.id === orderItemId ? { ...item, status } : item);
        
        let overallStatus = order.status;
        if (updatedItems.every(i => i.status === 'SERVED')) {
          overallStatus = 'SERVED';
        } else if (updatedItems.some(i => i.status === 'PREPARING' || i.status === 'READY')) {
          overallStatus = 'PREPARING';
        }

        return { ...order, status: overallStatus, items: updatedItems };
      })
    }));
    get().broadcastStateSync();
  },

  resolveCallWaiter: (callId) => {
    set((state) => ({
      callWaiters: state.callWaiters.map(c => c.id === callId ? { ...c, status: 'RESOLVED' } : c)
    }));
    get().broadcastStateSync();
  },

  transferTable: (sourceTableId, targetTableId) => {
    const sourceTable = get().tables.find(t => t.id === sourceTableId);
    const targetTable = get().tables.find(t => t.id === targetTableId);
    const session = get().getActiveSessionByTableId(sourceTableId);

    if (!sourceTable || !targetTable || !session) return false;
    if (targetTable.status !== 'AVAILABLE') return false;

    set((state) => ({
      tableSessions: state.tableSessions.map(s => s.id === session.id ? {
        ...s,
        tableId: targetTableId,
        tableNameSnapshot: targetTable.name,
      } : s),
      tables: state.tables.map(t => {
        if (t.id === sourceTableId) return { ...t, status: 'AVAILABLE' };
        if (t.id === targetTableId) return { ...t, status: session.status === 'BILL_REQUESTED' ? 'BILL_REQUESTED' : 'OCCUPIED' };
        return t;
      })
    }));

    get().logAudit('TRANSFER_TABLE', 'TableSession', session.id, `Chuyển bàn từ ${sourceTable.name} sang ${targetTable.name}`);
    get().broadcastStateSync();
    return true;
  },

  mergeTables: (sourceTableIds, targetTableId) => {
    const targetTable = get().tables.find(t => t.id === targetTableId);
    if (!targetTable) return false;

    let targetSession = get().getActiveSessionByTableId(targetTableId);
    if (!targetSession) {
      targetSession = get().openTableSession(targetTableId);
    }

    sourceTableIds.forEach(srcId => {
      if (srcId === targetTableId) return;
      const srcSession = get().getActiveSessionByTableId(srcId);
      if (!srcSession) return;

      set((state) => ({
        orders: state.orders.map(o => o.tableSessionId === srcSession.id ? { ...o, tableSessionId: targetSession.id } : o),
        tableSessions: state.tableSessions.map(s => s.id === srcSession.id ? { ...s, status: 'CLOSED' } : s),
        tables: state.tables.map(t => t.id === srcId ? { ...t, status: 'AVAILABLE' } : t),
      }));
    });

    const targetOrders = get().orders.filter(o => o.tableSessionId === targetSession.id && o.status !== 'CANCELLED');
    const combinedSubtotal = targetOrders.reduce((acc, o) => acc + o.subtotal, 0);

    const branch = get().branch;
    const serviceCharge = Math.round((combinedSubtotal - targetSession.discountAmount) * (branch.serviceChargeRate / 100));
    const tax = Math.round((combinedSubtotal - targetSession.discountAmount + serviceCharge) * (branch.vatRate / 100));
    const totalAmount = combinedSubtotal - targetSession.discountAmount + serviceCharge + tax;

    set((state) => ({
      tableSessions: state.tableSessions.map(s => s.id === targetSession.id ? {
        ...s,
        subtotal: combinedSubtotal,
        serviceChargeAmount: serviceCharge,
        taxAmount: tax,
        totalAmount,
        remainingAmount: Math.max(0, totalAmount - s.paidAmount),
      } : s)
    }));

    get().logAudit('MERGE_TABLES', 'TableSession', targetSession.id, `Gộp các bàn vào ${targetTable.name}`);
    get().broadcastStateSync();
    return true;
  },

  splitBill: (tableSessionId, orderItemIdsToSplit) => {
    const parentSession = get().tableSessions.find(s => s.id === tableSessionId);
    if (!parentSession || orderItemIdsToSplit.length === 0) return null;

    const newSessionId = `session-split-${Date.now()}`;
    const newSessionNumber = `${parentSession.sessionNumber}-SPLIT`;

    let splitItemsSubtotal = 0;
    const allOrders = get().orders.filter(o => o.tableSessionId === tableSessionId);
    const splitOrderItems: OrderItem[] = [];

    allOrders.forEach(o => {
      o.items.forEach(item => {
        if (orderItemIdsToSplit.includes(item.id)) {
          splitOrderItems.push(item);
          splitItemsSubtotal += item.subtotal;
        }
      });
    });

    const branch = get().branch;
    const serviceCharge = Math.round(splitItemsSubtotal * (branch.serviceChargeRate / 100));
    const tax = Math.round((splitItemsSubtotal + serviceCharge) * (branch.vatRate / 100));
    const totalAmount = splitItemsSubtotal + serviceCharge + tax;

    const splitSession: TableSession = {
      id: newSessionId,
      tenantId: get().tenant.id,
      branchId: get().branch.id,
      tableId: parentSession.tableId,
      tableNameSnapshot: `${parentSession.tableNameSnapshot} (Tách Bill)`,
      sessionNumber: newSessionNumber,
      status: 'OPEN',
      openedAt: new Date().toISOString(),
      guestCount: 1,
      subtotal: splitItemsSubtotal,
      discountAmount: 0,
      serviceChargeAmount: serviceCharge,
      taxAmount: tax,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
    };

    set((state) => ({
      tableSessions: [splitSession, ...state.tableSessions]
    }));

    get().logAudit('SPLIT_BILL', 'TableSession', newSessionId, `Tách bill ${newSessionNumber} từ ${parentSession.tableNameSnapshot}`);
    get().broadcastStateSync();
    return splitSession;
  },

  applyDiscount: (tableSessionId, amount, reason) => {
    const session = get().tableSessions.find(s => s.id === tableSessionId);
    if (!session) return;

    const branch = get().branch;
    const serviceCharge = Math.round((session.subtotal - amount) * (branch.serviceChargeRate / 100));
    const tax = Math.round((session.subtotal - amount + serviceCharge) * (branch.vatRate / 100));
    const totalAmount = session.subtotal - amount + serviceCharge + tax;
    const remainingAmount = Math.max(0, totalAmount - session.paidAmount);

    set((state) => ({
      tableSessions: state.tableSessions.map(s => s.id === tableSessionId ? {
        ...s,
        discountAmount: amount,
        discountReason: reason,
        serviceChargeAmount: serviceCharge,
        taxAmount: tax,
        totalAmount,
        remainingAmount,
      } : s)
    }));
    get().broadcastStateSync();
  },

  processPayment: (tableSessionId, paymentMethod, amount, receivedAmount, cashierId, transactionCode) => {
    const session = get().tableSessions.find(s => s.id === tableSessionId);
    if (!session) return { success: false, message: 'Không tìm thấy phiên làm việc!' };

    const changeAmount = Math.max(0, receivedAmount - amount);
    const txCode = transactionCode || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      tenantId: get().tenant.id,
      branchId: get().branch.id,
      tableSessionId,
      paymentMethod,
      amount,
      receivedAmount,
      changeAmount,
      transactionCode: txCode,
      status: 'SUCCESS',
      paidAt: new Date().toISOString(),
      cashierId,
    };

    const newPaidAmount = session.paidAmount + amount;
    const isFullyPaid = newPaidAmount >= session.totalAmount;
    const remaining = Math.max(0, session.totalAmount - newPaidAmount);

    set((state) => ({
      payments: [newPayment, ...state.payments],
      tableSessions: state.tableSessions.map(s => s.id === tableSessionId ? {
        ...s,
        paidAmount: newPaidAmount,
        remainingAmount: remaining,
        status: isFullyPaid ? 'PAID' : 'PAYING',
        closedAt: isFullyPaid ? new Date().toISOString() : undefined,
      } : s),
      tables: state.tables.map(t => t.id === session.tableId ? {
        ...t,
        status: isFullyPaid ? 'CLEANING' : 'PAYING'
      } : t),
    }));

    if (get().currentShift) {
      set((state) => ({
        currentShift: state.currentShift ? {
          ...state.currentShift,
          endingCashExpected: state.currentShift.endingCashExpected + (paymentMethod === 'CASH' ? amount : 0),
        } : null
      }));
    }

    get().logAudit('PAYMENT_SUCCESS', 'Payment', newPayment.id, `Thanh toán ${paymentMethod} cho ${session.tableNameSnapshot}: ${amount.toLocaleString('vi-VN')} ₫`);
    get().broadcastStateSync();
    return { success: true, payment: newPayment };
  },

  openShift: (startingCash) => {
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      tenantId: get().tenant.id,
      branchId: get().branch.id,
      userId: get().currentUser.id,
      userName: get().currentUser.name,
      openedAt: new Date().toISOString(),
      startingCash,
      endingCashExpected: startingCash,
      status: 'OPEN',
    };
    set({ currentShift: newShift });
    get().broadcastStateSync();
  },

  closeShift: (endingCashActual) => {
    const shift = get().currentShift;
    if (!shift) throw new Error('No active shift');

    const closedShift: Shift = {
      ...shift,
      closedAt: new Date().toISOString(),
      endingCashActual,
      cashDifference: endingCashActual - shift.endingCashExpected,
      status: 'CLOSED',
    };

    set({ currentShift: null });
    get().logAudit('CLOSE_SHIFT', 'Shift', shift.id, `Đóng ca làm việc. Tiền thực tế: ${endingCashActual.toLocaleString('vi-VN')} ₫`);
    get().broadcastStateSync();
    return closedShift;
  },

  addProduct: (p) => {
    const newProduct: Product = { ...p, id: `prod-${Date.now()}` };
    set((state) => ({ products: [...state.products, newProduct] }));
    get().broadcastStateSync();
  },

  updateProduct: (id, p) => {
    set((state) => ({
      products: state.products.map(item => item.id === id ? { ...item, ...p } : item)
    }));
    get().broadcastStateSync();
  },

  deleteProduct: (id) => {
    set((state) => ({ products: state.products.filter(item => item.id !== id) }));
    get().broadcastStateSync();
  },

  addCategory: (cat) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    set((state) => ({ categories: [...state.categories, newCat] }));
    get().logAudit('ADD_CATEGORY', 'Category', newCat.id, `Thêm danh mục mới: ${cat.name}`);
    get().broadcastStateSync();
  },

  deleteCategory: (id) => {
    set((state) => ({ categories: state.categories.filter(c => c.id !== id) }));
    get().logAudit('DELETE_CATEGORY', 'Category', id, `Xóa danh mục ${id}`);
    get().broadcastStateSync();
  },

  addTable: (t) => {
    const tableId = `tbl-${Date.now()}`;
    const qrToken = `token-${t.name.toLowerCase().replace(/\s+/g, '-')}-sec${Math.floor(100 + Math.random() * 900)}`;
    const newTable: Table = {
      ...t,
      id: tableId,
      qrToken,
    };
    set((state) => ({ tables: [...state.tables, newTable] }));
    get().logAudit('ADD_TABLE', 'Table', tableId, `Thêm bàn mới: ${t.name} kèm Mã QR`);
    get().broadcastStateSync();
  },

  deleteTable: (id) => {
    set((state) => ({ tables: state.tables.filter(t => t.id !== id) }));
    get().logAudit('DELETE_TABLE', 'Table', id, `Xóa bàn ${id}`);
    get().broadcastStateSync();
  },

  updateIngredientStock: (id, delta, note) => {
    set((state) => ({
      ingredients: state.ingredients.map(ing => ing.id === id ? {
        ...ing,
        currentStock: Math.max(0, ing.currentStock + delta)
      } : ing)
    }));
    get().logAudit('UPDATE_STOCK', 'Ingredient', id, `${delta > 0 ? 'Thêm' : 'Xuất'} ${Math.abs(delta)} nguyên liệu. Note: ${note}`);
    get().broadcastStateSync();
  },
}));
