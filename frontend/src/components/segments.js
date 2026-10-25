// Segment labels for the customer table.
// A customer is a Persuadable when the estimated effect (ITE) is above the threshold,
// has a Negative effect when it is below minus the threshold, and No effect in between.

import { toNumber } from './tableUtils.js';

export const SEGMENT_LABELS = ['Persuadable', 'No effect', 'Negative effect'];

// Setting the person can change on the page. Agree the official value with the team.
export const DEFAULT_THRESHOLD = 5;

export function parseThreshold(text) {
  const n = toNumber(text);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function labelSegment(ite, threshold = DEFAULT_THRESHOLD) {
  const value = toNumber(ite);
  const limit = Math.abs(toNumber(threshold));
  if (!Number.isFinite(value) || !Number.isFinite(limit)) return 'Unknown';
  if (value > limit) return 'Persuadable';
  if (value < -limit) return 'Negative effect';
  return 'No effect';
}

export function countSegments(rows, threshold = DEFAULT_THRESHOLD) {
  const counts = { Persuadable: 0, 'No effect': 0, 'Negative effect': 0 };
  for (const row of rows) {
    const label = labelSegment(row.ite, threshold);
    if (label in counts) counts[label] += 1;
  }
  return counts;
}
