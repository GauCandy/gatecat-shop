import pg from "pg";

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9.+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

function collectMatches(name, regex) {
  return Array.from(name.matchAll(regex), (match) =>
    match[0].replace(/\s+/g, " ").trim()
  );
}

function parseSpecs(name) {
  const specs = [
    ...collectMatches(
      name,
      /\b(?:GeForce\s+RTX\s*\d{4}(?:\s*Super)?|RTX\s*\d{4}(?:\s*Super)?|RX\s*\d{4}\s*XT)\b/gi
    ),
    ...collectMatches(
      name,
      /\b(?:Ryzen(?:\s+AI)?\s+\d+(?:\s+\d+[A-Za-z0-9-]*)?|Core\s+Ultra\s+\d+(?:\s+\d+[A-Za-z]*)?|Core\s+i[3579](?:\s+\d+[A-Za-z]*)?|i[3579](?:\s+\d+[A-Za-z]*|\s+\d+th\s+Gen)?|i[3579])\b/gi
    ),
    ...collectMatches(name, /\bM4\b/g),
    ...collectMatches(name, /\b\d+GB\b/gi),
    ...collectMatches(name, /\b\d+TB\b/gi),
    ...collectMatches(name, /\b\d+(?:\.\d+)?\s*inch\b/gi),
    ...collectMatches(name, /\b\d+Hz\b/gi),
    ...collectMatches(name, /\b(?:QHD|FHD|4K|2K|IPS|VA|OLED|HDR|USB-C|USB 3\.2|WiFi|Bluetooth|ANC|ARGB|NVMe|SATA|DDR5|DDR4|7200rpm|100W|240mm|120mm)\b/gi),
    ...collectMatches(name, /\b\d+-in-\d+\b/gi),
    ...collectMatches(name, /\b2\.1ch\b/gi),
  ];

  return unique(specs).slice(0, 4);
}

