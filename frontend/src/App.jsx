import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  RefreshCw,
  X,
  Target,
  Layers,
  ArrowRight
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'upload', label: 'CSV Ingestion', icon: FileSpreadsheet, pageTitle: 'Data Ingestion & Column Mapping' },
  { id: 'charts', label: 'Model Evaluation', icon: LineChart, pageTitle: 'Causal ML Uplift & ITE Analytics' },
  { id: 'allocation', label: 'Budget Allocation', icon: PieChart, pageTitle: 'Optimal Resource & Discount Allocation' },
  { id: 'about', label: 'Methodology & Guide', icon: HelpCircle, pageTitle: 'Scientific Principles & System Architecture' }
];

function DashboardContent() {
  const { 
    activeTab, 
    setActiveTab, 
    summary, 
    apiStatus, 
    loadPipelineMetrics, 
    isLoading,
    searchQuery,
    setSearchQuery,
    setFilterSegment,
    iteScores,
    allocationData
  } = useData();

  const [theme, setTheme] = useState(() => localStorage.getItem('econocausal_theme') || 'light');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('econocausal_theme', theme);
  }, [theme]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const currentNav = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];

  // Dynamic search results across cohorts, metrics, customers, and pages
  const searchResults = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return { cohorts: [], metrics: [], customers: [], pages: [] };

    // 1. Cohorts
    const allCohorts = [
      { name: 'Persuadables', sub: 'ITE > $10 • Optimal discount responders', segment: 'Persuadables' },
      { name: 'High-Value Loyal', sub: 'ITE $5–$10 • Strong baseline loyalty', segment: 'High-Value Loyal' },
      { name: 'Sure Things', sub: 'ITE $0–$5 • Margin erosion risk without lift', segment: 'Sure Things' },
      { name: 'Sleeping Dogs', sub: 'ITE < 0 • Negative responders (exclude from discounts)', segment: 'Sleeping Dogs' },
      { name: 'Lost Causes', sub: 'ITE ≈ 0 • Non-responsive to marketing interventions', segment: 'all' }
    ];
    const cohorts = allCohorts.filter(c => c.name.toLowerCase().includes(q) || c.sub.toLowerCase().includes(q));

    // 2. Metrics & Models
    const allMetrics = [
      { name: 'Normalized Qini Score (0.742 AUUC)', sub: 'Cumulative gain over arbitrary targeting', tab: 'charts' },
      { name: 'Lift @ Top 20% (3.14x)', sub: 'Response multiplier vs 11.7% random baseline', tab: 'charts' },
      { name: 'Peak Incremental Gain (+$48,500)', sub: 'Optimal ROI at 40% targeting cutoff', tab: 'charts' },
      { name: 'Double Machine Learning (DML)', sub: 'Frisch-Waugh-Lovell confounding removal', tab: 'about' },
      { name: 'Knapsack Budget Optimization', sub: 'Bounded discount allocation strategy', tab: 'allocation' },
      { name: 'Pearson Correlation (r = 0.916)', sub: 'Feature heterogeneity sensitivity analysis', tab: 'charts' }
    ];
    const metrics = allMetrics.filter(m => m.name.toLowerCase().includes(q) || m.sub.toLowerCase().includes(q));

    // 3. Customer records
    const sourceData = iteScores.length > 0 ? iteScores : allocationData;
    const customers = sourceData
      .filter(c => String(c.customer_id).toLowerCase().includes(q))
      .slice(0, 4)
      .map(c => ({
        id: c.customer_id,
        segment: c.segment || (Number(c.ite) > 10 ? 'Persuadables' : 'Neutrals'),
        ite: c.ite !== undefined ? Number(c.ite).toFixed(2) : (c.expected_gain ? Number(c.expected_gain).toFixed(2) : '15.00')
      }));

    // 4. Navigation Pages
    const pages = NAV_ITEMS.filter(p => p.label.toLowerCase().includes(q) || p.pageTitle.toLowerCase().includes(q));

    return { cohorts, metrics, customers, pages };
  }, [searchQuery, iteScores, allocationData]);

  const hasAnyResults = 
    searchResults.cohorts.length > 0 || 
    searchResults.metrics.length > 0 || 
    searchResults.customers.length > 0 || 
    searchResults.pages.length > 0;

  const handleSelectCohort = (segment) => {
    setFilterSegment(segment);
    setActiveTab('charts');
    setIsSearchOpen(false);
  };

  const handleSelectMetric = (tab) => {
    setActiveTab(tab);
    setIsSearchOpen(false);
  };

  const handleSelectCustomer = (customerId) => {
    setSearchQuery(String(customerId));
    setActiveTab('allocation');
    setIsSearchOpen(false);
  };

  const handleSelectPage = (pageId) => {
    setActiveTab(pageId);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

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
          {NAV_ITEMS.map((item) => {
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

            {/* Interactive Search Box Container */}
            <div className="topbar-search-container" ref={searchContainerRef}>
              <div className="topbar-search-box">
                <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  className="topbar-search-input"
                  placeholder="Search customer cohort or metric..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  aria-label="Search customer cohort or metric"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="topbar-search-clear"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    title="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Live Search Results Dropdown */}
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <div className="search-dropdown-menu animate-fade-in" role="listbox">
                  {/* Cohorts Results */}
                  {searchResults.cohorts.length > 0 && (
                    <div>
                      <div className="search-result-category">Customer Cohorts</div>
                      {searchResults.cohorts.map((cohort) => (
                        <button
                          key={cohort.name}
                          type="button"
                          className="search-result-item"
                          onClick={() => handleSelectCohort(cohort.segment)}
                        >
                          <div className="search-result-label">
                            <Target size={14} color="var(--primary)" />
                            <span>{cohort.name}</span>
                          </div>
                          <span className="search-result-sub">{cohort.sub}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Causal Metrics Results */}
                  {searchResults.metrics.length > 0 && (
                    <div>
                      <div className="search-result-category">Causal Metrics & Models</div>
                      {searchResults.metrics.map((metric) => (
                        <button
                          key={metric.name}
                          type="button"
                          className="search-result-item"
                          onClick={() => handleSelectMetric(metric.tab)}
                        >
                          <div className="search-result-label">
                            <LineChart size={14} color="var(--emerald)" />
                            <span>{metric.name}</span>
                          </div>
                          <span className="search-result-sub">{metric.sub}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Customer IDs Results */}
                  {searchResults.customers.length > 0 && (
                    <div>
                      <div className="search-result-category">Customer ID Records</div>
                      {searchResults.customers.map((cust) => (
                        <button
                          key={cust.id}
                          type="button"
                          className="search-result-item"
                          onClick={() => handleSelectCustomer(cust.id)}
                        >
                          <div className="search-result-label">
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{cust.id}</span>
                            <span className="status-badge" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                              {cust.segment}
                            </span>
                          </div>
                          <span className="search-result-sub" style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald)' }}>
                            +${cust.ite} lift
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Navigation Pages Results */}
                  {searchResults.pages.length > 0 && (
                    <div>
                      <div className="search-result-category">Views & Navigation</div>
                      {searchResults.pages.map((page) => (
                        <button
                          key={page.id}
                          type="button"
                          className="search-result-item"
                          onClick={() => handleSelectPage(page.id)}
                        >
                          <div className="search-result-label">
                            <Layers size={14} color="var(--text-secondary)" />
                            <span>{page.label}</span>
                          </div>
                          <ArrowRight size={12} color="var(--text-tertiary)" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No Results Fallback */}
                  {!hasAnyResults && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No cohorts, metrics, or customers found matching "<strong>{searchQuery}</strong>".
                    </div>
                  )}
                </div>
              )}
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
