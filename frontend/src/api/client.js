/**
 * EconoCausal API Client Module
 * Role C: Frontend Engineer (Sangamesh Ragam)
 * 
 * Provides centralized communication with the FastAPI backend.
 * Gracefully falls back to local data contracts when backend is offline.
 */

import Papa from 'papaparse';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
        throw new Error(`Upload failed (HTTP ${response.status}): ${errorText}`);
      }

      const result = await response.json();
      return { success: true, data: result, source: 'api' };
    } catch (err) {
      console.warn('FastAPI upload endpoint unavailable, processing locally:', err.message);
      return { success: false, error: err.message, fallback: true };
    }
  }

  /**
   * Fetch Uplift and Qini curve points
   * @returns {Promise<Array<{ fraction_targeted: number, model_gain: number, oracle_gain: number, random_gain: number }>>}
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
        return { success: true, data, source: 'api' };
      }
    } catch {
      // Backend offline
    }

    // 2. Fallback to /mock_ite.json
    try {
      const res = await fetch('/mock_ite.json');
      if (res.ok) {
        const data = await res.json();
        return { success: true, data, source: 'mock' };
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
   * Fetch Budget Allocation recommendations
   * @param {number} budget 
   * @returns {Promise<{ success: boolean, data: Array<any>, source: string }>}
   */
  async fetchAllocation(budget = 25000) {
    // 1. Try FastAPI endpoint
    try {
      const response = await fetch(`${this.baseUrl}/api/allocation?budget=${budget}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data, source: 'api' };
      }
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
   * Fetch Strategy Comparison metrics (blanket vs random vs optimized)
   * @returns {Promise<{ success: boolean, data: Array<any>, source: string }>}
   */
  async fetchStrategyComparison() {
    // 1. Try FastAPI endpoint
    try {
      const response = await fetch(`${this.baseUrl}/api/strategy-comparison`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data, source: 'api' };
      }
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
