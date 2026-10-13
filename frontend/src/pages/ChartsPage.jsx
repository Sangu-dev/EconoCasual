import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import UpliftChart from '../charts/UpliftChart';
import IteHistogram from '../charts/IteHistogram';
import IteScatterPlot from '../charts/IteScatterPlot';
import { 
  LineChart, 
  Filter, 
  Database, 
  RefreshCw,
  Info
} from 'lucide-react';

export default function ChartsPage() {
  const { 
    summary, 
    iteScores, 
    upliftData, 
    isLoading, 
    apiStatus,
    filterSegment,
    setFilterSegment,
    filterMinLoyalty,
    setFilterMinLoyalty,
    loadPipelineMetrics,
    setActiveTab
  } = useData();

  // Filter ITE records in real-time based on active filters
  const filteredIteScores = useMemo(() => {
    if (!iteScores || iteScores.length === 0) return [];

    return iteScores.filter((row) => {
      // 1. Loyalty filter
      if (row.loyalty_score !== undefined && Number(row.loyalty_score) < filterMinLoyalty) {
        return false;
      }

      // 2. Segment filter
      if (filterSegment === 'all') return true;
      const ite = Number(row.ite);
      if (filterSegment === 'Persuadables') return ite > 10;
      if (filterSegment === 'High-Value Loyal') return ite > 5 && ite <= 10;
      if (filterSegment === 'Sure Things') return ite >= 0 && ite <= 5;
      if (filterSegment === 'Sleeping Dogs') return ite < 0;
      return true;
    });
  }, [iteScores, filterSegment, filterMinLoyalty]);

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <LineChart className="text-primary" size={32} />
            Causal Model Evaluation & ITE Analytics Suite
          </h1>
          <p className="page-desc">
            Evaluate Double Machine Learning (DML) policy uplift against theoretical Oracle benchmarks,
            inspect treatment effect heterogeneity, and explore customer feature responsiveness with GPU-accelerated WebGL.
          </p>
        </div>

        {/* Status and Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="status-pill" style={{ borderColor: apiStatus === 'online' ? 'var(--emerald-border)' : 'var(--border-accent)', color: apiStatus === 'online' ? '#6ee7b7' : 'var(--primary-light)' }}>
            <span className="status-indicator-dot" />
            <span>{apiStatus === 'online' ? 'FastAPI Connected' : 'Offline Mock Data Contract'}</span>
          </div>

          <button
            className="btn btn-secondary"
            onClick={loadPipelineMetrics}
            disabled={isLoading}
            title="Refresh metrics from API or data files"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            Sync Data
          </button>
        </div>
      </div>

      {/* Dataset State Banner */}
      {!summary?.isValid ? (
        <div className="alert-banner alert-info" style={{ marginBottom: '1.5rem' }}>
          <Info size={22} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="alert-heading">Notice: Visualizing Reference Pipeline Model</div>
            <div className="alert-body">
              Displaying benchmark results from <code>uplift_curve.csv</code> and <code>mock_ite.json</code> (Role D handoff). 
              You can upload your own raw customer data on the Ingestion page to validate new cohorts.
            </div>
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            onClick={() => setActiveTab('upload')}
          >
            Upload Custom Data →
          </button>
        </div>
      ) : (
        <div className="alert-banner alert-success" style={{ marginBottom: '1.5rem' }}>
          <Database size={22} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="alert-heading">Active Ingestion Context Synchronized</div>
            <div className="alert-body">
              Verified dataset containing <strong>{summary.totalRows.toLocaleString()} customers</strong> is synchronized. 
              {iteScores.length.toLocaleString()} ITE predictions loaded for causal analysis.
            </div>
          </div>
        </div>
      )}

      {/* Interactive Linked Filter Bar (Fulfills Stage 3 & Role D integration) */}
      <div className="card-panel" style={{ marginBottom: '1.75rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
            <Filter size={18} color="var(--primary-light)" />
            <span>Interactive Cohort Filters</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              (Active Cohort: {filteredIteScores.length.toLocaleString()} / {iteScores.length.toLocaleString()})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Segment Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="segment-filter" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Target Segment:
              </label>
              <select
                id="segment-filter"
                value={filterSegment}
                onChange={(e) => setFilterSegment(e.target.value)}
                style={{
                  padding: '0.35rem 0.75rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem'
                }}
              >
                <option value="all">All Segments</option>
                <option value="Persuadables">Persuadables (ITE &gt; $10)</option>
                <option value="High-Value Loyal">High-Value Loyal ($5 - $10)</option>
                <option value="Sure Things">Sure Things ($0 - $5)</option>
                <option value="Sleeping Dogs">Sleeping Dogs (ITE &lt; 0)</option>
              </select>
            </div>

            {/* Min Loyalty Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label htmlFor="loyalty-slider" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Min Loyalty: <strong style={{ color: 'var(--cyan)' }}>{filterMinLoyalty}</strong>
              </label>
              <input
                id="loyalty-slider"
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={filterMinLoyalty}
                onChange={(e) => setFilterMinLoyalty(Number(e.target.value))}
                style={{ width: 100, accentColor: 'var(--primary)' }}
              />
            </div>

            {(filterSegment !== 'all' || filterMinLoyalty > 0) && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                onClick={() => {
                  setFilterSegment('all');
                  setFilterMinLoyalty(0);
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chart Section 1: Uplift & Qini Curves */}
      <div style={{ marginBottom: '1.75rem' }}>
        <UpliftChart upliftData={upliftData} isLoading={isLoading} />
      </div>

      {/* Chart Section 2 & 3: ITE Distribution Histogram & WebGL Feature Scatter Plot */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <IteHistogram iteScores={filteredIteScores} isLoading={isLoading} />
        <IteScatterPlot iteScores={filteredIteScores} isLoading={isLoading} />
      </div>
    </div>
  );
}
