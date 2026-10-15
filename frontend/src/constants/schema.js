/**
 * EconoCausal Schema & Business Constants
 * Role C: Frontend Engineer (Sangamesh Ragam)
 */

export const REQUIRED_COLUMNS = [
  'customer_id',
  'age',
  'loyalty_score',
  'past_orders',
  'avg_order_value',
  'discount',
  'revenue'
];

export const COLUMN_METADATA = {
  customer_id: { label: 'Customer ID', type: 'Identifier', role: 'Unit of Analysis' },
  age: { label: 'Age', type: 'Integer', role: 'Confounder / Feature' },
  loyalty_score: { label: 'Loyalty Score', type: 'Float [0-10]', role: 'Key Confounder' },
  past_orders: { label: 'Past Orders', type: 'Integer', role: 'Historical Activity' },
  avg_order_value: { label: 'Avg Order Value ($)', type: 'Float', role: 'Confounder / Spending Tier' },
  discount: { label: 'Discount Treatment (T)', type: 'Binary [0, 1]', role: 'Treatment Indicator' },
  revenue: { label: 'Observed Revenue (Y)', type: 'Float', role: 'Target Outcome Variable' }
};

export const SEGMENTS = [
  { id: 'all', label: 'All Segments', color: '#6366f1' },
  { id: 'Persuadables', label: 'Persuadables (ITE >> 0)', color: '#10b981' },
  { id: 'High-Value Loyal', label: 'High-Value Loyal (ITE > 5)', color: '#38bdf8' },
  { id: 'Sure Things', label: 'Sure Things (ITE ≈ 0)', color: '#94a3b8' },
  { id: 'Sleeping Dogs', label: 'Sleeping Dogs (ITE < 0)', color: '#f43f5e' }
];
