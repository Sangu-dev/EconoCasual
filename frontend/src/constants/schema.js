/**
 * EconoCausal Schema & Business Constants
 * Standardized data contracts, schemas, and canonical segment taxonomy.
 */

// Primary Retail Observational Schema (7 columns)
export const RETAIL_REQUIRED_COLUMNS = [
  'customer_id',
  'age',
  'loyalty_score',
  'past_orders',
  'avg_order_value',
  'discount',
  'revenue'
];

// Kaggle Promotional Campaign Schema - Processed (6 columns)
export const PROMO_REQUIRED_COLUMNS = [
  'customer_id',
  'recency',
  'history',
  'is_referral',
  'discount',
  'revenue'
];

// Kaggle Promotional Campaign Schema - Raw (9 columns)
export const RAW_PROMO_REQUIRED_COLUMNS = [
  'recency',
  'history',
  'used_discount',
  'used_bogo',
  'zip_code',
  'is_referral',
  'channel',
  'offer',
  'conversion'
];

// Default required columns (Retail) maintained for backward compatibility
export const REQUIRED_COLUMNS = RETAIL_REQUIRED_COLUMNS;

export const COLUMN_METADATA = {
  // Retail features
  customer_id: { label: 'Customer ID', type: 'Identifier', role: 'Unit of Analysis' },
  age: { label: 'Age', type: 'Integer', role: 'Confounder / Feature' },
  loyalty_score: { label: 'Loyalty Score', type: 'Float [0-10]', role: 'Key Confounder' },
  past_orders: { label: 'Past Orders', type: 'Integer', role: 'Historical Activity' },
  avg_order_value: { label: 'Avg Order Value ($)', type: 'Float', role: 'Confounder / Spending Tier' },
  discount: { label: 'Discount Treatment (T)', type: 'Binary [0, 1]', role: 'Treatment Indicator' },
  revenue: { label: 'Observed Revenue (Y)', type: 'Float', role: 'Target Outcome Variable' },

  // Promotional features
  recency: { label: 'Recency (Months)', type: 'Integer', role: 'Historical Activity' },
  history: { label: 'Spend History ($)', type: 'Float', role: 'Confounder / Spending Tier' },
  is_referral: { label: 'Referral Indicator', type: 'Binary [0, 1]', role: 'Acquisition Channel' },
  used_discount: { label: 'Prior Discount Usage', type: 'Binary [0, 1]', role: 'Behavioral Feature' },
  used_bogo: { label: 'Prior BOGO Usage', type: 'Binary [0, 1]', role: 'Behavioral Feature' },
  zip_code: { label: 'Postal Area', type: 'Categorical', role: 'Demographic Feature' },
  channel: { label: 'Communication Channel', type: 'Categorical', role: 'Contact Feature' },
  offer: { label: 'Campaign Offer', type: 'Categorical', role: 'Treatment Variant' },
  conversion: { label: 'Conversion Indicator', type: 'Binary [0, 1]', role: 'Observed Response' }
};

/**
 * Validates detected columns against supported schemas and returns schema details or missing fields.
 * @param {string[]} detectedColumns
 * @returns {{ isValid: boolean, schemaName: string, missingColumns: string[], expectedColumns: string[], label: string }}
 */
export function validateDatasetColumns(detectedColumns = []) {
  const detected = new Set(detectedColumns.map((c) => String(c).trim()));

  // 1. Check Retail
  const missingRetail = RETAIL_REQUIRED_COLUMNS.filter((c) => !detected.has(c));
  if (missingRetail.length === 0) {
    return {
      isValid: true,
      schemaName: 'retail',
      label: 'Retail Observational Dataset',
      missingColumns: [],
      expectedColumns: RETAIL_REQUIRED_COLUMNS
    };
  }

  // 2. Check Processed Promotion
  const missingPromo = PROMO_REQUIRED_COLUMNS.filter((c) => !detected.has(c));
  if (missingPromo.length === 0) {
    return {
      isValid: true,
      schemaName: 'promotion',
      label: 'Promotion Campaign Dataset (Processed)',
      missingColumns: [],
      expectedColumns: PROMO_REQUIRED_COLUMNS
    };
  }

  // 3. Check Raw Promotion
  const missingRawPromo = RAW_PROMO_REQUIRED_COLUMNS.filter((c) => !detected.has(c));
  if (missingRawPromo.length === 0) {
    return {
      isValid: true,
      schemaName: 'promotion_raw',
      label: 'Kaggle Promotion Dataset (Raw)',
      missingColumns: [],
      expectedColumns: RAW_PROMO_REQUIRED_COLUMNS
    };
  }

  // Diagnostic match determination
  const retailFeatures = ['age', 'loyalty_score', 'past_orders', 'avg_order_value'];
  const promoFeatures = ['recency', 'history', 'is_referral', 'offer', 'conversion'];

  const hasRetailClues = retailFeatures.some((f) => detected.has(f));
  const hasPromoClues = promoFeatures.some((f) => detected.has(f));

  if (hasRetailClues || (!hasPromoClues && detected.has('customer_id'))) {
    return {
      isValid: false,
      schemaName: 'retail',
      label: 'Retail Observational Dataset',
      missingColumns: missingRetail,
      expectedColumns: RETAIL_REQUIRED_COLUMNS
    };
  }

  if (detected.has('offer') || detected.has('conversion')) {
    return {
      isValid: false,
      schemaName: 'promotion_raw',
      label: 'Kaggle Promotion Dataset (Raw)',
      missingColumns: missingRawPromo,
      expectedColumns: RAW_PROMO_REQUIRED_COLUMNS
    };
  }

  return {
    isValid: false,
    schemaName: 'promotion',
    label: 'Promotion Campaign Dataset',
    missingColumns: missingPromo,
    expectedColumns: PROMO_REQUIRED_COLUMNS
  };
}

// Canonical Segment Taxonomy & Aliases
export const CANONICAL_SEGMENT_MAP = {
  Persuadables: 'Persuadables',
  Persuadable: 'Persuadables',
  persuadable: 'Persuadables',
  persuadables: 'Persuadables',
  'Sleeping Dogs': 'Sleeping Dogs',
  'Sleeping Dog': 'Sleeping Dogs',
  'sleeping dog': 'Sleeping Dogs',
  'sleeping dogs': 'Sleeping Dogs',
  'Negative effect': 'Sleeping Dogs',
  'Sure Things': 'Sure Things',
  'Sure Thing': 'Sure Things',
  'sure thing': 'Sure Things',
  'sure things': 'Sure Things',
  'No effect': 'Sure Things',
  'Not targeted': 'Sure Things',
  'High-Value Loyal': 'Persuadables',
  'Lost Causes': 'Sure Things',
  'Lost Cause': 'Sure Things'
};

export function normalizeSegment(segment) {
  if (!segment) return 'Unknown';
  return CANONICAL_SEGMENT_MAP[segment] || CANONICAL_SEGMENT_MAP[String(segment).trim()] || segment;
}

export const SEGMENTS = [
  { id: 'all', label: 'All Segments', color: '#6366f1' },
  { id: 'Persuadables', label: 'Persuadables (Positive Uplift)', color: '#10b981' },
  { id: 'Sure Things', label: 'Sure Things (Organic Baseline)', color: '#94a3b8' },
  { id: 'Sleeping Dogs', label: 'Sleeping Dogs (Negative Uplift)', color: '#f43f5e' }
];
