import React, { useMemo } from 'react';
import Plot from './PlotlyComponent';
import { usePlotlyTheme } from './usePlotlyTheme';
import { BarChart3, Info, HelpCircle } from 'lucide-react';

export default function IteHistogram({ iteScores = [], isLoading = false }) {
  const theme = usePlotlyTheme();
  // Statistics and segment summaries
  const stats = useMemo(() => {
    if (!iteScores || iteScores.length === 0) return null;

    const values = iteScores.map((d) => Number(d.ite)).filter((v) => !isNaN(v));
    if (values.length === 0) return null;

    const n = values.length;
    const sum = values.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;

    const sorted = [...values].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const persuadables = values.filter((v) => v > 10).length;
    const moderatePositive = values.filter((v) => v >= 0 && v <= 10).length;
    const sleepingDogs = values.filter((v) => v < 0).length;

    return {
      total: n,
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      stdDev: stdDev.toFixed(2),
      min: sorted[0].toFixed(2),
      max: sorted[n - 1].toFixed(2),
      persuadables,
      persuadablesPct: ((persuadables / n) * 100).toFixed(1),
      moderatePositive,
      sleepingDogs,
      sleepingDogsPct: ((sleepingDogs / n) * 100).toFixed(1)
    };
  }, [iteScores]);

  // Traces for Plotly histogram
  const traces = useMemo(() => {
    if (!iteScores || iteScores.length === 0) return [];

    const values = iteScores.map((d) => Number(d.ite)).filter((v) => !isNaN(v));

    return [
      {
        x: values,
        type: 'histogram',
        nbinsx: 35,
        marker: {
          color: values.map((v) => (v < 0 ? '#f43f5e' : v > 10 ? '#10b981' : '#6366f1')),
          line: { color: 'rgba(255, 255, 255, 0.1)', width: 1 }
        },
        hovertemplate: '<b>ITE Range:</b> %{x:.2f}<br><b>Customers:</b> %{y:,} records<extra></extra>'
      }
    ];
  }, [iteScores]);

  const layout = {
    autosize: true,
    height: 380,
    margin: { l: 60, r: 25, t: 30, b: 50 },
    paper_bgcolor: theme.paper_bgcolor,
    plot_bgcolor: theme.plot_bgcolor,
    font: theme.font,
    hoverlabel: theme.hoverlabel,
    xaxis: {
      title: { text: 'Individual Treatment Effect (Δ Revenue $)', font: { size: 11, color: theme.font.color } },
      tickprefix: '$',
      showgrid: true,
      gridcolor: theme.gridcolor,
      zerolinecolor: 'rgba(244, 63, 94, 0.6)',
      zerolinewidth: 2
    },
    yaxis: {
      title: { text: 'Customer Frequency', font: { size: 11, color: theme.font.color } },
      showgrid: true,
      gridcolor: theme.gridcolor,
      zerolinecolor: theme.zerolinecolor
    },
    shapes: [
      // Vertical line marker at ITE = 0
      {
        type: 'line',
        x0: 0,
        x1: 0,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: { color: '#f43f5e', width: 2, dash: 'dashdot' }
      }
    ],
    annotations: [
      {
        x: 0,
        y: 1,
        yref: 'paper',
        text: 'Zero Effect Boundary',
        showarrow: false,
        font: { size: 10, color: '#f43f5e' },
        xanchor: 'center',
        yanchor: 'bottom'
      }
    ]
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d']
  };

  if (isLoading) {
    return (
      <div className="card-panel" style={{ minHeight: 440, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="status-indicator-dot" style={{ display: 'inline-block', marginBottom: '1rem', width: 14, height: 14 }} />
          <div>Computing ITE Distribution...</div>
        </div>
      </div>
    );
  }

  if (!iteScores || iteScores.length === 0) {
    return (
      <div className="card-panel" style={{ minHeight: 440, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', maxWidth: 400 }}>
          <Info size={36} color="var(--primary-light)" style={{ marginBottom: '1rem' }} />
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No ITE Score Data</h4>
          <p style={{ fontSize: '0.86rem' }}>
            Upload customer data or ensure <code>mock_ite.json</code> / <code>ite_scores.csv</code> is available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-panel">
      {/* Header */}
      <div className="card-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)' }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 className="card-heading">ITE Distribution & Treatment Heterogeneity</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Variation of Individual Treatment Effects across {stats?.total.toLocaleString()} customers
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', margin: '1rem 0' }}>
          <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(8, 12, 20, 0.45)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mean ITE</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>+${stats.mean}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Std Dev: ${stats.stdDev}</div>
          </div>

          <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(8, 12, 20, 0.45)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Median ITE</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>+${stats.median}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Range: [${stats.min}, ${stats.max}]</div>
          </div>

          <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--emerald-border)' }}>
            <div style={{ fontSize: '0.7rem', color: '#6ee7b7', textTransform: 'uppercase' }}>Persuadables (ITE &gt; $10)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399' }}>{stats.persuadables}</div>
            <div style={{ fontSize: '0.7rem', color: '#a7f3d0' }}>{stats.persuadablesPct}% of customer base</div>
          </div>

          <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(244, 63, 94, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--rose-border)' }}>
            <div style={{ fontSize: '0.7rem', color: '#fca5a5', textTransform: 'uppercase' }}>Sleeping Dogs (ITE &lt; 0)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fb7185' }}>{stats.sleepingDogs}</div>
            <div style={{ fontSize: '0.7rem', color: '#fecdd3' }}>{stats.sleepingDogsPct}% negative responders</div>
          </div>
        </div>
      )}

      {/* Plot */}
      <div style={{ width: '100%', height: 380, marginTop: '0.5rem' }}>
        <Plot
          data={traces}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </div>

      {/* Explanatory Caption */}
      <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <HelpCircle size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--cyan)' }} />
        <span>
          <strong>Why Heterogeneity Matters:</strong> If treatment effects were homogeneous, all customers would cluster tightly around the mean.
          The wide variance (from ${stats?.min} to ${stats?.max}) proves that discounting everyone uniformly burns marketing budget on customers who either buy anyway or buy less.
        </span>
      </div>
    </div>
  );
}
