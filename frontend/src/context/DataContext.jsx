import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import apiClient, { extractBudgetValue } from '../api/client';
import { validateDatasetColumns, normalizeSegment } from '../constants/schema';
import { DataContext } from './context';

export function DataProvider({ children }) {
  const [dataset, setDataset] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [summary, setSummary] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState(null);
  
  // Pipeline metrics state (populated ONLY from backend or offline contracts, NEVER fabricated)
  const [iteScores, setIteScores] = useState([]);
  const [upliftData, setUpliftData] = useState([]);
  const [allocationData, setAllocationData] = useState([]);
  const [strategyData, setStrategyData] = useState([]);
  const [budget, setBudgetState] = useState(25000);

  // Wrapper for setBudget ensuring budget state is always stored as a valid number
  const setBudget = useCallback((newBudget) => {
    const numeric = extractBudgetValue(newBudget, 25000);
    setBudgetState(numeric);
  }, []);
  
  // Filtering, search and interaction state
  const [filterSegment, setFilterSegment] = useState('all');
  const [filterMinLoyalty, setFilterMinLoyalty] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // System & API status
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'online' | 'offline' | 'mock'
  const [activeTab, setActiveTab] = useState('upload');

  // Load all pipeline metrics (Uplift, ITE, Allocation, Strategy)
  const loadPipelineMetrics = useCallback(async (targetBudget = budget) => {
    const numericBudget = extractBudgetValue(targetBudget, extractBudgetValue(budget, 25000));
    setIsLoading(true);
    try {
      // 1. Check backend health
      const health = await apiClient.checkHealth();
      setApiStatus(health.online ? 'online' : 'mock');

      // 2. Fetch Uplift Curve
      const upliftRes = await apiClient.fetchUpliftCurve();
      if (upliftRes.success && Array.isArray(upliftRes.data)) {
        setUpliftData(upliftRes.data);
      }

      // 3. Fetch Genuine ITE Scores
      const iteRes = await apiClient.fetchIteScores();
      if (iteRes.success && Array.isArray(iteRes.data)) {
        const normalized = iteRes.data.map((r) => ({
          ...r,
          segment: normalizeSegment(r.segment)
        }));
        setIteScores(normalized);
      }

      // 4. Fetch Optimization Allocation for target budget
      const allocRes = await apiClient.fetchAllocation(numericBudget);
      if (allocRes.success && Array.isArray(allocRes.data)) {
        const normalized = allocRes.data.map((r) => ({
          ...r,
          segment: normalizeSegment(r.segment)
        }));
        setAllocationData(normalized);
      }

      // 5. Fetch Strategy Comparison for target budget
      const stratRes = await apiClient.fetchStrategyComparison(numericBudget);
      if (stratRes.success && Array.isArray(stratRes.data)) {
        setStrategyData(stratRes.data);
      }
    } catch (err) {
      console.warn('Error loading pipeline metrics:', err);
      setApiStatus('mock');
    } finally {
      setIsLoading(false);
    }
  }, [budget]);

  // Initial mount load
  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      if (!ignore) {
        loadPipelineMetrics();
      }
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [loadPipelineMetrics]);

  // Re-fetch allocation and strategy comparison when budget changes
  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      if (ignore) return;
      const numericBudget = extractBudgetValue(budget, 25000);
      try {
        const [allocRes, stratRes] = await Promise.all([
          apiClient.fetchAllocation(numericBudget),
          apiClient.fetchStrategyComparison(numericBudget)
        ]);
        if (!ignore && allocRes.success && Array.isArray(allocRes.data)) {
          setAllocationData(allocRes.data.map((r) => ({ ...r, segment: normalizeSegment(r.segment) })));
        }
        if (!ignore && stratRes.success && Array.isArray(stratRes.data)) {
          setStrategyData(stratRes.data);
        }
      } catch (err) {
        console.warn('Error updating budget allocation:', err);
      }
    }, 150);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [budget]);

  // Format file size utility
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Process and upload CSV to FastAPI backend for real Double ML inference.
   * Completely eliminates client-side fabricated ITE formulas.
   */
  const parseCsvFile = (fileOrBlob, customName = null) => {
    setIsLoading(true);
    setValidationError(null);
    setUploadSuccessMessage(null);

    const actualName = customName || fileOrBlob.name || 'uploaded_data.csv';
    const actualSize = fileOrBlob.size || 0;

    Papa.parse(fileOrBlob, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
      complete: async (results) => {
        if (!results.data || results.data.length === 0) {
          setIsLoading(false);
          setValidationError('Uploaded CSV contains no valid data rows.');
          setDataset([]);
          setSummary(null);
          return;
        }

        const rows = results.data;
        const firstRow = rows[0];
        const detectedColumns = Object.keys(firstRow).map((c) => c.trim());

        // Validate detected columns against supported schemas
        const validation = validateDatasetColumns(detectedColumns);

        let treated = 0;
        let control = 0;
        let sumRev = 0;
        let sumAov = 0;
        let validNumericCount = 0;

        rows.forEach((r) => {
          if (r.discount === 1 || r.discount === '1') treated++;
          else control++;

          const rev = Number(r.revenue);
          const aov = Number(r.avg_order_value || r.history);
          if (!isNaN(rev)) sumRev += rev;
          if (!isNaN(aov)) {
            sumAov += aov;
            validNumericCount++;
          }
        });

        const datasetSummary = {
          totalRows: rows.length,
          totalColumns: detectedColumns.length,
          detectedColumns,
          missingColumns: validation.missingColumns,
          expectedColumns: validation.expectedColumns,
          schemaName: validation.schemaName,
          schemaLabel: validation.label,
          isValid: validation.isValid,
          treatmentCount: treated,
          controlCount: control,
          treatmentRatio: rows.length ? ((treated / rows.length) * 100).toFixed(1) : 0,
          avgRevenue: rows.length ? (sumRev / rows.length).toFixed(2) : 0,
          avgAov: validNumericCount ? (sumAov / validNumericCount).toFixed(2) : 0,
          previewRows: rows.slice(0, 10)
        };

        setDataset(rows);
        setFileName(actualName);
        setFileSize(actualSize ? formatBytes(actualSize) : null);
        setSummary(datasetSummary);

        if (!validation.isValid) {
          setIsLoading(false);
          setValidationError(
            `Schema Validation Failed: Missing ${validation.missingColumns.length} required causal column(s) for ${validation.label}: [${validation.missingColumns.join(', ')}].`
          );
          return;
        }

        // Upload to backend for genuine Double ML causal inference
        try {
          // Wrap file if needed
          let fileObj = fileOrBlob;
          if (!(fileObj instanceof File)) {
            fileObj = new File([fileOrBlob], actualName, { type: 'text/csv' });
          }

          const uploadRes = await apiClient.uploadCustomerCsv(fileObj);
          if (!uploadRes.success) {
            setValidationError(uploadRes.error || 'Backend model training failed.');
            setIsLoading(false);
            return;
          }

          // Fetch updated genuine predictions from backend
          await loadPipelineMetrics(budget);
          setUploadSuccessMessage(
            `Successfully trained Double ML model on ${actualName} (${rows.length.toLocaleString()} records). Genuine ITE scores generated!`
          );
          setValidationError(null);
        } catch (uploadErr) {
          setValidationError(`Backend upload error: ${uploadErr.message}`);
        } finally {
          setIsLoading(false);
        }
      },
      error: (err) => {
        setIsLoading(false);
        setValidationError(`CSV parsing failed: ${err.message}`);
      }
    });
  };

  // Load Pre-configured Sample CSV (1,000 customers)
  const loadSampleData = async () => {
    setIsLoading(true);
    setValidationError(null);
    try {
      const response = await fetch('/sample_retail.csv');
      const csvText = await response.text();
      const file = new File([csvText], 'sample_retail.csv', { type: 'text/csv' });
      parseCsvFile(file, 'sample_retail.csv (1,000 customers)');
    } catch (e) {
      setIsLoading(false);
      setValidationError(`Network error loading sample: ${e.message}`);
    }
  };

  // Load Synthetic 10,000 Rows CSV for Stage 3 Scale & Performance Testing
  const loadSynthetic10kData = async () => {
    setIsLoading(true);
    setValidationError(null);
    try {
      const response = await fetch('/synthetic_10k.csv');
      const csvText = await response.text();
      const file = new File([csvText], 'synthetic_10k.csv', { type: 'text/csv' });
      parseCsvFile(file, 'synthetic_10k.csv (10,000 customers)');
    } catch (e) {
      setIsLoading(false);
      setValidationError(`Network error loading 10k stress test: ${e.message}`);
    }
  };

  // Load Invalid Sample CSV to test validation rejection
  const loadInvalidSample = async () => {
    setIsLoading(true);
    setValidationError(null);
    try {
      const response = await fetch('/invalid_sample.csv');
      const csvText = await response.text();
      const file = new File([csvText], 'invalid_sample.csv', { type: 'text/csv' });
      parseCsvFile(file, 'invalid_sample.csv (Missing discount & revenue)');
    } catch (e) {
      setIsLoading(false);
      setValidationError(`Network error loading test file: ${e.message}`);
    }
  };

  const resetDataset = () => {
    setDataset([]);
    setFileName(null);
    setFileSize(null);
    setSummary(null);
    setValidationError(null);
    setUploadSuccessMessage(null);
    loadPipelineMetrics();
  };

  const value = {
    dataset,
    fileName,
    fileSize,
    summary,
    validationError,
    uploadSuccessMessage,
    iteScores,
    setIteScores,
    upliftData,
    allocationData,
    strategyData,
    budget,
    setBudget,
    filterSegment,
    setFilterSegment,
    filterMinLoyalty,
    setFilterMinLoyalty,
    searchQuery,
    setSearchQuery,
    isLoading,
    apiStatus,
    activeTab,
    setActiveTab,
    parseCsvFile,
    loadSampleData,
    loadSynthetic10kData,
    loadInvalidSample,
    resetDataset,
    loadPipelineMetrics
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export default DataProvider;
