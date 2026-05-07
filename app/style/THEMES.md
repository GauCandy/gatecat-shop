# Gatecat Shop — Spec 7 theme gaming

Tài liệu này mô tả đủ để recreate lại 7 theme từ con số 0. Mỗi theme có:
palette · typography · layout · component · effect · copy direction · use case.

Source code mẫu của từng theme nằm ở:
- `app/style/cyberpunk/page.tsx`
- `app/style/esports/page.tsx`
- `app/style/synthwave/page.tsx`
- `app/style/tactical/page.tsx`
- `app/style/mecha/page.tsx`
- `app/style/arcade/page.tsx`
- `app/style/stealth/page.tsx`

Mock data dùng chung: `app/style/_data/mock.ts`.

---

## 1. NEON CYBERPUNK

> "Power up your reality." — Night City vibe, dành cho FPS / MMO / cyberpunk fan.

### Palette
| Vai trò | Hex | Ghi chú |
|---|---|---|
| Background base | `#050507` | gần đen, hơi xanh lạnh |
| Surface (card) | `#0a0a0c` / `#18181b` (zinc-950) | |
| Accent chính | `#d946ef` (fuchsia-500) | neon magenta — nút primary, badge, glow |
| Accent phụ | `#22d3ee` (cyan-400) | neon cyan — text emphasis, dot, link hover |
| Text chính | `#ffffff` | |
| Text dim | `rgba(255,255,255,0.65)` | |
| Border | `rgba(255,255,255,0.10)` | rất mảnh |

### Typography
- **Display / heading:** Inter / SF Pro, `font-weight: 900`, `letter-spacing: -0.04em`, scale lớn (60–112px ở hero).
- **Body:** Inter / system-ui, 13–14px.
- **Mono / tech label:** ui-monospace, `text-[10px] uppercase tracking-[0.32em]` cho mọi label kiểu `// 02 · arsenal`, `/// system_online`.
- **Effect chữ:** glitch — duplicate chữ thành 2 layer cyan + magenta lệch ±1px (`text-shadow` hoặc pseudo-element).

### Layout
- Header sticky đen với grid lưới mờ phía sau, logo dạng "GATE·CAT" bo cạnh, nav là pill-link gạch chân gradient khi hover.
- Hero: 7/5 cột — bên trái text + CTA + 3 stat block (01/02/03), bên phải card spotlight aspect 4/5 với HUD góc và badge ID.
- Categories: lưới 6 ô vuông `aspect-square`, mỗi ô là gradient màu khác nhau + scanline overlay.
- Products: 1 spotlight to (5 cột × 2 rows) + grid 6 thumbnail nhỏ.
- Manifesto: dải đen, tiêu đề khổng lồ với 1 chữ accent cyan/magenta.
- Footer: đen + grid lưới + logo to "GATE·CAT_" với underscore nháy.

### Component patterns
- **Button primary:** `clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)` (vát chéo 2 đầu) + nền gradient `linear-gradient(90deg, #d946ef, #22d3ee)`, chữ đen, font mono uppercase.
- **Button ghost:** cùng clip-path, border `rgba(255,255,255,0.2)`, hover đổi border + chữ thành cyan.
- **Card frame:** border `rgba(217,70,239,0.35)` + `box-shadow: inset 0 0 0 1px rgba(34,211,238,0.15), 0 0 60px rgba(217,70,239,0.15)`.
- **Tag/chip:** rounded-full, border 1px cyan, chữ cyan, nền `rgba(0,0,0,0.4)` + `backdrop-filter: blur(6px)`.
- **Badge giảm giá:** vuông góc, nền fuchsia đặc, chữ đen, mono uppercase tracking 0.2em.

### Effect signature
1. **Grid lưới** (`.cp-grid`): 2 layer line — 1px magenta + 1px cyan, size `32px 32px`, opacity 18%.
2. **Grid floor (perspective):** giống hero floor ở synthwave nhưng nhỏ hơn, mask radial từ giữa-dưới.
3. **Scanline:** repeating-linear-gradient ngang, opacity ~18%, dày 1px khoảng cách 3px → tạo cảm giác CRT.
4. **Glow blob:** tròn `rounded-full` blur `120px`, accent fuchsia hoặc cyan, opacity 30–40%, đặt sau hero và sau section.
5. **Pulse dot:** chấm cyan `box-shadow` ring động → animation "online indicator".
6. **Glitch text:** `::before` cyan dịch (-1px,0), `::after` fuchsia dịch (+1px,0), `mix-blend-mode: screen`.

