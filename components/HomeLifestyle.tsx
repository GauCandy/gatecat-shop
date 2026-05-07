import { HOME_ASSETS } from "@/lib/home-assets";

const scenes = [
  {
    label: "Gaming",
    imageUrl: HOME_ASSETS.lifestyleGamer,
    className: "col-span-6 h-[240px] sm:h-[320px] lg:col-span-4 lg:h-[420px]",
  },
  {
    label: "Creator",
    imageUrl: HOME_ASSETS.lifestyleCreator,
    className: "col-span-3 h-[170px] sm:h-[220px] lg:col-span-2 lg:h-[204px]",
  },
  {
    label: "Dev",
    imageUrl: HOME_ASSETS.lifestyleDev,
    className: "col-span-3 h-[170px] sm:h-[220px] lg:col-span-2 lg:h-[204px]",
  },
];

const points = [
  "Cấu hình được chọn theo nhu cầu thật",
  "Ảnh và thông tin sản phẩm rõ ràng",
  "Bảo hành, đổi trả, hậu mãi minh bạch",
];

export function HomeLifestyle() {
  return (
    <section className="bg-[var(--color-paper)] text-[var(--color-ink)]">
      <div className="mx-auto grid w-full gap-8 px-4 py-12 sm:px-6 lg:w-2/3 lg:grid-cols-12 lg:px-0 lg:py-16">
        <div className="flex flex-col justify-center lg:col-span-5">
          <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-[var(--color-cobalt)]">
            Gatecat standard
          </p>
          <h2 className="mt-3 max-w-md text-[28px] font-semibold leading-tight sm:text-[36px]">
            Vì sao chọn Gatecat?
          </h2>
          <p className="mt-4 max-w-md text-[14px] leading-7 text-[var(--color-ink)]/68">
            Một cửa hàng công nghệ nên giúp bạn thấy rõ món đồ mình sắp mua:
            đúng cấu hình, đúng bối cảnh sử dụng, và không bị nhiễu bởi ảnh
            minh họa lệch tông.
          </p>

          <ul className="mt-7 grid gap-3">
            {points.map((point) => (
              <li
                key={point}
                className="flex items-center gap-3 text-[13px] font-medium text-[var(--color-ink)]/78"
              >
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-cobalt)]"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-6 gap-3 lg:col-span-7">
          {scenes.map((scene) => (
            <div
              key={scene.label}
              aria-label={scene.label}
              className={`relative overflow-hidden rounded-[8px] bg-[var(--color-ink)] ${scene.className}`}
              role="img"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(10,10,12,0.04), rgba(10,10,12,0.36)), url(${scene.imageUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
