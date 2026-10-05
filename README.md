# GourmetOS - Full-Stack F&B QR Ordering + POS + KDS + Payment SaaS Platform

![GourmetOS System](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80)

Hệ thống quản lý F&B hoàn chỉnh dành cho **Nhà hàng, Quán ăn, Quán Cà phê, Trà sữa, Quán nhậu, Food Court, Bakery** hỗ trợ mô hình Multi-Tenant SaaS (Multi-Location/Multi-Branch).

---

## 🌟 Nổi Bật Về Kiến Trúc & Nghiệp Vụ

1. **Table Session & Open Check Core (Nghiệp vụ quan trọng nhất)**:
   - Quản lý phiên làm việc bàn (`table_sessions`).
   - Hỗ trợ gọi món nhiều lần (**Multiple Order Rounds**: Round 1, Round 2, Round 3...) thuộc cùng một session mà không bị tách rời hóa đơn.
2. **KDS Chế Biến Realtime**:
   - Phân loại trạm bếp: **Quầy Pha Chế (Bar)**, **Bếp Chính (Kitchen)**, **Bánh & Tráng Miệng (Dessert)**.
   - Âm thanh thông báo khi có ticket mới & Bộ đếm thời gian chờ chế biến.
3. **POS Thu Ngân Tốc Độ Cao**:
   - Quản lý sơ đồ bàn trực quan theo tầng & khu vực.
   - Chuyển bàn (**Transfer Table**), Gộp bàn (**Merge Tables**), Giảm giá (Discount % & Fixed).
   - Thanh toán tiền mặt tự động tính tiền thối, Thanh toán **VietQR**, Thanh toán kết hợp (**Mixed Payment**).
   - In hóa đơn nhiệt định dạng chuẩn.
4. **Customer Mobile PWA QR Ordering**:
   - Quét mã QR token an toàn (`/q/{secure_token}`).
   - Tùy chỉnh Modifiers (Size, Đường, Đá, Toppings, Note).
   - Nút Gọi Nhân Viên & Yêu Cầu Thanh Toán.
5. **Admin Center & Multi-Tenant RBAC**:
   - Phân quyền theo Role (Super Admin, Manager, Cashier, Waiter, Kitchen, Inventory).
   - Quản lý tồn kho nguyên liệu & tự động trừ định lượng.
   - Báo cáo doanh thu & Nhật ký giao dịch (Audit Log).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Yêu Cầu Hệ Thống
- Node.js v18+ & npm 10+
- PHP 8.2+ (nếu triển khai với Laravel API Backend)
- MySQL 8.0+ / Redis 7+

### 2. Cài Đặt Dependencies & Khởi Chạy Local Dev
```bash
# Di chuyển vào thư mục dự án
cd c:\laragon\www\F&B

# Cài đặt gói phụ thuộc
npm install

# Chạy server phát triển (Development Server)
node "node_modules/vite/bin/vite.js" --host
```
Truy cập trình duyệt tại: `http://localhost:3000`

### 3. Kiểm Tra Type Check & Build Production
```bash
# Kiểm tra TypeScript type safety
node "node_modules/typescript/bin/tsc" --noEmit

# Đóng gói sản phẩm cho Production
node "node_modules/vite/bin/vite.js" build
```

---

## 🏗️ Cấu Trúc Thư Mục Dự Án

```
c:\laragon\www\F&B\
├── ARCHITECTURE_SPECIFICATION.md    # Document thiết kế ERD, REST API & State Machine
├── .env.example                     # Biến môi trường mẫu
├── package.json                     # Dependencies & Scripts
├── tailwind.config.js               # Cấu hình Tailwind CSS Theme
├── vite.config.ts                   # Cấu hình Vite & Path Alias (@/*)
└── src/
    ├── components/                  # Components dùng chung (HeaderNav, VietQRModal, ReceiptPrinterModal)
    ├── features/                    # Các phân hệ chức năng cốt lõi:
    │   ├── customer/                # App Customer QR Ordering (Mobile PWA)
    │   ├── pos/                     # App POS / Thu Ngân (Floor map, Check out, Bills)
    │   ├── kds/                     # App Kitchen Display System (Realtime Tickets)
    │   └── admin/                   # App Admin Control Center (Dashboard, Menu, QR, Inventory, RBAC)
    ├── services/                    # Seed data & Service Mock Engine
    ├── stores/                      # Centralized Zustand State Manager (Business Logic Core)
    ├── types/                       # Định nghĩa TypeScript Types & Entities
    ├── App.tsx                      # Component chính điều hướng
    └── main.tsx                     # Vite Entry point
```

---

## 📋 Tài Liệu Tham Chiếu Chi Tiết
Vui lòng xem file `ARCHITECTURE_SPECIFICATION.md` trong artifact directory để xem thiết kế chi tiết 38 bảng Database ERD, 20+ REST API Specification v1, State Machines và WebSockets Broadcast Events!