### Copy / voice direction
- Tiếng Anh + Việt mix: "POWER UP / Your Reality".
- Label section dạng `// 02 · arsenal`, `/// flagship_drop`, `::system_online`.
- CTA: `>_ Khám phá Hangar`, `>_ Equip now`, `Pre-order →`.
- Tone: tech-savvy, hơi hacker, "neon division", "overclocked dreams".

### Use case
Phù hợp khi muốn target gen Z hardcore, người chơi FPS (Valorant, CS), MMO (Genshin, Tower of Fantasy), người yêu RGB và setup tối.

---

## 2. ESPORTS ARENA

> "Play hard. Win fast." — Vibe FaZe Clan / 100 Thieves / TSM. Aggressive, dứt khoát, dễ nhớ.

### Palette
| Vai trò | Hex | Ghi chú |
|---|---|---|
| Background base | `#0c0c0e` | đen than, không tuyệt đối |
| Surface | `#000000` | đen tuyệt cho section quan trọng |
| Accent chính | `#ef4444` (red-500) | đỏ máu — primary button, badge, accent |
| Accent dim | `#dc2626` (red-600) | hover state |
| Spark | `#facc15` (yellow-400) | điện áp — pick of the week, tag |
| Text chính | `#ffffff` | |
| Text dim | `rgba(255,255,255,0.65)` | |
| Border | `rgba(255,255,255,0.10)` | |

### Typography
- **Display:** Inter italic, `font-weight: 900`, `font-style: italic`, `letter-spacing: -0.04em`. Scale rất lớn (88–112px).
- **Body:** Inter, 13–14px, không italic.
- **Mono:** ui-monospace cho label nhỏ.
- **Effect chữ "stroke red":** `-webkit-text-stroke: 2px #ef4444; color: transparent; text-shadow: 4px 4px 0 rgba(239,68,68,0.18)` — chữ rỗng viền đỏ với bóng đặc.

### Layout
- Top bar marquee đen với chấm sét vàng nháy.
- Header dùng "shield" hexagon clip-path cho logo, nav uppercase italic.
- Hero 7/5: bên trái title 2 dòng "PLAY HARD / WIN FAST" với chữ HARD viền đỏ rỗng và FAST màu vàng. 3 stat (240Hz / 0.03ms / 24/7).
- Sponsor strip: dải đen với loga các "team" giả ("TEAM FLASH", "GAM ESPORTS"...).
- Categories: 6 ô vuông clip-path vát góc đối xứng (góc trên phải + dưới trái cắt 16px).
- Products: 1 feature card to vát góc lớn 32px + 6 cards nhỏ vát góc 0.
- Manifesto: tiêu đề khổng lồ (80px) "We don't play to JOIN. We play to WIN." với JOIN viền đỏ, WIN vàng đặc.
- Footer: GATECAT. khổng lồ (88px) italic với dấu chấm đỏ.

### Component patterns
- **Button primary:** `clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 12px 100%)` (hình thang) + nền `#ef4444`, hover dịch translateX +2px.
- **Button outline:** cùng clip-path, border-2 white, hover invert thành nền trắng chữ đen.
- **Button yellow accent:** `#facc15` nền + chữ đen — dùng cho CTA mua trên card.
- **Tag yellow:** clip-path vát đối xứng (6px 2 góc đối) + chữ đen italic.
- **Tab pill:** vát góc 8px, active = đỏ đặc, idle = xám 5% trắng.
- **Cards:** clip-path vát đối xứng 16/24/32px tùy size.

### Effect signature
1. **Diagonal stripes** (`.es-stripe-bg`): repeating-linear-gradient `135deg`, đỏ alpha 40%, line 2px khoảng 32px.
2. **Diagonal subtle** (`.es-diagonal`): cùng kỹ thuật nhưng `115deg`, alpha 5%, line cách 82px → texture nền không quá ồn.
3. **Spotlight gradient:** `radial-gradient(ellipse at 80% 0%, rgba(220,38,38,0.25), transparent 60%)` — đỏ tỏa từ góc.
4. **Blob lớn:** đỏ + vàng blur `160px` opacity 20–30%.
5. **Blink dot:** chấm đỏ `animation: es-blink 1.2s infinite alternate`.
6. **Hover card:** translateY -4px + đổi border thành đỏ.

### Copy / voice direction
- Câu lệnh: "PLAY HARD. WIN FAST.", "Equip → Win", "Vào trận →", "Insert Coin →".
- Label: `// 02 · loadout`, `// 03 · meta picks`, `⚔ flagship · titan series`.
- Tone: hung hãn, tự tin, ngắn, hơi quân sự nhẹ.

