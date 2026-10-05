export type UserRole = 
  | 'SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'BRANCH_MANAGER'
  | 'CASHIER'
  | 'WAITER'
  | 'KITCHEN'
  | 'INVENTORY'
  | 'ACCOUNTANT'
  | 'CUSTOMER';

export interface Permission {
  id: string;
  name: string; // e.g., 'order.create', 'payment.create', 'table.transfer'
  category: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  phone: string;
  address: string;
  taxNumber: string;
  vatRate: number; // e.g. 8% or 10%
  serviceChargeRate: number; // e.g. 5%
  bankAccount: {
    bankName: string;
    accountNo: string;
    accountName: string;
  };
}

export interface User {
  id: string;
  tenantId: string;
  branchId?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  permissions: string[];
}

export type TableStatus = 
  | 'AVAILABLE' 
  | 'OCCUPIED' 
  | 'ORDERING' 
  | 'BILL_REQUESTED' 
  | 'PAYING' 
  | 'CLEANING' 
  | 'DISABLED';

export interface Floor {
  id: string;
  branchId: string;
  name: string;
  sortOrder: number;
}

export interface Table {
  id: string;
  tenantId: string;
  branchId: string;
  floorId: string;
  name: string;
  code: string;
  capacity: number;
  status: TableStatus;
  qrToken: string;
  sortOrder: number;
  active: boolean;
}

export type TableSessionStatus = 
  | 'OPEN' 
  | 'BILL_REQUESTED' 
  | 'PAYING' 
  | 'PAID' 
  | 'CLOSED' 
  | 'CANCELLED';

export interface TableSession {
  id: string;
  tenantId: string;
  branchId: string;
  tableId: string;
  tableNameSnapshot: string;
  sessionNumber: string;
  status: TableSessionStatus;
  openedAt: string;
  closedAt?: string;
  guestCount: number;
  customerId?: string;
  subtotal: number;
  discountAmount: number;
  discountReason?: string;
  serviceChargeAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

export type KitchenStation = 'BAR' | 'KITCHEN' | 'DESSERT';

export interface Category {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
}

export interface Modifier {
  id: string;
  groupName: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface ModifierGroup {
  id: string;
  tenantId: string;
  name: string;
  selectionType: 'SINGLE' | 'MULTIPLE';
  minSelection: number;
  maxSelection: number;
  isRequired: boolean;
  modifiers: Modifier[];
}

export interface Product {
  id: string;
  tenantId: string;
  branchId: string;
  categoryId: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  image: string;
  price: number;
  costPrice: number;
  kitchenStation: KitchenStation;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN';
  modifierGroupIds: string[];
}

export type OrderStatus = 
  | 'SUBMITTED' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'SERVED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type OrderItemStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'SERVED' 
  | 'CANCELLED';

export interface SelectedModifier {
  modifierId: string;
  modifierName: string;
  price: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  subtotal: number;
  note?: string;
  kitchenStation: KitchenStation;
  status: OrderItemStatus;
  selectedModifiers: SelectedModifier[];
}

export interface Order {
  id: string;
  tenantId: string;
  branchId: string;
  tableSessionId: string;
  orderNumber: string;
  roundNumber: number;
  status: OrderStatus;
  subtotal: number;
  notes?: string;
  createdByUserId?: string;
  createdAt: string;
  items: OrderItem[];
}

export type PaymentMethod = 
  | 'CASH' 
  | 'VIETQR' 
  | 'BANK_TRANSFER' 
  | 'MOMO' 
  | 'ZALOPAY' 
  | 'CARD';

export interface Payment {
  id: string;
  tenantId: string;
  branchId: string;
  tableSessionId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  receivedAmount: number;
  changeAmount: number;
  transactionCode: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  cashierId?: string;
  metadata?: Record<string, any>;
}

export type CallWaiterType = 'WAITER' | 'WATER' | 'UTENSILS' | 'BILL';

export interface CallWaiter {
  id: string;
  tenantId: string;
  branchId: string;
  tableId: string;
  tableName: string;
  tableSessionId: string;
  type: CallWaiterType;
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
}

export interface Shift {
  id: string;
  tenantId: string;
  branchId: string;
  userId: string;
  userName: string;
  openedAt: string;
  closedAt?: string;
  startingCash: number;
  endingCashExpected: number;
  endingCashActual?: number;
  cashDifference?: number;
  status: 'OPEN' | 'CLOSED';
}

export interface Ingredient {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  costPerUnit: number;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}
