import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giới thiệu | Gatecat Shop",
  description: "Về Gatecat Shop - Cửa hàng PC Custom và thiết bị Gaming cao cấp.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl backdrop-blur-sm sm:p-12">
        <h1 className="mb-6 text-[32px] font-bold tracking-tight text-zinc-100 sm:text-[40px]">
          Về <span className="text-orange-500">Gatecat Shop</span>
        </h1>
        
        <div className="prose prose-invert max-w-none text-zinc-400">
          <p className="text-[16px] leading-relaxed">
            Chào mừng bạn đến với Gatecat Shop – điểm đến hàng đầu dành cho những tín đồ công nghệ, game thủ và những nhà sáng tạo nội dung đang tìm kiếm các sản phẩm PC Custom và thiết bị phần cứng cao cấp.
          </p>
          
          <h2 className="mt-8 text-[20px] font-semibold text-zinc-200">Sứ mệnh của chúng tôi</h2>
          <p className="mt-4 text-[16px] leading-relaxed">
            Tại Gatecat, chúng tôi không chỉ bán phần cứng. Chúng tôi mang đến những giải pháp sức mạnh tối thượng với thiết kế "mecha-industrial" độc quyền. Từng linh kiện, từng bộ máy được lắp ráp và tinh chỉnh với độ hoàn thiện cao nhất để đáp ứng nhu cầu khắt khe nhất của bạn.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl bg-zinc-950 p-6 ring-1 ring-zinc-800">
              <h3 className="text-[15px] font-bold text-orange-400">Chất lượng cao cấp</h3>
              <p className="mt-2 text-[14px] text-zinc-500">Linh kiện được tuyển chọn kỹ lưỡng từ các thương hiệu hàng đầu thế giới.</p>
            </div>
            <div className="rounded-xl bg-zinc-950 p-6 ring-1 ring-zinc-800">
              <h3 className="text-[15px] font-bold text-orange-400">Thiết kế độc quyền</h3>
              <p className="mt-2 text-[14px] text-zinc-500">Phong cách Mecha-Industrial mạnh mẽ, góc cạnh và khác biệt.</p>
            </div>
            <div className="rounded-xl bg-zinc-950 p-6 ring-1 ring-zinc-800">
              <h3 className="text-[15px] font-bold text-orange-400">Hỗ trợ tận tâm</h3>
              <p className="mt-2 text-[14px] text-zinc-500">Bảo hành chuyên nghiệp, tư vấn cấu hình chính xác theo nhu cầu.</p>
            </div>
          </div>

          <div className="mt-12 rounded-xl bg-orange-500/10 p-6 text-center ring-1 ring-orange-500/20">
            <p className="text-[15px] font-medium text-orange-300">
              "Trải nghiệm sức mạnh thực sự - Khơi nguồn cảm hứng vô tận."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
