// Standardized segment labels for the customer table.
// A customer is a Persuadable when the estimated effect (ITE) is above the threshold,
// a Sleeping Dog when it is below minus the threshold, and a Sure Thing in between.

import { toNumber } from './tableUtils.js';

export const SEGMENT_LABELS = ['Persuadables', 'Sure Things', 'Sleeping Dogs'];

// Default threshold for considering lift significantly positive
export const DEFAULT_THRESHOLD = 5;

export function parseThreshold(text) {
  const n = toNumber(text);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function labelSegment(ite, threshold = DEFAULT_THRESHOLD) {
  const value = toNumber(ite);
  const limit = Math.abs(toNumber(threshold));
  if (!Number.isFinite(value) || !Number.isFinite(limit)) return 'Unknown';
  if (value > limit) return 'Persuadables';
  if (value < -limit) return 'Sleeping Dogs';
  return 'Sure Things';
}

export function countSegments(rows, threshold = DEFAULT_THRESHOLD) {
  const counts = {
    Persuadables: 0,
    'Sure Things': 0,
    'Sleeping Dogs': 0,
    // Aliases for backward compatibility
    Persuadable: 0,
    'No effect': 0,
    'Negative effect': 0
  };
  for (const row of rows) {
    const label = labelSegment(row.ite, threshold);
    if (label in counts) {
      counts[label] += 1;
      if (label === 'Persuadables') counts.Persuadable += 1;
      if (label === 'Sure Things') counts['No effect'] += 1;
      if (label === 'Sleeping Dogs') counts['Negative effect'] += 1;
    }
  }
  return counts;
}
