/**
 * EconoCausal API Client Module
 * Provides centralized communication with the FastAPI backend.
 * Gracefully falls back to local data contracts when backend is offline.
 */

import Papa from 'papaparse';

/**
 * Safely extracts a numeric budget value from a number, numeric string,
 * or object (e.g., { budget }, { totalBudget }, { value }, { target: { value } }).
 * Prevents [object Object] query parameter serialization and NaN bugs.
 * 
 * @param {any} input 
 * @param {number} fallback 
 * @returns {number}
 */
export function extractBudgetValue(input, fallback = 25000) {
  if (input === null || input === undefined) {
    return fallback;
  }

  // Already a valid finite number
  if (typeof input === 'number' && Number.isFinite(input)) {
    return input > 0 ? input : fallback;
  }

  // Numeric string (e.g. "25000")
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed !== '') {
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return fallback;
  }

  // Object structure inspection (do NOT blindly call Number(input))
  if (typeof input === 'object') {
    // 1. Direct budget property: { budget: 25000 }
    if (input.budget !== undefined && input.budget !== null) {
      return extractBudgetValue(input.budget, fallback);
    }
    // 2. Planning settings totalBudget property: { totalBudget: 25000 }
    if (input.totalBudget !== undefined && input.totalBudget !== null) {
      return extractBudgetValue(input.totalBudget, fallback);
    }
    // 3. Snake case total_budget property: { total_budget: 25000 }
    if (input.total_budget !== undefined && input.total_budget !== null) {
      return extractBudgetValue(input.total_budget, fallback);
    }
    // 4. Value property: { value: 25000 }
    if (input.value !== undefined && input.value !== null) {
      return extractBudgetValue(input.value, fallback);
    }
    // 5. Nested settings object: { settings: { totalBudget: 25000 } }
    if (input.settings && typeof input.settings === 'object') {
      return extractBudgetValue(input.settings, fallback);
    }
    // 6. DOM or Synthetic Event target: { target: { value: 25000 } }
    if (input.target && typeof input.target === 'object' && input.target.value !== undefined) {
      return extractBudgetValue(input.target.value, fallback);
    }
  }

  return fallback;
}

/**
 * Safely extracts numeric discount amount from number, string, or options object.
 * @param {any} input 
 * @param {number} fallback 
 * @returns {number}
 */
