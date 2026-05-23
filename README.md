# Gatecat Shop

Web bán hàng đồ án — Next.js 16 + PostgreSQL + Tailwind CSS 4.

## Tính năng

- **Khách:** duyệt / tìm sản phẩm, giỏ hàng, sổ địa chỉ, đặt đơn COD, áp voucher, huỷ đơn khi còn `pending`, đánh giá sản phẩm sau khi nhận hàng.
- **Đăng nhập:** Google OAuth **hoặc** Email OTP (mã 6 số, không cần mật khẩu). Mỗi lần đăng nhập có email thông báo.
- **Shipper:** workflow 3 bước (xác nhận → chuẩn bị hàng → đang giao) + quét POS mã vận chuyển để đánh dấu giao thành công / hoàn hàng, chỉnh trạng thái thủ công ở trang "Tất cả đơn".
- **Admin:** dashboard doanh thu (stats + biểu đồ 30 ngày + top sản phẩm), CRUD danh mục / sản phẩm / voucher, quản lí vai trò người dùng, **cấm tài khoản kèm lý do**, kiểm duyệt review (ẩn/hiện).
- **Site management:** Quick Edit Panel cho admin chỉnh tên site, logo, banner slideshow, popup quảng cáo, ảnh nền hero, marquee chạy chữ — tất cả không cần deploy lại.
- **Voucher:** `public` (hiện trong checkout) hoặc `private` (phải nhập mã), giảm theo % hoặc số tiền cố định, hạn sử dụng, giới hạn lượt dùng, mỗi tài khoản chỉ dùng 1 lần.
- **Tồn kho:** tự động hoàn kho khi đơn bị huỷ hoặc trả.
- **Giao diện:** toggle Dark / Light mode (lưu vào localStorage, anti-FOUC).

## Stack

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, TypeScript 5
- **Backend:** Next.js Route Handlers, `pg` cho PostgreSQL, `nodemailer` cho SMTP
- **Auth:** Google OAuth 2.0 + Email OTP, session cookie (SHA-256 hashed token, 30 ngày)
- **DB migrations:** file SQL trong `db/migrations/`, chạy bằng `scripts/migrate.mjs` (transaction-wrapped)

## Yêu cầu

- Node.js 20+
- PostgreSQL 14+ (enum `ALTER TYPE ... ADD VALUE` cần PG 12+)
- SMTP server (Gmail App Password / Mailtrap / SendGrid / ...) — cần cho Email OTP và notification

## Cài đặt

```bash
npm install
```

Tạo file `.env` ở root (copy từ `.env.example`):

```env
# Database
DATABASE_URL=postgres://user:password@host:port/dbname

# URL của app (dùng cho OAuth redirect khi prod)
APP_URL=http://localhost:3000

# Google OAuth — tạo ở https://console.cloud.google.com/
# Redirect URI cần đăng ký: {APP_URL}/api/auth/google/callback
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

# SMTP — bắt buộc để gửi OTP đăng nhập và email thông báo
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="Gatecat Shop"
```

Chạy migrations (sẽ apply lần lượt 0001 → 0024):

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

Đăng nhập lần đầu (Google hoặc OTP) sẽ tạo user với role `USER`. Để tự phong mình lên admin, chạy SQL trực tiếp:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Sau đó vào `/admin/users` để gán role `SHIPPER` cho các tài khoản khác qua UI.

## Cấu trúc thư mục chính

```
app/
  (root)/              — trang chủ, products, category, cart, checkout, orders, login
  account/             — thông tin tài khoản & sổ địa chỉ
  admin/               — dashboard, categories, products, vouchers, users, reviews, site
  shipping/            — pending, preparing, delivering, all, chi tiết đơn cho shipper
  api/                 — route handlers (admin, shop, auth, voucher, reviews, uploads)
components/            — UI components tái sử dụng (Header, Footer, ThemeToggle, Toaster...)
lib/                   — domain logic (products, orders, vouchers, users, session, mailer)
db/migrations/         — SQL migrations đánh số 0001–00xx
scripts/migrate.mjs    — runner migration (transaction-wrapped)
data/uploads/          — ảnh upload (ignored, serve qua /api/uploads/[...path])
```

## Quy ước

- Sửa xong code: chạy `npm run build` để pass type-check + compile trước khi commit.
- Thêm migration mới: số thứ tự tiếp theo (`0025_...sql`), sau đó `npm run db:migrate`. **Không sửa migration đã apply.**
- Trước khi làm việc với Next.js mới, đọc `node_modules/next/dist/docs/` — docs trong đó là nguồn chính xác (Next.js cập nhật nhanh hơn training data của LLM).
- `.gitignore` skip toàn bộ dotfiles (`.*`), chỉ trừ `.gitignore` và `.env.example`. AI tooling configs (`.claude/`, `.codex-*/`, ...) không bao giờ vào repo.

## Flow trạng thái đơn hàng

```
pending ─┬─► confirmed ──► shipping ─┬─► delivered
         │                           └─► returned (hoàn kho)
         └─► cancelled (khách tự huỷ, hoàn kho)
```

`/api/admin/orders/[id]/status` cho phép admin/shipper chuyển bất kỳ trạng thái nào. Khi vào `returned` hoặc `cancelled` mà stock chưa hoàn, hệ thống `UPDATE product_variants SET stock = stock + quantity` và set `orders.stock_restored = TRUE`. Nếu admin thao tác ngược ra khỏi trạng thái hoàn thì tự trừ lại.

## Cấm tài khoản

Admin vào `/admin/users` → nút **Cấm** → nhập lý do (max 500 ký tự). Hệ thống sẽ:

1. Set `users.is_banned = TRUE` + lưu `ban_reason`, `banned_at`.
2. `DELETE FROM sessions WHERE user_id = X` → user đang online bị kick ngay khi reload.
3. Lần đăng nhập kế tiếp (Google hoặc OTP) đều bị chặn, redirect về `/login?error=banned` kèm cookie `ban_info` chứa lý do.
4. Trang login hiển thị thông báo cấm + lý do + nút mailto `support@gatecat.net` để khiếu nại.

Bấm **Gỡ cấm** để khôi phục — user đăng nhập lại bình thường.
