import { Category, Product, ModifierGroup, Floor, Table, Branch, Tenant, User, Ingredient } from '../types';

export const initialTenant: Tenant = {
  id: 'tenant-001',
  name: 'Saigon Bistro Group',
  slug: 'saigon-bistro',
  domain: 'saigonbistro.gourmetos.com',
  logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80',
  status: 'ACTIVE',
};

export const initialBranch: Branch = {
  id: 'branch-001',
  tenantId: 'tenant-001',
  name: 'Chi Nhánh Quận 1 - Lê Lợi',
  code: 'CN-Q1',
  phone: '0901234567',
  address: '68 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  taxNumber: '0312345678',
  vatRate: 8, // 8% VAT
  serviceChargeRate: 5, // 5% Service Charge
  bankAccount: {
    bankName: 'MBBank (Ngân hàng Quân Đội)',
    accountNo: '999988887777',
    accountName: 'SAIGON BISTRO Q1',
  },
};

export const initialUsers: User[] = [
  {
    id: 'user-001',
    tenantId: 'tenant-001',
    branchId: 'branch-001',
    name: 'Nguyễn Văn Admin',
    email: 'admin@gourmetos.com',
    phone: '0909000111',
    role: 'SUPER_ADMIN',
    permissions: ['all'],
  },
  {
    id: 'user-002',
    tenantId: 'tenant-001',
    branchId: 'branch-001',
    name: 'Lê Thu Ngân (Cashier)',
    email: 'cashier@gourmetos.com',
    phone: '0909000222',
    role: 'CASHIER',
    permissions: ['order.create', 'order.update', 'payment.create', 'table.transfer', 'table.merge'],
  },
  {
    id: 'user-003',
    tenantId: 'tenant-001',
    branchId: 'branch-001',
    name: 'Trần Phục Vụ (Waiter)',
    email: 'waiter@gourmetos.com',
    phone: '0909000333',
    role: 'WAITER',
    permissions: ['order.create', 'table.transfer'],
  },
  {
    id: 'user-004',
    tenantId: 'tenant-001',
    branchId: 'branch-001',
    name: 'Phạm Bếp Trưởng (Kitchen)',
    email: 'kitchen@gourmetos.com',
    phone: '0909000444',
    role: 'KITCHEN',
    permissions: ['kds.view', 'kds.update'],
  },
];

export const initialFloors: Floor[] = [
  { id: 'floor-01', branchId: 'branch-001', name: 'Tầng Trệt (Indoor)', sortOrder: 1 },
  { id: 'floor-02', branchId: 'branch-001', name: 'Tầng 1 (VIP & Máy Lạnh)', sortOrder: 2 },
  { id: 'floor-03', branchId: 'branch-001', name: 'Sân Thượng (Rooftop Garden)', sortOrder: 3 },
];

