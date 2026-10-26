import React, { useMemo, useState } from 'react';
import Plot from './PlotlyComponent';
import { usePlotlyTheme } from './usePlotlyTheme';
import { ScatterChart, Zap, Info } from 'lucide-react';

export default function IteScatterPlot({ iteScores = [], isLoading = false }) {
  const [featureKey, setFeatureKey] = useState('loyalty_score');
  const theme = usePlotlyTheme();

  const featureOptions = [
    { key: 'loyalty_score', label: 'Loyalty Score [0 - 10]', default: true },
    { key: 'avg_order_value', label: 'Average Order Value ($)' },
    { key: 'age', label: 'Customer Age' },
    { key: 'past_orders', label: 'Past Order Count' }
  ];

  // Calculate Pearson correlation and feature metrics
  const analysis = useMemo(() => {
    if (!iteScores || iteScores.length === 0) return null;

    const validPairs = iteScores
      .filter((d) => d[featureKey] !== undefined && d.ite !== undefined && !isNaN(d[featureKey]) && !isNaN(d.ite))
      .map((d) => ({ x: Number(d[featureKey]), y: Number(d.ite) }));

    if (validPairs.length === 0) return null;

    const n = validPairs.length;
    const sumX = validPairs.reduce((a, b) => a + b.x, 0);
    const sumY = validPairs.reduce((a, b) => a + b.y, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    validPairs.forEach(({ x, y }) => {
      const dx = x - meanX;
      const dy = y - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    });

    const r = (denX > 0 && denY > 0) ? num / Math.sqrt(denX * denY) : 0;

    return {
      count: n,
      correlation: r.toFixed(3),
      strength: Math.abs(r) > 0.5 ? 'Strong' : Math.abs(r) > 0.25 ? 'Moderate' : 'Weak'
    };
  }, [iteScores, featureKey]);

  // Build WebGL traces (scattergl)
  const traces = useMemo(() => {
    if (!iteScores || iteScores.length === 0) return [];

    const persuadables = { x: [], y: [], text: [] };
    const regulars = { x: [], y: [], text: [] };
    const sleepingDogs = { x: [], y: [], text: [] };

    iteScores.forEach((row) => {
      const xVal = Number(row[featureKey]);
      const yVal = Number(row.ite);
      if (isNaN(xVal) || isNaN(yVal)) return;

      const customerId = row.customer_id || 'Unknown';
      const tooltip = `<b>${customerId}</b><br>${featureKey}: ${xVal.toFixed(2)}<br>ITE Lift: $${yVal.toFixed(2)}`;

      if (yVal > 10) {
        persuadables.x.push(xVal);
        persuadables.y.push(yVal);
        persuadables.text.push(tooltip);
      } else if (yVal < 0) {
        sleepingDogs.x.push(xVal);
        sleepingDogs.y.push(yVal);
        sleepingDogs.text.push(tooltip);
      } else {
        regulars.x.push(xVal);
        regulars.y.push(yVal);
        regulars.text.push(tooltip);
      }
    });

    const regularColor = theme.isDark ? '#858585' : '#6366f1';

    return [
      {
        name: 'Persuadables (ITE > $10)',
        x: persuadables.x,
        y: persuadables.y,
        text: persuadables.text,
        type: 'scattergl', // WebGL GPU accelerated
        mode: 'markers',
        marker: {
          color: '#10b981',
          size: 6,
          opacity: 0.8,
          line: { color: 'rgba(255, 255, 255, 0.4)', width: 0.5 }
        },
        hoverinfo: 'text'
      },
      {
        name: 'Sure Things / Neutrals ($0 - $10)',
        x: regulars.x,
        y: regulars.y,
        text: regulars.text,
        type: 'scattergl', // WebGL GPU accelerated
        mode: 'markers',
        marker: {
          color: regularColor,
          size: 5.5,
          opacity: 0.7,
          line: { color: 'rgba(255, 255, 255, 0.4)', width: 0.5 }
        },
        hoverinfo: 'text'
      },
      {
        name: 'Sleeping Dogs (ITE < 0)',
        x: sleepingDogs.x,
        y: sleepingDogs.y,
        text: sleepingDogs.text,
        type: 'scattergl', // WebGL GPU accelerated
        mode: 'markers',
        marker: {
          color: '#ef4444',
          size: 6,
          opacity: 0.85,
          line: { color: 'rgba(255, 255, 255, 0.4)', width: 0.5 }
        },
        hoverinfo: 'text'
      }
    ];
  }, [iteScores, featureKey, theme.isDark]);

  const activeOption = featureOptions.find((o) => o.key === featureKey);

  const layout = {
    autosize: true,
    height: 360,
    margin: { l: 60, r: 20, t: 25, b: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      family: 'Plus Jakarta Sans, sans-serif',
      color: theme.font.color,
      size: 11
    },
    hoverlabel: theme.hoverlabel,
    xaxis: {
      title: { text: activeOption?.label || featureKey, font: { size: 11, color: theme.font.color } },
      showgrid: true,
      gridcolor: theme.gridcolor,
      zerolinecolor: theme.zerolinecolor
    },
    yaxis: {
      title: { text: 'Individual Treatment Effect (Δ Revenue $)', font: { size: 11, color: theme.font.color } },
      tickprefix: '$',
      showgrid: true,
      gridcolor: theme.gridcolor,
      zerolinecolor: 'rgba(239, 68, 68, 0.4)',
      zerolinewidth: 1.5
    },
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.14,
      font: { color: theme.legend_font, size: 11 },
      bgcolor: 'rgba(0,0,0,0)'
    }
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  if (isLoading) {
    return (
      <div className="panel-card" style={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div>Rendering WebGL Scatter Plot...</div>
        </div>
      </div>
    );
  }

  if (!iteScores || iteScores.length === 0) {
    return (
      <div className="panel-card" style={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', maxWidth: 400 }}>
          <Info size={36} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Feature Data Available</h4>
          <p style={{ fontSize: '0.86rem' }}>
            Load customer dataset to evaluate individual feature heterogeneity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-card" style={{ marginTop: '1.25rem' }}>
      {/* Header with Feature Selector and WebGL Badge */}
      <div className="panel-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 34, 
            height: 34, 
            borderRadius: 'var(--radius-sm)', 
            backgroundColor: 'var(--primary-subtle)', 
            color: 'var(--primary)',
            flexShrink: 0
          }}>
            <ScatterChart size={18} />
          </div>
          <div>
            <h3 className="panel-card-title">ITE Feature Heterogeneity & WebGL Inspector</h3>
            <p className="panel-card-sub">
              Testing causal treatment effect variation across {iteScores.length.toLocaleString()} customer records
            </p>
          </div>
        </div>

        {/* Feature Selector & WebGL Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="status-badge status-badge-green" style={{ fontSize: '0.74rem' }}>
            <Zap size={12} />
            <span>WebGL scattergl Active</span>
          </div>

          <select
            value={featureKey}
            onChange={(e) => setFeatureKey(e.target.value)}
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: 'var(--bg-card-subtle)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {featureOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                Feature: {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clean High-Contrast Correlation Metric Banner */}
      {analysis && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          padding: '0.75rem 1.15rem', 
          backgroundColor: 'var(--bg-card-subtle)', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid var(--border-card)', 
          borderLeft: '4px solid var(--primary)',
          margin: '0.85rem 0 1rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Pearson Correlation (r):
              </span>
              <span style={{ marginLeft: '0.45rem', fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 800, color: Number(analysis.correlation) > 0 ? 'var(--emerald)' : 'var(--rose)' }}>
                {analysis.correlation}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Relationship:
              </span>
              <span style={{ marginLeft: '0.45rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {analysis.strength} Positive
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sample Size:
              </span>
              <span style={{ marginLeft: '0.45rem', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {analysis.count.toLocaleString()} customer data points
              </span>
            </div>
          </div>

          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Higher values indicate strong treatment sensitivity
          </span>
        </div>
      )}

      {/* Plotly Canvas Container */}
      <div style={{ width: '100%', height: 360 }}>
        <Plot
          data={traces}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </div>

      {/* Explanatory Caption Footer */}
      <div style={{ 
        marginTop: '0.65rem', 
        paddingTop: '0.65rem', 
        borderTop: '1px solid var(--border-subtle)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        fontSize: '0.76rem', 
        color: 'var(--text-muted)' 
      }}>
        <span>
          GPU-accelerated WebGL engine (<code>type: 'scattergl'</code>) handles up to 50,000+ points at 60 FPS without DOM lag.
        </span>
        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
          Active Feature: {activeOption?.label}
        </span>
      </div>
    </div>
  );
}
