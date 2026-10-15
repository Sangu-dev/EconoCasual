# EconoCausal — Frontend Application Shell & Analytics Engine

> **Role C (Frontend Engineer):** Sangamesh Ragam  
> **Team:** Team Group 25 | **Internship:** Infotact Solutions  
> **Git Branch:** `sangamesh-ragam`  
> **Milestone:** Stage 1 (10–16 October 2026)

---

## Overview

The **EconoCausal Frontend** is an interactive causal analytics web application built with React 19 and Vite. It provides the experimentation interface (Module 4) for marketing decision-makers and data scientists to evaluate Individual Treatment Effects (ITE), visualize Uplift/Qini curves, and optimize discount budget allocation under resource constraints.

---

## Key Features (Stage 1)

1. **Client-Side CSV Parsing:** Powered by `PapaParse`, allowing browser-side parsing of retail observational datasets up to 50,000+ rows.
2. **Strict Causal Schema Validation:** Verifies the 7 mandatory columns required by Double Machine Learning (DML) models:
   - `customer_id` (identifier)
   - `age`, `loyalty_score`, `past_orders`, `avg_order_value` (confounders)
   - `discount` (binary treatment: 0/1)
   - `revenue` (continuous outcome: $Y$)
3. **Real-time Diagnostic Banners:** Explicit, user-friendly alert cards displaying missing vs recognized features when invalid files are uploaded.
4. **Summary KPI Metrics & 10-Row Preview Table:** Real-time metrics (customer count, treatment ratio, average revenue) with formatted preview table.
5. **Shared Global State (`DataContext`):** Global state with fallback to `mock_ite.json` for cross-page development.
6. **Curated Aesthetic:** Slate cosmic dark mode, accessible contrast, smooth micro-animations, and responsive layout.

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
│   ├── favicon.svg              # Causal DAG favicon
│   ├── sample_retail.csv        # Valid 1,000-customer test dataset
│   ├── invalid_sample.csv       # Schema rejection test dataset
│   └── mock_ite.json            # Mock ITE scores for cross-view state testing
├── src/
│   ├── context/
│   │   └── DataContext.jsx      # Shared application state & validation engine
│   ├── pages/
│   │   ├── UploadPage.jsx       # CSV upload & schema validation view
│   │   ├── ChartsPage.jsx       # Causal Uplift & ITE visualizations (Stage 2)
│   │   ├── AllocationPage.jsx   # Budget optimization & segment view (Stage 4)
│   │   └── AboutPage.jsx        # Methodology & causal reasoning guide
│   ├── App.jsx                  # Main application shell with tabbed navigation
│   ├── index.css                # Vanilla CSS design system
│   └── main.jsx                 # Application entry point
├── package.json
└── vite.config.js
```

---

## Inbound Handoff Contracts

| File / Resource | Source Role | Due Date | Destination |
| :--- | :---: | :---: | :--- |
| `mock_ite.json` | Role D | 13 Oct | `frontend/public/mock_ite.json` |
| `uplift_curve.csv` | Role B | 19 Oct | `data/uplift_curve.csv` |
| `ite_scores.csv` | Role A | 19 Oct | `data/ite_scores.csv` |
| `allocation.csv` | Role B | 28 Oct | `data/allocation.csv` |
| FastAPI Backend | Role A | 30 Oct | `http://localhost:8000` |
