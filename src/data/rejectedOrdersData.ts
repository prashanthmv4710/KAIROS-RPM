export interface RejectedOrderRow {
  id: string;
  articleId: string;
  articleName: string;
  department: string;
  deliveryType: string;
  deliveryDate: string;
  source: string;
  destination: string;
  quantity: number;
  excessQuantity: number;
  reason: string;
  submittedBy: string;
  tentativeSapDate: string;
  /** Resolved fixture photo for a handful of rows — the rest fall back to the generic thumbnail placeholder. */
  imageUrl?: string;
  /** Meaningful a11y description of imageUrl's contents — required whenever imageUrl is set. */
  imageAlt?: string;
}

const ARTICLE_IDS = [
  '100041243',
  '100058812',
  '100073391',
  '100029654',
  '100084127',
  '100015973',
  '100067240',
  '100038805',
  '100091462',
  '100052318',
  '100076609',
  '100024481',
];

const ARTICLE_NAMES = [
  '11"x85" Acrylic Sign Holder',
  '4ft Steel End Cap Shelving Bracket',
  'Clip Strip Merchandising Hooks, 12-pack',
  '22"x28" Foam Board Sign, Double-Sided',
  'Rolling Wire Display Basket, Large',
  'Adjustable Peg Hook Assortment, 6"',
  'Modular Gondola Shelf Divider',
  'Checkout Lane Impulse Rack',
  'Pallet Wrap Dispenser with Brake',
  'Freestanding Endcap Header Sign',
  'Wire Grid Panel, 4ft x 2ft',
  'Corrugated Floor Display, 3-tier',
];

const DEPARTMENTS = [
  '0 - Action Alley Features & Ends',
  '14 - Health and Beauty Aids',
  '43 - Pets',
  '80 - Toys',
  '92 - Electronics',
  '07 - Dairy',
  '22 - Apparel',
  '56 - Home Decor',
];

const DELIVERY_TYPES = ['P21', 'P22', 'D14', 'X01', 'R33'];

const SOURCES = ['RREW 443566', 'RREW 552210', 'DC 6032', 'DC 7044', 'RREW 118820'];

const DESTINATIONS = ['Store 2721', 'Store 3390', 'Store 1042', 'Store 5588', 'Store 4790'];

const REASONS = [
  'Damaged packaging received at dock',
  'Incorrect quantity received from vendor',
  'Item discontinued by merchant',
  'Vendor shipment delay past reset date',
  'Failed quality inspection on arrival',
  'Wrong SKU shipped against PO',
  'Excess inventory already on hand',
  'Store lacks space for planogram reset',
];

const SUBMITTED_BY = [
  'John Smith',
  'Maria Garcia',
  'David Chen',
  'Aisha Khan',
  'Robert Johnson',
  'Emily Davis',
];

const DELIVERY_DATES = [
  '02/22/2026',
  '03/05/2026',
  '03/18/2026',
  '04/02/2026',
  '04/19/2026',
  '05/07/2026',
];

const QUANTITIES = [
  12345, 67890, 23456, 78901, 34567, 89012, 45678, 90123, 56789, 1234, 67890,
  12345,
];

const EXCESS_QUANTITIES = [21, 8, 45, 3, 60, 14, 27, 5, 33, 9, 52, 17];

/**
 * A handful of rows get a real remodel-fixture photo instead of the generic
 * placeholder icon. Sourced from Wikimedia Commons (freely licensed —
 * CC0 / CC BY-SA 4.0) since this kit ships no fixture-photo catalog of its
 * own (ProductService only covers retail consumer goods). `articleName` is
 * overridden to match what each photo actually depicts, and `imageAlt`
 * carries that same description for the <Image alt>.
 */
const FIXTURE_IMAGES_BY_ROW_INDEX: Record<number, { articleName: string; imageUrl: string; imageAlt: string }> = {
  1: {
    articleName: 'Warehouse Pallet Racking Unit',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pallet_Racking.jpg',
    imageAlt: 'Warehouse pallet racking shelving unit',
  },
  4: {
    articleName: 'Modular Gondola Shelving Aisle',
    imageUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Self-serve_aisle_in_IKEA_Torp_Uddevalla_2.jpg',
    imageAlt: 'Retail self-serve aisle with gondola shelving',
  },
  7: {
    articleName: 'Drive-In Pallet Rack System',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Drive-In-Rack.jpg',
    imageAlt: 'Drive-in pallet rack storage system',
  },
  10: {
    articleName: 'Custom PVC Floor Display Stand',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Custom_PVC_Stands.jpg',
    imageAlt: 'Custom PVC floor display stands',
  },
};

export const rejectedOrders: RejectedOrderRow[] = QUANTITIES.map((quantity, index) => {
  const fixtureImage = FIXTURE_IMAGES_BY_ROW_INDEX[index];

  return {
    id: `rejected-order-${index + 1}`,
    articleId: ARTICLE_IDS[index % ARTICLE_IDS.length],
    articleName: fixtureImage?.articleName ?? ARTICLE_NAMES[index % ARTICLE_NAMES.length],
    department: DEPARTMENTS[(index * 3) % DEPARTMENTS.length],
    deliveryType: DELIVERY_TYPES[(index * 2) % DELIVERY_TYPES.length],
    deliveryDate: DELIVERY_DATES[index % DELIVERY_DATES.length],
    source: SOURCES[(index * 2) % SOURCES.length],
    destination: DESTINATIONS[(index * 3) % DESTINATIONS.length],
    quantity,
    excessQuantity: EXCESS_QUANTITIES[index % EXCESS_QUANTITIES.length],
    reason: REASONS[(index * 5) % REASONS.length],
    submittedBy: SUBMITTED_BY[index % SUBMITTED_BY.length],
    tentativeSapDate: DELIVERY_DATES[(index + 2) % DELIVERY_DATES.length],
    imageUrl: fixtureImage?.imageUrl,
    imageAlt: fixtureImage?.imageAlt,
  };
});
