import React, { createContext, useContext, useState, useEffect } from 'react';
import Papa from 'papaparse';

export const REQUIRED_COLUMNS = [
  'customer_id',
  'age',
  'loyalty_score',
  'past_orders',
  'avg_order_value',
  'discount',
  'revenue'
];

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [dataset, setDataset] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [summary, setSummary] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [iteScores, setIteScores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  // Load mock ITE predictions on mount to satisfy Task T4 cross-page contract
  useEffect(() => {
    fetch('/mock_ite.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load mock_ite.json');
        return res.json();
      })
      .then((data) => {
        setIteScores(data);
      })
      .catch((err) => {
        console.warn('Notice: mock_ite.json could not be loaded automatically:', err.message);
      });
  }, []);

  // Format file size nicely
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate parsed records against the required schema
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

  // Process CSV File with PapaParse (Task T3 implementation)
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
          // If fatal error
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

  // Load Pre-configured Sample CSV for instant evaluation / demo
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

  // Load Invalid Sample CSV to showcase schema validation rejection
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
    isLoading,
    activeTab,
    setActiveTab,
    parseCsvFile,
    loadSampleData,
    loadInvalidSample,
    resetDataset
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
