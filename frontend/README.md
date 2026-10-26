# EconoCausal — Frontend Application Shell & Analytics Engine

> **Role C (Frontend Engineer):** Sangamesh Ragam  
> **Team:** Team Group 25 | **Internship:** Infotact Solutions (Data Science & ML)  
> **Git Branch:** `sangamesh-ragam`  
> **Milestone:** Stage 3 & Stage 4 (Scale Performance, Causal Visualizations & Budget Allocation)

---

## Overview

The **EconoCausal Frontend** is an interactive causal analytics web application built with React 19, Vite 8, and Plotly.js. It provides the experimentation and decision interface for evaluating Individual Treatment Effects (ITE), visualizing Uplift/Qini curves, stress-testing scale performance with 10,000+ customer records at 60 FPS via WebGL, and dynamically optimizing promotional budget allocation under resource constraints.

---

## Key Features

1. **Client-Side CSV Parsing & One-Click 10k Scale Benchmark:**
   - High-throughput streaming parser powered by `PapaParse`, processing 50,000+ records in under 400 ms.
   - Built-in **"⚡ Load 10k Scale Test"** button on the Ingestion interface for instant Stage 3 Scale SLA verification with automated verification badges.
   - Synchronizes 10,000 customer records directly with GPU-accelerated WebGL charts.

2. **Strict Causal Schema Validation:**
   - Enforces the 7 mandatory columns required by Double Machine Learning (DML) models:
     `customer_id`, `age`, `loyalty_score`, `past_orders`, `avg_order_value`, `discount`, `revenue`.
   - Real-time diagnostic alert banners isolating missing vs. recognized features.
   - Selective 10-row preview table preventing DOM layout thrashing.

3. **Causal Model Evaluation Visualizations (`charts/UpliftChart.jsx`):**
   - Interactive Uplift Curves and Qini Curves comparing Model Gain vs. Oracle Ground Truth vs. Uniform Random Baseline.
   - Normalized AUUC score and Qini metric calculations.
   - Smooth toggle between cumulative revenue lift ($) and Qini lift trajectories.

4. **Treatment Heterogeneity & 60 FPS WebGL Scatter Suite (`charts/IteScatterPlot.jsx`):**
   - ITE distribution histogram with mean ($\mu$), median, standard deviation ($\sigma$), and segment breakdowns.
   - GPU-accelerated WebGL (`type: 'scattergl'`) feature scatter plot rendering **10,000 to 50,000 points at 60 FPS**.
   - Dynamic feature selection (Loyalty Score, AOV, Age, Past Orders) with live Pearson correlation ($r$) analysis.
   - Real-time loyalty slider and segment filters executing in $\le 2$ ms without UI freezing.

5. **Dynamic What-If Budget Allocation Simulator (`pages/AllocationPage.jsx`):**
   - Enterprise-calibrated knapsack optimization allocating marketing discounts to maximize incremental ROI.
   - Fluid 60 FPS range slider ($5,000 to $100,000) with instant ROI recalculation.
   - Multi-strategy comparison bar charts (**Blanket** vs. **Random** vs. **Causal DML Optimization**).
   - Cumulative Gain vs. Spend Curve illustrating the concave optimal efficiency frontier.
   - Paginated customer allocation table with real-time search, segment filtering, and CSV export.

6. **Centralized Asynchronous API Client (`api/client.js`):**
   - Configurable base URL via `VITE_API_BASE_URL` (default: `http://localhost:8000`).
   - Centralized endpoints for `/health`, `/api/upload`, `/api/ite`, `/api/uplift`, `/api/allocation`, and `/api/strategy-comparison`.
   - Resilient offline fallback architecture: seamlessly serves local mock contracts when the FastAPI backend is offline.

7. **Executive UI Aesthetic & Global Command Search:**
   - Clean executive monochrome design system with custom CSS tokens.
   - One-click Light / Dark theme toggle with high-contrast WebGL chart palettes.
   - Interactive global search palette querying customer cohorts, metrics, and models.

---

## Scale Performance Benchmarks (Empirical SLA)

| Evaluation Metric | 1,000 Rows *(Sample)* | 10,000 Rows *(Stage 3 SLA)* | 50,000 Rows *(Peak Scale)* |
| :--- | :---: | :---: | :---: |
| **Ingestion & Parse Time** | 40 ms | **63 ms** | 362 ms |
| **Schema Validation Latency** | < 1 ms | **2 ms** | 3 ms |
| **Live Filter Latency (`useMemo`)** | 1 ms | **1 ms** | 2 ms |
| **Total Ingestion Pipeline** | **40 ms** | **65 ms** | **365 ms** |
| **Plotly Scatter Mode** | SVG / WebGL | **WebGL `scattergl`** | **WebGL `scattergl`** |
| **Interactive Pan/Zoom FPS** | 60 FPS | **60 FPS** | **60 FPS** |

---

## Getting Started

### Prerequisites
- Node.js LTS (`v18+` or `v20+`, tested on `v22.20.0`)
- npm (`v9+` or `v10+`)

### Install & Run
```bash
# Install dependencies
npm install

# Start local development server (port 5173)
npm run dev

# Run linter (oxlint)
npm run lint

# Run production build
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```text
frontend/
├── public/
│   ├── favicon.ico
│   ├── favicon.svg              # Custom Causal DAG icon
│   ├── sample_retail.csv        # Valid 1,000-customer test dataset
│   ├── synthetic_10k.csv        # 10,000-customer scale benchmark dataset
│   ├── invalid_sample.csv       # Schema rejection test dataset
│   ├── ite_scores.csv           # Causal effect scores
│   ├── uplift_curve.csv         # Uplift & Qini coordinates
│   ├── allocation.csv           # Segment budget recommendations
│   ├── strategy_comparison.csv  # Blanket vs Random vs Optimized benchmarks
│   └── mock_ite.json            # Mock ITE JSON payload
├── src/
│   ├── api/
│   │   └── client.js            # Asynchronous FastAPI client with offline fallback
│   ├── assets/
│   │   └── logo-crest.png       # EconoCausal brand identity crest
│   ├── charts/
│   │   ├── AllocationCharts.jsx # Spend vs Gain bars & cumulative spend curve
│   │   ├── IteHistogram.jsx     # Treatment effect distribution histogram
│   │   ├── IteScatterPlot.jsx   # WebGL GPU scattergl with Pearson correlation
│   │   ├── PlotlyComponent.jsx  # Vendor bundle wrapper
│   │   ├── UpliftChart.jsx      # Model vs Oracle vs Random uplift/qini curves
│   │   └── usePlotlyTheme.js    # Reactive dark/light Plotly layout palette
│   ├── constants/
│   │   └── schema.js            # Causal schema definitions & column metadata
│   ├── context/
│   │   ├── DataContext.jsx      # Application state, CSV parser & 10k loader
│   │   ├── context.js           # React Context definition
│   │   └── useData.js           # Custom hook for data consumer components
│   ├── pages/
│   │   ├── AboutPage.jsx        # Scientific principles & system architecture
│   │   ├── AllocationPage.jsx   # What-if dynamic budget slider & allocation table
│   │   ├── ChartsPage.jsx       # Causal Uplift & ITE evaluation dashboard
│   │   └── UploadPage.jsx       # CSV ingestion, 10k scale test & schema validation
│   ├── App.jsx                  # Main dashboard shell & global search palette
│   ├── index.css                # Vanilla CSS design tokens & animations
│   └── main.jsx                 # Application entry point
├── package.json
└── vite.config.js               # Plotly vendor chunk code-splitting
```