### Use case
Phù hợp khi định vị rõ là cửa hàng dành cho competitive gamer, esports player, người mua gear pro (chuột 60g, phím 60%, màn 240Hz).

---

## 3. SYNTHWAVE 1986

> "Game on. Stay rad." — Outrun aesthetic, mặt trời sọc + lưới phối cảnh, chữ chrome.

### Palette
| Vai trò | Hex | Ghi chú |
|---|---|---|
| Background base | `#06011a` | tím đêm gần đen |
| Sky (hero) | gradient `#1a0436 → #3b0a59 → #87155a → #ec4899 → #f97316` | sunset 5 stop |
| Surface | `#10052a` / `#0a0220` | tím đậm |
| Accent chính | `#ec4899` (pink-500) | hồng neon — primary |
| Accent phụ | `#22d3ee` (cyan-400) | aqua — text accent, link |
| Spark | `#fde047` (yellow-300) | vàng nhẹ — chỉ dùng cho mặt trời + emphasis |
| Text chính | `#ffffff` | |
| Text dim | `rgba(252,231,243,0.75)` (pink-100) | hơi hồng |

### Typography
- **Display "chrome":** background-clip text với `linear-gradient(180deg, #ffffff 0%, #fce7f3 30%, #f472b6 55%, #be185d 100%)`, `text-shadow: 0 0 24px rgba(236,72,153,0.35)`, font-weight 900.
- **Display "stroke pink":** `-webkit-text-stroke: 2px #ec4899; color: transparent; text-shadow: 4px 4px 0 rgba(34,211,238,0.4)` — viền hồng bóng cyan offset 4px.
- **Mono:** ui-monospace, label dạng `// 02 ✦ catalogue`, `/// hot pick`.

### Layout
- Top bar tím đậm với hoa thị `✦` cyan và chữ hồng.
- Header: logo gradient hộp vuông + chữ chrome "GATECAT".
- Hero là **show-stopper**: sunset gradient phủ toàn nền + mặt trời sọc lớn ở giữa-trên + grid floor phối cảnh ở nửa dưới + 2 blob hồng/cyan blur.
  - Title: "GAME ON." chữ chrome khổng lồ + "Stay rad." viền hồng bóng cyan.
- Categories: 6 ô bo `rounded-2xl`, gradient + grid mini.
- Products: card "side·a" (như mặt A đĩa than) + grid 6 thumbnail.
- Manifesto: "Yesterday's vibe. / Tomorrow's rig." chữ chrome lớn.
- Footer: GATECAT chrome + dấu ✦ khắp nơi.

### Component patterns
- **Button primary:** rounded-full + nền `linear-gradient(90deg, #ec4899, #8b5cf6)` + box-shadow `0 0 18px rgba(236,72,153,0.45), inset 0 1px 0 rgba(255,255,255,0.25)` (highlight bóng trên).
- **Button outline:** rounded-full + border 1px cyan, hover glow cyan.
- **Button cyan:** `#22d3ee` đặc + chữ tím đen, glow cyan.
- **Tag pink/cyan:** rounded-full + glow blur theo màu.
- **Card frame:** border hồng 40% + inset 1px cyan 18% + glow ngoài 50px hồng 20%.

### Effect signature
1. **Sunset sky:** gradient 5 stop từ tím đêm → cam.
2. **Mặt trời sọc:** `border-radius: 9999px`, gradient `vàng → cam → hồng`, `::after` overlay sọc đen ngang đậm dần xuống dưới (mask gradient từ 50%) → tạo "horizon sun" iconic của synthwave.
3. **Grid floor (perspective):**
   ```css
   background-image:
     linear-gradient(rgba(236,72,153,0.55) 2px, transparent 2px),
     linear-gradient(90deg, rgba(236,72,153,0.55) 2px, transparent 2px);
   background-size: 60px 80px;
   transform: perspective(600px) rotateX(72deg);
   transform-origin: bottom;
   animation: sw-grid-pan 4s linear infinite;
   mask-image: linear-gradient(180deg, transparent 0%, black 30%, black 100%);
   ```
4. **Stars background:** `radial-gradient(1px 1px at X Y, white, transparent)` lặp lại nhiều tọa độ → bầu trời sao.
5. **Glow blob:** hồng + cyan blur 120–140px, opacity 20–30%.

### Copy / voice direction
- "Track listing", "Side A / Side B", "Greatest hits", "Heavy rotation", "Drop loaded" — toàn ẩn dụ băng đĩa, mixtape.
- "▶ Press Start", "Insert Coin →", "▶ Listen / Buy".
- Tone: hoài niệm, lãng mạn, hơi sến nhưng có duyên.

