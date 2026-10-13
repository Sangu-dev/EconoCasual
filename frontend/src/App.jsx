import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import UploadPage from './pages/UploadPage';
import ChartsPage from './pages/ChartsPage';
import AllocationPage from './pages/AllocationPage';
import AboutPage from './pages/AboutPage';
import { 
  FileSpreadsheet, 
  LineChart, 
  PieChart, 
  HelpCircle, 
  Database, 
  GitBranch,
  Sun,
  Moon,
  Search,
  RefreshCw
} from 'lucide-react';

function DashboardContent() {
  const { activeTab, setActiveTab, summary, apiStatus, loadPipelineMetrics, isLoading } = useData();
  const [theme, setTheme] = useState(() => localStorage.getItem('econocausal_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('econocausal_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const navItems = [
    { id: 'upload', label: 'CSV Ingestion', icon: FileSpreadsheet, pageTitle: 'Data Ingestion & Column Mapping' },
    { id: 'charts', label: 'Model Evaluation', icon: LineChart, pageTitle: 'Causal ML Uplift & ITE Analytics' },
    { id: 'allocation', label: 'Budget Allocation', icon: PieChart, pageTitle: 'Optimal Resource & Discount Allocation' },
    { id: 'about', label: 'Methodology & Guide', icon: HelpCircle, pageTitle: 'Scientific Principles & Team Architecture' }
  ];

  const currentNav = navItems.find((item) => item.id === activeTab) || navItems[0];

  return (
    <div className="app-shell">
      {/* Mindweave Inspired Sidebar (Reference 3) */}
      <aside className="app-sidebar" aria-label="Sidebar Navigation">
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-badge">
            <div className="brand-icon-box">E</div>
            <div className="brand-title">
              Econo<span>Causal</span>.
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-menu-label">Analytics Engine</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="role-pill" title="Git Branch: sangamesh-ragam">
            <GitBranch size={12} color="var(--primary)" />
            <span>Role C • Sangamesh Ragam</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0.25rem 0' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Theme:</span>
            <button
              type="button"
              className="btn-pill btn-pill-secondary"
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon size={12} /> : <Sun size={12} />}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="app-main">
        {/* Top Bar (Reference 1 & 3) */}
        <header className="app-topbar">
          <div className="topbar-left">
            <h1 className="page-title-text">{currentNav.pageTitle}</h1>
            <div className="topbar-search-box">
              <Search size={14} />
              <span>Search customer cohort or metric...</span>
            </div>
          </div>

          <div className="topbar-right">
            {/* Active Data Pill */}
            {summary && summary.isValid ? (
              <div className="status-badge status-badge-green">
                <span className="status-badge-dot" />
                <span>{summary.totalRows.toLocaleString()} Records Active</span>
              </div>
            ) : (
              <div className="status-badge">
                <Database size={12} style={{ color: 'var(--text-muted)' }} />
                <span>Default Retail Pipeline</span>
              </div>
            )}

            {/* FastAPI Status Pill */}
            <div className="status-badge status-badge-blue">
              <span className={`status-badge-dot ${apiStatus === 'online' ? '' : 'amber'}`} />
              <span>{apiStatus === 'online' ? 'FastAPI Online' : 'Mock Mode'}</span>
            </div>

            {/* Sync / Train Button */}
            <button
              type="button"
              className="btn-pill btn-pill-primary"
              onClick={loadPipelineMetrics}
              disabled={isLoading}
              title="Refresh models and metrics"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>Sync Pipeline</span>
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="content-area">
          {activeTab === 'upload' && <UploadPage />}
          {activeTab === 'charts' && <ChartsPage />}
          {activeTab === 'allocation' && <AllocationPage />}
          {activeTab === 'about' && <AboutPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <DashboardContent />
    </DataProvider>
  );
}
