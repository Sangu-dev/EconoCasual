// Compares an allocation plan with the budget settings from the form.
// Until the optimizer API is connected, the form settings are checked against the precomputed plan.

import { sumColumn, toNumber } from './tableUtils.js';

export function checkPlan(rows, settings) {
  const targeted = rows.filter((row) => toNumber(row.discount_amount) > 0);
  const result = {
    customers: rows.length,
    targeted: targeted.length,
    spend: sumColumn(rows, 'discount_amount'),
    gain: sumColumn(rows, 'expected_gain'),
    ready: Boolean(settings),
  };
  if (!settings) return result;

  result.withinBudget = result.spend <= settings.totalBudget + 1e-9;
  result.overBudgetBy = Math.max(0, result.spend - settings.totalBudget);
  // The small extra term protects against floating point results like 2.9999999.
  result.affordableDiscounts = Math.floor(settings.totalBudget / settings.costPerDiscount + 1e-9);
  result.aboveMaxDiscount = targeted.filter((row) => toNumber(row.discount_amount) > settings.maxDiscount).length;
  result.belowMinGain = targeted.filter((row) => toNumber(row.expected_gain) < settings.minExpectedGain).length;
  return result;
}

// files: [{ budget: number | null, url: string }]
// Picks the plan built for the largest budget that is not above the entered budget,
// so the chosen plan never overspends. With no budget-specific files it returns the first file.
export function pickAllocationFile(files, totalBudget) {
  const withBudget = files.filter((f) => Number.isFinite(f.budget));
  if (withBudget.length === 0 || !Number.isFinite(totalBudget)) return files[0];
  const affordable = withBudget.filter((f) => f.budget <= totalBudget);
  if (affordable.length > 0) return affordable.reduce((a, b) => (b.budget > a.budget ? b : a));
  return withBudget.reduce((a, b) => (b.budget < a.budget ? b : a));
}