### Use case
Phù hợp khi muốn tạo identity có hồn nhất, target người chơi RPG cổ điển, sưu tầm RGB, fan Stranger Things / Cyberpunk 2077 / Drive (2011) / Hotline Miami.

---

## 4. TACTICAL HUD

> "Gear for the long night." — Mil-spec, blueprint, font mono toàn trang. Lạnh, kỹ thuật, đáng tin.

### Palette
| Vai trò | Hex | Ghi chú |
|---|---|---|
| Background base | `#0a100a` | gần đen olive |
| Surface | `#0d130a` | olive đêm |
| Border | `#3d4a2a` | olive đậm |
| Olive nhạt | `#5a6f37` | midground accent |
| Text chính | `#d8e6c0` | xanh oliu nhạt — KHÔNG dùng trắng tinh |
| Text dim | `#a4b87a` | olive sáng |
| Text very dim | `#5a6f37` | dùng cho footnote |
| Accent chính | `#f59e0b` (amber-500) | hổ phách — duy nhất accent màu nóng |
| Accent hover | `#fbbf24` (amber-400) | |

### Typography
- **TOÀN TRANG dùng MONO** — không có font sans-serif (chỉ headline lớn dùng Inter).
- ui-monospace / SFMono / Menlo, uppercase mặc định cho 80% UI.
- Letter-spacing rộng `0.18em` đến `0.32em`.
- Headline: Inter `font-weight: 900`, `letter-spacing: -0.04em`, scale 68–80px (không to bằng các theme khác — vibe nén lại).

### Layout
- Header có timestamp + lat/lon + status indicator như HUD trinh sát: `▸ OPS_LOG · 2026.05.07 · LAT 10.7720 · LON 106.6940 · UTC+7 · ALL SYS GO`.
- Nav có function key prefix: `F1 · Laptop`, `F2 · Build PC`...
- Hero 7/5: trái text "GEAR FOR / THE LONG NIGHT." + 4 stat block (RIGS / OPS / LAT / WAR) với border-left hổ phách. Phải card spotlight có **HUD góc** (4 góc L vuông amber 18px).
- Categories: 6 ô vuông, mỗi ô có 4 HUD góc nhỏ (12px) + label `CL·01` + glyph.
- Products: 6 cards 3 cột (không có spotlight to) — mỗi card có 4 HUD góc, card chia thành "image area" và "spec area" ngăn bằng 1 line border.
- Manifesto: "NO RGB FOR THE SAKE OF RGB." + 3 cột rule với border-left amber.
- Footer: timestamp + callsign GC·01.

### Component patterns
- **Button primary (amber):** clip-path vát 2 góc đối nhau (`8px 0 ... 0 8px`), nền `#f59e0b`, chữ đen olive, `letter-spacing: 0.18em`, hover dịch translateX +2px.
- **Button outline:** cùng clip-path, border `#5a6f37`, hover đổi border + text thành amber.
- **Tag amber:** clip-path vát + nền amber + chữ đen olive.
- **Tab:** active = amber đặc; idle = border olive đậm + text olive rất nhạt.
- **HUD corners:** 4 span absolute mỗi góc card, kích thước 18px (large) hoặc 12px (small), border-2px amber chỉ 2 cạnh tạo hình chữ L.
  ```css
  .corner-tl { left:0; top:0; border-right:0; border-bottom:0; border:2px solid #f59e0b; }
  ```

### Effect signature
1. **Grid lưới khoa học** (`.tc-grid`): 1px olive `rgba(164,184,122,0.18)`, size `40px 40px`. Đặt khắp section.
2. **Blueprint grid** (`.tc-blueprint`): 2 lớp lưới — lớp 1 amber 80px, lớp 2 olive 16px → texture giấy blueprint kỹ thuật.
3. **HUD corners:** **chữ ký quan trọng nhất** của theme — đặt ở mọi card và spotlight image.
4. **Border-left amber** dùng cho các stat block và manifesto rule — vạch dọc 2px hổ phách.
5. **Pulse dot** amber `animation: tc-pulse 1.4s infinite` — chấm trạng thái "armed".

### Copy / voice direction
- Tất cả uppercase mono: `▸ MISSION 06 · BRIEFING`, `▸ DOSSIER`, `▸ ENGAGE`, `▸ DEPLOY GEAR`, `▸ ACQUIRE`.
- Stat label viết tắt: `RIGS / OPS / LAT / WAR / ALLOC / ID·0x4090-OC / CLS·SS-FLAGSHIP`.
- Vẫn có chữ Việt nhưng giảm tải, ưu tiên Anh.
- Tone: ngắn, kỹ thuật, không cảm xúc.

