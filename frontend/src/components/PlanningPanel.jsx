import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import AllocationTable from './AllocationTable.jsx';
import { BudgetProvider } from './BudgetContext.jsx';
import BudgetForm from './BudgetForm.jsx';
import CustomerTable from './CustomerTable.jsx';
import Filters from './Filters.jsx';
import SummaryText from './SummaryText.jsx';
import { ALLOCATION_FILES } from './allocationFiles.js';
import { formatCount, formatMoney } from './format.js';
import { checkPlan, pickAllocationFile } from './planCheck.js';
import { EMPTY_FILTERS, applyFilters } from './tableUtils.js';
import { useBudget } from './useBudget.js';
import './planning.css';

const CUSTOMERS_URL = '/mock_ite.json';
const STRATEGY_URL = '/strategy_comparison.csv';

async function loadFile(url, kind) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url} (status ${response.status}).`);
  if (kind === 'json') {
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error(`${url} should contain a list of customers.`);
    return data;
  }
  const text = await response.text();
  return Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: 'greedy' }).data;
}

function useRemote(url, kind) {
  const [state, setState] = useState({ url: null, data: null, error: '' });
  useEffect(() => {
    let cancelled = false;
    loadFile(url, kind)
      .then((data) => {
        if (!cancelled) setState({ url, data, error: '' });
      })
      .catch((error) => {
        if (!cancelled) setState({ url, data: null, error: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [url, kind]);
  const loading = state.url !== url;
  return { data: loading ? null : state.data, error: loading ? '' : state.error, loading };
}

function Status({ resource, name }) {
  if (resource.loading) return <p className="plan-caption">Loading {name}...</p>;
  if (resource.error) return <p className="plan-error" role="alert">{resource.error}</p>;
  return null;
}

function PlanCheck({ rows, settings, currency }) {
  const check = useMemo(() => checkPlan(rows, settings), [rows, settings]);
  if (!check.ready) {
    return <p className="plan-empty">Fix the budget settings to see how the plan compares with them.</p>;
  }
  const budget = formatMoney(settings.totalBudget, currency);
  const spend = formatMoney(check.spend, currency);
  return (
    <ul className="plan-check">
      <li>
        {check.withinBudget
          ? `The plan spends ${spend}, which is within the ${budget} budget.`
          : `The plan spends ${spend}, which is ${formatMoney(check.overBudgetBy, currency)} over the ${budget} budget.`}
      </li>
      <li>
        At {formatMoney(settings.costPerDiscount, currency)} per discount, the budget covers up to{' '}
        {formatCount(check.affordableDiscounts)} discounts. The plan gives {formatCount(check.targeted)}.
      </li>
      <li>
        {check.aboveMaxDiscount === 0
          ? `No discount is above the maximum of ${formatMoney(settings.maxDiscount, currency)}.`
          : `${formatCount(check.aboveMaxDiscount)} discounts are above the maximum of ${formatMoney(settings.maxDiscount, currency)}.`}
      </li>
      <li>
        {check.belowMinGain === 0
          ? `Every discounted customer has an expected gain of at least ${formatMoney(settings.minExpectedGain, currency)}.`
          : `${formatCount(check.belowMinGain)} discounted customers have an expected gain below ${formatMoney(settings.minExpectedGain, currency)}.`}
      </li>
    </ul>
  );
}

function PanelContent({ currency, currencySymbol }) {
  const { settings } = useBudget();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [thresholdText, setThresholdText] = useState('5');

  const customers = useRemote(CUSTOMERS_URL, 'json');
  const strategies = useRemote(STRATEGY_URL, 'csv');

  const allocationFile = useMemo(
    () => pickAllocationFile(ALLOCATION_FILES, settings ? settings.totalBudget : NaN),
    [settings],
  );
  const allocation = useRemote(allocationFile.url, 'csv');

  const customerRows = customers.data;
  const filteredCustomers = useMemo(
    () => (customerRows ? applyFilters(customerRows, filters) : []),
    [customerRows, filters],
  );

  return (
    <div className="plan-panel">
      <section>
        <h2>Budget settings</h2>
        <BudgetForm currencySymbol={currencySymbol} />
      </section>

      <section>
        <h2>Plan summary</h2>
        <Status resource={allocation} name="the allocation plan" />
        <Status resource={strategies} name="the strategy comparison" />
        <SummaryText
          allocationRows={allocation.data ?? []}
          strategyRows={strategies.data ?? []}
          currency={currency}
        />
      </section>

      <section>
        <h2>Plan check</h2>
        <PlanCheck rows={allocation.data ?? []} settings={settings} currency={currency} />
      </section>

      <section>
        <h2>Allocation plan</h2>
        <p className="plan-caption">
          {allocationFile.budget === null
            ? 'Showing the current plan file. Budget-specific plan files have not been added yet.'
            : `Showing the plan built for a budget of ${formatMoney(allocationFile.budget, currency)}.`}
        </p>
        <AllocationTable rows={allocation.data ?? []} currency={currency} />
      </section>

      <section>
        <h2>Customers</h2>
        <Status resource={customers} name="the customer scores" />
        <Filters filters={filters} onChange={setFilters} />
        <CustomerTable
          rows={filteredCustomers}
          totalCount={customerRows ? customerRows.length : 0}
          thresholdText={thresholdText}
          onThresholdTextChange={setThresholdText}
        />
      </section>
    </div>
  );
}

// Planning view: budget form, summary, plan check, allocation table and customer table in one place.
export default function PlanningPanel({ currency = 'USD', currencySymbol = '$' }) {
  return (
    <BudgetProvider>
      <PanelContent currency={currency} currencySymbol={currencySymbol} />
    </BudgetProvider>
  );
}
