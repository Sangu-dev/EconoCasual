import { useMemo, useState } from 'react';
import { formatCount, formatFixed } from './format.js';
import { DEFAULT_THRESHOLD, SEGMENT_LABELS, countSegments, labelSegment, parseThreshold } from './segments.js';
import { paginate, sortRows } from './tableUtils.js';

const COLUMNS = [
  { key: 'customer_id', label: 'Customer ID', type: 'text' },
  { key: 'ite', label: 'ITE', type: 'number', decimals: 2 },
  { key: 'age', label: 'Age', type: 'number', decimals: 0 },
  { key: 'loyalty_score', label: 'Loyalty score', type: 'number', decimals: 2 },
  { key: 'avg_order_value', label: 'Avg order value', type: 'number', decimals: 2 },
  { key: 'segment', label: 'ITE segment', type: 'text' },
];

// Customer table with sorting, paging and segment labels.
// rows: customers with customer_id, ite, age, loyalty_score, avg_order_value (already filtered).
// totalCount: how many customers there are before filtering.
export default function CustomerTable({
  rows,
  totalCount = rows.length,
  thresholdText,
  onThresholdTextChange,
  pageSize = 50,
}) {
  const parsed = parseThreshold(thresholdText);
  const threshold = parsed ?? DEFAULT_THRESHOLD;

  const [sort, setSort] = useState({ key: 'ite', direction: 'desc' });
  const [page, setPage] = useState(1);
  // Go back to page 1 whenever the rows change (for example after a filter is applied).
  const [seenRows, setSeenRows] = useState(rows);
  if (seenRows !== rows) {
    setSeenRows(rows);
    setPage(1);
  }

  const labelled = useMemo(
    () => rows.map((row) => ({ ...row, segment: labelSegment(row.ite, threshold) })),
    [rows, threshold],
  );
  const counts = useMemo(() => countSegments(rows, threshold), [rows, threshold]);
  const sorted = useMemo(() => {
    const column = COLUMNS.find((c) => c.key === sort.key);
    return sortRows(labelled, sort.key, sort.direction, column ? column.type : 'text');
  }, [labelled, sort]);
  const { pageRows, page: current, totalPages } = paginate(sorted, page, pageSize);

  function handleSort(column) {
    setPage(1);
    setSort((prev) =>
      prev.key === column.key
        ? { key: column.key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key: column.key, direction: column.type === 'number' ? 'desc' : 'asc' },
    );
  }

  return (
    <div className="plan-table-block">
      <div className="plan-segment-bar">
        <div className="plan-field plan-threshold">
          <label htmlFor="segment-threshold">Persuadable threshold (ITE above)</label>
          <input
            id="segment-threshold"
            type="text"
            inputMode="decimal"
            value={thresholdText}
            onChange={(event) => onThresholdTextChange(event.target.value)}
            aria-invalid={parsed === null ? 'true' : 'false'}
          />
          {parsed === null && (
            <p className="plan-error" role="alert">
              Enter a number of zero or more. Using {DEFAULT_THRESHOLD} until this is fixed.
            </p>
          )}
        </div>
        <ul className="plan-chips" aria-label="Customers per segment">
          {SEGMENT_LABELS.map((label) => (
            <li key={label}>
              {label}: <strong>{formatCount(counts[label])}</strong>
            </li>
          ))}
        </ul>
      </div>

      <p className="plan-hint">
        These labels come from each customer's ITE and the threshold above. The allocation plan has its own segments, taken from its file.
      </p>

      <p className="plan-caption">
        Showing {formatCount(rows.length)} of {formatCount(totalCount)} customers.
      </p>

      {rows.length === 0 ? (
        <p className="plan-empty">No customers match the filters. Clear a filter to see more.</p>
      ) : (
        <div className="plan-scroll">
          <table className="plan-table">
            <thead>
              <tr>
                {COLUMNS.map((column) => {
                  const active = sort.key === column.key;
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      className={column.type === 'number' ? 'plan-num' : undefined}
                      aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <button type="button" className="plan-sort" onClick={() => handleSort(column)}>
                        {column.label}
                        <span aria-hidden="true">{active ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : ''}</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, index) => (
                <tr key={`${row.customer_id}-${index}`}>
                  {COLUMNS.map((column) => (
                    <td key={column.key} className={column.type === 'number' ? 'plan-num' : undefined}>
                      {column.type === 'number' ? formatFixed(row[column.key], column.decimals) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="plan-pager">
        <button type="button" onClick={() => setPage(current - 1)} disabled={current <= 1}>
          Previous
        </button>
        <span>
          Page {current} of {totalPages}
        </span>
        <button type="button" onClick={() => setPage(current + 1)} disabled={current >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
