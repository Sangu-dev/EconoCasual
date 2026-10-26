// Builds the plain-English summary from the result files.
// Every number comes from the rows passed in. The allocation file and the strategy comparison file
// are described separately, because they can come from different runs.

import { toNumber } from './tableUtils.js';
import { formatCount, formatMoney, formatPercent } from './format.js';

export function summarizeAllocation(rows) {
  let targeted = 0;
  let spend = 0;
  let gain = 0;
  let persuadables = 0;
  let hasSegment = false;
  for (const row of rows) {
    const discount = toNumber(row.discount_amount);
    const expected = toNumber(row.expected_gain);
    if (Number.isFinite(discount)) {
      spend += discount;
      if (discount > 0) targeted += 1;
    }
    if (Number.isFinite(expected)) gain += expected;
    const segment = String(row.segment ?? '').trim();
    if (segment) {
      hasSegment = true;
      if (/persuadable/i.test(segment)) persuadables += 1;
    }
  }
  return { customers: rows.length, targeted, spend, gain, persuadables, hasSegment };
}

export function summarizeStrategies(rows) {
  const byName = {};
  for (const row of rows) {
    const name = String(row.strategy ?? '').trim().toLowerCase();
    if (!name) continue;
    byName[name] = { spend: toNumber(row.total_spend), gain: toNumber(row.total_gain) };
  }
  return byName;
}

const SAME = 0.005;

function compareSentence(heading, optimized, other, currency) {
  if (!optimized || !other) return '';
  const values = [optimized.spend, optimized.gain, other.spend, other.gain];
  if (!values.every(Number.isFinite)) return '';

  const spendDiff = other.spend - optimized.spend;
  const gainDiff = optimized.gain - other.gain;
  const spendText =
    Math.abs(spendDiff) < SAME
      ? 'spends the same'
      : spendDiff > 0
        ? `spends ${formatMoney(spendDiff, currency)} less`
        : `spends ${formatMoney(-spendDiff, currency)} more`;
  const gainText =
    Math.abs(gainDiff) < SAME
      ? 'gains the same'
      : gainDiff > 0
        ? `gains ${formatMoney(gainDiff, currency)} more`
        : `gains ${formatMoney(-gainDiff, currency)} less`;
  return `Compared with ${heading}, the optimized strategy ${spendText} and ${gainText}.`;
}

// Returns { allocation: string[], strategy: string[] }.
export function buildSummary(allocationRows = [], strategyRows = [], currency = 'USD') {
  const allocation = [];
  const strategy = [];

  if (allocationRows.length > 0) {
    const a = summarizeAllocation(allocationRows);
    allocation.push(
      `The plan targets ${formatCount(a.targeted)} of ${formatCount(a.customers)} customers, ` +
        `spends ${formatMoney(a.spend, currency)} and expects a gain of ${formatMoney(a.gain, currency)}.`,
    );
    if (a.hasSegment) {
      allocation.push(
        `${formatCount(a.persuadables)} customers (${formatPercent(a.persuadables / a.customers)}) are Persuadables.`,
      );
    }
  }

  const s = summarizeStrategies(strategyRows);
  if (s.optimized) {
    const blanket = compareSentence('giving every customer a discount', s.optimized, s.blanket, currency);
    const random = compareSentence('random targeting', s.optimized, s.random, currency);
    if (blanket) strategy.push(blanket);
    if (random) strategy.push(random);
  }

  return { allocation, strategy };
}