export const initialTables: Table[] = [
  { id: 'tbl-a01', tenantId: 'tenant-001', branchId: 'branch-001', floorId: 'floor-01', name: 'Bàn A01', code: 'A01', capacity: 4, status: 'OCCUPIED', qrToken: 'token-table-a01-sec789', sortOrder: 1, active: true },
  { id: 'tbl-a02', tenantId: 'tenant-001', branchId: 'branch-001', floorId: 'floor-01', name: 'Bàn A02', code: 'A02', capacity: 2, status: 'AVAILABLE', qrToken: 'token-table-a02-sec456', sortOrder: 2, active: true },
  { id: 'tbl-a03', tenantId: 'tenant-001', branchId: 'branch-001', floorId: 'floor-01', name: 'Bàn A03', code: 'A03', capacity: 6, status: 'AVAILABLE', qrToken: 'token-table-a03-sec123', sortOrder: 3, active: true },
  { id: 'tbl-a04', tenantId: 'tenant-001', branchId: 'branch-001', floorId: 'floor-01', name: 'Bàn A04', code: 'A04', capacity: 4, status: 'AVAILABLE', qrToken: 'token-table-a04-sec321', sortOrder: 4, active: true },
  
  { id: 'tbl-b01', tenantId: 'tenant-001', branchId: 'branch-001', floorId: 'floor-02', name: 'Bàn B01 (VIP)', code: 'B01', capacity: 8, status: 'AVAILABLE', qrToken: 'token-table-b01-sec654', sortOrder: 5, active: true },
  { id: 'tbl-b02', tenantId: 'tenant-001', branchId: 'branch-001', floorId: 'floor-02', name: 'Bàn B02 (VIP)', code: 'B02', capacity: 10, status: 'AVAILABLE', qrToken: 'token-table-b02-sec987', sortOrder: 6, active: true },

  { id: 'tbl-c01', tenantId: 'tenant-001', branchId: 'branch-001', floorId: 'floor-03', name: 'Bàn C01 (Chill)', code: 'C01', capacity: 4, status: 'AVAILABLE', qrToken: 'token-table-c01-sec147', sortOrder: 7, active: true },
  { id: 'tbl-c02', tenantId: 'tenant-001', branchId: 'branch-001', floorId: 'floor-03', name: 'Bàn C02 (Chill)', code: 'C02', capacity: 4, status: 'AVAILABLE', qrToken: 'token-table-c02-sec258', sortOrder: 8, active: true },
];

export const initialCategories: Category[] = [
  { id: 'cat-01', tenantId: 'tenant-001', branchId: 'branch-001', name: 'Cà Phê Việt & Ý', slug: 'ca-phe', icon: 'Coffee', sortOrder: 1 },
  { id: 'cat-02', tenantId: 'tenant-001', branchId: 'branch-001', name: 'Trà Sữa & Topping', slug: 'tra-sua', icon: 'Milk', sortOrder: 2 },
  { id: 'cat-03', tenantId: 'tenant-001', branchId: 'branch-001', name: 'Món Ăn Chính', slug: 'mon-chinh', icon: 'Utensils', sortOrder: 3 },
  { id: 'cat-04', tenantId: 'tenant-001', branchId: 'branch-001', name: 'Ăn Vặt & Chiên', slug: 'an-vat', icon: 'Pizza', sortOrder: 4 },
  { id: 'cat-05', tenantId: 'tenant-001', branchId: 'branch-001', name: 'Tráng Miệng & Bánh', slug: 'trang-mieng', icon: 'Cake', sortOrder: 5 },
];

