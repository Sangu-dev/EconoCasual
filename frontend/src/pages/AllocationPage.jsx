import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import AllocationCharts from '../charts/AllocationCharts';
import { 
  PieChart, 
  DollarSign, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Search, 
  Table as TableIcon
} from 'lucide-react';

export default function AllocationPage() {
  const { 
    allocationData, 
    strategyData, 
    budget, 
    setBudget, 
    isLoading 
  } = useData();

  const [tableSearch, setTableSearch] = useState('');
  const [tableSegment, setTableSegment] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Compute budget summary KPIs
  const summaryMetrics = useMemo(() => {
    if (!allocationData || allocationData.length === 0) {
      return {
        totalBudget: budget,
        targetedCount: 0,
        targetedPct: '0.0',
        totalGain: 0,
        projectedRoi: '0.0',
        avgGainPerCustomer: '0.00'
      };
    }

    let targetedCount = 0;
    let totalSpend = 0;
    let totalGain = 0;

    allocationData.forEach((row) => {
      const discount = Number(row.discount_amount) || 0;
      const gain = Number(row.expected_gain) || 0;
      if (discount > 0) {
        targetedCount += 1;
        totalSpend += discount;
      }
      totalGain += gain;
    });

    const activeSpend = totalSpend > 0 ? totalSpend : budget;
    const roi = activeSpend > 0 ? ((totalGain / activeSpend) * 100).toFixed(1) : '0.0';
    const targetedPct = ((targetedCount / allocationData.length) * 100).toFixed(1);
    const avgGain = targetedCount > 0 ? (totalGain / targetedCount).toFixed(2) : '0.00';

    return {
      totalBudget: activeSpend,
      targetedCount,
      targetedPct,
      totalGain: Math.round(totalGain),
      projectedRoi: roi,
      avgGainPerCustomer: avgGain
    };
  }, [allocationData, budget]);

  // Filter and paginate allocation table
  const filteredRows = useMemo(() => {
    if (!allocationData || allocationData.length === 0) return [];

    return allocationData.filter((row) => {
      const matchSearch = tableSearch.trim() === '' || 
        String(row.customer_id).toLowerCase().includes(tableSearch.toLowerCase().trim());
      const matchSegment = tableSegment === 'all' || row.segment === tableSegment;
      return matchSearch && matchSegment;
    });
  }, [allocationData, tableSearch, tableSegment]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage]);

  const handleBudgetChange = (newBudget) => {
    setBudget(newBudget);
    setCurrentPage(1);
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <PieChart className="text-primary" size={32} />
            Budget Optimization & Resource Allocation Engine
          </h1>
          <p className="page-desc">
            Allocates marketing discount budgets to maximize net incremental revenue ROI under finite marketing constraints.
            Visualizes SciPy optimization outputs and strategic comparisons across customer cohorts.
          </p>
        </div>

        {/* Budget Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <DollarSign size={16} color="var(--primary-light)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Campaign Budget:</span>
          <select
            value={budget}
            onChange={(e) => handleBudgetChange(Number(e.target.value))}
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.6rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value={10000}>$10,000</option>
            <option value={25000}>$25,000 (Recommended)</option>
            <option value={50000}>$50,000</option>
            <option value={100000}>$100,000</option>
          </select>
        </div>
      </div>

      {/* Top KPI Cards Preview */}
      <div className="kpi-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Allocated Budget</span>
            <DollarSign size={16} color="var(--primary-light)" />
          </div>
          <div className="kpi-value">${summaryMetrics.totalBudget.toLocaleString()}</div>
          <div className="kpi-subtext">Constrained marketing spend</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Targeted Customers</span>
            <Target size={16} color="var(--cyan)" />
          </div>
          <div className="kpi-value">{summaryMetrics.targetedCount.toLocaleString()}</div>
          <div className="kpi-subtext">{summaryMetrics.targetedPct}% of total customer pool</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Expected Revenue Lift</span>
            <TrendingUp size={16} color="var(--emerald)" />
          </div>
          <div className="kpi-value">+${summaryMetrics.totalGain.toLocaleString()}</div>
          <div className="kpi-subtext">Avg +${summaryMetrics.avgGainPerCustomer} per targeted unit</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Projected Incremental ROI</span>
            <CheckCircle2 size={16} color="var(--amber)" />
          </div>
          <div className="kpi-value">{summaryMetrics.projectedRoi}%</div>
          <div className="kpi-subtext">{(Number(summaryMetrics.projectedRoi) / 100).toFixed(1)}x return on discount dollars</div>
        </div>
      </div>

      {/* Allocation Charts Component */}
      <AllocationCharts
        allocationData={allocationData}
        strategyData={strategyData}
        isLoading={isLoading}
      />

      {/* Customer Allocation Table (Integration Area Owned jointly with Role D) */}
      <div className="card-panel">
        <div className="card-header-row" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <TableIcon size={18} color="var(--cyan)" />
              <h3 className="card-heading">Customer Allocation Plan</h3>
              <span className="badge-role">Role D Shared Interface Contract</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Inspection table for customer-level discount assignments derived from <code>data/allocation.csv</code>
            </p>
          </div>

          {/* Table Filters & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search Customer ID..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.4rem 0.75rem 0.4rem 2rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  width: 180
                }}
              />
            </div>

            <select
              value={tableSegment}
              onChange={(e) => {
                setTableSegment(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.4rem 0.75rem',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem'
              }}
            >
              <option value="all">All Segments</option>
              <option value="Persuadables">Persuadables</option>
              <option value="High-Value Loyal">High-Value Loyal</option>
              <option value="Sure Things">Sure Things</option>
              <option value="Sleeping Dogs">Sleeping Dogs</option>
            </select>
          </div>
        </div>

        {/* Allocation Table */}
        <div className="table-wrapper" style={{ marginTop: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Causal Segment</th>
                <th>Assigned Discount</th>
                <th>Expected Net Gain</th>
                <th>Action Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No customer allocation records matching filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const discount = Number(row.discount_amount) || 0;
                  const gain = Number(row.expected_gain) || 0;

                  return (
                    <tr key={row.customer_id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.customer_id}</td>
                      <td>
                        <span 
                          className={`col-tag ${
                            row.segment === 'Persuadables' ? 'col-tag-matched' : 
                            row.segment === 'Sleeping Dogs' ? 'col-tag-missing' : 
                            'col-tag-extra'
                          }`}
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          {row.segment}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: discount > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        ${discount.toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 700, color: gain > 0 ? '#34d399' : 'var(--text-muted)' }}>
                        {gain > 0 ? `+$${gain.toFixed(2)}` : '$0.00'}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {discount > 0 ? (
                          <span style={{ color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <CheckCircle2 size={13} />
                            Deploy Discount Offer
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>
                            Exclude (Preserve Margin)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Showing {filteredRows.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * rowsPerPage, filteredRows.length)} of {filteredRows.length.toLocaleString()} customers
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '0 0.5rem' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
