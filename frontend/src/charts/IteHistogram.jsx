import React, { useMemo } from 'react';
import Plot from './PlotlyComponent';
import { usePlotlyTheme } from './usePlotlyTheme';
import { BarChart3, Info } from 'lucide-react';

export default function IteHistogram({ iteScores = [], isLoading = false }) {
  const theme = usePlotlyTheme();

  // Statistics and segment summaries
  const stats = useMemo(() => {
    if (!iteScores || iteScores.length === 0) return null;

    const values = iteScores.map((d) => Number(d.ite)).filter((v) => !isNaN(v));
    const n = values.length;
    if (n === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    const sorted = [...values].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const persuadables = values.filter((v) => v > 10).length;
    const moderatePositive = values.filter((v) => v >= 0 && v <= 10).length;
    const sleepingDogs = values.filter((v) => v < 0).length;

    // P90 quantile
    const p90Index = Math.min(n - 1, Math.floor(n * 0.90));
    const p90 = sorted[p90Index];

    return {
      total: n,
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      stdDev: stdDev.toFixed(2),
      p90: p90.toFixed(2),
      min: sorted[0].toFixed(2),
      max: sorted[n - 1].toFixed(2),
      persuadables,
      persuadablesPct: ((persuadables / n) * 100).toFixed(1),
      moderatePositive,
      moderatePositivePct: ((moderatePositive / n) * 100).toFixed(1),
      sleepingDogs,
      sleepingDogsPct: ((sleepingDogs / n) * 100).toFixed(1)
    };
  }, [iteScores]);

  // Traces for Plotly histogram
  const traces = useMemo(() => {
    if (!iteScores || iteScores.length === 0) return [];

    const values = iteScores.map((d) => Number(d.ite)).filter((v) => !isNaN(v));
    const barColor = theme.isDark ? '#e5e5e5' : '#6366f1';
    const borderColor = theme.isDark ? '#ffffff' : '#4f46e5';

    return [
      {
        x: values,
        type: 'histogram',
        nbinsx: 30,
        marker: {
          color: barColor,
          opacity: 0.85,
          line: { color: borderColor, width: 1 }
        },
        hovertemplate: '<b>Effect Range:</b> $%{x:.2f}<br><b>Customers:</b> %{y:,}<extra></extra>'
      }
    ];
  }, [iteScores, theme.isDark]);

  const layout = {
    autosize: true,
    height: 330,
    margin: { l: 55, r: 20, t: 20, b: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      family: 'Plus Jakarta Sans, sans-serif',
      color: theme.font.color,
      size: 11
    },
    hoverlabel: theme.hoverlabel,
    xaxis: {
      title: { text: 'Individual Treatment Effect ($/Customer Lift)', font: { size: 11, color: theme.font.color } },
      tickprefix: '$',
      showgrid: true,
      gridcolor: theme.gridcolor,
      zerolinecolor: 'rgba(239, 68, 68, 0.5)',
      zerolinewidth: 2
    },
    yaxis: {
      title: { text: 'Customer Frequency', font: { size: 11, color: theme.font.color } },
      showgrid: true,
      gridcolor: theme.gridcolor,
      zerolinecolor: theme.zerolinecolor
    },
    shapes: [
      {
        type: 'line',
        x0: 0,
        x1: 0,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: { color: '#ef4444', width: 1.5, dash: 'dash' }
      }
    ]
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  if (isLoading) {
    return (
      <div className="panel-card" style={{ minHeight: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div>Computing ITE Distribution...</div>
        </div>
      </div>
    );
  }

  if (!iteScores || iteScores.length === 0) {
    return (
      <div className="panel-card" style={{ minHeight: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', maxWidth: 400 }}>
          <Info size={36} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No ITE Score Data</h4>
          <p style={{ fontSize: '0.86rem' }}>
            Upload customer dataset or ensure model scoring pipeline has run.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header (Reference 1 Score Distribution style) */}
      <div className="panel-card-header" style={{ marginBottom: '0.5rem' }}>
        <div>
          <h3 className="panel-card-title">
            <BarChart3 size={17} color="var(--primary)" />
            <span>Score Distribution</span>
          </h3>
          <p className="panel-card-sub">
            Individual Treatment Effect (ITE) spread across {stats?.total.toLocaleString()} customers
          </p>
        </div>

        {stats && (
          <div style={{ 
            fontSize: '0.74rem', 
            fontFamily: 'var(--font-mono)', 
            backgroundColor: 'var(--bg-card-subtle)',
            padding: '0.3rem 0.65rem',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-secondary)'
          }}>
            Median <strong style={{ color: 'var(--text-primary)' }}>${stats.median}</strong> │ Mean <strong style={{ color: 'var(--text-primary)' }}>${stats.mean}</strong> │ P90 <strong style={{ color: 'var(--text-primary)' }}>${stats.p90}</strong>
          </div>
        )}
      </div>

      {/* Plotly Canvas */}
      <div style={{ width: '100%', height: 330 }}>
        <Plot
          data={traces}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </div>

      {/* Reference 1 bottom segmented pill legend */}
      <div style={{ 
        marginTop: '0.5rem', 
        paddingTop: '0.65rem', 
        borderTop: '1px solid var(--border-subtle)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.74rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span className="status-badge status-badge-green" style={{ fontSize: '0.72rem', padding: '1px 6px' }}>
            ● Hot / Persuadables {stats?.persuadablesPct || 0}%
          </span>
          <span className="status-badge" style={{ fontSize: '0.72rem', padding: '1px 6px', color: 'var(--amber-text)', borderColor: 'var(--amber-border)', backgroundColor: 'var(--amber-subtle)' }}>
            ● Neutral {stats?.moderatePositivePct || 0}%
          </span>
          <span className="status-badge" style={{ fontSize: '0.72rem', padding: '1px 6px', color: 'var(--rose-text)', borderColor: 'var(--rose-border)', backgroundColor: 'var(--rose-subtle)' }}>
            ● Sleeping Dogs {stats?.sleepingDogsPct || 0}%
          </span>
        </div>

        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {stats?.total.toLocaleString()} scored
        </span>
      </div>
    </div>
  );
}
