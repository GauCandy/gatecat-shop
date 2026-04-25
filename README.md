# Gatecat Shop

Web bán hàng đồ án — Next.js 16 + PostgreSQL + Tailwind CSS 4.

## Tính năng

- **Khách:** duyệt / tìm sản phẩm, giỏ hàng, sổ địa chỉ, đặt đơn COD, áp voucher, huỷ đơn khi còn `pending`.
- **Shipper:** workflow 3 bước (xác nhận → chuẩn bị hàng → đang giao) + quét POS mã vận chuyển để đánh dấu giao thành công / hoàn hàng, chỉnh trạng thái thủ công ở trang "Tất cả đơn".
- **Admin:** dashboard doanh thu (stats + biểu đồ 30 ngày + top sản phẩm), CRUD danh mục / sản phẩm / voucher, quản lí vai trò người dùng.
- **Voucher:** `public` (hiện trong checkout) hoặc `private` (phải nhập mã), giảm theo % hoặc số tiền cố định, hạn sử dụng, giới hạn lượt dùng, mỗi tài khoản chỉ dùng 1 lần.
- **Tồn kho:** tự động hoàn kho khi đơn bị huỷ hoặc trả.

## Stack

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, TypeScript 5
- **Backend:** Next.js Route Handlers, `pg` cho PostgreSQL
- **Auth:** Google OAuth (session cookie, SHA-256 hashed token)
- **DB migrations:** file SQL trong `db/migrations/`, chạy bằng `scripts/migrate.mjs`

## Yêu cầu

- Node.js 20+
- PostgreSQL 14+ (enum `ALTER TYPE ... ADD VALUE` cần PG 12+)

## Cài đặt

```bash
npm install
```

Tạo file `.env` ở root với:

```env
DATABASE_URL=postgres://user:password@host:port/dbname
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

Chạy migrations:

```bash
npm run db:migrate
```

Khởi động dev:

```bash
npm run dev
```

Build production:

```bash
npm run build
npm start
```

## Gán quyền admin đầu tiên

Đăng nhập lần đầu bằng Google sẽ tạo user với role `USER`. Để tự phong mình lên admin, chạy SQL trực tiếp:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Sau đó vào `/admin/users` để gán role `SHIPPER` cho các tài khoản khác qua UI.

## Cấu trúc thư mục chính

```
app/
  (root)/              — trang chủ, products, category, cart, checkout, orders, login
  account/             — thông tin tài khoản & sổ địa chỉ
  admin/               — dashboard, categories, products, vouchers, users
  shipping/            — pending, preparing, delivering, all, chi tiết đơn cho shipper
  api/                 — route handlers (admin, shop, auth, voucher)
components/            — UI components tái sử dụng (Header, Footer, clients, Toaster...)
lib/                   — domain logic (products, orders, vouchers, users, session)
db/migrations/         — SQL migrations đánh số 0001–00xx
scripts/migrate.mjs    — runner migration (transaction-wrapped)
```

## Quy ước

- Sửa xong code: chạy `npm run build` để pass type-check + compile trước khi commit.
- Thêm migration mới: số thứ tự tiếp theo (`0018_...sql`), sau đó `npm run db:migrate`. Không sửa migration đã apply.
- Trước khi làm việc với Next.js mới, đọc `node_modules/next/dist/docs/` — docs trong đó là nguồn chính xác (Next.js cập nhật nhanh hơn training data của LLM).

## Flow trạng thái đơn hàng

```
pending ─┬─► confirmed ──► shipping ─┬─► delivered
         │                           └─► returned (hoàn kho)
         └─► cancelled (khách tự huỷ, hoàn kho)
```

`/api/admin/orders/[id]/status` cho phép admin/shipper chuyển bất kỳ trạng thái nào. Khi vào `returned` hoặc `cancelled` mà stock chưa hoàn, hệ thống `UPDATE product_variants SET stock = stock + quantity` và set `orders.stock_restored = TRUE`. Nếu admin thao tác ngược ra khỏi trạng thái hoàn thì tự trừ lại.
