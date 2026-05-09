import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pháp lý | Gatecat Shop",
  description:
    "Điều khoản sử dụng và chính sách bảo mật của Gatecat Shop.",
};

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl backdrop-blur-sm sm:p-12">

        {/* ── Header ── */}
        <h1 className="mb-2 text-[32px] font-bold tracking-tight text-zinc-100 sm:text-[40px]">
          Pháp lý{" "}
          <span className="text-orange-500">Gatecat Shop</span>
        </h1>
        <p className="mb-10 text-[13px] text-zinc-500">
          Cập nhật lần cuối:{" "}
          <span className="text-orange-400">10 tháng 5 năm 2026</span>
        </p>

        {/* ── Nav: two tabs ── */}
        <div className="mb-10 flex gap-1">
          <a
            href="#terms"
            className="mc-tab-active mc-tab px-5 py-2"
          >
            Điều khoản
          </a>
          <a
            href="#privacy"
            className="mc-tab px-5 py-2"
          >
            Chính sách bảo mật
          </a>
        </div>

        <div className="space-y-12 text-zinc-400">

          {/* ══════════════════════════════════
              PART 1 — ĐIỀU KHOẢN
          ══════════════════════════════════ */}
          <span id="terms" className="sr-only">Điều khoản sử dụng</span>

          <div className="space-y-10">

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                1. Giới thiệu
              </h2>
              <p className="text-[15px] leading-relaxed">
                Chào mừng bạn đến với Gatecat Shop. Khi truy cập và sử dụng trang web{" "}
                <span className="text-orange-400">shop.gatecat.net</span> (sau đây gọi
                là &quot;Website&quot;), bạn đồng ý tuân thủ các điều khoản và điều kiện
                được nêu trong tài liệu này. Nếu bạn không đồng ý với bất kỳ phần nào,
                vui lòng không sử dụng Website.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                2. Tài khoản người dùng
              </h2>
              <ul className="list-inside list-disc space-y-2 text-[15px] leading-relaxed">
                <li>
                  Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu đăng
                  nhập của mình.
                </li>
                <li>
                  Bạn đồng ý thông báo ngay cho chúng tôi qua kênh hỗ trợ nếu phát
                  hiện bất kỳ việc sử dụng trái phép nào.
                </li>
                <li>
                  Chúng tôi có quyền đình chỉ hoặc chấm dứt tài khoản nếu phát hiện
                  hành vi vi phạm điều khoản hoặc pháp luật hiện hành.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                3. Sản phẩm và giá cả
              </h2>
              <ul className="list-inside list-disc space-y-2 text-[15px] leading-relaxed">
                <li>
                  Tất cả sản phẩm được hiển thị trên Website đều có sẵn hoặc theo hình
                  thức đặt trước (pre-order). Thời gian giao hàng cho sản phẩm
                  pre-order có thể lâu hơn bình thường và sẽ được thông báo cụ thể tại
                  trang sản phẩm.
                </li>
                <li>
                  Giá sản phẩm được niêm yết bằng đồng Việt Nam (₫) và đã bao gồm
                  thuế giá trị gia tăng (VAT) theo quy định.
                </li>
                <li>
                  Chúng tôi cam kết cung cấp sản phẩm chính hãng 100%. Hình ảnh và mô
                  tả sản phẩm chỉ mang tính chất tham khảo; màu sắc, kích thước thực tế
                  có thể có sai lệch nhỏ so với hình ảnh hiển thị.
                </li>
                <li>
                  Chúng tôi bảo lưu quyền thay đổi giá sản phẩm mà không cần thông
                  báo trước. Đơn hàng đã đặt sẽ giữ nguyên giá tại thời điểm đặt.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                4. Đặt hàng và thanh toán
              </h2>
              <ul className="list-inside list-disc space-y-2 text-[15px] leading-relaxed">
                <li>
                  Khi bạn hoàn tất đặt hàng và thanh toán thành công, hợp đồng mua
                  bán giữa bạn và Gatecat Shop được xem là đã giao kết.
                </li>
                <li>
                  Hiện tại, chúng tôi hỗ trợ thanh toán qua phương thức{" "}
                  <span className="text-orange-400">COD (Thanh toán khi nhận hàng)</span>.
                  Chúng tôi có thể mở rộng các phương thức thanh toán khác trong tương lai.
                </li>
                <li>
                  Voucher giảm giá chỉ có giá trị khi được nhập đúng mã và trong thời
                  gian hiệu lực. Mỗi voucher có thể bị giới hạn số lần sử dụng và
                  điều kiện áp dụng riêng.
                </li>
                <li>
                  Chúng tôi có quyền từ chối hoặc hủy đơn hàng nếu có nghi ngờ về
                  tính hợp lệ hoặc bất kỳ dấu hiệu gian lận nào.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                5. Vận chuyển và giao hàng
              </h2>
              <ul className="list-inside list-disc space-y-2 text-[15px] leading-relaxed">
                <li>
                  Chúng tôi giao hàng trên toàn quốc. Phí vận chuyển và thời gian giao
                  hàng sẽ được thông báo cụ thể tại bước checkout.
                </li>
                <li>
                  Đơn hàng nội thành được ưu tiên xử lý nhanh; đơn hàng các tỉnh
                  thành khác phụ thuộc vào khu vực và đơn vị vận chuyển.
                </li>
                <li>
                  Khi nhận hàng, bạn vui lòng kiểm tra tình trạng bên ngoài và số
                  lượng sản phẩm. Mọi khiếu nại về sai sót cần được thông báo trong
                  vòng 24 giờ kể từ khi nhận hàng.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                6. Đổi trả và bảo hành
              </h2>
              <ul className="list-inside list-disc space-y-2 text-[15px] leading-relaxed">
                <li>
                  Sản phẩm được đổi trả miễn phí trong vòng{" "}
                  <span className="text-orange-400">7 ngày</span> kể từ ngày nhận
                  hàng, theo các điều kiện: sản phẩm còn nguyên vẹn, chưa qua sử
                  dụng, đầy đủ phụ kiện và bao bì gốc.
                </li>
                <li>
                  Bảo hành sản phẩm theo chính sách bảo hành của nhà sản xuất. Thời
                  gian bảo hành được ghi rõ trong thông tin sản phẩm hoặc phiếu bảo
                  hành đi kèm.
                </li>
                <li>
                  Sản phẩm trả góp được hỗ trợ bảo hành theo quy định của nhà sản xuất;
                  điều khoản trả góp do đối tác tài chính quy định riêng.
                </li>
                <li>
                  Các trường hợp không được đổi trả: sản phẩm đã qua sử dụng, sản
                  phẩm được mua trong chương trình khuyến mãi đặc biệt có ghi chú
                  &quot;không áp dụng đổi trả&quot;, sản phẩm custom/lắp ráp theo yêu
                  cầu riêng.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                7. Quyền sở hữu trí tuệ
              </h2>
              <p className="text-[15px] leading-relaxed">
                Toàn bộ nội dung trên Website, bao gồm nhưng không giới hạn ở: văn bản,
                hình ảnh, logo, thiết kế, mã nguồn, đều thuộc quyền sở hữu của{" "}
                <span className="text-orange-400">Gatecat Shop</span> hoặc các bên
                cấp phép hợp lệ. Nghiêm cấm sao chép, phân phối, sửa đổi hoặc sử
                dụng cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                8. Giới hạn trách nhiệm
              </h2>
              <p className="text-[15px] leading-relaxed">
                Gatecat Shop không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp,
                đặc biệt, ngẫu nhiên hoặc do hậu quả phạm vi nào phát sinh từ việc sử
                dụng hoặc không thể sử dụng Website hoặc sản phẩm, trừ khi được quy
                định rõ ràng trong pháp luật hiện hành.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                9. Sửa đổi điều khoản
              </h2>
              <p className="text-[15px] leading-relaxed">
                Chúng tôi có quyền cập nhật, thay đổi hoặc bổ sung các điều khoản
                này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng
                tải trên Website. Việc bạn tiếp tục sử dụng Website sau khi thay đổi
                đồng nghĩa với việc chấp nhận các điều khoản mới.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                10. Luật áp dụng và giải quyết tranh chấp
              </h2>
              <p className="text-[15px] leading-relaxed">
                Các điều khoản này được điều chỉnh theo pháp luật Việt Nam. Mọi tranh
                chấp phát sinh sẽ được giải quyết trước tiên bằng thương lượng, hòa
                giải. Nếu không đạt được thỏa thuận, tranh chấp sẽ được đưa ra Tòa
                án nhân dân có thẩm quyền tại Việt Nam.
              </p>
            </section>

          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <p className="text-[12px] text-zinc-600">Chính sách bảo mật</p>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* ══════════════════════════════════
              PART 2 — CHÍNH SÁCH BẢO MẬT
          ══════════════════════════════════ */}
          <span id="privacy" className="sr-only">Chính sách bảo mật</span>

          <div className="space-y-10">

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                1. Mục đích thu thập dữ liệu
              </h2>
              <p className="text-[15px] leading-relaxed">
                Gatecat Shop (&quot;chúng tôi&quot;) cam kết bảo vệ quyền riêng tư của bạn.
                Chúng tôi thu thập và sử dụng thông tin cá nhân với các mục đích sau:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-2 text-[15px] leading-relaxed">
                <li>Xử lý đơn hàng, giao hàng và hỗ trợ khách hàng.</li>
                <li>Xác thực tài khoản đăng nhập qua Google hoặc email OTP.</li>
                <li>
                  Gửi thông báo về đơn hàng, cập nhật trạng thái vận chuyển và các
                  thông tin liên quan đến tài khoản của bạn.
                </li>
                <li>
                  Cải thiện trải nghiệm người dùng và nội dung Website.
                </li>
                <li>
                  Tuân thủ các nghĩa vụ pháp lý theo quy định của pháp luật Việt Nam.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                2. Dữ liệu chúng tôi thu thập
              </h2>
              <ul className="list-inside list-disc space-y-2 text-[15px] leading-relaxed">
                <li>
                  <span className="text-orange-400">Thông tin tài khoản:</span> Họ tên,
                  địa chỉ email, ảnh đại diện (khi đăng nhập qua Google).
                </li>
                <li>
                  <span className="text-orange-400">Thông tin giao hàng:</span> Tên
                  người nhận, số điện thoại, địa chỉ giao hàng (tỉnh, quận/huyện,
                  phường/xã, địa chỉ chi tiết), ghi chú giao hàng.
                </li>
                <li>
                  <span className="text-orange-400">Thông tin đơn hàng:</span> Danh
                  sách sản phẩm, phương thức thanh toán, tổng giá trị, mã voucher sử
                  dụng.
                </li>
                <li>
                  <span className="text-orange-400">Dữ liệu duyệt web:</span> Địa chỉ
                  IP, loại trình duyệt, thời gian truy cập. Dữ liệu này được thu thập
                  tự động thông qua cookie và các công nghệ tương tự để phục vụ mục
                  đích phân tích và vận hành Website.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                3. Cách chúng tôi sử dụng dữ liệu
              </h2>
              <ul className="list-inside list-disc space-y-2 text-[15px] leading-relaxed">
                <li>
                  Dữ liệu được lưu trữ trên máy chủ bảo mật và chỉ được truy cập bởi
                  nhân viên được ủy quyền của Gatecat Shop.
                </li>
                <li>
                  Chúng tôi <strong className="text-zinc-200">không bán, cho thuê
                  </strong> hoặc chuyển giao thông tin cá nhân của bạn cho bên thứ ba
                  vì mục đích tiếp thị.
                </li>
                <li>
                  Dữ liệu có thể được chia sẻ với đối tác vận chuyển để thực hiện
                  giao hàng và với cơ quan nhà nước khi có yêu cầu theo quy định pháp
                  luật.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                4. Bảo mật dữ liệu
              </h2>
              <ul className="list-inside list-disc space-y-2 text-[15px] leading-relaxed">
                <li>
                  Dữ liệu được bảo vệ bằng các biện pháp bảo mật kỹ thuật phù hợp,
                  bao gồm mã hóa khi truyền tải (TLS) và kiểm soát quyền truy cập.
                </li>
                <li>
                  Mật khẩu tài khoản được hash — chúng tôi không lưu mật khẩu dạng
                  plain text.
                </li>
                <li>
                  Thông tin thanh toán COD (tiền mặt khi nhận hàng) không được xử lý
                  qua Website; bạn thanh toán trực tiếp cho đơn vị vận chuyển khi
                  nhận hàng.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                5. Cookie
              </h2>
              <p className="text-[15px] leading-relaxed">
                Website sử dụng cookie để duy trì phiên đăng nhập và cải thiện trải
                nghiệm duyệt web. Bạn có thể tắt cookie trong cài đặt trình duyệt;
                tuy nhiên, một số tính năng của Website có thể không hoạt động đúng
                khi cookie bị vô hiệu hóa.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                6. Quyền của bạn
              </h2>
              <p className="text-[15px] leading-relaxed">
                Theo quy định của pháp luật Việt Nam (Luật An ninh mạng 2015, Nghị
                định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân), bạn có quyền:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-2 text-[15px] leading-relaxed">
                <li>Yêu cầu truy cập và xem thông tin cá nhân của mình.</li>
                <li>Yêu cầu chỉnh sửa, cập nhật thông tin không chính xác.</li>
                <li>Yêu cầu xóa tài khoản và dữ liệu liên quan.</li>
                <li>
                  Phản đối hoặc yêu cầu hạn chế việc xử lý dữ liệu trong các trường
                  hợp nhất định.
                </li>
              </ul>
              <p className="mt-3 text-[15px] leading-relaxed">
                Để thực hiện các quyền trên, vui lòng liên hệ:{" "}
                <a
                  href="mailto:support@gatecat.net"
                  className="text-orange-400 underline underline-offset-2 hover:text-orange-300"
                >
                  support@gatecat.net
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                7. Lưu trữ dữ liệu
              </h2>
              <p className="text-[15px] leading-relaxed">
                Chúng tôi lưu trữ thông tin cá nhân của bạn trong thời gian cần thiết
                để thực hiện các mục đích thu thập hoặc theo yêu cầu của pháp luật.
                Dữ liệu đơn hàng được lưu trữ tối thiểu theo quy định kế toán và thuế
                hiện hành.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-[18px] font-semibold text-zinc-200">
                8. Liên hệ
              </h2>
              <div className="rounded-xl bg-zinc-950 p-5 ring-1 ring-zinc-800">
                <p className="text-[15px] font-semibold text-orange-400">
                  Gatecat Shop
                </p>
                <p className="mt-2 text-[14px] text-zinc-400">
                  Email:{" "}
                  <a
                    href="mailto:support@gatecat.net"
                    className="text-orange-400 underline underline-offset-2 hover:text-orange-300"
                  >
                    support@gatecat.net
                  </a>
                </p>
                <p className="mt-1 text-[14px] text-zinc-400">
                  Website:{" "}
                  <a
                    href="https://shop.gatecat.net"
                    className="text-orange-400 underline underline-offset-2 hover:text-orange-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    shop.gatecat.net
                  </a>
                </p>
              </div>
            </section>

          </div>

        </div>
      </div>
    </div>
  );
}