### Use case
Phù hợp khi muốn vibe pro/serious — target builder PC kỹ thuật cao, anh em mua linh kiện theo spec, thích Call of Duty / Tarkov / Helldivers / mil-sim. Cũng hợp với ai muốn cửa hàng có tính chuyên nghiệp, không "trẻ trâu RGB".

---

---

## 5. MECHA INDUSTRIAL

> "Heavy duty. Max output." — Vibe Gundam / Titanfall / xưởng cơ khí. Khác Tactical ở chỗ Tactical là **trinh sát/blueprint** còn Mecha là **máy móc nặng/cơ khí**.

### Palette
| Vai trò | Hex | Ghi chú |
|---|---|---|
| Background base | `#09090b` (zinc-950) | gần đen than |
| Surface | `#18181b` (zinc-900) / `#27272a` (zinc-800) | bậc thang |
| Border | `#27272a` / `#52525b` | xám đậm/sáng |
| Accent chính | `#f97316` (orange-500) | cam an toàn — primary, accent |
| Accent hover | `#fb923c` (orange-400) | |
| Hazard | `#eab308` (yellow-500) | vàng cảnh báo — chỉ dùng cho hazard stripe + tag |
| Text chính | `#f4f4f5` (zinc-100) | |
| Text dim | `#a1a1aa` (zinc-400) | |

### Typography
- **Display:** Inter `font-weight: 900`, `text-transform: uppercase`, `letter-spacing: -0.04em`. Scale 68–92px.
- **Mono toàn UI label:** ui-monospace, `font-bold`, `tracking-[0.22em]` đến `tracking-[0.32em]`.
- **Effect chữ "stroke-orange":** `-webkit-text-stroke: 2px #f97316; color: transparent; text-shadow: 4px 4px 0 rgba(234,179,8,0.4)` — chữ rỗng cam viền, bóng vàng offset.

### Layout
- **Hazard strip 2px** (sọc cam-đen 45°) ở top + giữa các section + bottom footer — chữ ký quan trọng nhất.
- Header sticky border-bottom-2 cam, có badge `SYS·LOAD 87%` với dot pulse.
- Logo có 4 rivet ở 4 góc + gunmetal gradient + ⬢ orange.
- Hero 7/5: trái title + 3 stat block (mỗi block là plate có 2 rivet trên, đơn vị `kW · GHz · %`). Phải card spotlight có **gauge tròn SVG** chỉ 87% + readout `EFFICIENCY/THERMAL/FAN` + 4 rivet góc.
- Categories: 6 ô vuông, mỗi ô có 4 rivet góc + label `MOD/01...06` + glyph cam.
- Products: 6 cards 3 cột, mỗi card có 4 rivet góc, hover translate(-2px,-2px) + box-shadow offset 6px (3D press).
- Manifesto: tile có rivet 4 góc + border-2 olive + headline "WE BUILD MACHINES THAT RUN COLD."
- Footer: hazard strip ở cuối + logo `GATECAT/MCH` + label `ISO 9001`.

### Component patterns
- **Rivet** (chữ ký): `position: absolute`, `width/height: 6px`, `background: radial-gradient(circle at 35% 35%, #71717a, #18181b)`, `border-radius: 9999px`, `box-shadow: inset 0 0 0 1px rgba(0,0,0,0.5)`. Đặt ở 4 góc mọi card và plate.
- **Button primary:** nền cam đặc, border-2 cam, **box-shadow: 4px 4px 0 #18181b** (hard shadow đen offset), hover dịch translate(-2px,-2px) + shadow 6px. Cảm giác "press button vật lý".
- **Button outline:** border-2 zinc-700, hover đổi border + text thành cam.
- **Hazard tag (badge giảm giá):** nền vàng + border-2 đen + box-shadow 2px 2px đen + chữ đen mono.
- **Stat plate:** border-2 zinc-800 + bg zinc-900 + 2 rivet trên góc.
- **Gauge tròn:** SVG `<circle stroke="#27272a">` background ring + `<circle stroke="#f97316" stroke-dasharray="264" stroke-dashoffset="60">` foreground arc + `<text>` % ở giữa.

