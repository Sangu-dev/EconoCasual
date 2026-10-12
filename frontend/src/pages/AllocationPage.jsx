import React from 'react';
import { useData } from '../context/DataContext';
import { PieChart, TrendingUp, DollarSign, Target, CheckCircle2 } from 'lucide-react';

export default function AllocationPage() {
  const { summary } = useData();

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <PieChart className="text-primary" size={32} />
            Budget Optimization & Segment Allocation
          </h1>
          <p className="page-desc">
            Allocates discount budgets to maximize incremental revenue ROI using SciPy optimization
            under finite marketing constraints. Scheduled for Stage 4 (24–30 Oct).
          </p>
        </div>

        <div className="status-pill">
          <span className="status-indicator-dot" />
          <span>Stage 4 Staging Area</span>
        </div>
      </div>

      {/* KPI Cards Preview */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Marketing Budget</span>
            <DollarSign size={16} color="var(--primary-light)" />
          </div>
          <div className="kpi-value">$25,000</div>
          <div className="kpi-subtext">Constrained marketing spend</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Targeted Customers</span>
            <Target size={16} color="var(--cyan)" />
          </div>
          <div className="kpi-value">
            {summary ? Math.round(summary.totalRows * 0.35).toLocaleString() : '350'}
          </div>
          <div className="kpi-subtext">35% top persuadable tier</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Expected Revenue Lift</span>
            <TrendingUp size={16} color="var(--emerald)" />
          </div>
          <div className="kpi-value">+$74,200</div>
          <div className="kpi-subtext">Optimal vs Blanket allocation</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Projected Incremental ROI</span>
            <CheckCircle2 size={16} color="var(--amber)" />
          </div>
          <div className="kpi-value">296.8%</div>
          <div className="kpi-subtext">3.0x return on discount spend</div>
        </div>
      </div>

      {/* Architecture Plan */}
      <div className="card-panel">
        <div className="card-header-row">
          <h3 className="card-heading">
            <TrendingUp size={18} color="var(--cyan)" />
            Stage 4 Implementation Blueprint (Role C Scope)
          </h3>
          <span className="badge-role">Week 3 Milestone</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          In Stage 4, this page will integrate with Role B's optimization outputs (<code>allocation.csv</code> and <code>strategy_comparison.csv</code>) 
          and connect directly to Role A's FastAPI backend via <code>src/api/client.js</code>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(8, 12, 20, 0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '0.35rem' }}>Strategy Comparison</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Side-by-side bar chart evaluating <code>Blanket Discounting</code> vs <code>Random Assignment</code> vs <code>Causal Optimized</code>.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(8, 12, 20, 0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '0.35rem' }}>Segment Distribution</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Segment breakdown of dollars allocated to Persuadables, High-Value, and At-Risk customer clusters.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(8, 12, 20, 0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '0.35rem' }}>FastAPI Client Bridge</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Asynchronous <code>fetchOptimalAllocation(budget)</code> client linking React frontend to Python backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
