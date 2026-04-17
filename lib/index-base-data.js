// Base data for DC Index computation.
// BASE_PRICES: closing prices on January 2, 2024 (first trading day of 2024).
// BASE_MARKET_CAPS: approximate market caps ($B) on Jan 2, 2024 for cap-weighted mode.
// Both looked up once and hardcoded for reproducibility.

export const BASE_PRICES = {
  // ── Brands (41) ──
  NKE: 106.55, TPR: 38.17, RL: 146.03, LULU: 505.38, DECK: 112.33,
  ONON: 26.76, CHWY: 22.35, CELH: 59.03, BROS: 31.06, BIRK: 47.38,
  CROX: 93.77, ANF: 90.96, HIMS: 9.64, ELF: 139.66, PVH: 121.83,
  BBWI: 44.75, VSCO: 27.12, KTB: 61.69, FRPT: 87.48, YETI: 50.37,
  COLM: 79.32, COCO: 26.18, WRBY: 14.90, UAA: 8.68, CPRI: 50.31,
  SHOO: 42.30, FIGS: 6.69, PTON: 5.82, SONO: 16.68, RVLV: 16.66,
  OLPX: 2.50, WWW: 8.64, GIII: 33.54, CRI: 75.41, GOOS: 11.54,
  ODD: 44.89, SFIX: 3.58, HNST: 3.19, XPOF: 12.65, LOVE: 26.33,
  RENT: 9.68, BIRD: 26.00,

  // ── Marketplaces (24) ──
  AMZN: 149.93, BABA: 74.76, SHOP: 73.83, PDD: 145.64, BKNG: 139.22,
  MELI: 1529.16, DASH: 96.46, CVNA: 48.87, SE: 38.45, EBAY: 43.87,
  JD: 27.20, CPNG: 15.73, GRAB: 3.30, RKUNY: 4.39, CART: 24.03,
  W: 58.79, VIPS: 17.37, ZAL: 20.96, ETSY: 81.08, MCARY: 9.06,
  REAL: 1.97, JMIA: 3.36, TDUP: 2.27, DIBS: 4.63,

  // ── Software (50) ──
  V: 258.87, MA: 421.89, ADBE: 580.07, UPS: 158.34, FDX: 252.24,
  NET: 79.35, PYPL: 61.46, XYZ: 72.22, DDOG: 115.08, ADYEN: 1159.20,
  FISV: 133.08, FIS: 60.97, XPO: 84.88, AFRM: 46.60, TWLO: 71.13,
  GPN: 127.17, TOST: 18.06, AKAM: 116.88, PINS: 36.21, HUBS: 547.86,
  GDDY: 103.00, TTD: 70.59, SNAP: 16.14, MANH: 206.77, GXO: 60.13,
  DSGX: 81.41, GLBE: 38.69, KLAR: 40.00, KVYO: 27.01, ESTC: 106.54, FOUR: 73.36,
  CMRC: 9.00, DLO: 17.35, BILL: 77.23, FSLY: 17.49, BRZE: 50.33,
  SEZL: 3.57, MQ: 6.81, PAYO: 5.03, RAMP: 37.14, DV: 36.10,
  FLYW: 22.75, CXM: 11.80, LSPD: 19.46, PGY: 15.60, TBLA: 4.20,
  CRTO: 24.63, AMPL: 12.59, VTEX: 6.69, RSKD: 4.44,
};

// Market caps in $B as of ~Jan 2024 for weighted mode.
// Source: Yahoo Finance / CompaniesMarketCap, approximate.
export const BASE_MARKET_CAPS = {
  // ── Brands (41) ──
  NKE: 162, TPR: 9.2, RL: 9.6, LULU: 62, DECK: 16,
  ONON: 17, CHWY: 9.2, CELH: 14, BROS: 5.5, BIRK: 8.9,
  CROX: 5.8, ANF: 4.7, HIMS: 2.2, ELF: 8.2, PVH: 7.8,
  BBWI: 10.2, VSCO: 2.1, KTB: 3.5, FRPT: 3.8, YETI: 4.3,
  COLM: 5.1, COCO: 1.5, WRBY: 1.7, UAA: 3.7, CPRI: 6.5,
  SHOO: 3.3, FIGS: 1.1, PTON: 2.0, SONO: 2.1, RVLV: 1.2,
  OLPX: 0.4, WWW: 1.3, GIII: 1.6, CRI: 3.5, GOOS: 1.3,
  ODD: 2.4, SFIX: 0.4, HNST: 0.3, XPOF: 0.3, LOVE: 0.4,
  RENT: 0.15, BIRD: 0.2,

  // ── Marketplaces (24) ──
  AMZN: 1550, BABA: 190, SHOP: 95, PDD: 195, BKNG: 118,
  MELI: 78, DASH: 38, CVNA: 9.5, SE: 22, EBAY: 24,
  JD: 42, CPNG: 28, GRAB: 12.5, RKUNY: 6.8, CART: 6.5,
  W: 7.2, VIPS: 10.8, ZAL: 5.2, ETSY: 10.2, MCARY: 1.7,
  REAL: 0.17, JMIA: 0.6, TDUP: 0.14, DIBS: 0.18,

  // ── Software (50) ──
  V: 540, MA: 398, ADBE: 260, UPS: 137, FDX: 63,
  NET: 27, PYPL: 70, XYZ: 42, DDOG: 36, ADYEN: 47,
  FISV: 83, FIS: 37, XPO: 9.8, AFRM: 14, TWLO: 14,
  GPN: 34, TOST: 10, AKAM: 18, PINS: 24, HUBS: 28,
  GDDY: 17, TTD: 34, SNAP: 26, MANH: 13, GXO: 7.2,
  DSGX: 6.8, GLBE: 5.8, KLAR: 15.1, KVYO: 7.4, ESTC: 10.5, FOUR: 4.5,
  CMRC: 0.68, DLO: 5.3, BILL: 8.0, FSLY: 2.2, BRZE: 4.0,
  SEZL: 0.2, MQ: 3.5, PAYO: 1.9, RAMP: 2.1, DV: 5.5,
  FLYW: 2.7, CXM: 3.1, LSPD: 2.8, PGY: 1.2, TBLA: 1.1,
  CRTO: 1.5, AMPL: 1.5, VTEX: 1.2, RSKD: 0.28,
};
