import React, { useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { REQUIRED_COLUMNS } from '../constants/schema';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  Columns, 
  Percent, 
  DollarSign, 
  RotateCcw,
  Sparkles,
  FileWarning,
  Table as TableIcon
} from 'lucide-react';

export default function UploadPage() {
  const { 
    dataset, 
    fileName, 
    fileSize, 
    summary, 
    validationError, 
    isLoading, 
    parseCsvFile, 
    loadSampleData, 
    loadInvalidSample, 
    resetDataset,
    setActiveTab
  } = useData();

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        parseCsvFile(file);
      } else {
        alert('Please upload a valid CSV file (.csv format)');
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      parseCsvFile(e.target.files[0]);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Page Title & Context Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileSpreadsheet className="text-primary" size={32} />
            CSV Data Ingestion & Schema Engine
          </h1>
          <p className="page-desc">
            Client-side CSV parser using PapaParse. Upload your observational retail customer data
            to validate against Double Machine Learning (DML) input contracts before causal estimation.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="btn-group">
          <button 
            className="btn btn-primary" 
            onClick={loadSampleData}
            disabled={isLoading}
            title="Load valid 1,000-customer retail dataset"
          >
            <Sparkles size={16} />
            Load Sample CSV (1k Rows)
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={loadInvalidSample}
            disabled={isLoading}
            title="Load an invalid CSV to demonstrate schema failure detection"
          >
            <FileWarning size={16} />
            Test Schema Rejection
          </button>

          {dataset.length > 0 && (
            <button 
              className="btn btn-outline-danger" 
              onClick={resetDataset}
              title="Clear active dataset"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="alert-banner alert-error" role="alert">
          <AlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div className="alert-heading">Schema Verification Error</div>
            <div className="alert-body">
              {validationError}
              {summary && summary.missingColumns && summary.missingColumns.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fecdd3' }}>
                    Required Columns Missing:
                  </div>
                  <div className="column-tag-list">
                    {summary.missingColumns.map((col) => (
                      <span key={col} className="col-tag col-tag-missing">
                        ✕ {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {summary && summary.detectedColumns && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>
                    Recognized Columns in Upload:
                  </div>
                  <div className="column-tag-list">
                    {summary.detectedColumns.map((col) => (
                      <span 
                        key={col} 
                        className={`col-tag ${REQUIRED_COLUMNS.includes(col) ? 'col-tag-matched' : 'col-tag-extra'}`}
                      >
                        {REQUIRED_COLUMNS.includes(col) ? '✓ ' : '+ '} {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validation Success Banner */}
      {summary && summary.isValid && (
        <div className="alert-banner alert-success" role="status">
          <CheckCircle2 size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div className="alert-heading">Schema Verification Passed!</div>
            <div className="alert-body">
              All <strong>7 required causal features</strong> (treatment, outcome, and confounders) were successfully verified.
              Dataset <code>{fileName}</code> ({fileSize ? `${fileSize} • ` : ''}{summary.totalRows.toLocaleString()} rows) is structured and ready for ITE scoring.
            </div>
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
            onClick={() => setActiveTab('charts')}
          >
            Go to Charts →
          </button>
        </div>
      )}

      {/* Main Drag-and-Drop Area */}
      <div 
        className={`dropzone-container ${isDragOver ? 'is-dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".csv"
          onChange={handleFileInputChange}
        />
        <div className="dropzone-icon-wrapper">
          <Upload size={32} />
        </div>
        <div className="dropzone-title">
          {isLoading ? 'Parsing and Validating CSV...' : 'Drag & Drop your customer CSV file here'}
        </div>
        <div className="dropzone-text">
          Supports RFC 4180 CSV files up to 50,000+ rows. Required columns: 
          <code style={{ color: 'var(--cyan)' }}> customer_id, age, loyalty_score, past_orders, avg_order_value, discount, revenue</code>.
        </div>
        <button 
          className="btn btn-primary"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <Upload size={16} />
          Browse CSV File
        </button>
      </div>

      {/* Dataset Summary & Metrics */}
      {summary && (
        <div style={{ marginTop: '2rem' }}>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">
                <span>Total Customers</span>
                <Users size={16} color="var(--primary-light)" />
              </div>
              <div className="kpi-value">{summary.totalRows.toLocaleString()}</div>
              <div className="kpi-subtext">Rows parsed from {fileName || 'CSV'}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">
                <span>Schema Features</span>
                <Columns size={16} color="var(--cyan)" />
              </div>
              <div className="kpi-value">{summary.totalColumns} Columns</div>
              <div className="kpi-subtext">
                {summary.missingColumns.length === 0 ? '7/7 required present' : `${summary.missingColumns.length} missing`}
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">
                <span>Treatment Ratio (T=1)</span>
                <Percent size={16} color="var(--emerald)" />
              </div>
              <div className="kpi-value">{summary.treatmentRatio}%</div>
              <div className="kpi-subtext">
                {summary.treatmentCount.toLocaleString()} discount / {summary.controlCount.toLocaleString()} control
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">
                <span>Mean Revenue (Y)</span>
                <DollarSign size={16} color="var(--amber)" />
              </div>
              <div className="kpi-value">${summary.avgRevenue}</div>
              <div className="kpi-subtext">Avg Order Value: ${summary.avgAov}</div>
            </div>
          </div>

          {/* Schema Checklist Card */}
          <div className="card-panel" style={{ marginBottom: '1.75rem' }}>
            <div className="card-header-row">
              <h3 className="card-heading">
                <CheckCircle2 size={18} color="var(--emerald)" />
                Mandatory Causal Schema Contract (Role A ↔ Role C)
              </h3>
              <span className="badge-role">Contract Specification</span>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Verification status for each column required by Double Machine Learning (DML) models:
            </div>
            <div className="column-tag-list">
              {REQUIRED_COLUMNS.map((reqCol) => {
                const isPresent = summary.detectedColumns.includes(reqCol);
                return (
                  <span 
                    key={reqCol} 
                    className={`col-tag ${isPresent ? 'col-tag-matched' : 'col-tag-missing'}`}
                  >
                    {isPresent ? '✓ ' : '✕ '} {reqCol}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 10-Row Preview Table (Task T3 Requirement) */}
          <div className="card-panel">
            <div className="card-header-row">
              <h3 className="card-heading">
                <TableIcon size={18} color="var(--cyan)" />
                Dataset Sample Preview (First 10 Rows)
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Showing 10 of {summary.totalRows.toLocaleString()} rows
              </span>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    {summary.detectedColumns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summary.previewRows.map((row, index) => (
                    <tr key={index}>
                      <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                      {summary.detectedColumns.map((col) => {
                        const val = row[col];
                        if (col === 'discount') {
                          return (
                            <td key={col}>
                              <span className={`badge-treatment ${val === 1 ? 'badge-treatment-1' : 'badge-treatment-0'}`}>
                                {val === 1 ? 'Treated (1)' : 'Control (0)'}
                              </span>
                            </td>
                          );
                        }
                        if (col === 'revenue' || col === 'avg_order_value') {
                          return (
                            <td key={col}>
                              ${typeof val === 'number' ? val.toFixed(2) : val}
                            </td>
                          );
                        }
                        return (
                          <td key={col}>
                            {val !== undefined && val !== null ? String(val) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
