import { useMemo, useState } from 'react';
import { formatCount, formatMoney } from './format.js';
import { downloadCsv, paginate, sortRows, sumColumn, toCsv } from './tableUtils.js';

const COLUMNS = [
  { key: 'customer_id', label: 'Customer ID', type: 'text' },
  { key: 'discount_amount', label: 'Recommended discount', type: 'number', money: true },
  { key: 'expected_gain', label: 'Expected gain', type: 'number', money: true },
  { key: 'segment', label: 'Segment', type: 'text' },
];

// Allocation matrix: one row per customer, sortable, with a totals row and CSV export.
// rows: objects with customer_id, discount_amount, expected_gain, segment (data/allocation.csv).
// The totals and the CSV cover every row passed in, not only the page on screen.
export default function AllocationTable({
  rows,
  currency = 'USD',
  pageSize = 50,
  fileName = 'allocation_plan.csv',
}) {
  const [sort, setSort] = useState({ key: 'expected_gain', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [seenRows, setSeenRows] = useState(rows);
  if (seenRows !== rows) {
    setSeenRows(rows);
    setPage(1);
  }

  const sorted = useMemo(() => {
    const column = COLUMNS.find((c) => c.key === sort.key);
    return sortRows(rows, sort.key, sort.direction, column ? column.type : 'text');
  }, [rows, sort]);
  const totalSpend = useMemo(() => sumColumn(rows, 'discount_amount'), [rows]);
  const totalGain = useMemo(() => sumColumn(rows, 'expected_gain'), [rows]);
  const { pageRows, page: current, totalPages } = paginate(sorted, page, pageSize);

  function handleSort(column) {
    setPage(1);
    setSort((prev) =>
      prev.key === column.key
        ? { key: column.key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key: column.key, direction: column.type === 'number' ? 'desc' : 'asc' },
    );
  }

  function handleExport() {
    // The file holds the rows in the order currently sorted, with the same columns as allocation.csv.
    downloadCsv(fileName, toCsv(sorted, COLUMNS));
  }

  return (
    <div className="plan-table-block">
      <div className="plan-actions">
        <button type="button" onClick={handleExport} disabled={rows.length === 0}>
          Download CSV
        </button>
        <span className="plan-caption">{formatCount(rows.length)} customers in the plan.</span>
      </div>

      {rows.length === 0 ? (
        <p className="plan-empty">There are no allocation rows to show yet.</p>
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
                      {column.money ? formatMoney(row[column.key], currency) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total, all {formatCount(rows.length)} customers</th>
                <td className="plan-num">{formatMoney(totalSpend, currency)}</td>
                <td className="plan-num">{formatMoney(totalGain, currency)}</td>
                <td />
              </tr>
            </tfoot>
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