### Effect signature
1. **Hazard stripe** (`.mc-hazard`): `repeating-linear-gradient(-45deg, #f97316 0, #f97316 14px, #18181b 14px, #18181b 28px)`, height 2px hoặc 8px tuỳ vị trí. **Đây là chữ ký mạnh nhất.**
2. **Hex grid** (`.mc-hex`): kết hợp 4 layer — 2 radial-gradient nhỏ + 2 linear-gradient 60°/-60° để tạo lưới tổ ong, cam alpha 5–8%.
3. **Rivet 4 góc:** mọi card, button đậm, plate đều có.
4. **Hard shadow press button:** offset 4px-6px, không blur, nền đen — feeling vật lý.
5. **Gauge SVG** ở spotlight card.
6. **Pulse dot** cam ở badge SYS·LOAD.

### Copy / voice direction
- "HEAVY DUTY. MAX OUTPUT.", "DEPLOY UNIT", "ENGAGE", "ORDER", "ENLIST".
- Label: `⬢ MFG_LOG · UNIT 0426`, `SN/0426-09A`, `CL/SUPER-HEAVY`, `PWR/1.2KW · 24V`.
- Stat unit nặng: `kW`, `GHz`, `°C`, `RPM`, `2400RPM`.
- Tone: kỹ sư, công nghiệp, không pha cảm xúc. Khác Tactical (trinh sát) — đây là **xưởng cơ khí**.

### Use case
Phù hợp cho cửa hàng định vị mảng PC build tự lắp, custom cooling, modding, fan của Gundam/Mecha/Titanfall, hoặc khách thích vibe "máy móc thật" thay vì "RGB lung linh".

---

## 6. ARCADE PIXEL

> "Press start to play!" — 8-bit NES retro, theme duy nhất **fun/cute** trong cả 7 theme. Hợp khi muốn approachable, không hardcore.

### Palette (NES pop)
| Vai trò | Hex | Ghi chú |
|---|---|---|
| Background base | `#fef3c7` (amber-100) | nền bánh mì kem — KHÔNG phải đen như các theme khác |
| Section tints | red-400 / cyan-400 / yellow-300 / lime-300 / pink-300 / purple-400 / blue-300 | mỗi section đổi màu mạnh |
| Border / outline | `#000000` | viền 4px đen luôn luôn |
| Accent đỏ | `#ef4444` (red-500) | primary action |
| Accent vàng | `#fde047` (yellow-300) | secondary, top bar |
| Accent cyan | `#22d3ee` (cyan-400) | header |

### Typography
- **Toàn trang dùng MONO** với `font-weight: 900` để giả pixel font (khi không có Press Start 2P thật).
- `letter-spacing: 0.05em` đến `0.1em`.
- **Effect chữ "8-way text shadow":** 8 hướng shadow đen 3px tạo viền chữ pixel chunky:
  ```css
  text-shadow:
    3px 0 0 #000, -3px 0 0 #000,
    0 3px 0 #000, 0 -3px 0 #000,
    3px 3px 0 #000, -3px -3px 0 #000,
    3px -3px 0 #000, -3px 3px 0 #000,
    6px 6px 0 rgba(0,0,0,0.3);  /* drop shadow lớn */
  ```
- Variant: shadow drop màu đỏ thay vì đen → "ar-text-shadow-red".

### Layout
- Top bar **vàng** chữ đen, sao đỏ ★ — thay vì đen như các theme khác.
- Header **cyan** + logo block đỏ ◢◤ + nav có prefix `1P/2P/3P/4P` + indicator "❤❤❤❤❤" (5 trái tim hp).
- Hero **hồng** với checker pattern + scanline. Title 2 dòng "PRESS START / TO PLAY!" với chữ trắng và vàng (8-way shadow). 3 stat tile (HI·SCORE / STAGE / LIVES). Card spotlight: aspect-square + label ★ BOSS + bar HP `████████░░`.
- Categories **lime** với 6 ô đa sắc (mỗi ô màu khác hẳn nhau).
- Products **xanh dương** với grid 6 thẻ trắng.
- Manifesto **tím** với headline pixel + 3 tile trắng.
- Footer **đen** + viền vàng.

### Component patterns
- **Mọi element đều có border 3-4px đen + box-shadow offset 3-8px đen** (NES "press effect"). Hover: `translate(-2px,-2px)` + shadow tăng. Active: `translate(2px,2px)` + shadow 0px.
- **Button primary:** nền đỏ, border-3 đen, shadow 4×4 đen.
- **Button secondary:** nền vàng, cùng style.
- **Button icon:** ô vuông trắng + viền đen + shadow.
- **Tile/badge:** vuông + viền đen + shadow.
- **Input:** viền 4px vàng + shadow vàng → focus đổi sang đỏ.

