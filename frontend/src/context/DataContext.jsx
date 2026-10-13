import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import apiClient from '../api/client';
import { REQUIRED_COLUMNS } from '../constants/schema';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [dataset, setDataset] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [summary, setSummary] = useState(null);
  const [validationError, setValidationError] = useState(null);
  
  // Pipeline metrics state
  const [iteScores, setIteScores] = useState([]);
  const [upliftData, setUpliftData] = useState([]);
  const [allocationData, setAllocationData] = useState([]);
  const [strategyData, setStrategyData] = useState([]);
  const [budget, setBudget] = useState(25000);
  
  // Filtering and interaction state
  const [filterSegment, setFilterSegment] = useState('all');
  const [filterMinLoyalty, setFilterMinLoyalty] = useState(0);

  // System & API status
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'online' | 'mock'
  const [activeTab, setActiveTab] = useState('upload');

  // Load all pipeline metrics (Uplift, ITE, Allocation, Strategy)
  const loadPipelineMetrics = useCallback(async () => {
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

      // 3. Fetch ITE Scores
      const iteRes = await apiClient.fetchIteScores();
      if (iteRes.success && Array.isArray(iteRes.data)) {
        setIteScores(iteRes.data);
      }

      // 4. Fetch Allocation
      const allocRes = await apiClient.fetchAllocation(budget);
      if (allocRes.success && Array.isArray(allocRes.data)) {
        setAllocationData(allocRes.data);
      }

      // 5. Fetch Strategy Comparison
      const stratRes = await apiClient.fetchStrategyComparison();
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
    loadPipelineMetrics();
  }, [loadPipelineMetrics]);

  // Format file size utility
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate parsed records against required causal schema
  const validateAndProcessData = (rows, name, size) => {
    if (!rows || rows.length === 0) {
      setValidationError('Uploaded CSV contains no valid data rows.');
      setDataset([]);
      setSummary(null);
      return;
    }

    const firstRow = rows[0];
    const detectedColumns = Object.keys(firstRow).map((c) => c.trim());
    
    // Check for missing mandatory columns
    const missingColumns = REQUIRED_COLUMNS.filter(
      (reqCol) => !detectedColumns.includes(reqCol)
    );

    const isValid = missingColumns.length === 0;

    let treated = 0;
    let control = 0;
    let sumRev = 0;
    let sumAov = 0;
    let validNumericCount = 0;

    rows.forEach((r) => {
      if (r.discount === 1 || r.discount === '1') treated++;
      else control++;

      const rev = Number(r.revenue);
      const aov = Number(r.avg_order_value);
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
      missingColumns,
      isValid,
      treatmentCount: treated,
      controlCount: control,
      treatmentRatio: rows.length ? ((treated / rows.length) * 100).toFixed(1) : 0,
      avgRevenue: rows.length ? (sumRev / rows.length).toFixed(2) : 0,
      avgAov: validNumericCount ? (sumAov / validNumericCount).toFixed(2) : 0,
      previewRows: rows.slice(0, 10)
    };

    setDataset(rows);
    setFileName(name);
    setFileSize(size ? formatBytes(size) : null);
    setSummary(datasetSummary);

    if (!isValid) {
      setValidationError(
        `Schema Validation Failed: Missing ${missingColumns.length} required causal column(s): [${missingColumns.join(', ')}].`
      );
    } else {
      setValidationError(null);
    }
  };

  // Process CSV File with PapaParse
  const parseCsvFile = (file) => {
    setIsLoading(true);
    setValidationError(null);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        setIsLoading(false);
        if (results.errors && results.errors.length > 0) {
          const firstErr = results.errors[0];
          console.warn('PapaParse warnings/errors:', results.errors);
          if (!results.data || results.data.length === 0) {
            setValidationError(`Parsing error: ${firstErr.message} (Row: ${firstErr.row})`);
            return;
          }
        }
        validateAndProcessData(results.data, file.name, file.size);
      },
      error: (err) => {
        setIsLoading(false);
        setValidationError(`Failed to parse file: ${err.message}`);
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
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        transformHeader: (h) => h.trim(),
        complete: (results) => {
          setIsLoading(false);
          validateAndProcessData(results.data, 'sample_retail.csv (1,000 customers)', csvText.length);
        },
        error: (err) => {
          setIsLoading(false);
          setValidationError(`Failed to load sample: ${err.message}`);
        }
      });
    } catch (e) {
      setIsLoading(false);
      setValidationError(`Network error loading sample: ${e.message}`);
    }
  };

  // Load Invalid Sample CSV to test validation rejection
  const loadInvalidSample = async () => {
    setIsLoading(true);
    setValidationError(null);
    try {
      const response = await fetch('/invalid_sample.csv');
      const csvText = await response.text();
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        transformHeader: (h) => h.trim(),
        complete: (results) => {
          setIsLoading(false);
          validateAndProcessData(results.data, 'invalid_sample.csv (Missing discount & revenue)', csvText.length);
        },
        error: (err) => {
          setIsLoading(false);
          setValidationError(`Failed to load invalid test file: ${err.message}`);
        }
      });
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
  };

  const value = {
    dataset,
    fileName,
    fileSize,
    summary,
    validationError,
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
    isLoading,
    apiStatus,
    activeTab,
    setActiveTab,
    parseCsvFile,
    loadSampleData,
    loadInvalidSample,
    resetDataset,
    loadPipelineMetrics
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
