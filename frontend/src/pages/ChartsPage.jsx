import React from 'react';
import { useData } from '../context/DataContext';
import { LineChart, BarChart3, ScatterChart, Info, Database, Layers } from 'lucide-react';

export default function ChartsPage() {
  const { dataset, summary, iteScores, setActiveTab } = useData();

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <LineChart className="text-primary" size={32} />
            Causal Uplift & ITE Visualization Suite
          </h1>
          <p className="page-desc">
            Visualizing the Individual Treatment Effect (ITE) and cumulative incremental gain curves (Uplift & Qini).
            Scheduled for Stage 2 (17–23 Oct) integration with Plotly.js.
          </p>
        </div>

        <div className="status-pill">
          <span className="status-indicator-dot" />
          <span>Stage 2 Staging Area (Plotly Suite)</span>
        </div>
      </div>

      {/* Dataset Status Banner */}
      {!summary?.isValid ? (
        <div className="alert-banner alert-info" style={{ marginBottom: '1.75rem' }}>
          <Info size={24} style={{ flexShrink: 0 }} />
          <div>
            <div className="alert-heading">Notice: Observing Default Pipeline State</div>
            <div className="alert-body">
              No verified dataset is currently active. You can still inspect mock ITE state loaded across pages via 
              <code>DataContext</code>, or return to Upload to load <code>sample_retail.csv</code>.
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ marginTop: '0.75rem', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              onClick={() => setActiveTab('upload')}
            >
              ← Go to CSV Ingestion
            </button>
          </div>
        </div>
      ) : (
        <div className="alert-banner alert-success" style={{ marginBottom: '1.75rem' }}>
          <Database size={24} style={{ flexShrink: 0 }} />
          <div>
            <div className="alert-heading">Dataset Synchronized via Shared DataContext</div>
            <div className="alert-body">
              Active dataset contains <strong>{summary.totalRows.toLocaleString()}</strong> customer records ready for 
              DML inference. {iteScores.length} mock ITE scores loaded for cross-page development.
            </div>
          </div>
        </div>
      )}

      {/* Cross-page Shared State Verification Card (Task T4) */}
      <div className="card-panel" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header-row">
          <h3 className="card-heading">
            <Layers size={20} color="var(--primary-light)" />
            Task T4: Shared Application State Verification (DataContext)
          </h3>
          <span className="badge-role">React Context • Role D Mock Contract</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          This view verifies that customer features and ITE predictions are accessible globally across views 
          from <code>mock_ite.json</code> (provided under inbound handoff contract from Role D).
        </p>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Mock ITE Records Loaded</div>
            <div className="kpi-value">{iteScores.length}</div>
            <div className="kpi-subtext">From /mock_ite.json</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Estimated Persuadables (ITE &gt; $10)</div>
            <div className="kpi-value">
              {iteScores.filter((r) => r.ite > 10).length}
            </div>
            <div className="kpi-subtext">High uplift segment to target</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Sure Things / Neutrals (0 ≤ ITE ≤ 10)</div>
            <div className="kpi-value">
              {iteScores.filter((r) => r.ite >= 0 && r.ite <= 10).length}
            </div>
            <div className="kpi-subtext">Do not waste marketing budget</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Sleeping Dogs (ITE &lt; 0)</div>
            <div className="kpi-value">
              {iteScores.filter((r) => r.ite < 0).length}
            </div>
            <div className="kpi-subtext">Negative response to discounts</div>
          </div>
        </div>
      </div>

      {/* Stage 2 Roadmap Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div className="card-panel">
          <div className="card-header-row">
            <h3 className="card-heading">
              <LineChart size={18} color="var(--cyan)" />
              Uplift & Qini Curves
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 18 Oct</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Plots Model Gain (DML ranking) vs Oracle Gain (true effect) vs Random baseline. Evaluates Area Under Uplift Curve (AUUC).
          </p>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(8, 12, 20, 0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Component: <code>frontend/src/charts/UpliftChart.jsx</code><br/>
            Contract: <code>fraction_targeted, model_gain, oracle_gain, random_gain</code>
          </div>
        </div>

        <div className="card-panel">
          <div className="card-header-row">
            <h3 className="card-heading">
              <BarChart3 size={18} color="var(--primary-light)" />
              ITE Score Distribution
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 19 Oct</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Histogram illustrating treatment effect heterogeneity across customers. Proves that uniform blanket discounting is inefficient.
          </p>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(8, 12, 20, 0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Component: <code>frontend/src/charts/IteHistogram.jsx</code><br/>
            Metric: $\Delta \text{Revenue} = Y(1) - Y(0)$
          </div>
        </div>

        <div className="card-panel">
          <div className="card-header-row">
            <h3 className="card-heading">
              <ScatterChart size={18} color="var(--emerald)" />
              WebGL Feature Scatter Plots
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 21 Oct</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Interactive scatter plots connecting ITE scores to customer loyalty and order values with 60 FPS performance using <code>scattergl</code>.
          </p>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(8, 12, 20, 0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Acceleration: WebGL GPU rendering (50,000 records)<br/>
            Contract: <code>data/ite_scores.csv</code>
          </div>
        </div>
      </div>
    </div>
  );
}