### Effect signature
1. **Checker pattern** (`.ar-checker`): 4 lớp linear-gradient 45°/-45° đen, size `12px 12px`, stagger position → ô vuông xen kẽ. Dùng làm overlay opacity 15-25%.
2. **Scanline:** repeating đen 25% mỗi 4px.
3. **Hard shadow press effect:** mọi clickable element. Cảm giác chunky vật lý.
4. **Bar HP/score:** dùng ký tự khối `████████░░` cho HP bar, score giả `99,999`.
5. **8-way text shadow:** title nào lớn cũng có chunky outline.

### Copy / voice direction
- Toàn UI là metaphor game cổ: "PRESS START", "INSERT COIN", "1P/2P", "STAGE 06", "BONUS LIFE", "GAME OVER?", "HI-SCORE", "LIVES: ∞", "★ BOSS", "▶ FIGHT", "▶ BUY", "QUEST", "GUILD", "WORLDS", "POWER-UPS!".
- Vẫn pha tiếng Việt: "Cửa hàng đồ gaming 8-bit. Linh kiện thật, vibe hoài niệm."
- Tone: vui, tươi, friendly, hơi ngớ ngẩn dễ thương — xa nhất với 6 theme còn lại.

### Use case
Phù hợp khi target người chơi casual, fan Nintendo / arcade, người chơi indie, hoặc khi muốn phá định kiến "shop gaming = tối tăm RGB". Cũng tốt cho dịp lễ / event đặc biệt.

---

## 7. STEALTH LUXE

> "Rare. Refined. Reliable." — Vibe luxury watch boutique / Razer Edge / B&O / Bang & Olufsen. Theme duy nhất **premium minimalist**, không hiệu ứng.

### Palette
| Vai trò | Hex | Ghi chú |
|---|---|---|
| Background base | `#000000` | đen tuyệt đối |
| Surface | `#0a0a0a` | đen đậm cho section thứ 2 |
| Border | `rgba(255,255,255,0.08)` | rất mảnh, gần như vô hình |
| Accent **duy nhất** | `#cba76b` | champagne gold — không bao giờ dùng màu khác |
| Text chính | `#ffffff` | |
| Text dim | `rgba(255,255,255,0.60)` | |
| Text very dim | `rgba(255,255,255,0.40)` | footnote |

### Typography
- **Headline:** Fraunces (serif) `font-style: italic` ưu tiên, scale rất lớn (88–112px hero), `letter-spacing: -0.02em`. Mix `font-weight: 900` và `font-thin` trong cùng heading để tạo đối lập (vd: "Rare. **Refined.** *Reliable.*" — refined đậm, reliable thin italic).
- **Mono label:** ui-monospace, `tracking-[0.42em]` rộng nhất trong tất cả theme. Dùng cho ALL caps section markers.
- **Body:** serif Fraunces 15-18px, line-height 1.7, **không in nghiêng cho copy dài** (chỉ headline mới italic).

### Layout
- **Whitespace cực rộng** — padding section `py-24` đến `py-32`, padding hero ngang lưới hơi hẹp.
- Header có 5 nav link uppercase mono tracking 0.32em, gap-7 (xa nhau).
- Hero có editorial header riêng: `Volume XII · Spring · 2026 · № 06` ở dải trên cùng.
- Title 3 dòng: "Rare. / Refined. (gold) / *Reliable.* (thin italic)".
- Stat dùng chữ serif lớn mảnh: "12 Collections / 320 Curated pieces / 24mo Lifetime concierge".
- Card spotlight có `figcaption` ở dưới: "Photographed in atelier · Saigon · Plate I" — thật sự magazine layout.
- Categories: 3 cột (KHÔNG phải 6 ô như các theme khác), mỗi cell aspect 4/5, label `№ 01/02/03...`.
- Products: 3 cột grid, không có spotlight to. Mỗi card: ảnh + tên serif italic + spec serif italic + giá vàng + link `Inquire →`.
- Manifesto: "Restraint is the **finest feature**." (serif italic 88-108px), 3 cột "I/II/III" La Mã + chữ thin italic.
- Footer: "A correspondence, *unhurried.*" + form newsletter chỉ là 1 line border-bottom mảnh + logo `Gatecat.` (serif italic 100px) + dấu "© MMXXVI" La Mã.

### Component patterns
- **Button gold:** transparent + border-1 gold + chữ gold, hover đảo thành nền gold chữ đen. Không có shadow, không có clip-path.
- **Link arrow:** `border-bottom: 1px solid currentColor` + padding-bottom 4px → hover padding-bottom 6px (link đẩy nhẹ xuống). Style của Apple/luxury.
- **Card:** **không có border, không có shadow, không có background**. Chỉ có ảnh + text dưới. Phân tách bằng border-t 1px white/10.
- **Badge giảm giá:** border 1px gold + bg đen 40% + chữ gold mono → giảm tải accent.
- **Input:** chỉ có border-bottom 1px white/15, focus đổi gold. Không có background, không có border 4 cạnh.

