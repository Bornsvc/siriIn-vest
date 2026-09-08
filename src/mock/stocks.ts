import type { Stock } from "@/shared/types";

/**
 * Quotes are frozen at the values in the product design so every screen tells
 * the same story. A real build swaps this module for the market data feed —
 * nothing outside `src/mock` knows the difference.
 */
export const STOCKS: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    kind: "stock",
    sector: "Technology",
    brandColor: "#1d1d1f",
    price: 179.32,
    change: 4.28,
    changePct: 2.45,
    marketCap: 2_780_000_000_000,
    peRatio: 29.4,
    volume: 54_320_000,
    dayHigh: 180.11,
    dayLow: 175.02,
    weekHigh52: 199.62,
    weekLow52: 143.9,
    dividendYield: 0.54,
    about:
      "Apple designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories, and sells a range of related services.",
    aboutLo:
      "ບໍລິສັດ Apple ອອກແບບ, ຜະລິດ ແລະ ຈຳໜ່າຍໂທລະສັບສະຫຼາດ, ຄອມພິວເຕີ, ແທັບເລັດ ແລະ ອຸປະກອນສວມໃສ່ ພ້ອມທັງບໍລິການທີ່ກ່ຽວຂ້ອງ.",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    kind: "stock",
    sector: "Technology",
    brandColor: "#0067b8",
    price: 415.26,
    change: 7.42,
    changePct: 1.82,
    marketCap: 3_090_000_000_000,
    peRatio: 35.8,
    volume: 21_450_000,
    dayHigh: 417.9,
    dayLow: 408.14,
    weekHigh52: 430.82,
    weekLow52: 309.45,
    dividendYield: 0.72,
    about:
      "Microsoft develops and licenses software, services, devices and solutions, spanning cloud infrastructure, productivity software and gaming.",
    aboutLo:
      "Microsoft ພັດທະນາ ແລະ ໃຫ້ໃບອະນຸຍາດຊອບແວ, ບໍລິການຄລາວ, ອຸປະກອນ ແລະ ໂຊລູຊັນສຳລັບອົງກອນ ແລະ ຜູ້ບໍລິໂພກ.",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    kind: "stock",
    sector: "Technology",
    brandColor: "#ea4335",
    price: 142.18,
    change: 2.93,
    changePct: 2.1,
    marketCap: 1_790_000_000_000,
    peRatio: 25.1,
    volume: 28_760_000,
    dayHigh: 143.04,
    dayLow: 139.6,
    weekHigh52: 155.2,
    weekLow52: 102.21,
    dividendYield: null,
    about:
      "Alphabet is the holding company for Google, with businesses across search, advertising, cloud computing, Android and autonomous driving.",
    aboutLo:
      "Alphabet ເປັນບໍລິສັດແມ່ຂອງ Google ດຳເນີນທຸລະກິດຊອກຫາຂໍ້ມູນ, ໂຄສະນາ, ຄລາວ, Android ແລະ ລົດຂັບຂີ່ອັດຕະໂນມັດ.",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    kind: "stock",
    sector: "Consumer",
    brandColor: "#ff9900",
    price: 178.44,
    change: 2.74,
    changePct: 1.56,
    marketCap: 1_850_000_000_000,
    peRatio: 51.2,
    volume: 38_910_000,
    dayHigh: 179.5,
    dayLow: 175.31,
    weekHigh52: 189.77,
    weekLow52: 118.35,
    dividendYield: null,
    about:
      "Amazon operates online and physical stores, third-party seller services, advertising, subscriptions and Amazon Web Services.",
    aboutLo:
      "Amazon ດຳເນີນທຸລະກິດຮ້ານຄ້າອອນລາຍ, ບໍລິການຜູ້ຂາຍພາຍນອກ, ໂຄສະນາ, ສະມາຊິກ ແລະ ບໍລິການຄລາວ AWS.",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    kind: "stock",
    sector: "Technology",
    brandColor: "#76b900",
    price: 482.91,
    change: 14.61,
    changePct: 3.12,
    marketCap: 1_190_000_000_000,
    peRatio: 64.9,
    volume: 46_180_000,
    dayHigh: 486.2,
    dayLow: 470.05,
    weekHigh52: 505.48,
    weekLow52: 262.2,
    dividendYield: 0.03,
    about:
      "NVIDIA designs graphics processors and system-on-chip units for gaming, professional visualisation, data centre and automotive markets.",
    aboutLo:
      "NVIDIA ອອກແບບຊິບປະມວນຜົນກຣາຟິກ ແລະ ລະບົບຊິບສຳລັບເກມ, ສູນຂໍ້ມູນ, ປັນຍາປະດິດ ແລະ ອຸດສາຫະກຳລົດຍົນ.",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    kind: "stock",
    sector: "Consumer",
    brandColor: "#cc0000",
    price: 248.5,
    change: -3.1,
    changePct: -1.23,
    marketCap: 790_000_000_000,
    peRatio: 71.3,
    volume: 92_640_000,
    dayHigh: 253.9,
    dayLow: 247.11,
    weekHigh52: 299.29,
    weekLow52: 152.37,
    dividendYield: null,
    about:
      "Tesla designs, manufactures and sells electric vehicles, energy generation and storage systems, and related software and services.",
    aboutLo:
      "Tesla ອອກແບບ, ຜະລິດ ແລະ ຂາຍລົດໄຟຟ້າ, ລະບົບຜະລິດ ແລະ ເກັບຮັກສາພະລັງງານ ພ້ອມທັງຊອບແວທີ່ກ່ຽວຂ້ອງ.",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    kind: "stock",
    sector: "Finance",
    brandColor: "#5a2d0c",
    price: 198.74,
    change: 1.12,
    changePct: 0.57,
    marketCap: 570_000_000_000,
    peRatio: 12.1,
    volume: 9_320_000,
    dayHigh: 199.8,
    dayLow: 196.42,
    weekHigh52: 205.88,
    weekLow52: 135.19,
    dividendYield: 2.28,
    about:
      "JPMorgan Chase is a global financial services firm operating in investment banking, consumer banking, commercial banking and asset management.",
    aboutLo:
      "JPMorgan Chase ເປັນສະຖາບັນການເງິນລະດັບໂລກ ໃຫ້ບໍລິການທະນາຄານການລົງທຶນ, ທະນາຄານລາຍຍ່ອຍ ແລະ ການຄຸ້ມຄອງຊັບສິນ.",
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    kind: "stock",
    sector: "Health",
    brandColor: "#d51900",
    price: 156.03,
    change: -0.84,
    changePct: -0.54,
    marketCap: 375_000_000_000,
    peRatio: 15.4,
    volume: 7_110_000,
    dayHigh: 157.4,
    dayLow: 155.62,
    weekHigh52: 175.97,
    weekLow52: 143.13,
    dividendYield: 3.11,
    about:
      "Johnson & Johnson researches, develops and sells pharmaceutical products and medical devices across global healthcare markets.",
    aboutLo:
      "Johnson & Johnson ຄົ້ນຄວ້າ, ພັດທະນາ ແລະ ຈຳໜ່າຍຢາ ແລະ ອຸປະກອນການແພດໃນຕະຫຼາດສຸຂະພາບທົ່ວໂລກ.",
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil Corporation",
    kind: "stock",
    sector: "Energy",
    brandColor: "#e01e2d",
    price: 113.86,
    change: 0.94,
    changePct: 0.83,
    marketCap: 452_000_000_000,
    peRatio: 13.7,
    volume: 15_040_000,
    dayHigh: 114.6,
    dayLow: 112.7,
    weekHigh52: 123.75,
    weekLow52: 95.77,
    dividendYield: 3.34,
    about:
      "Exxon Mobil explores for and produces crude oil and natural gas, and manufactures petroleum products and petrochemicals.",
    aboutLo:
      "Exxon Mobil ສຳຫຼວດ ແລະ ຜະລິດນ້ຳມັນດິບ ແລະ ອາຍແກັສທຳມະຊາດ ພ້ອມທັງຜະລິດຕະພັນປິໂຕຣເຄມີ.",
  },
  {
    symbol: "VOO",
    name: "Vanguard S&P 500 ETF",
    kind: "etf",
    sector: "Finance",
    brandColor: "#96151d",
    price: 448.21,
    change: 3.68,
    changePct: 0.83,
    marketCap: 1_090_000_000_000,
    peRatio: null,
    volume: 4_870_000,
    dayHigh: 449.05,
    dayLow: 444.9,
    weekHigh52: 461.34,
    weekLow52: 362.05,
    dividendYield: 1.32,
    about:
      "Tracks the S&P 500 index, giving exposure to 500 of the largest publicly traded companies in the United States at a 0.03% expense ratio.",
    aboutLo:
      "ຕິດຕາມດັດຊະນີ S&P 500 ເຊິ່ງລວມ 500 ບໍລິສັດໃຫຍ່ທີ່ສຸດຂອງສະຫະລັດ ດ້ວຍຄ່າທຳນຽມພຽງ 0.03%.",
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    kind: "etf",
    sector: "Technology",
    brandColor: "#0b3d91",
    price: 428.65,
    change: 5.91,
    changePct: 1.4,
    marketCap: 248_000_000_000,
    peRatio: null,
    volume: 32_180_000,
    dayHigh: 429.7,
    dayLow: 423.02,
    weekHigh52: 449.34,
    weekLow52: 316.5,
    dividendYield: 0.56,
    about:
      "Tracks the Nasdaq-100 index — the largest non-financial companies listed on the Nasdaq, weighted toward technology.",
    aboutLo:
      "ຕິດຕາມດັດຊະນີ Nasdaq-100 ເຊິ່ງລວມບໍລິສັດໃຫຍ່ທີ່ບໍ່ແມ່ນສະຖາບັນການເງິນ ໂດຍເນັ້ນໜັກໄປທາງເຕັກໂນໂລຊີ.",
  },
  {
    symbol: "VTI",
    name: "Vanguard Total Stock Market ETF",
    kind: "etf",
    sector: "Finance",
    brandColor: "#96151d",
    price: 246.9,
    change: 1.83,
    changePct: 0.75,
    marketCap: 1_450_000_000_000,
    peRatio: null,
    volume: 3_260_000,
    dayHigh: 247.4,
    dayLow: 245.1,
    weekHigh52: 254.12,
    weekLow52: 199.44,
    dividendYield: 1.41,
    about:
      "Holds the entire U.S. equity market — large, mid and small caps — in a single fund at a 0.03% expense ratio.",
    aboutLo:
      "ຖືຄອງຫຼັກຊັບທັງໝົດຂອງຕະຫຼາດສະຫະລັດ ທັງບໍລິສັດໃຫຍ່, ກາງ ແລະ ນ້ອຍ ໃນກອງທຶນດຽວ.",
  },
];

const BY_SYMBOL = new Map(STOCKS.map((stock) => [stock.symbol, stock]));

export function getStock(symbol: string): Stock | undefined {
  return BY_SYMBOL.get(symbol.toUpperCase());
}

export function listStocks(): Stock[] {
  return STOCKS;
}

/** Symbols the customer is following but does not own. */
export const WATCHLIST = ["GOOGL", "QQQ", "JPM", "XOM"];

export function searchStocks(query: string): Stock[] {
  const q = query.trim().toLowerCase();
  if (!q) return STOCKS;
  return STOCKS.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(q) ||
      stock.name.toLowerCase().includes(q),
  );
}

export const TOP_GAINERS = ["NVDA", "AAPL", "GOOGL"];
export const TOP_LOSERS = ["TSLA", "JNJ"];
export const MOST_ACTIVE = ["TSLA", "AAPL", "NVDA"];
