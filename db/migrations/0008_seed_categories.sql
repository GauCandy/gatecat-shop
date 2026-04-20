-- Seed an extended category taxonomy + auto-link orphan categories.
-- Idempotent: re-running is safe (ON CONFLICT DO NOTHING, updates only orphans).

-- 1) Ensure root (parent) categories exist.
WITH parent_data(name, slug, sort_order) AS (VALUES
  ('Laptop'::text, 'laptop'::text, 1),
  ('PC', 'pc', 2),
  ('Màn hình', 'man-hinh', 3),
  ('Linh kiện máy tính', 'linh-kien-may-tinh', 4),
  ('Bàn phím', 'ban-phim', 5),
  ('Chuột', 'chuot', 6),
  ('Tai nghe', 'tai-nghe', 7),
  ('Loa máy tính', 'loa-may-tinh', 8),
  ('Microphone', 'microphone', 9),
  ('Webcam', 'webcam', 10),
  ('Mousepad', 'mousepad', 11),
  ('Phụ kiện', 'phu-kien', 12),
  ('Nội thất Gaming', 'noi-that-gaming', 13)
)
INSERT INTO categories (id, name, slug, sort_order)
SELECT md5(random()::text || clock_timestamp()::text || p.slug),
       p.name, p.slug, p.sort_order
FROM parent_data p
ON CONFLICT (slug) DO NOTHING;

-- 2) Insert detailed children under their parents.
WITH child_data(parent_slug, name, slug, sort_order) AS (VALUES
  -- Laptop
  ('laptop'::text, 'Laptop văn phòng'::text, 'laptop-van-phong'::text, 1),
  ('laptop', 'Laptop Gaming', 'laptop-gaming', 2),
  ('laptop', 'Laptop đồ hoạ', 'laptop-do-hoa', 3),
  ('laptop', 'Laptop mỏng nhẹ', 'laptop-mong-nhe', 4),
  ('laptop', 'Macbook', 'macbook', 5),
  -- PC
  ('pc', 'PC văn phòng', 'pc-van-phong', 1),
  ('pc', 'PC Gaming', 'pc-gaming', 2),
  ('pc', 'PC đồ hoạ', 'pc-do-hoa', 3),
  ('pc', 'Mini PC', 'mini-pc', 4),
  ('pc', 'PC All-in-One', 'pc-all-in-one', 5),
  -- Màn hình
  ('man-hinh', 'Màn hình 22 inch', 'man-hinh-22-inch', 1),
  ('man-hinh', 'Màn hình 24 inch', 'man-hinh-24-inch', 2),
  ('man-hinh', 'Màn hình 27 inch', 'man-hinh-27-inch', 3),
  ('man-hinh', 'Màn hình 32 inch', 'man-hinh-32-inch', 4),
  ('man-hinh', 'Màn hình cong', 'man-hinh-cong', 5),
  ('man-hinh', 'Màn hình 4K', 'man-hinh-4k', 6),
  ('man-hinh', 'Màn hình Gaming', 'man-hinh-gaming', 7),
  ('man-hinh', 'Màn hình đồ hoạ', 'man-hinh-do-hoa', 8),
  -- Linh kiện máy tính
  ('linh-kien-may-tinh', 'CPU', 'cpu', 1),
  ('linh-kien-may-tinh', 'Mainboard', 'mainboard', 2),
  ('linh-kien-may-tinh', 'RAM', 'ram', 3),
  ('linh-kien-may-tinh', 'SSD', 'ssd', 4),
  ('linh-kien-may-tinh', 'HDD', 'hdd', 5),
  ('linh-kien-may-tinh', 'Card đồ hoạ', 'card-do-hoa', 6),
  ('linh-kien-may-tinh', 'Nguồn máy tính', 'nguon-may-tinh', 7),
  ('linh-kien-may-tinh', 'Tản nhiệt CPU', 'tan-nhiet-cpu', 8),
  ('linh-kien-may-tinh', 'Vỏ case', 'vo-case', 9),
  ('linh-kien-may-tinh', 'Quạt case', 'quat-case', 10),
  -- Bàn phím
  ('ban-phim', 'Bàn phím cơ', 'ban-phim-co', 1),
  ('ban-phim', 'Bàn phím không dây', 'ban-phim-khong-day', 2),
  ('ban-phim', 'Bàn phím văn phòng', 'ban-phim-van-phong', 3),
  ('ban-phim', 'Bàn phím gaming', 'ban-phim-gaming', 4),
  -- Chuột
  ('chuot', 'Chuột gaming', 'chuot-gaming', 1),
  ('chuot', 'Chuột văn phòng', 'chuot-van-phong', 2),
  ('chuot', 'Chuột không dây', 'chuot-khong-day', 3),
  ('chuot', 'Chuột Bluetooth', 'chuot-bluetooth', 4),
  -- Tai nghe
  ('tai-nghe', 'Tai nghe gaming', 'tai-nghe-gaming', 1),
  ('tai-nghe', 'Tai nghe Bluetooth', 'tai-nghe-bluetooth', 2),
  ('tai-nghe', 'Tai nghe TWS', 'tai-nghe-tws', 3),
  ('tai-nghe', 'Tai nghe có dây', 'tai-nghe-co-day', 4),
  -- Loa máy tính
  ('loa-may-tinh', 'Loa Bluetooth', 'loa-bluetooth', 1),
  ('loa-may-tinh', 'Loa soundbar', 'loa-soundbar', 2),
  ('loa-may-tinh', 'Loa 2.1', 'loa-2-1', 3),
  -- Nội thất Gaming
  ('noi-that-gaming', 'Bàn Gaming', 'ban-gaming', 1),
  ('noi-that-gaming', 'Ghế Gaming', 'ghe-gaming', 2),
  ('noi-that-gaming', 'Giá đỡ màn hình', 'gia-do-man-hinh', 3),
  -- Phụ kiện
  ('phu-kien', 'Tay cầm Gaming', 'tay-cam-gaming', 1),
  ('phu-kien', 'Hub USB', 'hub-usb', 2),
  ('phu-kien', 'Cáp sạc', 'cap-sac', 3),
  ('phu-kien', 'Balo laptop', 'balo-laptop', 4),
  ('phu-kien', 'Đế tản nhiệt laptop', 'de-tan-nhiet-laptop', 5),
  ('phu-kien', 'Ổ cứng di động', 'o-cung-di-dong', 6)
)
INSERT INTO categories (id, name, slug, parent_id, sort_order)
SELECT md5(random()::text || clock_timestamp()::text || c.slug),
       c.name, c.slug, p.id, c.sort_order
FROM child_data c
JOIN categories p ON p.slug = c.parent_slug
ON CONFLICT (slug) DO NOTHING;

-- 3) Auto-link existing orphan categories to their natural parents
--    (only touches rows where parent_id IS NULL — user's manual links stay intact).
UPDATE categories c
SET parent_id = p.id, updated_at = NOW()
FROM (VALUES
  ('laptop-gaming'::text, 'laptop'::text),
  ('pc-gaming', 'pc'),
  ('ban-gaming', 'noi-that-gaming'),
  ('ghe-gaming', 'noi-that-gaming'),
  ('tay-cam-gaming', 'phu-kien'),
  ('mousepad', 'phu-kien'),
  ('microphone', 'phu-kien'),
  ('webcam', 'phu-kien')
) AS l(child_slug, parent_slug),
  categories p
WHERE p.slug = l.parent_slug
  AND c.slug = l.child_slug
  AND c.parent_id IS NULL;
