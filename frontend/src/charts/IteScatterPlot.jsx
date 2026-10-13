import React, { useMemo, useState } from 'react';
import Plot from './PlotlyComponent';
import { usePlotlyTheme } from './usePlotlyTheme';
import { ScatterChart, Zap, HelpCircle, Info } from 'lucide-react';

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

    // Segregate into segments for clear visual clarity
    const persuadables = { x: [], y: [], text: [] };
    const regulars = { x: [], y: [], text: [] };
    const sleepingDogs = { x: [], y: [], text: [] };

    iteScores.forEach((row) => {
      const xVal = Number(row[featureKey]);
      const yVal = Number(row.ite);
      if (isNaN(xVal) || isNaN(yVal)) return;

      const customerId = row.customer_id || 'Unknown';
      const tooltip = `<b>${customerId}</b><br>${featureKey}: ${xVal.toFixed(2)}<br>ITE: $${yVal.toFixed(2)}`;

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
          opacity: 0.75,
          line: { color: 'rgba(255, 255, 255, 0.2)', width: 0.5 }
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
          color: '#6366f1',
          size: 5,
          opacity: 0.65
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
          color: '#f43f5e',
          size: 6,
          opacity: 0.8
        },
        hoverinfo: 'text'
      }
    ];
  }, [iteScores, featureKey]);

  const activeOption = featureOptions.find((o) => o.key === featureKey);

  const layout = {
    autosize: true,
    height: 380,
    margin: { l: 65, r: 25, t: 25, b: 55 },
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
      zerolinecolor: 'rgba(244, 63, 94, 0.4)',
      zerolinewidth: 1.5
    },
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.12,
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
      <div className="panel-card" style={{ minHeight: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div>Rendering WebGL Scatter Plot...</div>
        </div>
      </div>
    );
  }

  if (!iteScores || iteScores.length === 0) {
    return (
      <div className="panel-card" style={{ minHeight: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', maxWidth: 400 }}>
          <Info size={36} color="var(--primary-light)" style={{ marginBottom: '1rem' }} />
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Feature Data Available</h4>
          <p style={{ fontSize: '0.86rem' }}>
            Upload a CSV containing customer features or ensure <code>mock_ite.json</code> is accessible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-panel">
      {/* Header with Feature Selector and WebGL Badge */}
      <div className="card-header-row" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--cyan)' }}>
            <ScatterChart size={20} />
          </div>
          <div>
            <h3 className="card-heading">ITE Feature Correlation (WebGL)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Testing feature effect heterogeneity across {iteScores.length.toLocaleString()} customer records
            </p>
          </div>
        </div>

        {/* Feature Selector & WebGL Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="status-pill" style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: 'var(--cyan)' }}>
            <Zap size={13} />
            <span>WebGL scattergl Active</span>
          </div>

          <select
            value={featureKey}
            onChange={(e) => setFeatureKey(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
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

      {/* Correlation Metric Banner */}
      {analysis && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '0.75rem 1rem', background: 'rgba(8, 12, 20, 0.45)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', margin: '1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pearson Correlation (r): </span>
              <strong style={{ fontSize: '0.95rem', color: Number(analysis.correlation) > 0 ? '#10b981' : '#f43f5e' }}>
                {analysis.correlation}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Relationship: </span>
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{analysis.strength}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sample Size: </span>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{analysis.count.toLocaleString()} data points</span>
            </div>
          </div>
        </div>
      )}

      {/* Plotly Canvas Container */}
      <div style={{ width: '100%', height: 420 }}>
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
          <strong>GPU-Accelerated Performance:</strong> This chart renders via WebGL (<code>type: 'scattergl'</code>).
          Unlike DOM-based SVG that stutters beyond a few thousand elements, WebGL handles 50,000+ points at 60 FPS.
          Notice how customer loyalty influences treatment sensitivity—high loyalty customers often show higher treatment responsiveness.
        </span>
      </div>
    </div>
  );
}
