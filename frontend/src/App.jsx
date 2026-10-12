import React from 'react';
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
  ExternalLink
} from 'lucide-react';

function DashboardContent() {
  const { activeTab, setActiveTab, summary, fileName } = useData();

  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <header className="top-navbar">
        <div className="brand-section">
          <div className="brand-logo-badge">
            <Activity size={24} />
          </div>
          <div className="brand-info">
            <span className="brand-title">EconoCausal</span>
            <span className="brand-subtitle">Causal ML Uplift & Resource Allocation Engine</span>
          </div>
        </div>

        {/* 4 Primary Navigation Tabs */}
        <nav className="nav-tabs" aria-label="Main Navigation">
          <button 
            className={`nav-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <FileSpreadsheet size={16} />
            CSV Ingestion
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            <LineChart size={16} />
            Causal Charts
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'allocation' ? 'active' : ''}`}
            onClick={() => setActiveTab('allocation')}
          >
            <PieChart size={16} />
            Budget Allocation
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <HelpCircle size={16} />
            Methodology & Guide
          </button>
        </nav>

        {/* Status Indicators & Metadata */}
        <div className="header-status-group">
          {summary && summary.isValid ? (
            <div className="status-pill" style={{ borderColor: 'var(--emerald-border)', color: '#6ee7b7' }}>
              <span className="status-indicator-dot" />
              <span>{summary.totalRows.toLocaleString()} Customers Active</span>
            </div>
          ) : (
            <div className="status-pill" style={{ color: 'var(--text-muted)' }}>
              <Database size={13} />
              <span>No Dataset Loaded</span>
            </div>
          )}

          <div className="badge-role" title="Git Branch: sangamesh-ragam">
            Role C • Sangamesh Ragam
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="main-viewport">
        {activeTab === 'upload' && <UploadPage />}
        {activeTab === 'charts' && <ChartsPage />}
        {activeTab === 'allocation' && <AllocationPage />}
        {activeTab === 'about' && <AboutPage />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <GitBranch size={15} color="var(--primary-light)" />
          <span>Branch: <code>sangamesh-ragam</code> • Stage 1 Deliverable (10–16 Oct 2026)</span>
        </div>
        <div>
          <span>Infotact Solutions • Data Science & ML Internship • Team Group 25</span>
        </div>
      </footer>
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
