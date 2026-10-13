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
  Activity, 
  GitBranch,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';

function DashboardContent() {
  const { activeTab, setActiveTab, summary, fileName, apiStatus } = useData();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('econocausal_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('econocausal_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const navItems = [
    { id: 'upload', label: 'CSV Ingestion', icon: FileSpreadsheet, pageTitle: 'Data Ingestion & Schema Engine' },
    { id: 'charts', label: 'Causal Charts', icon: LineChart, pageTitle: 'Causal Model Evaluation & ITE Analytics' },
    { id: 'allocation', label: 'Budget Allocation', icon: PieChart, pageTitle: 'Budget Optimization & Strategy Allocation' },
    { id: 'about', label: 'Methodology', icon: HelpCircle, pageTitle: 'Methodology, Scientific Logic & Architecture' }
  ];

  const currentNav = navItems.find((item) => item.id === activeTab) || navItems[0];

  return (
    <div className="app-shell">
      {/* Sidebar Navigation (Reference 3) */}
      <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`} aria-label="Sidebar Navigation">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-badge">
            <div className="brand-icon">
              <Activity size={20} />
            </div>
            {!isSidebarCollapsed && (
              <div className="brand-text">
                <span className="brand-title">EconoCausal</span>
                <span className="brand-subtitle">Double ML Pricing</span>
              </div>
            )}
          </div>

          <button 
            type="button"
            className="btn btn-secondary btn-icon" 
            style={{ width: 28, height: 28, border: 'none' }}
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Metadata */}
        <div className="sidebar-footer">
          {!isSidebarCollapsed && (
            <div className="role-badge" title="Git Branch: sangamesh-ragam">
              <GitBranch size={13} color="var(--primary)" />
              <span>Role C • Sangamesh Ragam</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="app-main">
        {/* Top Bar (Reference 3) */}
        <header className="app-topbar">
          <div className="topbar-title-area">
            <h1 className="page-main-heading">{currentNav.pageTitle}</h1>
          </div>

          <div className="topbar-actions">
            {/* Active Data Pill */}
            {summary && summary.isValid ? (
              <div className="status-pill">
                <span className="status-dot" />
                <span>{summary.totalRows.toLocaleString()} Customers Active {fileName ? `(${fileName})` : ''}</span>
              </div>
            ) : (
              <div className="status-pill">
                <Database size={13} style={{ color: 'var(--text-muted)' }} />
                <span>Default Reference Pipeline</span>
              </div>
            )}

            {/* API Status Pill */}
            <div className="status-pill" title={apiStatus === 'online' ? 'Connected to FastAPI backend' : 'Using agreed mock contracts'}>
              <span className={`status-dot ${apiStatus === 'online' ? '' : 'offline'}`} />
              <span>{apiStatus === 'online' ? 'FastAPI Online' : 'Mock Data Mode'}</span>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
              aria-label="Toggle color theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="content-viewport">
          {activeTab === 'upload' && <UploadPage />}
          {activeTab === 'charts' && <ChartsPage />}
          {activeTab === 'allocation' && <AllocationPage />}
          {activeTab === 'about' && <AboutPage />}
        </main>

        {/* Clean Footer */}
        <footer className="app-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <GitBranch size={14} color="var(--primary)" />
            <span>Branch: <code>sangamesh-ragam</code> • Role C: Frontend Engineer</span>
          </div>
          <div>
            <span>EconoCausal: Dynamic Pricing via Double Machine Learning • Infotact Solutions</span>
          </div>
        </footer>
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
