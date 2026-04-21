import crypto from "node:crypto";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const products = [
  {
    category: "laptop-gaming",
    name: "ASUS TUF Gaming A15 FA507NV R7 RTX 4060",
    sku: "LPG-ASUS-TUF-A15-4060",
    listPrice: 28990000,
    salePrice: 24990000,
  },
  {
    category: "laptop-gaming",
    name: "Lenovo Legion 5 16IRX9 i7 RTX 4060",
    sku: "LPG-LENOVO-LEGION5-16IRX9",
    listPrice: 39990000,
    salePrice: 35490000,
  },
  {
    category: "laptop-van-phong",
    name: "Lenovo ThinkPad E14 Gen 6 Core Ultra 5",
    sku: "LPV-THINKPAD-E14-G6-U5",
    listPrice: 18990000,
    salePrice: 16490000,
  },
  {
    category: "laptop-van-phong",
    name: "Dell Inspiron 15 3530 i5 16GB 512GB",
    sku: "LPV-DELL-INSPIRON-3530-I5",
    listPrice: 14990000,
    salePrice: 12790000,
  },
  {
    category: "laptop-do-hoa",
    name: "ASUS ProArt P16 H7606 Ryzen AI 9 RTX 4070",
    sku: "LPD-ASUS-PROART-P16-4070",
    listPrice: 69990000,
    salePrice: 64990000,
  },
  {
    category: "laptop-do-hoa",
    name: "Dell XPS 16 9640 Core Ultra 7 RTX 4060",
    sku: "LPD-DELL-XPS16-9640-4060",
    listPrice: 75990000,
    salePrice: 69990000,
  },
  {
    category: "laptop-mong-nhe",
    name: "LG Gram 14 2025 Core Ultra 7 16GB 1TB",
    sku: "LPM-LG-GRAM14-U7-1TB",
    listPrice: 29990000,
    salePrice: 26990000,
  },
  {
    category: "laptop-mong-nhe",
    name: "Lenovo Yoga Slim 7 14IMH9 Core Ultra 5",
    sku: "LPM-YOGA-SLIM7-14IMH9",
    listPrice: 25990000,
    salePrice: 22990000,
  },
  {
    category: "macbook",
    name: "MacBook Air 13 M4 16GB 256GB",
    sku: "MAC-AIR13-M4-16-256",
    listPrice: 26990000,
    salePrice: 23190000,
  },
  {
    category: "macbook",
    name: "MacBook Pro 14 M4 16GB 512GB",
    sku: "MAC-PRO14-M4-16-512",
    listPrice: 39990000,
    salePrice: 36990000,
  },
  {
    category: "pc-gaming",
    name: "PC Gaming Ryzen 7 7800X3D RTX 4070 Super",
    sku: "PCG-R7-7800X3D-4070S",
    listPrice: 39990000,
    salePrice: 35990000,
  },
  {
    category: "pc-gaming",
    name: "PC Gaming Core i5 14400F RTX 4060",
    sku: "PCG-I5-14400F-4060",
    listPrice: 23990000,
    salePrice: 20990000,
  },
  {
    category: "pc-van-phong",
    name: "PC Office Core i3 14100 16GB 512GB",
    sku: "PCO-I3-14100-16-512",
    listPrice: 8990000,
    salePrice: 7790000,
  },
  {
    category: "pc-van-phong",
    name: "PC Office Ryzen 5 5600G 16GB 512GB",
    sku: "PCO-R5-5600G-16-512",
    listPrice: 9490000,
    salePrice: 8290000,
  },
  {
    category: "pc-do-hoa",
    name: "Workstation Core i7 14700F RTX 4070 32GB",
    sku: "PCD-I7-14700F-4070",
    listPrice: 45990000,
    salePrice: 41990000,
  },
  {
    category: "pc-do-hoa",
    name: "Workstation Ryzen 9 7900X RTX 4080 Super",
    sku: "PCD-R9-7900X-4080S",
    listPrice: 65990000,
    salePrice: 60990000,
  },
  {
    category: "mini-pc",
    name: "Intel NUC 13 Pro i5 1340P Barebone",
    sku: "MINI-NUC13PRO-I5",
    listPrice: 13990000,
    salePrice: 11990000,
  },
  {
    category: "mini-pc",
    name: "ASUS NUC 14 Pro Core Ultra 5 Barebone",
    sku: "MINI-ASUS-NUC14-U5",
    listPrice: 16990000,
    salePrice: 14990000,
  },
  {
    category: "pc-all-in-one",
    name: "HP All-in-One 24 cr0129d i5 13th Gen",
    sku: "AIO-HP-24-CR0129D-I5",
    listPrice: 18990000,
    salePrice: 16490000,
  },
  {
    category: "pc-all-in-one",
    name: "Lenovo IdeaCentre AIO 3 24IRH9 i5",
    sku: "AIO-LENOVO-3-24IRH9",
    listPrice: 17990000,
    salePrice: 15490000,
  },
  {
    category: "man-hinh-22-inch",
    name: "Dell E2222HS 21.5 inch FHD VA 60Hz",
    sku: "MON22-DELL-E2222HS",
    listPrice: 3290000,
    salePrice: 2890000,
  },
  {
    category: "man-hinh-22-inch",
    name: "LG 22MP410-B 21.5 inch FHD FreeSync",
    sku: "MON22-LG-22MP410",
    listPrice: 2990000,
    salePrice: 2590000,
  },
  {
    category: "man-hinh-24-inch",
    name: "Dell P2425H 24 inch IPS 100Hz",
    sku: "MON24-DELL-P2425H",
    listPrice: 4990000,
    salePrice: 4290000,
  },
  {
    category: "man-hinh-24-inch",
    name: "LG 24MR400-B 24 inch IPS 100Hz",
    sku: "MON24-LG-24MR400",
    listPrice: 3490000,
    salePrice: 2990000,
  },
  {
    category: "man-hinh-27-inch",
    name: "Dell S2725HS 27 inch IPS 100Hz",
    sku: "MON27-DELL-S2725HS",
    listPrice: 5990000,
    salePrice: 5290000,
  },
  {
    category: "man-hinh-27-inch",
    name: "BenQ GW2790 27 inch IPS 100Hz Eye-Care",
    sku: "MON27-BENQ-GW2790",
    listPrice: 4790000,
    salePrice: 4190000,
  },
  {
    category: "man-hinh-32-inch",
    name: "LG 32UN650-W 32 inch 4K IPS HDR",
    sku: "MON32-LG-32UN650",
    listPrice: 9990000,
    salePrice: 8890000,
  },
  {
    category: "man-hinh-32-inch",
    name: "Samsung Odyssey G5 32 inch QHD 165Hz",
    sku: "MON32-SAM-G5-32QHD",
    listPrice: 8990000,
    salePrice: 7790000,
  },
  {
    category: "man-hinh-cong",
    name: "Samsung Odyssey G5 G55C 27 inch Curved QHD",
    sku: "MONC-SAM-G5-G55C-27",
    listPrice: 7990000,
    salePrice: 6790000,
  },
  {
    category: "man-hinh-cong",
    name: "MSI MAG 275CQRF QD E2 27 inch Curved",
    sku: "MONC-MSI-275CQRF-QD-E2",
    listPrice: 8990000,
    salePrice: 7890000,
  },
  {
    category: "man-hinh-4k",
    name: "Dell UltraSharp U2723QE 27 inch 4K USB-C",
    sku: "MON4K-DELL-U2723QE",
    listPrice: 14990000,
    salePrice: 12990000,
  },
  {
    category: "man-hinh-4k",
    name: "LG 27UP850N-W 27 inch 4K IPS USB-C",
    sku: "MON4K-LG-27UP850N",
    listPrice: 11990000,
    salePrice: 9990000,
  },
  {
    category: "man-hinh-gaming",
    name: "LG UltraGear 27GR75Q-B 27 inch 2K 165Hz",
    sku: "MONG-LG-27GR75Q",
    listPrice: 7990000,
    salePrice: 6090000,
  },
  {
    category: "man-hinh-gaming",
    name: "ASUS TUF Gaming VG27AQ3A 27 inch 2K 180Hz",
    sku: "MONG-ASUS-VG27AQ3A",
    listPrice: 8990000,
    salePrice: 7590000,
  },
  {
    category: "man-hinh-do-hoa",
    name: "ASUS ProArt PA278QV 27 inch QHD IPS",
    sku: "MONGFX-ASUS-PA278QV",
    listPrice: 8990000,
    salePrice: 7890000,
  },
  {
    category: "man-hinh-do-hoa",
    name: "BenQ PD2705U 27 inch 4K Designer Monitor",
    sku: "MONGFX-BENQ-PD2705U",
    listPrice: 15990000,
    salePrice: 13990000,
  },
  {
    category: "ssd",
    name: "Samsung 990 PRO 1TB PCIe 4.0 NVMe",
    sku: "SSD-SAM-990PRO-1TB",
    listPrice: 3290000,
    salePrice: 2790000,
  },
  {
    category: "ssd",
    name: "WD Black SN850X 1TB PCIe 4.0 NVMe",
    sku: "SSD-WD-SN850X-1TB",
    listPrice: 3190000,
    salePrice: 2690000,
  },
  {
    category: "hdd",
    name: "Seagate BarraCuda 2TB 7200rpm",
    sku: "HDD-SEAGATE-BARRACUDA-2TB",
    listPrice: 1890000,
    salePrice: 1590000,
  },
  {
    category: "hdd",
    name: "WD Blue 1TB 7200rpm 3.5 inch",
    sku: "HDD-WD-BLUE-1TB",
    listPrice: 1490000,
    salePrice: 1190000,
  },
  {
    category: "tan-nhiet-cpu",
    name: "DeepCool AK400 Digital CPU Cooler",
    sku: "COOLCPU-DEEPCOOL-AK400-D",
    listPrice: 1190000,
    salePrice: 990000,
  },
  {
    category: "tan-nhiet-cpu",
    name: "Thermalright Peerless Assassin 120 SE ARGB",
    sku: "COOLCPU-TR-PA120SE",
    listPrice: 1290000,
    salePrice: 1090000,
  },
  {
    category: "vo-case",
    name: "NZXT H5 Flow Mid Tower Black",
    sku: "CASE-NZXT-H5-FLOW-BLK",
    listPrice: 2490000,
    salePrice: 2190000,
  },
  {
    category: "vo-case",
    name: "Corsair 4000D Airflow Tempered Glass",
    sku: "CASE-CORSAIR-4000D-AF",
    listPrice: 2790000,
    salePrice: 2390000,
  },
  {
    category: "quat-case",
    name: "ARCTIC P12 PWM PST 120mm",
    sku: "FAN-ARCTIC-P12-PWM",
    listPrice: 290000,
    salePrice: 240000,
  },
  {
    category: "quat-case",
    name: "Cooler Master SickleFlow 120 ARGB",
    sku: "FAN-CM-SICKLEFLOW-120",
    listPrice: 390000,
    salePrice: 320000,
  },
  {
    category: "ban-phim-co",
    name: "Keychron K2 Pro RGB Hot-swap",
    sku: "KBM-KEYCHRON-K2-PRO",
    listPrice: 2690000,
    salePrice: 2290000,
  },
  {
    category: "ban-phim-co",
    name: "AKKO 5075B Plus Transparent ASA Black Piano Pro",
    sku: "KBM-AKKO-5075B-BPP",
    listPrice: 2200000,
    salePrice: 1590000,
  },
  {
    category: "ban-phim-khong-day",
    name: "Logitech MX Keys S Wireless",
    sku: "KBW-LOGI-MX-KEYS-S",
    listPrice: 2990000,
    salePrice: 2490000,
  },
  {
    category: "ban-phim-khong-day",
    name: "Keychron K3 Max Low Profile Wireless",
    sku: "KBW-KEYCHRON-K3-MAX",
    listPrice: 2790000,
    salePrice: 2390000,
  },
  {
    category: "ban-phim-van-phong",
    name: "Logitech K120 USB Keyboard",
    sku: "KBO-LOGI-K120",
    listPrice: 220000,
    salePrice: 170000,
  },
  {
    category: "ban-phim-van-phong",
    name: "Dell KB216 Multimedia Keyboard",
    sku: "KBO-DELL-KB216",
    listPrice: 290000,
    salePrice: 230000,
  },
  {
    category: "ban-phim-gaming",
    name: "Razer BlackWidow V4 X Green Switch",
    sku: "KBG-RAZER-BWV4X-GREEN",
    listPrice: 3490000,
    salePrice: 2990000,
  },
  {
    category: "ban-phim-gaming",
    name: "Corsair K70 CORE RGB Mechanical",
    sku: "KBG-CORSAIR-K70-CORE",
    listPrice: 2990000,
    salePrice: 2490000,
  },
  {
    category: "chuot-gaming",
    name: "Logitech G Pro X Superlight 2",
    sku: "MOG-LOGI-GPROX-SL2",
    listPrice: 3990000,
    salePrice: 3390000,
  },
  {
    category: "chuot-gaming",
    name: "Razer DeathAdder V3 Pro Wireless",
    sku: "MOG-RAZER-DAV3-PRO",
    listPrice: 4290000,
    salePrice: 3690000,
  },
  {
    category: "chuot-van-phong",
    name: "Logitech M331 Silent Plus",
    sku: "MOO-LOGI-M331",
    listPrice: 390000,
    salePrice: 310000,
  },
  {
    category: "chuot-van-phong",
    name: "Dell MS116 Optical Mouse",
    sku: "MOO-DELL-MS116",
    listPrice: 190000,
    salePrice: 150000,
  },
  {
    category: "chuot-khong-day",
    name: "Logitech MX Master 3S Wireless",
    sku: "MOW-LOGI-MX-MASTER-3S",
    listPrice: 2890000,
    salePrice: 2390000,
  },
  {
    category: "chuot-khong-day",
    name: "Microsoft Bluetooth Ergonomic Mouse",
    sku: "MOW-MS-BT-ERGONOMIC",
    listPrice: 1190000,
    salePrice: 990000,
  },
  {
    category: "chuot-bluetooth",
    name: "Logitech Pebble Mouse 2 M350s",
    sku: "MOBT-LOGI-PEBBLE-M350S",
    listPrice: 590000,
    salePrice: 490000,
  },
  {
    category: "chuot-bluetooth",
    name: "Rapoo M650 Silent Bluetooth",
    sku: "MOBT-RAPOO-M650",
    listPrice: 490000,
    salePrice: 390000,
  },
  {
    category: "cpu",
    name: "Intel Core Ultra 7 265K",
    sku: "CPU-INTEL-U7-265K",
    listPrice: 9990000,
    salePrice: 8790000,
  },
  {
    category: "cpu",
    name: "AMD Ryzen 7 7800X3D",
    sku: "CPU-AMD-R7-7800X3D",
    listPrice: 10990000,
    salePrice: 9490000,
  },
  {
    category: "card-do-hoa",
    name: "MSI GeForce RTX 4070 Super Ventus 2X OC 12GB",
    sku: "GPU-MSI-4070S-VENTUS2X",
    listPrice: 19990000,
    salePrice: 17990000,
  },
  {
    category: "card-do-hoa",
    name: "ASUS Dual GeForce RTX 4060 OC 8GB",
    sku: "GPU-ASUS-DUAL-4060-O8G",
    listPrice: 8990000,
    salePrice: 7790000,
  },
  {
    category: "mainboard",
    name: "ASUS TUF Gaming B650-Plus WiFi",
    sku: "MB-ASUS-TUF-B650-WIFI",
    listPrice: 5990000,
    salePrice: 5190000,
  },
  {
    category: "mainboard",
    name: "MSI MAG B760M Mortar WiFi II",
    sku: "MB-MSI-B760M-MORTAR-WIFI2",
    listPrice: 5290000,
    salePrice: 4590000,
  },
  {
    category: "ram",
    name: "Kingston Fury Beast 16GB DDR5 5600",
    sku: "RAM-KINGSTON-FURY-16D5-5600",
    listPrice: 1490000,
    salePrice: 1190000,
  },
  {
    category: "ram",
    name: "Corsair Vengeance 32GB DDR5 6000",
    sku: "RAM-CORSAIR-VEN-32D5-6000",
    listPrice: 3290000,
    salePrice: 2790000,
  },
  {
    category: "o-cung",
    name: "Samsung 870 EVO 1TB SATA SSD",
    sku: "DRV-SAM-870EVO-1TB",
    listPrice: 2490000,
    salePrice: 1990000,
  },
  {
    category: "o-cung",
    name: "Crucial P3 Plus 1TB NVMe PCIe 4.0",
    sku: "DRV-CRUCIAL-P3P-1TB",
    listPrice: 2190000,
    salePrice: 1790000,
  },
  {
    category: "nguon-may-tinh",
    name: "Corsair RM750e 750W 80 Plus Gold",
    sku: "PSU-CORSAIR-RM750E",
    listPrice: 2990000,
    salePrice: 2490000,
  },
  {
    category: "nguon-may-tinh",
    name: "Cooler Master MWE 650 Bronze V2",
    sku: "PSU-CM-MWE650-BV2",
    listPrice: 1590000,
    salePrice: 1290000,
  },
  {
    category: "case-may-tinh",
    name: "MSI MAG Forge 120A Airflow",
    sku: "PCCASE-MSI-FORGE-120A",
    listPrice: 1190000,
    salePrice: 990000,
  },
  {
    category: "case-may-tinh",
    name: "Lian Li Lancool 216 RGB",
    sku: "PCCASE-LIANLI-LANCOOL216",
    listPrice: 2690000,
    salePrice: 2290000,
  },
  {
    category: "tan-nhiet",
    name: "Cooler Master MasterLiquid ML240L V2 ARGB",
    sku: "COOL-CM-ML240L-V2",
    listPrice: 2190000,
    salePrice: 1890000,
  },
  {
    category: "tan-nhiet",
    name: "DeepCool LS520 SE 240mm AIO",
    sku: "COOL-DEEPCOOL-LS520-SE",
    listPrice: 2490000,
    salePrice: 2090000,
  },
  {
    category: "tai-nghe-gaming",
    name: "Logitech G Pro X 2 Lightspeed Wireless",
    sku: "HSG-LOGI-GPROX2-LS",
    listPrice: 5490000,
    salePrice: 4790000,
  },
  {
    category: "tai-nghe-gaming",
    name: "HyperX Cloud III Wireless",
    sku: "HSG-HYPERX-CLOUD3-WL",
    listPrice: 3990000,
    salePrice: 3390000,
  },
  {
    category: "tai-nghe-bluetooth",
    name: "Sony WH-1000XM5 Bluetooth ANC",
    sku: "HSBT-SONY-WH1000XM5",
    listPrice: 7990000,
    salePrice: 6890000,
  },
  {
    category: "tai-nghe-bluetooth",
    name: "JBL Tune 770NC Wireless ANC",
    sku: "HSBT-JBL-TUNE770NC",
    listPrice: 2990000,
    salePrice: 2390000,
  },
  {
    category: "tai-nghe-tws",
    name: "Sony WF-1000XM5 True Wireless",
    sku: "HSTWS-SONY-WF1000XM5",
    listPrice: 6990000,
    salePrice: 5380000,
  },
  {
    category: "tai-nghe-tws",
    name: "Samsung Galaxy Buds3 Pro",
    sku: "HSTWS-SAM-BUDS3-PRO",
    listPrice: 5490000,
    salePrice: 4590000,
  },
  {
    category: "tai-nghe-co-day",
    name: "Sennheiser HD 560S Open-back",
    sku: "HSW-SENN-HD560S",
    listPrice: 4990000,
    salePrice: 4190000,
  },
  {
    category: "tai-nghe-co-day",
    name: "HyperX Cloud Earbuds II",
    sku: "HSW-HYPERX-CLOUD-EARBUDS2",
    listPrice: 990000,
    salePrice: 790000,
  },
  {
    category: "loa-bluetooth",
    name: "JBL Flip 6 Portable Bluetooth Speaker",
    sku: "SPBT-JBL-FLIP6",
    listPrice: 3290000,
    salePrice: 2790000,
  },
  {
    category: "loa-bluetooth",
    name: "Sony SRS-XB100 Compact Bluetooth Speaker",
    sku: "SPBT-SONY-SRS-XB100",
    listPrice: 1490000,
    salePrice: 1190000,
  },
  {
    category: "loa-soundbar",
    name: "Samsung HW-C450 2.1ch Soundbar",
    sku: "SPSB-SAM-HWC450",
    listPrice: 3990000,
    salePrice: 3290000,
  },
  {
    category: "loa-soundbar",
    name: "LG SQC2 2.1ch Soundbar",
    sku: "SPSB-LG-SQC2",
    listPrice: 3490000,
    salePrice: 2890000,
  },
  {
    category: "loa-2-1",
    name: "Logitech Z313 2.1 Speaker System",
    sku: "SP21-LOGI-Z313",
    listPrice: 990000,
    salePrice: 790000,
  },
  {
    category: "loa-2-1",
    name: "Edifier M201BT 2.1 Bluetooth Speaker",
    sku: "SP21-EDIFIER-M201BT",
    listPrice: 1690000,
    salePrice: 1390000,
  },
  {
    category: "ghe-gaming",
    name: "Corsair TC100 Relaxed Gaming Chair",
    sku: "CHAIR-CORSAIR-TC100",
    listPrice: 5990000,
    salePrice: 4990000,
  },
  {
    category: "ghe-gaming",
    name: "Razer Iskur V2 Gaming Chair",
    sku: "CHAIR-RAZER-ISKUR-V2",
    listPrice: 16990000,
    salePrice: 14990000,
  },
  {
    category: "ban-gaming",
    name: "E-Dra EGT1610AR Gaming Desk",
    sku: "DESK-EDRA-EGT1610AR",
    listPrice: 3490000,
    salePrice: 2990000,
  },
  {
    category: "ban-gaming",
    name: "Warrior Paladin WGT604 Gaming Desk",
    sku: "DESK-WARRIOR-WGT604",
    listPrice: 2990000,
    salePrice: 2490000,
  },
  {
    category: "tay-cam-gaming",
    name: "Xbox Wireless Controller Carbon Black",
    sku: "GAMEPAD-XBOX-WL-BLK",
    listPrice: 1890000,
    salePrice: 1590000,
  },
  {
    category: "tay-cam-gaming",
    name: "Sony DualSense Wireless Controller White",
    sku: "GAMEPAD-SONY-DUALSENSE-WHT",
    listPrice: 2190000,
    salePrice: 1890000,
  },
  {
    category: "webcam",
    name: "Logitech Brio 100 Full HD Webcam",
    sku: "WEBCAM-LOGI-BRIO100",
    listPrice: 890000,
    salePrice: 690000,
  },
  {
    category: "webcam",
    name: "Razer Kiyo X Full HD Webcam",
    sku: "WEBCAM-RAZER-KIYO-X",
    listPrice: 1690000,
    salePrice: 1390000,
  },
  {
    category: "microphone",
    name: "HyperX SoloCast USB Microphone",
    sku: "MIC-HYPERX-SOLOCAST",
    listPrice: 1490000,
    salePrice: 1190000,
  },
  {
    category: "microphone",
    name: "Razer Seiren Mini USB Microphone",
    sku: "MIC-RAZER-SEIREN-MINI",
    listPrice: 1290000,
    salePrice: 990000,
  },
  {
    category: "mousepad",
    name: "Logitech G640 Large Cloth Gaming Mousepad",
    sku: "PAD-LOGI-G640",
    listPrice: 790000,
    salePrice: 590000,
  },
  {
    category: "mousepad",
    name: "Razer Gigantus V2 Large Mouse Mat",
    sku: "PAD-RAZER-GIGANTUS-V2-L",
    listPrice: 690000,
    salePrice: 490000,
  },
  {
    category: "gia-do-man-hinh",
    name: "North Bayou F80 Monitor Arm",
    sku: "ARM-NB-F80",
    listPrice: 790000,
    salePrice: 590000,
  },
  {
    category: "gia-do-man-hinh",
    name: "Human Motion T6 Pro Dual Monitor Arm",
    sku: "ARM-HM-T6-PRO-DUAL",
    listPrice: 2490000,
    salePrice: 1990000,
  },
  {
    category: "hub-usb",
    name: "Ugreen CM512 USB-C 6-in-1 Hub",
    sku: "HUB-UGREEN-CM512",
    listPrice: 990000,
    salePrice: 790000,
  },
  {
    category: "hub-usb",
    name: "Anker 555 USB-C Hub 8-in-1",
    sku: "HUB-ANKER-555-8IN1",
    listPrice: 2490000,
    salePrice: 1990000,
  },
  {
    category: "cap-sac",
    name: "Anker 643 USB-C to USB-C 100W 1.8m",
    sku: "CABLE-ANKER-643-100W",
    listPrice: 590000,
    salePrice: 450000,
  },
  {
    category: "cap-sac",
    name: "Ugreen USB-C to USB-C 100W 2m",
    sku: "CABLE-UGREEN-C2C-100W-2M",
    listPrice: 390000,
    salePrice: 290000,
  },
  {
    category: "balo-laptop",
    name: "Tomtoc Navigator-T66 Laptop Backpack 15.6",
    sku: "BAG-TOMTOC-T66-156",
    listPrice: 1690000,
    salePrice: 1390000,
  },
  {
    category: "balo-laptop",
    name: "Lenovo Legion Active Gaming Backpack",
    sku: "BAG-LENOVO-LEGION-ACTIVE",
    listPrice: 1490000,
    salePrice: 1190000,
  },
  {
    category: "de-tan-nhiet-laptop",
    name: "Cooler Master Notepal X3 Laptop Cooler",
    sku: "LPCOOL-CM-NOTEPAL-X3",
    listPrice: 990000,
    salePrice: 790000,
  },
  {
    category: "de-tan-nhiet-laptop",
    name: "DeepCool N80 RGB Laptop Cooling Pad",
    sku: "LPCOOL-DEEPCOOL-N80-RGB",
    listPrice: 790000,
    salePrice: 590000,
  },
  {
    category: "o-cung-di-dong",
    name: "WD My Passport 2TB USB 3.2",
    sku: "EXT-WD-MYPASSPORT-2TB",
    listPrice: 2290000,
    salePrice: 1890000,
  },
  {
    category: "o-cung-di-dong",
    name: "Seagate One Touch 2TB Portable HDD",
    sku: "EXT-SEAGATE-ONETOUCH-2TB",
    listPrice: 2390000,
    salePrice: 1990000,
  },
];

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function normalizeSku(value) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

