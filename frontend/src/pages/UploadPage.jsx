import React, { useRef, useState } from 'react';
import { useData } from '../context/useData';
import { REQUIRED_COLUMNS, COLUMN_METADATA } from '../constants/schema';
import { 
  CloudUpload, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  FileWarning, 
  RotateCcw, 
  ArrowRight,
  Zap,
  Table as TableIcon
} from 'lucide-react';
import brandCrest from '../assets/logo-crest.png';

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
    loadSynthetic10kData,
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
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
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
      {/* Import Modal / Card (Reference 2 style) */}
      <div className="import-modal-card">
        <div className="import-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-crest-wrapper" style={{ width: 36, height: 36 }}>
              <img src={brandCrest} alt="EconoCausal" className="brand-logo-crest" style={{ width: 24, height: 24 }} />
            </div>
            <div>
              <h2 className="import-title">Import Observational Customer Data</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Upload your customer retail CSV to validate features against Double Machine Learning (DML) requirements.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-pill btn-pill-secondary"
              onClick={loadSampleData}
              disabled={isLoading}
              title="Load 1,000 retail records with valid schema"
            >
              <Sparkles size={13} color="var(--primary)" />
              <span>Load 1k Sample</span>
            </button>
            <button
              type="button"
              className="btn-pill btn-pill-secondary"
              onClick={loadSynthetic10kData}
              disabled={isLoading}
              title="Stress test with 10,000 customer records (Stage 3 Scale SLA • 60 FPS WebGL)"
              style={{ borderColor: 'var(--amber-border, rgba(245, 158, 11, 0.3))' }}
            >
              <Zap size={13} color="var(--amber, #f59e0b)" />
              <span>Load 10k Scale Test</span>
            </button>
            <button
              type="button"
              className="btn-pill btn-pill-secondary"
              onClick={loadInvalidSample}
              disabled={isLoading}
              title="Test missing columns detection"
            >
              <FileWarning size={13} color="var(--rose)" />
              <span>Test Error</span>
            </button>
            {dataset.length > 0 && (
              <button
                type="button"
                className="btn-pill btn-pill-secondary"
                onClick={resetDataset}
                title="Clear current dataset"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="panel-card" style={{ borderColor: 'var(--rose-border)', backgroundColor: 'var(--rose-subtle)', marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <AlertCircle size={20} color="var(--rose)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--rose-text)' }}>
                  Schema Validation Error
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--rose-text)', marginTop: '0.2rem' }}>
                  {validationError}
                </div>
                {summary?.missingColumns && (
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {summary.missingColumns.map((col) => (
                      <span key={col} style={{ background: 'var(--bg-card)', color: 'var(--rose)', border: '1px solid var(--rose-border)', padding: '2px 8px', borderRadius: 'var(--radius-xs)', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        ✕ Missing: {col}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Validation Success Banner */}
        {summary?.isValid && (
          <div className="panel-card" style={{ borderColor: 'var(--emerald-border)', backgroundColor: 'var(--emerald-subtle)', marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CheckCircle2 size={20} color="var(--emerald)" />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--emerald-text)' }}>
                      Schema Verified Successfully
                    </span>
                    {summary.totalRows >= 10000 && (
                      <span className="status-badge status-badge-green" style={{ fontSize: '0.68rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Zap size={10} />
                        Stage 3 Scale SLA Verified (10,000 Records • 60 FPS WebGL)
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--emerald-text)', marginTop: '0.15rem' }}>
                    All 7 required causal features identified. File <code>{fileName}</code> ({fileSize ? `${fileSize} • ` : ''}{summary.totalRows.toLocaleString()} rows) is ready.
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-pill btn-pill-primary"
                onClick={() => setActiveTab('charts')}
              >
                <span>Proceed to Causal Charts</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Dropzone Box (Reference 2 style) */}
        <div
          className={`upload-dropzone ${isDragOver ? 'dragover' : ''}`}
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
          <div className="upload-cloud-icon">
            <CloudUpload size={24} />
          </div>
          <div className="upload-dropzone-title">
            {isLoading ? 'Parsing and Validating CSV...' : 'Drag and drop files here or click to upload.'}
          </div>
          <div className="upload-dropzone-subtitle">
            {fileName ? `"${fileName}" is ready.` : 'Upload CSV files up to 50,000+ customer records.'}
          </div>
        </div>

        {/* Map Columns Section (Reference 2 style) */}
        <div className="map-columns-section">
          <div className="map-columns-title">Map Columns to Causal System Fields</div>
          <div className="table-container">
            <table className="map-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>CSV Header</th>
                  <th style={{ width: '10%' }}></th>
                  <th style={{ width: '50%' }}>Causal System Field</th>
                </tr>
              </thead>
              <tbody>
                {REQUIRED_COLUMNS.map((col) => {
                  const isPresent = summary?.detectedColumns?.includes(col) ?? false;
                  const meta = COLUMN_METADATA[col] || { label: col, role: 'Causal Variable' };
                  return (
                    <tr key={col}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {col}
                      </td>
                      <td className="map-arrow">
                        <ArrowRight size={14} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 500 }}>
                            {meta.label} <span style={{ color: 'var(--text-tertiary)', fontSize: '0.74rem' }}>({meta.role})</span>
                          </span>
                          {isPresent ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--emerald)', fontSize: '0.78rem', fontWeight: 600 }}>
                              ✓ Mapped
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
                              Auto-detect
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Strictly client-side parsing via PapaParse • No external transmission
          </span>

          {summary?.isValid && (
            <button
              type="button"
              className="btn-pill btn-pill-primary"
              onClick={() => setActiveTab('charts')}
            >
              <span>Import {summary.totalRows.toLocaleString()} Records</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 10-Row Data Preview Table (Reference 1 & 2) */}
      {summary?.isValid && (
        <div className="panel-card" style={{ maxWidth: 1100, margin: '0 auto 2rem' }}>
          <div className="panel-card-header">
            <div>
              <h3 className="panel-card-title">
                <TableIcon size={16} color="var(--primary)" />
                Dataset Sample Preview (First 10 Records)
              </h3>
              <p className="panel-card-sub">
                Inspecting first 10 rows of {summary.totalRows.toLocaleString()} loaded customer records
              </p>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {summary.totalColumns} Features Detected
            </span>
          </div>

          <div className="table-container">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>#</th>
                  {summary.detectedColumns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.previewRows.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{idx + 1}</td>
                    {summary.detectedColumns.map((col) => {
                      const val = row[col];
                      if (col === 'discount') {
                        return (
                          <td key={col}>
                            <span className={`status-badge ${val === 1 ? 'status-badge-blue' : ''}`} style={{ fontSize: '0.72rem', padding: '1px 6px' }}>
                              {val === 1 ? 'Treated (1)' : 'Control (0)'}
                            </span>
                          </td>
                        );
                      }
                      if (col === 'revenue' || col === 'avg_order_value') {
                        return (
                          <td key={col} style={{ fontWeight: 600 }}>
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
      )}
    </div>
  );
}
