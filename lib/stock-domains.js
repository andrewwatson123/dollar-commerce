// Maps stock ticker → company website domain for favicon/logo lookup.
// Used by Google's favicon API: https://www.google.com/s2/favicons?sz=64&domain=X

const DOMAINS = {
  // ── Brands (41) ──
  NKE: 'nike.com', TPR: 'tapestry.com', RL: 'ralphlauren.com',
  LULU: 'lululemon.com', DECK: 'deckers.com', ONON: 'on-running.com',
  CHWY: 'chewy.com', CELH: 'celsius.com', BROS: 'dutchbros.com',
  BIRK: 'birkenstock.com', CROX: 'crocs.com', ANF: 'abercrombie.com',
  HIMS: 'forhims.com', ELF: 'elfcosmetics.com', PVH: 'pvh.com',
  BBWI: 'bathandbodyworks.com', VSCO: 'victoriassecret.com',
  KTB: 'kontoor.com', FRPT: 'freshpet.com', YETI: 'yeti.com',
  COLM: 'columbia.com', COCO: 'vitacoco.com', WRBY: 'warbyparker.com',
  UAA: 'underarmour.com', CPRI: 'capriholdings.com', SHOO: 'stevemadden.com',
  FIGS: 'wearfigs.com', PTON: 'onepeloton.com', SONO: 'sonos.com',
  RVLV: 'revolve.com', OLPX: 'olaplex.com', WWW: 'wolverineworldwide.com',
  GIII: 'giii.com', CRI: 'carters.com', GOOS: 'canadagoose.com',
  ODD: 'oddity.com', SFIX: 'stitchfix.com', HNST: 'honest.com',
  XPOF: 'xponential.com', LOVE: 'lovesac.com', RENT: 'renttherunway.com',

  // ── Marketplaces (24) ──
  AMZN: 'amazon.com', BABA: 'alibaba.com', SHOP: 'shopify.com',
  PDD: 'temu.com', BKNG: 'booking.com', MELI: 'mercadolibre.com',
  DASH: 'doordash.com', CVNA: 'carvana.com', SE: 'sea.com',
  EBAY: 'ebay.com', JD: 'jd.com', CPNG: 'coupang.com',
  GRAB: 'grab.com', RKUNY: 'rakuten.com', CART: 'instacart.com',
  W: 'wayfair.com', VIPS: 'vip.com', ZAL: 'zalando.com',
  ETSY: 'etsy.com', MCARY: 'mercari.com', REAL: 'therealreal.com',
  JMIA: 'jumia.com', TDUP: 'thredup.com', DIBS: '1stdibs.com',

  // ── Software (50) ──
  V: 'visa.com', MA: 'mastercard.com', ADBE: 'adobe.com',
  UPS: 'ups.com', FDX: 'fedex.com', NET: 'cloudflare.com',
  PYPL: 'paypal.com', XYZ: 'block.xyz', DDOG: 'datadoghq.com',
  ADYEN: 'adyen.com', FISV: 'fiserv.com', FIS: 'fisglobal.com',
  XPO: 'xpo.com', AFRM: 'affirm.com', TWLO: 'twilio.com',
  GPN: 'globalpayments.com', TOST: 'toasttab.com', AKAM: 'akamai.com',
  PINS: 'pinterest.com', HUBS: 'hubspot.com', GDDY: 'godaddy.com',
  TTD: 'thetradedesk.com', SNAP: 'snapchat.com', MANH: 'manh.com',
  GXO: 'gxo.com', DSGX: 'descartes.com', GLBE: 'global-e.com',
  KLAR: 'klarna.com', KVYO: 'klaviyo.com', ESTC: 'elastic.co', FOUR: 'shift4.com',
  CMRC: 'bigcommerce.com', DLO: 'dlocal.com', BILL: 'bill.com',
  FSLY: 'fastly.com', BRZE: 'braze.com', SEZL: 'sezzle.com',
  MQ: 'marqeta.com', PAYO: 'payoneer.com', RAMP: 'liveramp.com',
  DV: 'doubleverify.com', FLYW: 'flywire.com', CXM: 'sprinklr.com',
  LSPD: 'lightspeedhq.com', PGY: 'pagaya.com', TBLA: 'taboola.com',
  CRTO: 'criteo.com', AMPL: 'amplitude.com', VTEX: 'vtex.com',
  RSKD: 'riskified.com',

  // ── Legacy / ETFs / Watchlist ──
  WISH: 'wish.com', POSH: 'poshmark.com', BIRD: 'allbirds.com',
  COTY: 'coty.com', STNE: 'stone.co', NU: 'nubank.com.br',
  RELY: 'remitly.com', BIGC: 'bigcommerce.com', FVRR: 'fiverr.com',
  UPWK: 'upwork.com', SQ: 'squareup.com',
  IBUY: 'amplifyetfs.com', ONLN: 'proshares.com', EBIZ: 'globalxetfs.com',
  CLIX: 'proshares.com', ARKF: 'ark-invest.com',
  META: 'meta.com', GOOG: 'google.com', UBER: 'uber.com',
  ABNB: 'airbnb.com', WMT: 'walmart.com', TGT: 'target.com',
  COST: 'costco.com', DUOL: 'duolingo.com', MNST: 'monsterbevcorp.com',
};

export function stockLogoUrl(symbol, size = 32) {
  const domain = DOMAINS[symbol];
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`;
}