export function extractDiscountAmount(input, fallback = 1.0) {
  if (input === null || input === undefined) {
    return fallback;
  }
  if (typeof input === 'number' && Number.isFinite(input)) {
    return input > 0 ? input : fallback;
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed !== '') {
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return fallback;
  }
  if (typeof input === 'object') {
    if (input.discount_amount !== undefined && input.discount_amount !== null) {
      return extractDiscountAmount(input.discount_amount, fallback);
    }
    if (input.discountAmount !== undefined && input.discountAmount !== null) {
      return extractDiscountAmount(input.discountAmount, fallback);
    }
    if (input.costPerDiscount !== undefined && input.costPerDiscount !== null) {
      return extractDiscountAmount(input.costPerDiscount, fallback);
    }
  }
  return fallback;
}

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8000';

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Check FastAPI server health and connectivity
   * @returns {Promise<{ online: boolean, message?: string, version?: string }>}
   */
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return { online: false, message: `HTTP ${response.status}: ${response.statusText}` };
      }
      const data = await response.json();
      return { online: true, ...data };
    } catch (err) {
      return { 
        online: false, 
        message: err.name === 'AbortError' ? 'Connection timed out' : 'Backend offline or unreachable' 
      };
    }
  }

  /**
   * Upload customer CSV to FastAPI backend for DML causal inference
   * @param {File} file 
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async uploadCustomerCsv(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = `Upload failed (HTTP ${response.status}): ${errorText}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed && parsed.detail) errorMsg = parsed.detail;
        } catch {
          // ignore json parse error
        }
        return { success: false, error: errorMsg, status: response.status };
      }

      const result = await response.json();
      return { success: true, data: result, source: 'api' };
    } catch (err) {
      console.warn('FastAPI upload request failed:', err.message);
      return { 
        success: false, 
        error: `Could not reach backend API server at ${this.baseUrl}: ${err.message}` 
      };
    }
  }

  /**
   * Fetch Uplift and Qini curve points
   * @returns {Promise<{ success: boolean, data: Array<{ fraction_targeted: number, model_gain: number, oracle_gain: number, random_gain: number }>, source: string }>}
   */
  async fetchUpliftCurve() {
    // 1. Try FastAPI endpoint
    try {
      const response = await fetch(`${this.baseUrl}/api/uplift`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data, source: 'api' };
      }
    } catch {
      // Backend offline - proceed to fallback
    }

    // 2. Fallback to static contract: /uplift_curve.csv
    try {
      const res = await fetch('/uplift_curve.csv');
      if (!res.ok) throw new Error('Failed to load local uplift_curve.csv');
      const csvText = await res.text();
      
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: 'greedy',
          complete: (results) => {
            resolve({
              success: true,
              data: results.data.map((r) => ({
                fraction_targeted: Number(r.fraction_targeted),
                model_gain: Number(r.model_gain),
                oracle_gain: Number(r.oracle_gain),
                random_gain: Number(r.random_gain)
              })),
              source: 'mock'
            });
          },
          error: (err) => {
            resolve({ success: false, error: err.message, source: 'error' });
          }
        });
      });
    } catch (err) {
      return { success: false, error: err.message, source: 'error' };
    }
  }

  /**
   * Fetch Individual Treatment Effect (ITE) scores
   * @returns {Promise<{ success: boolean, data: Array<any>, source: string }>}
   */
  async fetchIteScores() {
    // 1. Try FastAPI endpoint
    try {
      const response = await fetch(`${this.baseUrl}/api/ite`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const records = Array.isArray(data) ? data : (Array.isArray(data.rows) ? data.rows : []);
        return { success: true, data: records, source: 'api' };
      }
    } catch {
      // Backend offline
    }

    // 2. Fallback to /mock_ite.json
    try {
      const res = await fetch('/mock_ite.json');
      if (res.ok) {
        const data = await res.json();
        const records = Array.isArray(data) ? data : (Array.isArray(data.rows) ? data.rows : []);
        return { success: true, data: records, source: 'mock' };
      }
    } catch {
      // Try CSV fallback
    }

    // 3. Fallback to /ite_scores.csv
    try {
      const res = await fetch('/ite_scores.csv');
      const csvText = await res.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: 'greedy',
          complete: (results) => {
            resolve({ success: true, data: results.data, source: 'mock' });
          },
          error: (err) => resolve({ success: false, error: err.message, source: 'error' })
        });
      });
    } catch (err) {
      return { success: false, error: err.message, source: 'error' };
    }
  }

  /**
   * Fetch Budget Allocation recommendations from optimizer endpoint
   * @param {number|object} budget 
   * @param {number} discountAmount
   * @returns {Promise<{ success: boolean, data: Array<any>, source: string }>}
   */
  async fetchAllocation(budget = 25000, discountAmount = 1.0) {
    const numericBudget = extractBudgetValue(budget, 25000);
    const numericDiscount = extractDiscountAmount(
      typeof budget === 'object' && budget !== null && (budget.discount_amount || budget.discountAmount || budget.costPerDiscount)
        ? (budget.discount_amount || budget.discountAmount || budget.costPerDiscount)
        : discountAmount,
      1.0
    );

    const params = new URLSearchParams({
      budget: String(numericBudget),
      discount_amount: String(numericDiscount)
    });

    // 1. Try FastAPI endpoint
    try {
      const response = await fetch(`${this.baseUrl}/api/allocation?${params.toString()}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const records = Array.isArray(data) ? data : (Array.isArray(data.allocation) ? data.allocation : []);
        return { success: true, data: records, source: 'api' };
      }
      console.warn(`FastAPI /api/allocation returned HTTP ${response.status}:`, await response.text());
    } catch {
      // Backend offline
    }

    // 2. Fallback to /allocation.csv
    try {
      const res = await fetch('/allocation.csv');
      const csvText = await res.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: 'greedy',
          complete: (results) => {
            resolve({ success: true, data: results.data, source: 'mock' });
          },
          error: (err) => resolve({ success: false, error: err.message, source: 'error' })
        });
      });
    } catch (err) {
      return { success: false, error: err.message, source: 'error' };
    }
  }

  /**
   * Execute optimizer via POST /optimize
   * @param {number|object} budget 
   * @param {number} discountAmount 
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async optimize(budget = 25000, discountAmount = 1.0) {
    const numericBudget = extractBudgetValue(budget, 25000);
    const numericDiscount = extractDiscountAmount(
      typeof budget === 'object' && budget !== null && (budget.discount_amount || budget.discountAmount || budget.costPerDiscount)
        ? (budget.discount_amount || budget.discountAmount || budget.costPerDiscount)
        : discountAmount,
      1.0
    );

    try {
      const response = await fetch(`${this.baseUrl}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ budget: numericBudget, discount_amount: numericDiscount })
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data, source: 'api' };
      }
      const errText = await response.text();
      return { success: false, error: `Optimization failed: ${errText}` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Fetch Strategy Comparison metrics (blanket vs random vs optimized)
   * @param {number|object} budget
   * @param {number} discountAmount
   * @returns {Promise<{ success: boolean, data: Array<any>, source: string }>}
   */
  async fetchStrategyComparison(budget = 25000, discountAmount = 1.0) {
    const numericBudget = extractBudgetValue(budget, 25000);
    const numericDiscount = extractDiscountAmount(
      typeof budget === 'object' && budget !== null && (budget.discount_amount || budget.discountAmount || budget.costPerDiscount)
        ? (budget.discount_amount || budget.discountAmount || budget.costPerDiscount)
        : discountAmount,
      1.0
    );

    const params = new URLSearchParams({
      budget: String(numericBudget),
      discount_amount: String(numericDiscount)
    });

    // 1. Try FastAPI endpoint
    try {
      const response = await fetch(`${this.baseUrl}/api/strategy-comparison?${params.toString()}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data, source: 'api' };
      }
      console.warn(`FastAPI /api/strategy-comparison returned HTTP ${response.status}:`, await response.text());
    } catch {
      // Backend offline
    }

    // 2. Fallback to /strategy_comparison.csv
    try {
      const res = await fetch('/strategy_comparison.csv');
      const csvText = await res.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: 'greedy',
          complete: (results) => {
            resolve({ success: true, data: results.data, source: 'mock' });
          },
          error: (err) => resolve({ success: false, error: err.message, source: 'error' })
        });
      });
    } catch (err) {
      return { success: false, error: err.message, source: 'error' };
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
