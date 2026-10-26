// Helpers shared by the tables: number conversion, sorting, paging, filtering and CSV export.

export function toNumber(value) {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined) return NaN;
  const text = String(value).trim();
  return text === '' ? NaN : Number(text);
}

export function sumColumn(rows, key) {
  let total = 0;
  for (const row of rows) {
    const n = toNumber(row[key]);
    if (Number.isFinite(n)) total += n;
  }
  return total;
}

// Sorts a copy of the rows. Numeric columns are converted to numbers first, so 9 comes before 10.
// Empty or non-numeric values always go to the end, whatever the direction.
export function sortRows(rows, key, direction = 'asc', type = 'text') {
  const dir = direction === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    if (type === 'number') {
      const x = toNumber(a[key]);
      const y = toNumber(b[key]);
      const xMissing = Number.isNaN(x);
      const yMissing = Number.isNaN(y);
      if (xMissing && yMissing) return 0;
      if (xMissing) return 1;
      if (yMissing) return -1;
      return (x - y) * dir;
    }
    const left = String(a[key] ?? '');
    const right = String(b[key] ?? '');
    return left.localeCompare(right, undefined, { numeric: true }) * dir;
  });
}

export function paginate(rows, page, pageSize) {
  const size = Math.max(1, Math.floor(pageSize) || 1);
  const totalPages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const start = (current - 1) * size;
  return { pageRows: rows.slice(start, start + size), page: current, totalPages };
}

export const EMPTY_FILTERS = {
  search: '',
  iteMin: '',
  iteMax: '',
  loyaltyMin: '',
  loyaltyMax: '',
};

// A box that is empty or not a number is ignored, so typing "-" does not wipe the table.
export function readBound(text) {
  const n = toNumber(text);
  return Number.isFinite(n) ? n : null;
}

function inRange(value, min, max) {
  if (min === null && max === null) return true;
  const n = toNumber(value);
  if (!Number.isFinite(n)) return false;
  if (min !== null && n < min) return false;
  if (max !== null && n > max) return false;
  return true;
}

export function applyFilters(rows, filters) {
  const search = String(filters.search ?? '').trim().toLowerCase();
  const iteMin = readBound(filters.iteMin);
  const iteMax = readBound(filters.iteMax);
  const loyaltyMin = readBound(filters.loyaltyMin);
  const loyaltyMax = readBound(filters.loyaltyMax);
  return rows.filter((row) => {
    if (search && !String(row.customer_id ?? '').toLowerCase().includes(search)) return false;
    if (!inRange(row.ite, iteMin, iteMax)) return false;
    if (!inRange(row.loyalty_score, loyaltyMin, loyaltyMax)) return false;
    return true;
  });
}

function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Header row uses the column keys, so the file has the same columns as data/allocation.csv.
export function toCsv(rows, columns) {
  const header = columns.map((c) => csvCell(c.key)).join(',');
  const lines = rows.map((row) => columns.map((c) => csvCell(row[c.key])).join(','));
  return [header, ...lines].join('\n') + '\n';
}

// Browser only: build a Blob, point a temporary link at it and click it.
export function downloadCsv(fileName, csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