export const initialModifierGroups: ModifierGroup[] = [
  {
    id: 'modgrp-size',
    tenantId: 'tenant-001',
    name: 'Kích cỡ (Size)',
    selectionType: 'SINGLE',
    minSelection: 1,
    maxSelection: 1,
    isRequired: true,
    modifiers: [
      { id: 'mod-size-m', groupName: 'Size', name: 'Size M (Vừa)', price: 0, isDefault: true },
      { id: 'mod-size-l', groupName: 'Size', name: 'Size L (Lớn)', price: 10000 },
    ]
  },
  {
    id: 'modgrp-sugar',
    tenantId: 'tenant-001',
    name: 'Độ ngọt (Đường)',
    selectionType: 'SINGLE',
    minSelection: 1,
    maxSelection: 1,
    isRequired: true,
    modifiers: [
      { id: 'mod-sugar-100', groupName: 'Đường', name: '100% Đường', price: 0, isDefault: true },
      { id: 'mod-sugar-70', groupName: 'Đường', name: '70% Đường', price: 0 },
      { id: 'mod-sugar-50', groupName: 'Đường', name: '50% Đường', price: 0 },
      { id: 'mod-sugar-30', groupName: 'Đường', name: '30% Đường', price: 0 },
      { id: 'mod-sugar-0', groupName: 'Đường', name: 'Không đường', price: 0 },
    ]
  },
  {
    id: 'modgrp-ice',
    tenantId: 'tenant-001',
    name: 'Lượng Đá',
    selectionType: 'SINGLE',
    minSelection: 1,
    maxSelection: 1,
    isRequired: true,
    modifiers: [
      { id: 'mod-ice-normal', groupName: 'Đá', name: 'Đá bình thường', price: 0, isDefault: true },
      { id: 'mod-ice-less', groupName: 'Đá', name: 'Ít đá (50%)', price: 0 },
      { id: 'mod-ice-none', groupName: 'Đá', name: 'Không đá', price: 0 },
    ]
  },
  {
    id: 'modgrp-topping',
    tenantId: 'tenant-001',
    name: 'Topping thêm',
    selectionType: 'MULTIPLE',
    minSelection: 0,
    maxSelection: 4,
    isRequired: false,
    modifiers: [
      { id: 'mod-top-tc', groupName: 'Topping', name: 'Trân châu đen củ năng', price: 5000 },
      { id: 'mod-top-thach', groupName: 'Topping', name: 'Thạch trái cây', price: 7000 },
      { id: 'mod-top-pudding', groupName: 'Topping', name: 'Pudding Trứng', price: 8000 },
      { id: 'mod-top-kem', groupName: 'Topping', name: 'Macchiato Kem Cheese', price: 12000 },
    ]
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-01',
    tenantId: 'tenant-001',
    branchId: 'branch-001',
    categoryId: 'cat-01',
    name: 'Cà Phê Sữa Đá Sài Gòn',
    slug: 'ca-phe-sua-da',
    sku: 'CF-SUADA',
    description: 'Cà phê đậm đà kết hợp sữa đặc Ngôi Sao Phương Nam thơm béo hảo hạng.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
    price: 35000,
    costPrice: 12000,
    kitchenStation: 'BAR',
    status: 'AVAILABLE',
    modifierGroupIds: ['modgrp-size', 'modgrp-ice']
  },
  {
    id: 'prod-02',
    tenantId: 'tenant-001',
    branchId: 'branch-001',
    categoryId: 'cat-01',
    name: 'Bạc Xỉu Sương Mù',
    slug: 'bac-xiu',
    sku: 'CF-BACXIU',
    description: 'Nhiều sữa ít cà phê, bọt mịn béo ngậy.',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=80',
    price: 38000,
    costPrice: 13000,
    kitchenStation: 'BAR',
    status: 'AVAILABLE',
    modifierGroupIds: ['modgrp-size', 'modgrp-ice']
  },
  {
    id: 'prod-03',
    tenantId: 'tenant-001',
    branchId: 'branch-001',
    categoryId: 'cat-02',
    name: 'Trà Sữa Ô Long Nướng Macchiato',
    slug: 'tra-sua-o-long',
    sku: 'TS-OLONG',
    description: 'Lá trà Ô long nướng thơm lừng kết hợp kem cheese dầy mịn.',
    image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=500&auto=format&fit=crop&q=80',
    price: 45000,
    costPrice: 15000,
    kitchenStation: 'BAR',
    status: 'AVAILABLE',
    modifierGroupIds: ['modgrp-size', 'modgrp-sugar', 'modgrp-ice', 'modgrp-topping']
  },
  {
    id: 'prod-04',
    tenantId: 'tenant-001',
    branchId: 'branch-001',
    categoryId: 'cat-02',
    name: 'Trà Đào Cam Sả',
    slug: 'tra-dao-cam-sa',
    sku: 'TS-DAOCAMSA',
    description: 'Vị trà thanh mát, thơm nồng hương sả và miếng đào giòn ngọt.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    price: 42000,
    costPrice: 14000,
    kitchenStation: 'BAR',
    status: 'AVAILABLE',
    modifierGroupIds: ['modgrp-size', 'modgrp-sugar', 'modgrp-ice']
  },
  {
    id: 'prod-05',
    tenantId: 'tenant-001',
    branchId: 'branch-001',
    categoryId: 'cat-03',
    name: 'Phở Bố Tái Nạm Trứng Chèn',
    slug: 'pho-bo-tai-nam',
    sku: 'FOOD-PHOBO',
    description: 'Nước dùng hầm xương 24h ngọt thanh, thịt bò Mỹ giòn ngon.',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&auto=format&fit=crop&q=80',
    price: 65000,
    costPrice: 28000,
    kitchenStation: 'KITCHEN',
    status: 'AVAILABLE',
    modifierGroupIds: []
  },
  {
    id: 'prod-06',
    tenantId: 'tenant-001',
    branchId: 'branch-001',
    categoryId: 'cat-03',
    name: 'Cơm Tấm Sườn Bì Chả Trứng',
    slug: 'com-tam-suon-bi-cha',
    sku: 'FOOD-COMTAM',
    description: 'Sườn nướng than hoa thơm lừng kèm chả trứng hấp béo ngậy.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
    price: 60000,
    costPrice: 25000,
    kitchenStation: 'KITCHEN',
    status: 'AVAILABLE',
    modifierGroupIds: []
  },
  {
    id: 'prod-07',
    tenantId: 'tenant-001',
    branchId: 'branch-001',
    categoryId: 'cat-04',
    name: 'Khoai Tây Chiên Lắc Phô Mai',
    slug: 'khoai-tay-chien',
    sku: 'SNACK-KHOAITAY',
    description: 'Khoai tây giòn rụm phủ lớp bột phô Mai béo mặn đậm đà.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    price: 40000,
    costPrice: 12000,
    kitchenStation: 'KITCHEN',
    status: 'AVAILABLE',
    modifierGroupIds: []
  },
  {
    id: 'prod-08',
    tenantId: 'tenant-001',
    branchId: 'branch-001',
    categoryId: 'cat-04',
    name: 'Gà Rán Sốt Cay Hàn Quốc (4 Miếng)',
    slug: 'ga-ran-sot-cay',
    sku: 'SNACK-GARAN',
    description: 'Cánh gà giòn tan mọng nước đẫm sốt cay ngọt Chu-Gochujang.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
    price: 75000,
    costPrice: 32000,
    kitchenStation: 'KITCHEN',
    status: 'AVAILABLE',
    modifierGroupIds: []
  },
  {
    id: 'prod-09',
    tenantId: 'tenant-001',
    branchId: 'branch-001',
    categoryId: 'cat-05',
    name: 'Bánh Mousse Chanh Dây',
    slug: 'mousse-chanh-day',
    sku: 'DES-MOUSSE',
    description: 'Vị chua ngọt thanh mát kết hợp lớp cốt bánh mềm mịn.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=80',
    price: 48000,
    costPrice: 16000,
    kitchenStation: 'DESSERT',
    status: 'AVAILABLE',
    modifierGroupIds: []
  }
];

