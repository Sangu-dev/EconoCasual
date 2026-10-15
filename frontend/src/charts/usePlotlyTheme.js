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
      isDark: true,
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      plot_bgcolor: 'rgba(21, 21, 21, 0.7)',
      font: {
        family: "'Plus Jakarta Sans', system-ui, sans-serif",
        color: '#b0b0b0',
        size: 11
      },
      gridcolor: '#222222',
      zerolinecolor: '#333333',
      hoverlabel: {
        bgcolor: '#1b1b1b',
        bordercolor: '#383838',
        font: { color: '#f5f5f5', family: "'Plus Jakarta Sans', sans-serif" }
      },
      legend_bg: 'rgba(21, 21, 21, 0.85)',
      legend_font: '#f5f5f5'
    };
  }

  // Light theme colors (Default)
  return {
    isDark: false,
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
