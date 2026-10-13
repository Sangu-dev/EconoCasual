import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import AllocationCharts from '../charts/AllocationCharts';
import { 
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
      {/* Top Controls Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Budget Allocation & Strategy Optimization
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Constrained knapsack optimization allocating marketing discount offers to maximize incremental ROI.
          </p>
        </div>

        {/* Budget Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
          <DollarSign size={15} color="var(--primary)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Constrained Budget:</span>
          <select
            value={budget}
            onChange={(e) => handleBudgetChange(Number(e.target.value))}
            style={{
              background: 'transparent',
              color: 'var(--text-primary)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value={10000}>$10,000</option>
            <option value={25000}>$25,000 (Recommended)</option>
            <option value={50000}>$50,000</option>
            <option value={100000}>$100,000</option>
          </select>
        </div>
      </div>

      {/* 4 KPI Cards Row (Reference 1 & 3 style) */}
      <div className="kpi-row">
        <div className="kpi-box">
          <div className="kpi-box-val" style={{ color: 'var(--text-primary)' }}>
            ${summaryMetrics.totalBudget.toLocaleString()}
          </div>
          <div className="kpi-box-lbl">
            <span>Marketing Budget</span>
            <DollarSign size={13} color="var(--primary)" />
          </div>
          <div className="kpi-box-sub">Total discount spend constraint</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-box-val" style={{ color: 'var(--primary)' }}>
            {summaryMetrics.targetedCount.toLocaleString()}
          </div>
          <div className="kpi-box-lbl">
            <span>Targeted Customers</span>
            <Target size={13} color="var(--primary)" />
          </div>
          <div className="kpi-box-sub">{summaryMetrics.targetedPct}% of total customer pool</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-box-val" style={{ color: 'var(--emerald)' }}>
            +${summaryMetrics.totalGain.toLocaleString()}
          </div>
          <div className="kpi-box-lbl">
            <span>Expected Revenue Lift</span>
            <TrendingUp size={13} color="var(--emerald)" />
          </div>
          <div className="kpi-box-sub">Avg +${summaryMetrics.avgGainPerCustomer} per targeted unit</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-box-val" style={{ color: 'var(--text-primary)' }}>
            {summaryMetrics.projectedRoi}%
          </div>
          <div className="kpi-box-lbl">
            <span>Projected Incremental ROI</span>
            <CheckCircle2 size={13} color="var(--amber)" />
          </div>
          <div className="kpi-box-sub">{(Number(summaryMetrics.projectedRoi) / 100).toFixed(1)}x return on marketing spend</div>
        </div>
      </div>

      {/* Allocation Charts Component */}
      <AllocationCharts
        allocationData={allocationData}
        strategyData={strategyData}
        isLoading={isLoading}
      />

      {/* Customer Allocation Table (Reference 1 & 3 style) */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div>
            <h3 className="panel-card-title">
              <TableIcon size={16} color="var(--primary)" />
              Customer Allocation Plan & Recommendations
            </h3>
            <p className="panel-card-sub">
              Target assignments calculated under bounded optimization (allocation.csv)
            </p>
          </div>

          {/* Filters & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search Customer ID..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.35rem 0.65rem 0.35rem 1.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-card)',
                  background: 'var(--bg-card-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  outline: 'none',
                  width: 170
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
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-card)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                outline: 'none'
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
        <div className="table-container">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Causal Segment</th>
                <th>Allocated Discount</th>
                <th>Expected Net Gain</th>
                <th>Action Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No customer allocation records found.
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
                          className={`status-badge ${
                            row.segment === 'Persuadables' ? 'status-badge-green' : 
                            row.segment === 'Sleeping Dogs' ? '' : 
                            'status-badge-blue'
                          }`}
                          style={{ fontSize: '0.72rem', padding: '1px 8px' }}
                        >
                          {row.segment}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        ${discount.toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 700, color: gain > 0 ? 'var(--emerald)' : 'var(--text-muted)' }}>
                        {gain > 0 ? `+$${gain.toFixed(2)}` : '$0.00'}
                      </td>
                      <td>
                        {discount > 0 ? (
                          <span style={{ color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600 }}>
                            <CheckCircle2 size={13} />
                            Deploy Discount Offer
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
                            Exclude (Margin Protection)
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
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing {filteredRows.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * rowsPerPage, filteredRows.length)} of {filteredRows.length.toLocaleString()} records
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn-pill btn-pill-secondary"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.74rem' }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0 0.4rem' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn-pill btn-pill-secondary"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.74rem' }}
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