function placeholderUrl(name) {
  const text = name.replace(/[^a-zA-Z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  return `https://placehold.co/600x600/f8fafc/111827/png?text=${encodeURIComponent(text.slice(0, 46))}`;
}

async function slugExists(client, slug) {
  const { rows } = await client.query(
    "SELECT 1 FROM products WHERE slug = $1 LIMIT 1",
    [slug]
  );
  return rows.length > 0;
}

async function uniqueSlug(client, name) {
  const base = slugify(name);
  if (!base) throw new Error(`Cannot create slug for ${name}`);
  if (!(await slugExists(client, base))) return base;
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`;
    if (!(await slugExists(client, candidate))) return candidate;
  }
  throw new Error(`Cannot create unique slug for ${name}`);
}

function buildAncestorIds(category, byId) {
  const ids = [];
  let current = category;
  while (current) {
    ids.push(current.id);
    current = current.parent_id ? byId.get(current.parent_id) : null;
  }
  return ids;
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows: categories } = await client.query(
      "SELECT id, name, slug, parent_id FROM categories"
    );
    const bySlug = new Map(categories.map((c) => [c.slug, c]));
    const byId = new Map(categories.map((c) => [c.id, c]));

    const missing = products
      .map((p) => p.category)
      .filter((slug) => !bySlug.has(slug));
    if (missing.length) {
      throw new Error(`Missing categories: ${[...new Set(missing)].join(", ")}`);
    }

    const seenSku = new Set();
    for (const product of products) {
      const sku = normalizeSku(product.sku);
      if (seenSku.has(sku)) throw new Error(`Duplicate seed SKU: ${sku}`);
      seenSku.add(sku);
    }

    let inserted = 0;
    let skipped = 0;

    await client.query("BEGIN");
    for (const product of products) {
      const sku = normalizeSku(product.sku);
      const { rows: existingSku } = await client.query(
        "SELECT 1 FROM product_variants WHERE sku = $1 LIMIT 1",
        [sku]
      );
      if (existingSku.length) {
        skipped++;
        continue;
      }

      const id = crypto.randomUUID();
      const variantId = crypto.randomUUID();
      const slug = await uniqueSlug(client, product.name);
      const imageUrl = placeholderUrl(product.name);
      const category = bySlug.get(product.category);
      const categoryIds = buildAncestorIds(category, byId);

      const { rows: sortRows } = await client.query(
        "SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort FROM products"
      );
      const sortOrder = sortRows[0].next_sort;

      await client.query(
        `INSERT INTO products (id, name, slug, image_url, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, product.name, slug, imageUrl, sortOrder]
      );
      await client.query(
        `INSERT INTO product_variants
           (id, product_id, sku, image_url, list_price, sale_price, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, 1)`,
        [
          variantId,
          id,
          sku,
          imageUrl,
          product.listPrice,
          product.salePrice,
        ]
      );
      for (const categoryId of categoryIds) {
        await client.query(
          `INSERT INTO product_categories (product_id, category_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [id, categoryId]
        );
      }
      inserted++;
    }
    await client.query("COMMIT");

    console.log(
      JSON.stringify(
        {
          seedProducts: products.length,
          inserted,
          skipped,
        },
        null,
        2
      )
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
