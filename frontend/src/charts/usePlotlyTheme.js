import { useState, useEffect } from 'react';

export function usePlotlyTheme() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setIsDark(currentTheme === 'dark');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  if (isDark) {
    return {
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      plot_bgcolor: 'rgba(15, 22, 38, 0.45)',
      font: {
        family: "'Plus Jakarta Sans', system-ui, sans-serif",
        color: '#94a3b8',
        size: 11
      },
      gridcolor: 'rgba(255, 255, 255, 0.05)',
      zerolinecolor: 'rgba(255, 255, 255, 0.12)',
      hoverlabel: {
        bgcolor: '#141e33',
        bordercolor: '#6366f1',
        font: { color: '#f8fafc', family: "'Plus Jakarta Sans', sans-serif" }
      },
      legend_bg: 'rgba(15, 22, 38, 0.65)',
      legend_font: '#e2e8f0'
    };
  }

  // Light theme colors (Default)
  return {
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    plot_bgcolor: '#ffffff',
    font: {
      family: "'Plus Jakarta Sans', system-ui, sans-serif",
      color: '#475569',
      size: 11
    },
    gridcolor: '#f1f5f9',
    zerolinecolor: '#e2e8f0',
    hoverlabel: {
      bgcolor: '#ffffff',
      bordercolor: '#4f46e5',
      font: { color: '#0f172a', family: "'Plus Jakarta Sans', sans-serif" }
    },
    legend_bg: 'rgba(255, 255, 255, 0.85)',
    legend_font: '#0f172a'
  };
}
