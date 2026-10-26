// Rules for the budget constraints form.
// Values stay as strings while the person types and become numbers only when every field is valid.

export const BUDGET_FIELDS = [
  {
    key: 'totalBudget',
    label: 'Total budget',
    hint: 'The most we can spend on discounts in total.',
    money: true,
    mustBePositive: true,
  },
  {
    key: 'costPerDiscount',
    label: 'Cost per discount',
    hint: 'What it costs us to give one customer one discount.',
    money: true,
    mustBePositive: true,
  },
  {
    key: 'maxDiscount',
    label: 'Maximum discount',
    hint: 'The largest discount any single customer can get.',
    money: true,
    mustBePositive: true,
  },
  {
    key: 'minExpectedGain',
    label: 'Minimum expected gain per customer',
    hint: 'Customers whose expected gain is below this are flagged in the plan check.',
    money: true,
    mustBePositive: false,
  },
];

// Starting values. The 5,000 budget comes from the project brief's example. The 20 discount is a placeholder until the team agrees a value.
export const DEFAULT_BUDGET = {
  totalBudget: '5000',
  costPerDiscount: '20',
  maxDiscount: '20',
  minExpectedGain: '0',
};

export function validateField(field, raw) {
  const text = String(raw ?? '').trim();
  if (text === '') return `Enter a value for ${field.label.toLowerCase()}.`;
  const value = Number(text);
  if (!Number.isFinite(value)) return 'Enter a number such as 5000, using digits only (no commas or symbols).';
  if (value < 0) return 'Enter zero or more. Negative values are not allowed.';
  if (field.mustBePositive && value === 0) return 'Enter a number greater than zero.';
  return '';
}

// Returns an object like { totalBudget: 'message' }. An empty object means the form is valid.
export function validateBudget(values) {
  const errors = {};
  for (const field of BUDGET_FIELDS) {
    const message = validateField(field, values[field.key]);
    if (message) errors[field.key] = message;
  }
  if (!errors.totalBudget && !errors.costPerDiscount) {
    if (Number(values.costPerDiscount) > Number(values.totalBudget)) {
      errors.costPerDiscount = 'Cost per discount cannot be more than the total budget.';
    }
  }
  return errors;
}

// Numbers for the rest of the app, or null while any field is invalid.
export function parseBudget(values) {
  if (Object.keys(validateBudget(values)).length > 0) return null;
  const parsed = {};
  for (const field of BUDGET_FIELDS) {
    parsed[field.key] = Number(String(values[field.key]).trim());
  }
  return parsed;
}