### Effect signature
1. **Grain texture** (`.st-grain`): 2 layer radial-gradient pixel rất nhỏ (1px/4px) — film grain ấm áp. Opacity 30-50%, dùng làm overlay.
2. **Glow blob champagne:** rất mờ (blur 180px), opacity 6-8%, gold rất nhẹ.
3. **Underline progressive** ở nav link: scaleX(0) → scaleX(1) khi hover, transition 350ms cubic-bezier(0.16,1,0.3,1).
4. **Image hover scale:** chỉ 1.03 (rất nhẹ), duration 700ms.
5. **KHÔNG có:** clip-path, hard shadow, glitch, scanline, gradient màu, hex pattern. Hoàn toàn dựa vào typography + whitespace.

### Copy / voice direction
- "Rare. Refined. Reliable.", "View collection", "Bespoke consultation", "Concierge", "Inquire →" (không dùng "Mua ngay").
- Label: `◇ I — A note from the house`, `◇ II — The collections`, `◇ III — The signatures`, `◇ IV — Maison philosophy`.
- Edition: `№ 0426 / 1000` (giới hạn), `Plate I`, `Volume XII · MMXXVI`.
- Pháp ngữ: "Maison de tech · Saigon · est. 2026", "Tous droits réservés".
- Tone: kiệm lời, refined, hơi xa cách, gọi khách bằng "discerning operator". KHÔNG dùng từ esports/gaming/RGB.

### Use case
Phù hợp khi cửa hàng định vị **premium build PC**, custom cooling cao cấp, peripherals giới hạn (Razer Edge, MS Surface, Mac Studio), hoặc khi muốn thương hiệu cảm giác như Bang & Olufsen / Bowers & Wilkins / Loro Piana — không trẻ trâu, không RGB. Khách target: senior dev, CEO, người chơi sưu tầm.

---

## So sánh nhanh

| Theme | Nền | Hue chính | Phụ | Mood | Target |
|---|---|---|---|---|---|
| Cyberpunk | Tuyệt đối đen | Magenta | Cyan | Hacker, futuristic | Gen Z FPS/MMO |
| Esports | Đen than | Đỏ máu | Vàng điện | Aggressive, win | Pro/competitive |
| Synthwave | Tím đêm | Hồng neon | Cyan + Vàng | Hoài niệm, có hồn | RPG, sưu tầm RGB |
| Tactical | Olive đêm | Hổ phách | Olive nhạt | Lạnh, kỹ thuật | Builder, mil-sim |
| **Mecha** | **Zinc đen** | **Cam an toàn** | **Vàng cảnh báo** | **Cơ khí nặng, vật lý** | **PC build, modder** |
| **Arcade** | **Vàng kem** | **Đỏ NES** | **Cyan + vàng + lime** | **Vui, hoài niệm 8-bit** | **Casual, Nintendo fan** |
| **Stealth** | **Đen tuyệt đối** | **Champagne gold** | **(không có)** | **Luxury, kiệm lời** | **Premium, sưu tầm** |

## Component nào dùng chung được giữa 4 theme

Tất cả theme đều xài cùng cấu trúc 7 section:
1. **Marquee top bar** (text chạy ngang khẳng định cam kết)
2. **Sticky header** (logo + nav + search + cart + login)
3. **Hero** (title + tagline + 2 CTA + stat row + visual card)
4. **Featured categories** (6 ô grid)
5. **Featured products** (1 spotlight + 6 cards, hoặc 6 cards 3 cột với theme tactical)
6. **Manifesto / about** (tiêu đề lớn + 3 rule)
7. **Footer** (subscribe + 3 cột link + logo khổng lồ)

→ Nghĩa là khi đã chọn 1 theme và muốn áp dụng cho các trang khác (cart, checkout, account, admin), chỉ cần map thành phần (button, card, badge, table, form input) sang ngôn ngữ thị giác của theme đó.

## Mock data dùng chung

Đặt trong `app/style/_data/mock.ts`:
- 8 sản phẩm với category, tag, giá, gradient màu giả thay ảnh
- 6 danh mục
- Hàm `formatVnd()`
- Mảng `marqueeItems` (6 cam kết)

→ Đây là pattern nên tách khi build thật: keep mock data riêng để dễ test UI mà không cần DB.