export const initialIngredients: Ingredient[] = [
  { id: 'ing-01', tenantId: 'tenant-001', branchId: 'branch-001', name: 'Hạt Cà Phê Robusta Buon Ma Thuot', unit: 'kg', currentStock: 25.5, minStockLevel: 5.0, costPerUnit: 220000 },
  { id: 'ing-02', tenantId: 'tenant-001', branchId: 'branch-001', name: 'Sữa Đặc Ngôi Sao Phương Nam', unit: 'lon', currentStock: 48, minStockLevel: 10, costPerUnit: 24000 },
  { id: 'ing-03', tenantId: 'tenant-001', branchId: 'branch-001', name: 'Trà Ô Long Nướng Hảo Hạng', unit: 'kg', currentStock: 12.0, minStockLevel: 3.0, costPerUnit: 350000 },
  { id: 'ing-04', tenantId: 'tenant-001', branchId: 'branch-001', name: 'Bánh Phở Tươi', unit: 'kg', currentStock: 30.0, minStockLevel: 8.0, costPerUnit: 20000 },
  { id: 'ing-05', tenantId: 'tenant-001', branchId: 'branch-001', name: 'Thịt Bỏ Tái Mỹ (Nạm/Bắp)', unit: 'kg', currentStock: 18.2, minStockLevel: 5.0, costPerUnit: 280000 },
];
