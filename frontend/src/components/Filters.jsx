import { EMPTY_FILTERS, readBound } from './tableUtils.js';

const RANGE_FIELDS = [
  { minKey: 'iteMin', maxKey: 'iteMax', label: 'ITE' },
  { minKey: 'loyaltyMin', maxKey: 'loyaltyMax', label: 'Loyalty score' },
];

function boundError(text) {
  const trimmed = String(text ?? '').trim();
  if (trimmed === '') return false;
  return readBound(trimmed) === null;
}

// Filter controls for the customer table. The parent keeps the filter values,
// so other components (for example charts) can read the same state.
export default function Filters({ filters, onChange }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="plan-filters" role="group" aria-label="Customer filters">
      <div className="plan-field">
        <label htmlFor="filter-search">Search customer ID</label>
        <input
          id="filter-search"
          type="search"
          autoComplete="off"
          value={filters.search}
          onChange={(event) => update('search', event.target.value)}
        />
      </div>

      {RANGE_FIELDS.map(({ minKey, maxKey, label }) => {
        const minBad = boundError(filters[minKey]);
        const maxBad = boundError(filters[maxKey]);
        const lo = readBound(filters[minKey]);
        const hi = readBound(filters[maxKey]);
        const swapped = lo !== null && hi !== null && lo > hi;
        return (
          <fieldset className="plan-range" key={minKey}>
            <legend>{label} range</legend>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Min"
              aria-label={`${label} minimum`}
              aria-invalid={minBad ? 'true' : 'false'}
              value={filters[minKey]}
              onChange={(event) => update(minKey, event.target.value)}
            />
            <input
              type="text"
              inputMode="decimal"
              placeholder="Max"
              aria-label={`${label} maximum`}
              aria-invalid={maxBad ? 'true' : 'false'}
              value={filters[maxKey]}
              onChange={(event) => update(maxKey, event.target.value)}
            />
            {(minBad || maxBad) && (
              <p className="plan-error">Enter numbers only. This box is ignored until it is a number.</p>
            )}
            {swapped && <p className="plan-error">The minimum is higher than the maximum, so no customers match.</p>}
          </fieldset>
        );
      })}

      <button type="button" onClick={() => onChange({ ...EMPTY_FILTERS })}>
        Clear filters
      </button>
    </div>
  );
}
