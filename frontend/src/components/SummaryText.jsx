import { useMemo } from 'react';
import { buildSummary } from './summaryText.js';

// Plain-English summary of the plan. All numbers are read from the rows passed in.
// allocationRows: data/allocation.csv. strategyRows: data/strategy_comparison.csv.
export default function SummaryText({ allocationRows = [], strategyRows = [], currency = 'USD' }) {
  const summary = useMemo(
    () => buildSummary(allocationRows, strategyRows, currency),
    [allocationRows, strategyRows, currency],
  );

  if (summary.allocation.length === 0 && summary.strategy.length === 0) {
    return <p className="plan-empty">The summary appears once the result files have loaded.</p>;
  }

  return (
    <div className="plan-summary">
      {summary.allocation.length > 0 && (
        <div>
          <p>{summary.allocation.join(' ')}</p>
          <p className="plan-source">From the allocation plan file.</p>
        </div>
      )}
      {summary.strategy.length > 0 && (
        <div>
          <p>{summary.strategy.join(' ')}</p>
          <p className="plan-source">From the strategy comparison file. It can come from a different run than the plan above.</p>
        </div>
      )}
    </div>
  );
}