function joinItems(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} và ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} và ${items.at(-1)}`;
}

function categoryKey(product) {
  const categories = (product.categories ?? "")
    .split(",")
    .map((part) => normalizeText(part))
    .filter(Boolean);
  const categorySet = new Set(categories);
  const name = normalizeText(product.name);

  const priority = [
    ["laptop gaming", "laptop-gaming"],
    ["laptop do hoa", "laptop-creative"],
    ["laptop mong nhe", "laptop-thin"],
    ["laptop van phong", "laptop-office"],
    ["macbook", "macbook"],
    ["pc gaming", "pc-gaming"],
    ["pc do hoa", "pc-workstation"],
    ["pc van phong", "pc-office"],
    ["pc all-in-one", "pc-aio"],
    ["mini pc", "mini-pc"],
    ["man hinh gaming", "monitor-gaming"],
    ["man hinh do hoa", "monitor-creative"],
    ["man hinh 4k", "monitor-4k"],
    ["man hinh cong", "monitor-curved"],
    ["man hinh 32 inch", "monitor-32"],
    ["man hinh 27 inch", "monitor-27"],
    ["man hinh 24 inch", "monitor-24"],
    ["man hinh 22 inch", "monitor-22"],
    ["ban phim co", "keyboard-mech"],
    ["ban phim gaming", "keyboard-gaming"],
    ["ban phim khong day", "keyboard-wireless"],
    ["ban phim van phong", "keyboard-office"],
    ["chuot gaming", "mouse-gaming"],
    ["chuot bluetooth", "mouse-bluetooth"],
    ["chuot khong day", "mouse-wireless"],
    ["chuot van phong", "mouse-office"],
    ["tai nghe gaming", "headset-gaming"],
    ["tai nghe bluetooth", "headset-bluetooth"],
    ["tai nghe tws", "earbuds-tws"],
    ["tai nghe co day", "headset-wired"],
    ["loa soundbar", "speaker-soundbar"],
    ["loa bluetooth", "speaker-bluetooth"],
    ["loa 2.1", "speaker-21"],
    ["tan nhiet cpu", "cooler-cpu"],
    ["tan nhiet", "cooler"],
    ["quat case", "fan-case"],
    ["nguon may tinh", "psu"],
    ["mainboard", "mainboard"],
    ["ssd", "ssd"],
    ["hdd", "hdd"],
    ["o cung di dong", "portable-drive"],
    ["o cung", "storage"],
    ["ram", "ram"],
    ["card do hoa", "gpu"],
    ["cpu", "cpu"],
    ["vo case", "case"],
    ["case may tinh", "case"],
    ["balo laptop", "laptop-backpack"],
    ["hub usb", "usb-hub"],
    ["cap sac", "charging-cable"],
    ["webcam", "webcam"],
    ["microphone", "microphone"],
    ["mousepad", "mousepad"],
    ["tay cam gaming", "controller"],
    ["gia do man hinh", "monitor-arm"],
    ["de tan nhiet laptop", "laptop-cooler"],
    ["ghe gaming", "gaming-chair"],
    ["ban gaming", "gaming-desk"],
  ];

  for (const [alias, key] of priority) {
    if (categorySet.has(alias)) return key;
  }

  if (/\bmacbook\b/.test(name)) return "macbook";
  if (/\bcpu\b/.test(name)) return "cpu";
  if (/\bmonitor\b|\binch\b|\bhz\b|\bqhd\b|\bfhd\b|\b4k\b/.test(name))
    return "monitor";
  if (/\bkeyboard\b|\bswitch\b/.test(name)) return "keyboard";
  if (/\bmouse\b/.test(name)) return "mouse";
  if (/\bheadset\b|\bearbuds\b/.test(name)) return "headset";
  if (/\bspeaker\b|\bsoundbar\b/.test(name)) return "speaker";
  if (/\bwebcam\b/.test(name)) return "webcam";
  if (/\bmicrophone\b/.test(name)) return "microphone";
  if (/\bcontroller\b/.test(name)) return "controller";
  if (/\bdesk\b/.test(name)) return "gaming-desk";
  if (/\bchair\b/.test(name)) return "gaming-chair";
  if (/\bbackpack\b/.test(name)) return "laptop-backpack";
  if (/\bhub\b/.test(name)) return "usb-hub";
  if (/\bcable\b|\b100w\b/.test(name)) return "charging-cable";
  if (/\bssd\b|\bnvme\b/.test(name)) return "ssd";
  if (/\bhdd\b|7200rpm/.test(name)) return "hdd";

  return "general";
}

function buildDescription(product) {
  const name = product.name.trim();
  const specs = parseSpecs(name);
  const specsText = joinItems(specs);
  const primary = categoryKey(product);

  switch (primary) {
    case "laptop-gaming":
      return `${name} là mẫu laptop gaming phù hợp cho người dùng cần hiệu năng mạnh để chơi game, học tập và giải trí mỗi ngày. ${
        specsText
          ? `Các điểm nổi bật như ${specsText} giúp máy đáp ứng tốt game eSports lẫn nhiều tác vụ nặng hơn trong một thiết bị gọn gàng.`
          : "Máy được định hướng cho trải nghiệm ổn định, tản nhiệt tốt và khả năng sử dụng linh hoạt khi di chuyển."
      }`;
    case "laptop-creative":
      return `${name} là laptop đồ hoạ phù hợp cho thiết kế, chỉnh sửa nội dung và đa nhiệm cường độ cao. ${
        specsText
          ? `Thông số ${specsText} hỗ trợ tốt cho các phần mềm sáng tạo, dựng nội dung và làm việc chuyên môn trên thiết bị di động.`
          : "Sản phẩm ưu tiên hiệu năng ổn định, chất lượng hiển thị và khả năng xử lý tốt trong môi trường làm việc sáng tạo."
      }`;
    case "laptop-thin":
      return `${name} là laptop mỏng nhẹ hướng tới người dùng thường xuyên mang máy theo bên mình nhưng vẫn cần hiệu năng đủ tốt cho công việc hằng ngày. ${
        specsText
          ? `Trang bị ${specsText} giúp máy xử lý tốt văn phòng, học tập, họp online và giải trí cơ bản trong thân máy gọn nhẹ.`
          : "Thiết kế của máy tập trung vào tính di động, trải nghiệm sử dụng thoải mái và độ ổn định trong nhiều giờ làm việc."
      }`;
    case "laptop-office":
      return `${name} là laptop văn phòng phù hợp cho học tập, làm việc doanh nghiệp và các tác vụ hằng ngày. ${
        specsText
          ? `Cấu hình ${specsText} đáp ứng tốt nhu cầu Office, trình duyệt, họp trực tuyến và đa nhiệm phổ thông một cách ổn định.`
          : "Sản phẩm được định hướng theo tiêu chí thực dụng, dễ dùng và bền bỉ cho môi trường làm việc thường xuyên."
      }`;
    case "macbook":
      return `${name} là mẫu laptop Apple phù hợp cho người dùng ưu tiên sự gọn gàng, trải nghiệm mượt và hệ sinh thái đồng bộ. ${
        specsText
          ? `Các thông số ${specsText} giúp máy phục vụ tốt công việc văn phòng, sáng tạo nội dung và nhu cầu di chuyển hằng ngày.`
          : "Thiết bị hướng đến trải nghiệm cao cấp, vận hành ổn định và sự tiện lợi khi làm việc lẫn giải trí."
      }`;
    case "pc-gaming":
      return `${name} là bộ PC gaming cấu hình sẵn dành cho nhu cầu chơi game, giải trí và livestream tại nhà. ${
        specsText
          ? `Sự kết hợp của ${specsText} giúp hệ thống xử lý tốt nhiều tựa game phổ biến và vận hành mượt trong các tác vụ đa nhiệm.`
          : "Cấu hình được cân đối để người dùng có thể sử dụng ngay, đồng thời vẫn thuận tiện cho việc nâng cấp về sau."
      }`;
    case "pc-workstation":
      return `${name} là cấu hình PC đồ hoạ/workstation dành cho dựng hình, biên tập video và các tác vụ cần hiệu năng bền bỉ. ${
        specsText
          ? `Trang bị ${specsText} giúp máy xử lý tốt khối lượng công việc nặng, đa nhiệm và phần mềm sáng tạo chuyên nghiệp.`
          : "Sản phẩm phù hợp cho người dùng cần một hệ thống mạnh, ổn định và có khả năng làm việc dài hơi."
      }`;
    case "pc-office":
      return `${name} là bộ PC văn phòng phù hợp cho doanh nghiệp, học tập và các tác vụ phổ thông mỗi ngày. ${
        specsText
          ? `Thông số ${specsText} hỗ trợ tốt cho Office, quản lý dữ liệu, phần mềm nội bộ và làm việc đa nhiệm cơ bản.`
          : "Cấu hình được định hướng theo tiêu chí dễ dùng, ổn định và đáp ứng tốt nhu cầu làm việc thường xuyên."
      }`;
    case "pc-aio":
      return `${name} là mẫu PC All-in-One tích hợp gọn gàng, phù hợp cho văn phòng, quầy dịch vụ hoặc góc làm việc tối giản. ${
        specsText
          ? `Cấu hình ${specsText} đáp ứng tốt nhu cầu học tập, văn phòng và giải trí cơ bản trong một thiết kế đồng bộ.`
          : "Thiết bị giúp tiết kiệm diện tích, hạn chế dây kết nối và giữ không gian làm việc ngăn nắp hơn."
      }`;
    case "mini-pc":
      return `${name} là mini PC/barebone có kích thước nhỏ gọn, phù hợp cho không gian làm việc hạn chế hoặc nhu cầu triển khai linh hoạt. ${
        specsText
          ? `Các thông số ${specsText} mang lại hiệu năng phù hợp cho văn phòng, trình chiếu, kiosk hoặc hệ thống máy phụ trợ.`
          : "Sản phẩm tập trung vào sự gọn nhẹ, tính thực dụng và khả năng bố trí dễ dàng trong nhiều môi trường."
      }`;
    case "monitor-gaming":
      return `${name} là màn hình gaming hướng tới trải nghiệm chuyển động mượt, phản hồi nhanh và hình ảnh rõ nét khi chơi game. ${
        specsText
          ? `Các thông số ${specsText} giúp sản phẩm phù hợp cho game FPS, MOBA và nhiều nội dung giải trí tốc độ cao.`
          : "Màn hình được định hướng cho nhu cầu giải trí, chơi game và sử dụng desktop hằng ngày."
      }`;
    case "monitor-creative":
      return `${name} là màn hình đồ hoạ phù hợp cho thiết kế, chỉnh ảnh và công việc cần độ ổn định hiển thị tốt. ${
        specsText
          ? `Những điểm nổi bật như ${specsText} hỗ trợ tốt cho nhu cầu làm việc với màu sắc, chi tiết và không gian hiển thị rộng.`
          : "Sản phẩm cân bằng giữa độ nét, chất lượng hình ảnh và sự thoải mái khi làm việc trong thời gian dài."
      }`;
    case "monitor-4k":
      return `${name} là màn hình độ phân giải cao phù hợp cho làm việc chi tiết, giải trí chất lượng cao và đa nhiệm nhiều cửa sổ. ${
        specsText
          ? `Thông số ${specsText} giúp sản phẩm mang lại hình ảnh sắc nét và không gian hiển thị rộng rãi hơn trên bàn làm việc.`
          : "Thiết bị hướng đến người dùng ưu tiên độ nét, khả năng quan sát rõ ràng và trải nghiệm xem thoải mái."
      }`;
    case "monitor-curved":
      return `${name} là màn hình cong giúp tăng cảm giác bao quát và tạo trải nghiệm xem nhập vai hơn cho góc máy cá nhân. ${
        specsText
          ? `Các đặc điểm ${specsText} phù hợp cho cả chơi game, giải trí và làm việc trên không gian hiển thị rộng.`
          : "Thiết kế cong mang lại cảm giác liền mạch hơn khi theo dõi nội dung trong thời gian dài."
      }`;
    case "monitor-32":
      return `${name} là màn hình kích thước lớn phù hợp cho giải trí, làm việc đa cửa sổ và mở rộng không gian hiển thị. ${
        specsText
          ? `Những thông số ${specsText} giúp sản phẩm đáp ứng tốt từ văn phòng đến xem phim và chơi game tại bàn.`
          : "Sản phẩm tạo cảm giác quan sát rộng rãi hơn, phù hợp cho người dùng thích khung hình lớn."
      }`;
    case "monitor-27":
      return `${name} là màn hình 27 inch cân bằng tốt giữa diện tích hiển thị, độ nét và sự linh hoạt khi bố trí trên bàn làm việc. ${
        specsText
          ? `Thông số ${specsText} giúp sản phẩm phù hợp cho văn phòng, học tập, giải trí và xử lý hình ảnh cơ bản.`
          : "Đây là kích thước phổ biến cho nhu cầu sử dụng đa dụng trên desktop hoặc ghép cùng laptop."
      }`;
    case "monitor-24":
      return `${name} là màn hình 24 inch gọn gàng, phù hợp cho không gian vừa phải và nhu cầu sử dụng hằng ngày. ${
        specsText
          ? `Trang bị ${specsText} đáp ứng tốt học tập, văn phòng, họp online và giải trí cơ bản.`
          : "Màn hình cân đối giữa kích thước, chi phí và tính thực dụng trong môi trường làm việc phổ thông."
      }`;
    case "monitor-22":
      return `${name} là màn hình nhỏ gọn phù hợp cho bàn làm việc hạn chế diện tích hoặc nhu cầu hiển thị cơ bản. ${
        specsText
          ? `Các thông số ${specsText} hỗ trợ tốt cho văn phòng, học tập và các tác vụ sử dụng thường ngày.`
          : "Sản phẩm thực dụng, dễ bố trí và phù hợp cho hệ thống văn phòng hoặc góc học tập cá nhân."
      }`;
    case "keyboard-mech":
      return `${name} là bàn phím cơ phù hợp cho người dùng thích cảm giác gõ rõ ràng, phản hồi tốt và độ bền cao. ${
        specsText
          ? `Những điểm nhấn như ${specsText} giúp sản phẩm nổi bật hơn cho cả làm việc lẫn giải trí.`
          : "Thiết kế hướng đến trải nghiệm gõ ổn định, tính cá nhân hoá và khả năng sử dụng lâu dài."
      }`;
    case "keyboard-gaming":
      return `${name} là bàn phím gaming được tối ưu cho thao tác nhanh, cảm giác gõ chắc chắn và phong cách góc máy nổi bật. ${
        specsText
          ? `Các đặc điểm ${specsText} giúp sản phẩm phù hợp cho chơi game, gõ văn bản và sử dụng cường độ cao.`
          : "Sản phẩm hướng đến game thủ cần một bộ bàn phím vừa thực dụng vừa đồng bộ với setup hiện có."
      }`;
    case "keyboard-wireless":
      return `${name} là bàn phím không dây phù hợp cho góc làm việc gọn gàng và nhu cầu sử dụng linh hoạt trên nhiều thiết bị. ${
        specsText
          ? `Trang bị ${specsText} hỗ trợ tốt cho công việc văn phòng, học tập và di chuyển hằng ngày.`
          : "Thiết kế chú trọng sự tiện lợi, kết nối sạch dây và cảm giác gõ thoải mái trong thời gian dài."
      }`;
    case "keyboard-office":
      return `${name} là bàn phím văn phòng tập trung vào sự ổn định, dễ làm quen và cảm giác gõ thoải mái mỗi ngày. ${
        specsText
          ? `Những điểm như ${specsText} giúp sản phẩm đáp ứng tốt các tác vụ nhập liệu, học tập và làm việc phổ thông.`
          : "Sản phẩm phù hợp cho bộ máy tính dùng thường xuyên tại văn phòng hoặc tại nhà."
      }`;
    case "mouse-gaming":
      return `${name} là chuột gaming hướng tới thao tác nhanh, độ chính xác cao và cảm giác cầm nắm chắc tay. ${
        specsText
          ? `Các đặc điểm ${specsText} giúp sản phẩm phù hợp cho game cạnh tranh, luyện aim và sử dụng cường độ cao.`
          : "Thiết kế tập trung vào phản hồi ổn định và khả năng điều khiển linh hoạt trong nhiều thể loại game."
      }`;
    case "mouse-bluetooth":
      return `${name} là chuột Bluetooth gọn gàng, phù hợp cho người dùng laptop hoặc môi trường làm việc cần hạn chế dây nối. ${
        specsText
          ? `Các điểm nổi bật như ${specsText} hỗ trợ tốt cho học tập, văn phòng và nhu cầu di chuyển hằng ngày.`
          : "Sản phẩm ưu tiên tính cơ động, kết nối tiện lợi và thao tác êm ái trong nhiều không gian sử dụng."
      }`;
    case "mouse-wireless":
      return `${name} là chuột không dây phù hợp cho góc làm việc gọn gàng và nhu cầu thao tác linh hoạt mỗi ngày. ${
        specsText
          ? `Những thông số ${specsText} giúp sản phẩm hỗ trợ tốt cho công việc văn phòng, sáng tạo và sử dụng đa thiết bị.`
          : "Thiết kế của chuột tập trung vào sự tiện lợi, phản hồi ổn định và cảm giác sử dụng thoải mái."
      }`;
    case "mouse-office":
      return `${name} là chuột văn phòng thực dụng, phù hợp cho học tập, làm việc và sử dụng máy tính hằng ngày. ${
        specsText
          ? `Các điểm như ${specsText} giúp sản phẩm đáp ứng tốt thao tác cơ bản với cảm giác sử dụng ổn định.`
          : "Sản phẩm hướng tới độ bền, sự dễ dùng và khả năng làm việc lâu mà vẫn thoải mái."
      }`;
    case "headset-gaming":
      return `${name} là tai nghe gaming phù hợp cho chơi game, chat voice và giải trí tại bàn máy. ${
        specsText
          ? `Những đặc điểm ${specsText} hỗ trợ tốt cho nhu cầu nghe định vị, giao tiếp đội nhóm và sử dụng lâu dài.`
          : "Sản phẩm hướng đến âm thanh rõ ràng, cảm giác đeo thoải mái và độ ổn định trong quá trình sử dụng."
      }`;
    case "headset-bluetooth":
      return `${name} là tai nghe Bluetooth phù hợp cho nghe nhạc, gọi thoại và sử dụng di động hằng ngày. ${
        specsText
          ? `Các điểm nổi bật như ${specsText} giúp sản phẩm linh hoạt hơn khi làm việc, giải trí và di chuyển.`
          : "Thiết kế chú trọng sự tiện lợi, kết nối nhanh và trải nghiệm không dây gọn gàng."
      }`;
    case "earbuds-tws":
      return `${name} là tai nghe true wireless nhỏ gọn, phù hợp cho di chuyển, nghe nhạc và đàm thoại mỗi ngày. ${
        specsText
          ? `Thông số ${specsText} góp phần nâng cao trải nghiệm không dây và sự tiện lợi khi sử dụng bên ngoài hoặc tại văn phòng.`
          : "Sản phẩm hướng tới tính cơ động, thao tác nhanh và cảm giác đeo gọn tai trong nhiều tình huống."
      }`;
    case "headset-wired":
      return `${name} là tai nghe có dây phù hợp cho nghe nhạc, làm việc và giải trí với kết nối ổn định. ${
        specsText
          ? `Các đặc điểm ${specsText} hỗ trợ tốt cho nhu cầu sử dụng trên PC, laptop hoặc thiết bị tương thích.`
          : "Sản phẩm mang lại giải pháp âm thanh đơn giản, dễ dùng và đáng tin cậy cho nhu cầu hằng ngày."
      }`;
    case "speaker-soundbar":
      return `${name} là loa soundbar phù hợp để nâng cấp âm thanh cho TV, desktop hoặc không gian giải trí gia đình. ${
        specsText
          ? `Các điểm nổi bật như ${specsText} giúp sản phẩm tái tạo âm thanh rõ ràng hơn và thuận tiện trong nhiều kịch bản sử dụng.`
          : "Thiết kế gọn dài, dễ bố trí và phù hợp cho nhu cầu xem phim, nghe nhạc hoặc chơi game."
      }`;
    case "speaker-bluetooth":
      return `${name} là loa Bluetooth di động phù hợp cho nghe nhạc, mang theo khi di chuyển hoặc sử dụng trong không gian cá nhân. ${
        specsText
          ? `Những đặc điểm ${specsText} giúp sản phẩm linh hoạt trong kết nối và thuận tiện cho nhiều nhu cầu giải trí.`
          : "Sản phẩm hướng đến sự cơ động, dễ dùng và phù hợp cho cả môi trường trong nhà lẫn ngoài trời nhẹ."
      }`;
    case "speaker-21":
      return `${name} là bộ loa 2.1 dành cho desktop hoặc góc giải trí cần âm thanh đầy đặn hơn so với loa tích hợp. ${
        specsText
          ? `Các thông số ${specsText} hỗ trợ tốt cho nhu cầu nghe nhạc, xem phim và chơi game trong không gian cá nhân.`
          : "Hệ thống loa tập trung vào âm thanh rõ ràng, dải trầm tốt hơn và khả năng bố trí gọn trên bàn."
      }`;
    case "cooler-cpu":
      return `${name} là tản nhiệt CPU phù hợp cho người dùng muốn giữ nhiệt độ hệ thống ổn định và giảm tiếng ồn khi tải nặng. ${
        specsText
          ? `Các điểm nổi bật như ${specsText} cho thấy sản phẩm phù hợp cho việc nâng cấp dàn PC hiện đại.`
          : "Sản phẩm hướng tới hiệu quả làm mát, độ bền và khả năng vận hành bền bỉ trong thời gian dài."
      }`;
    case "cooler":
      return `${name} là giải pháp tản nhiệt dành cho hệ thống PC cần cải thiện khả năng làm mát và độ ổn định khi vận hành. ${
        specsText
          ? `Thông số ${specsText} giúp sản phẩm phù hợp cho nhiều cấu hình từ phổ thông đến hiệu năng cao.`
          : "Thiết bị tập trung vào hiệu quả giải nhiệt, tính thẩm mỹ và khả năng sử dụng ổn định lâu dài."
      }`;
    case "fan-case":
      return `${name} là quạt case hỗ trợ cải thiện luồng gió bên trong thùng máy và tăng hiệu quả tản nhiệt tổng thể. ${
        specsText
          ? `Các đặc điểm ${specsText} giúp sản phẩm phù hợp cho nhu cầu nâng cấp airflow hoặc hoàn thiện bộ PC.`
          : "Sản phẩm cân bằng giữa hiệu quả làm mát, độ bền và khả năng đồng bộ với hệ thống hiện có."
      }`;
    case "psu":
      return `${name} là bộ nguồn máy tính phù hợp cho cấu hình cần điện năng ổn định và độ tin cậy khi vận hành lâu dài. ${
        specsText
          ? `Những thông tin ${specsText} giúp sản phẩm đáp ứng tốt cho desktop phổ thông đến gaming tùy cấu hình đi kèm.`
          : "Đây là linh kiện quan trọng để đảm bảo hệ thống hoạt động an toàn, ổn định và bền bỉ hơn."
      }`;
    case "mainboard":
      return `${name} là bo mạch chủ dành cho người dùng đang xây dựng hoặc nâng cấp PC với nền tảng hiện đại. ${
        specsText
          ? `Các điểm nổi bật như ${specsText} cho thấy sản phẩm phù hợp cho nhiều cấu hình từ làm việc đến gaming.`
          : "Sản phẩm đóng vai trò kết nối linh kiện, hỗ trợ khả năng mở rộng và giữ sự ổn định cho toàn hệ thống."
      }`;
    case "ssd":
      return `${name} là ổ SSD hiệu năng cao giúp tăng tốc khởi động hệ điều hành, mở ứng dụng và sao chép dữ liệu nhanh hơn. ${
        specsText
          ? `Các thông số ${specsText} cho thấy sản phẩm phù hợp cho cả nâng cấp PC lẫn laptop hiện đại.`
          : "Thiết bị hướng đến tốc độ truy xuất tốt, độ ổn định cao và trải nghiệm sử dụng mượt hơn mỗi ngày."
      }`;
    case "hdd":
      return `${name} là ổ cứng cơ phù hợp cho nhu cầu lưu trữ dung lượng lớn với chi phí hợp lý. ${
        specsText
          ? `Thông số ${specsText} giúp sản phẩm đáp ứng tốt việc lưu dữ liệu, media, game và sao lưu lâu dài.`
          : "Thiết bị thực dụng, dễ triển khai và phù hợp cho hệ thống cần thêm không gian lưu trữ."
      }`;
    case "portable-drive":
      return `${name} là ổ cứng di động phù hợp cho sao lưu, mang dữ liệu theo người và chia sẻ file giữa nhiều thiết bị. ${
        specsText
          ? `Các điểm như ${specsText} giúp sản phẩm thuận tiện cho cả công việc lẫn nhu cầu lưu trữ cá nhân.`
          : "Thiết kế gọn gàng, dễ mang theo và phù hợp cho người dùng cần thêm không gian lưu trữ bên ngoài."
      }`;
    case "storage":
      return `${name} là thiết bị lưu trữ phù hợp cho nâng cấp dung lượng hoặc cải thiện khả năng lưu dữ liệu trên hệ thống. ${
        specsText
          ? `Những thông số ${specsText} giúp sản phẩm đáp ứng tốt nhiều nhu cầu từ văn phòng đến giải trí.`
          : "Thiết bị hướng đến sự ổn định, dễ lắp đặt và phù hợp cho nhu cầu mở rộng không gian dữ liệu."
      }`;
    case "ram":
      return `${name} là bộ nhớ RAM dành cho người dùng muốn nâng cấp khả năng đa nhiệm và độ phản hồi của hệ thống. ${
        specsText
          ? `Các thông số ${specsText} giúp sản phẩm phù hợp cho PC hiện đại, chơi game và làm việc với nhiều ứng dụng cùng lúc.`
          : "Linh kiện này góp phần cải thiện trải nghiệm sử dụng tổng thể và độ mượt trong các tác vụ thường xuyên."
      }`;
    case "gpu":
      return `${name} là card đồ họa phù hợp cho chơi game, dựng hình và tăng tốc xử lý hình ảnh trên desktop. ${
        specsText
          ? `Cấu hình với ${specsText} giúp sản phẩm đáp ứng tốt game phổ biến, nội dung độ phân giải cao và nhiều phần mềm sáng tạo.`
          : "Thiết bị tập trung vào hiệu năng đồ họa, sự ổn định khi tải nặng và khả năng nâng cấp sức mạnh hiển thị."
      }`;
    case "cpu":
      return `${name} là bộ xử lý dành cho người dùng đang xây dựng hoặc nâng cấp PC với ưu tiên về hiệu năng và độ ổn định. ${
        specsText
          ? `Thông số ${specsText} cho thấy sản phẩm phù hợp cho cả chơi game, làm việc và đa nhiệm trên nền tảng hiện đại.`
          : "Bộ xử lý giữ vai trò trung tâm, ảnh hưởng trực tiếp đến tốc độ phản hồi và khả năng vận hành của toàn hệ thống."
      }`;
    case "case":
      return `${name} là vỏ case/case máy tính phù hợp cho người dùng cần không gian lắp ráp gọn gàng, luồng gió tốt và ngoại hình hiện đại cho bộ PC. ${
        specsText
          ? `Những điểm như ${specsText} giúp sản phẩm phù hợp cho nhiều cấu hình từ phổ thông đến gaming.`
          : "Thiết kế tập trung vào khả năng bố trí linh kiện, hỗ trợ tản nhiệt và nâng cao thẩm mỹ của hệ thống."
      }`;
    case "laptop-backpack":
      return `${name} là balo laptop phù hợp cho người dùng thường xuyên mang máy tính và phụ kiện đi học, đi làm hoặc di chuyển hằng ngày. ${
        specsText
          ? `Những thông tin ${specsText} cho thấy sản phẩm phù hợp với nhiều kích cỡ thiết bị và nhu cầu sử dụng linh hoạt.`
          : "Thiết kế chú trọng tính gọn gàng, khả năng chứa đồ và sự tiện lợi khi di chuyển."
      }`;
    case "usb-hub":
      return `${name} là hub USB/USB-C giúp mở rộng cổng kết nối nhanh chóng cho laptop, tablet hoặc desktop hiện đại. ${
        specsText
          ? `Các điểm nổi bật như ${specsText} hỗ trợ tốt cho nhu cầu truyền dữ liệu, trình chiếu và kết nối nhiều thiết bị ngoại vi.`
          : "Đây là phụ kiện hữu ích cho góc làm việc gọn gàng hơn và linh hoạt hơn khi dùng thiết bị ít cổng."
      }`;
    case "charging-cable":
      return `${name} là cáp sạc dữ liệu phù hợp cho nhu cầu cấp nguồn, sạc nhanh và kết nối thiết bị mỗi ngày. ${
        specsText
          ? `Các thông số ${specsText} cho thấy sản phẩm thích hợp cho nhiều thiết bị USB-C hiện đại.`
          : "Thiết kế hướng đến độ bền, tính tiện dụng và khả năng sử dụng linh hoạt trong nhiều tình huống."
      }`;
    case "webcam":
      return `${name} là webcam phù hợp cho họp trực tuyến, học online, livestream cơ bản và ghi hình hằng ngày. ${
        specsText
          ? `Các điểm như ${specsText} giúp sản phẩm đáp ứng tốt nhu cầu giao tiếp hình ảnh rõ ràng trên PC hoặc laptop.`
          : "Thiết bị dễ lắp đặt, dễ sử dụng và là lựa chọn phù hợp cho góc làm việc tại nhà hoặc văn phòng."
      }`;
    case "microphone":
      return `${name} là microphone phù hợp cho gọi thoại, thu âm cơ bản, streaming hoặc tạo nội dung tại bàn làm việc. ${
        specsText
          ? `Những đặc điểm ${specsText} giúp sản phẩm đáp ứng tốt nhu cầu giao tiếp và ghi âm rõ ràng.`
          : "Thiết bị hướng đến sự tiện dụng, dễ thiết lập và chất lượng âm thanh ổn định cho nhiều kịch bản sử dụng."
      }`;
    case "mousepad":
      return `${name} là mousepad giúp bề mặt rê chuột ổn định hơn, tăng độ kiểm soát và hoàn thiện góc máy gọn gàng. ${
        specsText
          ? `Các điểm nhấn như ${specsText} mang lại sự tiện lợi cho cả chơi game lẫn làm việc hằng ngày.`
          : "Sản phẩm chú trọng cảm giác di chuột mượt, độ bám bề mặt và tính thẩm mỹ của không gian sử dụng."
      }`;
    case "controller":
      return `${name} là tay cầm chơi game phù hợp cho PC, console hoặc nhu cầu giải trí tại nhà với thao tác trực quan. ${
        specsText
          ? `Những điểm như ${specsText} giúp sản phẩm hỗ trợ tốt cho trải nghiệm điều khiển không dây hoặc đa nền tảng.`
          : "Thiết kế tập trung vào cảm giác cầm nắm, độ phản hồi nút bấm và sự thoải mái khi chơi trong thời gian dài."
      }`;
    case "monitor-arm":
      return `${name} là giá đỡ màn hình giúp tối ưu không gian bàn làm việc và cải thiện tư thế quan sát khi sử dụng lâu. ${
        specsText
          ? `Các thông số ${specsText} cho thấy sản phẩm phù hợp cho góc làm việc hiện đại cần sự linh hoạt trong bố trí màn hình.`
          : "Đây là phụ kiện hữu ích để sắp xếp không gian gọn gàng hơn và tăng tính công thái học cho bàn làm việc."
      }`;
    case "laptop-cooler":
      return `${name} là đế tản nhiệt laptop hỗ trợ hạ nhiệt khi máy phải hoạt động trong thời gian dài hoặc tải nặng. ${
        specsText
          ? `Các đặc điểm ${specsText} giúp sản phẩm phù hợp cho laptop học tập, làm việc và gaming.`
          : "Thiết bị góp phần cải thiện luồng gió, giữ nhiệt độ ổn định hơn và tăng sự thoải mái khi sử dụng lâu."
      }`;
    case "gaming-chair":
      return `${name} là ghế gaming phù hợp cho không gian chơi game hoặc làm việc cần ngồi lâu với cảm giác hỗ trợ tốt hơn. ${
        specsText
          ? `Các điểm nhấn ${specsText} giúp sản phẩm hoàn thiện trải nghiệm sử dụng trong góc máy cá nhân.`
          : "Thiết kế hướng đến sự thoải mái, phong cách mạnh mẽ và khả năng đồng hành trong nhiều giờ liên tục."
      }`;
    case "gaming-desk":
      return `${name} là bàn gaming phù hợp cho góc máy cần bề mặt rộng, bố trí gọn và phong cách đồng bộ hơn. ${
        specsText
          ? `Các chi tiết ${specsText} giúp sản phẩm dễ kết hợp cùng nhiều bộ PC và phụ kiện gaming.`
          : "Thiết kế tập trung vào sự chắc chắn, tối ưu không gian thao tác và nâng cao thẩm mỹ tổng thể của setup."
      }`;
    case "monitor":
      return `${name} là màn hình đa dụng phù hợp cho học tập, làm việc và giải trí hằng ngày. ${
        specsText
          ? `Các thông số ${specsText} giúp sản phẩm đáp ứng tốt nhiều nhu cầu sử dụng phổ thông.`
          : "Thiết bị hướng đến trải nghiệm hiển thị rõ ràng, dễ dùng và phù hợp với nhiều không gian làm việc."
      }`;
    case "keyboard":
      return `${name} là bàn phím phù hợp cho nhu cầu gõ phím hằng ngày, học tập hoặc hoàn thiện góc máy cá nhân. ${
        specsText
          ? `Các đặc điểm ${specsText} giúp sản phẩm nổi bật hơn về trải nghiệm sử dụng thực tế.`
          : "Thiết kế tập trung vào sự ổn định, tính thực dụng và cảm giác thao tác dễ làm quen."
      }`;
    case "mouse":
      return `${name} là chuột máy tính phù hợp cho thao tác hằng ngày, học tập và làm việc trên desktop hoặc laptop. ${
        specsText
          ? `Những điểm như ${specsText} giúp sản phẩm đáp ứng tốt nhu cầu sử dụng phổ thông một cách gọn gàng và ổn định.`
          : "Sản phẩm hướng đến sự dễ dùng, thao tác thoải mái và độ tin cậy trong môi trường làm việc thường xuyên."
      }`;
    case "headset":
      return `${name} là thiết bị âm thanh cá nhân phù hợp cho nghe nhạc, làm việc và giải trí hằng ngày. ${
        specsText
          ? `Các đặc điểm ${specsText} giúp sản phẩm phù hợp với nhiều tình huống sử dụng tại nhà hoặc khi di chuyển.`
          : "Thiết kế ưu tiên sự tiện lợi, khả năng đeo thoải mái và trải nghiệm sử dụng ổn định."
      }`;
    case "speaker":
      return `${name} là thiết bị âm thanh phù hợp cho bàn làm việc, góc giải trí hoặc nhu cầu nghe nhạc mỗi ngày. ${
        specsText
          ? `Các thông số ${specsText} giúp sản phẩm thuận tiện hơn cho nhiều kịch bản sử dụng khác nhau.`
          : "Sản phẩm hướng đến sự dễ dùng, âm thanh rõ ràng và khả năng bố trí linh hoạt trong không gian cá nhân."
      }`;
    default:
      return `${name} là sản phẩm công nghệ phù hợp cho nhu cầu sử dụng hằng ngày hoặc hoàn thiện góc máy cá nhân. ${
        specsText
          ? `Các điểm đáng chú ý như ${specsText} giúp sản phẩm nổi bật hơn trong quá trình sử dụng thực tế.`
          : "Thiết kế và định hướng sử dụng của sản phẩm tập trung vào sự ổn định, tính thực dụng và trải nghiệm dễ tiếp cận."
      }`;
  }
}

async function main() {
  const shouldApply = process.argv.includes("--apply");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const client = new pg.Client({ connectionString: url });
  await client.connect();

  const { rows } = await client.query(`
    SELECT p.id, p.name,
           COALESCE(string_agg(c.name, ', ' ORDER BY c.name), '') AS categories
    FROM products p
    LEFT JOIN product_categories pc ON pc.product_id = p.id
    LEFT JOIN categories c ON c.id = pc.category_id
    GROUP BY p.id, p.name
    ORDER BY p.name ASC
  `);

  const descriptions = rows.map((product) => ({
    id: product.id,
    name: product.name,
    description: buildDescription(product),
  }));

  if (!shouldApply) {
    console.log(
      JSON.stringify(
        {
          total: descriptions.length,
          preview: descriptions.slice(0, 12),
        },
        null,
        2
      )
    );
    await client.end();
    return;
  }

  await client.query("BEGIN");
  try {
    for (const item of descriptions) {
      await client.query(
        "UPDATE products SET description = $2, updated_at = NOW() WHERE id = $1",
        [item.id, item.description]
      );
    }

    const { rows: summaryRows } = await client.query(`
      SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE description IS NULL OR btrim(description) = '')::int AS empty_count,
             MIN(length(description))::int AS min_length,
             MAX(length(description))::int AS max_length
      FROM products
    `);

    const { rows: sampleRows } = await client.query(`
      SELECT name, description
      FROM products
      ORDER BY random()
      LIMIT 8
    `);

    await client.query("COMMIT");
    console.log(
      JSON.stringify(
        {
          updated: descriptions.length,
          summary: summaryRows[0],
          sample: sampleRows,
        },
        null,
        2
      )
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
