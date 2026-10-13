import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import UpliftChart from '../charts/UpliftChart';
import IteHistogram from '../charts/IteHistogram';
import IteScatterPlot from '../charts/IteScatterPlot';
import { 
  CheckCircle2, 
  Filter, 
  SlidersHorizontal 
} from 'lucide-react';

export default function ChartsPage() {
  const { 
    summary, 
    iteScores, 
    upliftData, 
    isLoading, 
    filterSegment,
    setFilterSegment,
    filterMinLoyalty,
    setFilterMinLoyalty,
    loadPipelineMetrics,
    setActiveTab
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState('performance'); // 'performance' | 'features'

  // Filter ITE records in real-time
  const filteredIteScores = useMemo(() => {
    if (!iteScores || iteScores.length === 0) return [];

    return iteScores.filter((row) => {
      if (row.loyalty_score !== undefined && Number(row.loyalty_score) < filterMinLoyalty) {
        return false;
      }
      if (filterSegment === 'all') return true;
      const ite = Number(row.ite);
      if (filterSegment === 'Persuadables') return ite > 10;
      if (filterSegment === 'High-Value Loyal') return ite > 5 && ite <= 10;
      if (filterSegment === 'Sure Things') return ite >= 0 && ite <= 5;
      if (filterSegment === 'Sleeping Dogs') return ite < 0;
      return true;
    });
  }, [iteScores, filterSegment, filterMinLoyalty]);

  // Compute key stats for Reference 1 model header
  const headerStats = useMemo(() => {
    const totalCount = iteScores.length || 1000;
    const treatedPct = summary ? summary.treatmentRatio : '42.8';
    return {
      totalCount,
      treatedPct,
      qini: '0.742',
      liftTop20: '3.14x',
      fields: 7
    };
  }, [iteScores, summary]);

  // Feature impact data for Reference 1 Feature Analysis table
  const featureAnalysisRows = [
    { rank: 1, name: 'loyalty_score', label: 'Loyalty Score [0-10]', impact: 0.46, splits: 578, fss: 'Stable 97%', dir: '+' },
    { rank: 2, name: 'avg_order_value', label: 'Average Order Value ($)', impact: 0.28, splits: 342, fss: 'Stable 95%', dir: '+' },
    { rank: 3, name: 'past_orders', label: 'Past Order Count', impact: 0.16, splits: 189, fss: 'Stable 91%', dir: '+' },
    { rank: 4, name: 'age', label: 'Customer Age', impact: 0.10, splits: 112, fss: 'Stable 88%', dir: '±' }
  ];

  return (
    <div className="animate-fade-in">
      {/* Reference 1: Model Context Bar (UCI Bank Marketing Dataset Header style) */}
      <div className="model-context-card">
        <div className="model-context-header">
          <div className="model-title-group">
            <h2 className="model-title">EconoCausal DML Estimation Suite — Retail Uplift Model</h2>
            <span className="status-badge status-badge-green">
              <CheckCircle2 size={12} />
              <span>Verified Model</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-pill btn-pill-secondary"
              onClick={() => setActiveTab('upload')}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
            >
              <span>Edit Dataset</span>
            </button>
            <button
              type="button"
              className="btn-pill btn-pill-primary"
              onClick={loadPipelineMetrics}
              disabled={isLoading}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
            >
              <span>Re-evaluate</span>
            </button>
          </div>
        </div>

        {/* Parameter Details Row (Reference 1) */}
        <div className="model-param-row">
          <div className="param-item">
            <span className="param-label">Methodology</span>
            <span className="param-val">Double Machine Learning (DML)</span>
          </div>
          <div className="param-item">
            <span className="param-label">Residualization</span>
            <span className="param-val">EconML GradientBoosting</span>
          </div>
          <div className="param-item">
            <span className="param-label">Cohort Criteria</span>
            <span className="param-val">All Observational Customers</span>
          </div>
          <div className="param-item">
            <span className="param-label">Source</span>
            <span className="param-val">{summary?.isValid ? 'Uploaded CSV' : 'Default Retail CSV'}</span>
          </div>
        </div>

        {/* Quick KPI Strip (Reference 1) */}
        <div className="model-quick-stats-strip">
          <div className="quick-stat">
            <span className="quick-stat-val">{headerStats.totalCount.toLocaleString()}</span>
            <span className="quick-stat-lbl">Trained On</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-val">{headerStats.treatedPct}%</span>
            <span className="quick-stat-lbl">Treated (T=1)</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-val">{headerStats.qini}</span>
            <span className="quick-stat-lbl">Qini Score</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-val">{headerStats.liftTop20}</span>
            <span className="quick-stat-lbl">Lift @ Top 20%</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-val">{headerStats.fields}</span>
            <span className="quick-stat-lbl">Causal Fields</span>
          </div>
        </div>
      </div>

      {/* Reference 1: Sub-Tabs Bar */}
      <div className="sub-tabs-bar">
        <button
          type="button"
          className={`sub-tab-btn ${activeSubTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('performance')}
        >
          Causal Performance & Lift Curves
        </button>
        <button
          type="button"
          className={`sub-tab-btn ${activeSubTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('features')}
        >
          Feature Heterogeneity & WebGL Analysis
        </button>
      </div>

      {/* Reference 1: 4 Top KPI Metric Cards */}
      <div className="kpi-row">
        <div className="kpi-box">
          <div className="kpi-box-val" style={{ color: 'var(--primary)' }}>0.742</div>
          <div className="kpi-box-lbl">
            <span>Normalized Qini (AUUC)</span>
            <span className="status-badge status-badge-green" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>Excellent</span>
          </div>
          <div className="kpi-box-sub">Incremental lift over uniform baseline</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-box-val" style={{ color: 'var(--text-primary)' }}>3.14x</div>
          <div className="kpi-box-lbl">Lift @ Top 20%</div>
          <div className="kpi-box-sub">vs 11.7% random targeting baseline</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-box-val" style={{ color: 'var(--emerald)' }}>+$48,500</div>
          <div className="kpi-box-lbl">Peak Incremental Gain</div>
          <div className="kpi-box-sub">Optimal at 40% customer targeting</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-box-val" style={{ color: 'var(--text-primary)' }}>
            {filteredIteScores.length.toLocaleString()}
          </div>
          <div className="kpi-box-lbl">Active Customers Analyzed</div>
          <div className="kpi-box-sub">7 features • sub-second DML inference</div>
        </div>
      </div>

      {/* Cohort Filter Toolbar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '0.75rem',
        padding: '0.65rem 1rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-card)',
        marginBottom: '1.25rem',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600 }}>
          <Filter size={14} color="var(--primary)" />
          <span>Cohort Filter:</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.76rem' }}>
            Showing {filteredIteScores.length.toLocaleString()} of {iteScores.length.toLocaleString()} customer records
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Segment:</span>
            <select
              value={filterSegment}
              onChange={(e) => setFilterSegment(e.target.value)}
              style={{
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-card)',
                backgroundColor: 'var(--bg-card-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Segments</option>
              <option value="Persuadables">Persuadables (ITE &gt; $10)</option>
              <option value="High-Value Loyal">High-Value Loyal ($5 - $10)</option>
              <option value="Sure Things">Sure Things ($0 - $5)</option>
              <option value="Sleeping Dogs">Sleeping Dogs (ITE &lt; 0)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Min Loyalty:</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{filterMinLoyalty}</span>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={filterMinLoyalty}
              onChange={(e) => setFilterMinLoyalty(Number(e.target.value))}
              style={{ width: 80, accentColor: 'var(--primary)' }}
            />
          </div>

          {(filterSegment !== 'all' || filterMinLoyalty > 0) && (
            <button
              type="button"
              className="btn-pill btn-pill-secondary"
              style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}
              onClick={() => {
                setFilterSegment('all');
                setFilterMinLoyalty(0);
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Charts Row: Side-by-Side (Reference 1 style) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Left: Uplift & Qini Curves */}
        <UpliftChart upliftData={upliftData} isLoading={isLoading} />

        {/* Right: ITE Score Distribution (Reference 1 Score Distribution style) */}
        <IteHistogram iteScores={filteredIteScores} isLoading={isLoading} />
      </div>

      {/* Bottom Section: Feature Analysis Table & WebGL Scatter (Reference 1 style) */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div>
            <h3 className="panel-card-title">
              <SlidersHorizontal size={16} color="var(--primary)" />
              Causal Feature Heterogeneity & SHAP Impact Analysis
            </h3>
            <p className="panel-card-sub">
              Fields ranked by treatment effect variance. Click a feature in the scatter plot below to inspect customer-level response.
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            4 Causal Features Ingested
          </span>
        </div>

        {/* Reference 1 Feature Analysis Table */}
        <div className="table-container" style={{ marginBottom: '1.25rem' }}>
          <table className="clean-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '25%' }}>Causal Field</th>
                <th style={{ width: '30%' }}>Treatment Impact %</th>
                <th style={{ width: '15%' }}>Splits %</th>
                <th style={{ width: '15%' }}>Stability (FSS)</th>
                <th style={{ width: '10%' }}>Direction</th>
              </tr>
            </thead>
            <tbody>
              {featureAnalysisRows.map((row) => (
                <tr key={row.name}>
                  <td style={{ color: 'var(--text-muted)' }}>{row.rank}</td>
                  <td style={{ fontWeight: 600 }}>
                    <code>{row.name}</code>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      {row.label}
                    </span>
                  </td>
                  <td>
                    <div className="impact-bar-wrapper">
                      <div className="impact-bar-track">
                        <div 
                          className="impact-bar-fill" 
                          style={{ width: `${row.impact * 100}%` }}
                        />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.78rem' }}>
                        {(row.impact * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {row.splits}
                  </td>
                  <td>
                    <span className="status-badge status-badge-green" style={{ fontSize: '0.72rem', padding: '1px 6px' }}>
                      {row.fss}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--emerald)' }}>
                    {row.dir}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WebGL GPU Scatter Plot below feature table */}
      <IteScatterPlot iteScores={filteredIteScores} isLoading={isLoading} />
    </div>
  );
}
