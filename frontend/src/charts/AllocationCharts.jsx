import React, { useMemo } from 'react';
import Plot from './PlotlyComponent';
import { usePlotlyTheme } from './usePlotlyTheme';
import { TrendingUp, Layers, HelpCircle, Info } from 'lucide-react';

export default function AllocationCharts({
  allocationData = [],
  strategyData = [],
  isLoading = false
}) {
  const theme = usePlotlyTheme();
  // Aggregate allocation by segment
  const segmentStats = useMemo(() => {
    if (!allocationData || allocationData.length === 0) return [];

    const grouped = {};
    allocationData.forEach((row) => {
      const seg = row.segment || 'Unknown';
      if (!grouped[seg]) {
        grouped[seg] = { segment: seg, count: 0, totalSpend: 0, totalGain: 0 };
      }
      grouped[seg].count += 1;
      grouped[seg].totalSpend += Number(row.discount_amount) || 0;
      grouped[seg].totalGain += Number(row.expected_gain) || 0;
    });

    return Object.values(grouped).sort((a, b) => b.totalGain - a.totalGain);
  }, [allocationData]);

  // Strategy comparison traces
  const strategyTraces = useMemo(() => {
    if (!strategyData || strategyData.length === 0) return [];

    const strategies = strategyData.map((d) => {
      const s = String(d.strategy).toLowerCase();
      if (s === 'blanket') return 'Blanket Discounting';
      if (s === 'random') return 'Random Assignment';
      if (s === 'optimized') return 'Causal DML Optimized';
      return d.strategy;
    });

    const spendValues = strategyData.map((d) => Number(d.total_spend) || 0);
    const gainValues = strategyData.map((d) => Number(d.total_gain) || 0);

    return [
      {
        name: 'Marketing Budget Spend',
        x: strategies,
        y: spendValues,
        type: 'bar',
        marker: { color: 'rgba(148, 163, 184, 0.45)', line: { color: '#94a3b8', width: 1.2 } },
        hovertemplate: '<b>%{x}</b><br>Spend: $%{y:,.0f}<extra></extra>'
      },
      {
        name: 'Total Incremental Revenue Gain',
        x: strategies,
        y: gainValues,
        type: 'bar',
        marker: { 
          color: strategies.map((s) => s.includes('Optimized') ? '#10b981' : '#6366f1'),
          line: { color: 'rgba(255, 255, 255, 0.2)', width: 1 }
        },
        hovertemplate: '<b>%{x}</b><br>Gain: $%{y:,.0f}<extra></extra>'
      }
    ];
  }, [strategyData]);

  // Segment distribution traces
  const segmentTraces = useMemo(() => {
    if (!segmentStats || segmentStats.length === 0) return [];

    const segmentColors = {
      'Persuadables': '#10b981',
      'High-Value Loyal': '#38bdf8',
      'Sure Things': '#94a3b8',
      'Sleeping Dogs': '#f43f5e'
    };

    return [
      {
        x: segmentStats.map((s) => s.segment),
        y: segmentStats.map((s) => s.totalGain),
        type: 'bar',
        marker: {
          color: segmentStats.map((s) => segmentColors[s.segment] || '#6366f1'),
          line: { color: 'rgba(255, 255, 255, 0.15)', width: 1 }
        },
        hovertemplate: '<b>%{x}</b><br>Expected Gain: $%{y:,.2f}<extra></extra>'
      }
    ];
  }, [segmentStats]);

  // Common Plotly Layout
  const commonLayout = {
    autosize: true,
    height: 340,
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
      showgrid: false,
      tickangle: -15,
      color: theme.font.color
    },
    yaxis: {
      tickprefix: '$',
      separatethousands: true,
      showgrid: true,
      gridcolor: theme.gridcolor,
      zerolinecolor: theme.zerolinecolor
    },
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.15,
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
      <div className="panel-card" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div>Loading Budget Allocation Charts...</div>
        </div>
      </div>
    );
  }

  if (strategyData.length === 0 && allocationData.length === 0) {
    return (
      <div className="card-panel" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', maxWidth: 420 }}>
          <Info size={36} color="var(--primary-light)" style={{ marginBottom: '1rem' }} />
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Allocation Data Found</h4>
          <p style={{ fontSize: '0.86rem' }}>
            Ensure <code>strategy_comparison.csv</code> and <code>allocation.csv</code> are present.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
      {/* Chart 1: Strategy Comparison */}
      <div className="card-panel">
        <div className="card-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)' }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="card-heading" style={{ fontSize: '1.05rem' }}>Strategy Comparison (Spend vs Gain)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Blanket vs Random vs Causal Optimization (strategy_comparison.csv)
              </p>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 340 }}>
          <Plot
            data={strategyTraces}
            layout={{
              ...commonLayout,
              barmode: 'group',
              yaxis: { ...commonLayout.yaxis, title: { text: 'Financial Amount ($)', font: { size: 11, color: '#94a3b8' } } }
            }}
            config={config}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        </div>

        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <HelpCircle size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--cyan)' }} />
          <span>
            <strong>Optimization Lift:</strong> For the same $25,000 spend, DML causal allocation achieves over 2.5x
            incremental revenue by eliminating wasteful spending on Sure Things and Sleeping Dogs.
          </span>
        </div>
      </div>

      {/* Chart 2: Expected Gain by Customer Segment */}
      <div className="card-panel">
        <div className="card-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Layers size={18} />
            </div>
            <div>
              <h3 className="card-heading" style={{ fontSize: '1.05rem' }}>Expected Gain by Customer Segment</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Revenue generated across customer clusters (allocation.csv)
              </p>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 340 }}>
          <Plot
            data={segmentTraces}
            layout={{
              ...commonLayout,
              yaxis: { ...commonLayout.yaxis, title: { text: 'Expected Net Gain ($)', font: { size: 11, color: '#94a3b8' } } }
            }}
            config={config}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        </div>

        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <HelpCircle size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--cyan)' }} />
          <span>
            <strong>Resource Concentration:</strong> Almost 85% of total incremental revenue is concentrated in Persuadables
            and High-Value Loyal segments, justifying prioritized budget assignment.
          </span>
        </div>
      </div>
    </div>
  );
}
