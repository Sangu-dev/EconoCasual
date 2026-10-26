# EconoCausal: Frontend Setup, Architecture & Operations Guide
**Role C: Frontend Engineer — App Shell, Pages, Charts & Backend Integration**  
**Author:** Sangamesh Ragam (`sangamesh-ragam`)  
**Team:** Team Group 25 | **Internship:** Infotact Solutions (Data Science & ML)  
**Deliverable Status:** Production Ready • All Pages, Charts, API Client & Scale Tested

---

## 1. Executive Summary & Deliverables

As **Role C (Frontend Engineer)**, I am responsible for the interactive analytics dashboard of **EconoCausal: Dynamic Pricing via Double Machine Learning**. 

This document details the architecture, setup instructions, validation tests, chart contracts, scale benchmarks, and backend integration requirements.

### Core Features Completed:
1. **Application Shell & Navigation (Reference 3):**
   - Collapsible/compact sidebar navigation for four views: **CSV Ingestion**, **Causal Charts**, **Budget Allocation**, and **Methodology & Guide**.
   - Clean top bar with contextual page titles, live dataset status pill, API status indicator, and a reactive **Light / Dark theme toggle** (Light theme by default).
2. **In-Browser CSV Ingestion Engine (Reference 1):**
   - High-throughput client-side parsing with PapaParse (`dynamicTyping: true`, `header: true`, `skipEmptyLines: 'greedy'`).
   - Strict schema validation enforcing the 7 required causal columns:
     `customer_id`, `age`, `loyalty_score`, `past_orders`, `avg_order_value`, `discount`, `revenue`.
   - Comprehensive error banners highlighting missing vs. recognized columns.
   - Selective 10-row preview table preventing DOM layout thrashing.
3. **Causal Visualizations Suite (Plotly.js):**
   - **Uplift Curve (`UpliftChart.jsx`):** Model Gain vs Oracle Gain vs Random Baseline with Qini curve toggle and normalized AUUC score metrics.
   - **ITE Distribution Histogram (`IteHistogram.jsx`):** Visualizes treatment effect heterogeneity across customers with mean, median, standard deviation, and segment proportions.
   - **WebGL Feature Scatter Plot (`IteScatterPlot.jsx`):** GPU-accelerated `scattergl` rendering plotting ITE against `loyalty_score`, `avg_order_value`, `age`, or `past_orders` with Pearson correlation ($r$) analysis.
4. **Budget Allocation Dashboard (Reference 2):**
   - Top KPI metric cards: Campaign Budget, Targeted Customers, Expected Revenue Lift, Projected Incremental ROI.
   - **Strategy Comparison Bar Chart:** Evaluates Blanket vs Random vs Causal Optimization spend and incremental gain.
   - **Expected Gain by Customer Segment:** Identifies revenue concentration across Persuadables, High-Value Loyal, and At-Risk groups.
   - **Customer Allocation Table:** Paginated (10 rows per page), searchable by Customer ID, filterable by Segment.
5. **Centralized Asynchronous API Client (`client.js`):**
   - Configurable base URL via `VITE_API_BASE_URL` (default: `http://localhost:8000`).
   - Endpoints for health check, CSV upload, ITE scores, uplift curves, and allocation optimization.
   - Resilient offline fallback to local mock data contracts when FastAPI backend is offline.
6. **Scale & Performance:**
   - Benchmarked and verified with synthetic datasets of up to **50,000 customer rows** ($\le$ 365 ms processing time, 60 FPS WebGL).

---

## 2. Directory Structure

```text
EconoCasual/
├── data/
│   ├── mock_retail.csv                    # 1,000-row baseline observational data
│   ├── ite_scores.csv                     # Inbound contract from Role A
│   ├── uplift_curve.csv                   # Inbound contract from Role B
│   ├── allocation.csv                     # Inbound contract from Role B
│   └── strategy_comparison.csv            # Inbound contract from Role B
├── docs/
│   ├── interface_showcase.md              # Visual showcase with primary panel screenshots
│   ├── causal_methodology.md              # Causal inference foundations & Double ML math
│   ├── data_contracts.md                  # Standardized data schemas & contract validation
│   ├── api_architecture.md               # REST API endpoints & offline fallback
│   ├── frontend_setup_sangamesh_ragam.md  # (This comprehensive guide)
│   ├── performance_notes.md               # Empirical benchmark results (1k - 50k rows)
│   ├── glossary.md                        # Causal terminology definitions
│   └── screenshots/                       # UI documentation captures
├── frontend/
│   ├── public/
│   │   ├── favicon.svg                    # Custom Causal DAG icon
│   │   ├── sample_retail.csv              # 1,000-row retail sample (Valid schema)
│   │   ├── invalid_sample.csv             # Test file missing discount & revenue
│   │   ├── mock_ite.json                  # Inbound handoff from Role D
│   │   ├── uplift_curve.csv               # Local mock fallback
│   │   ├── allocation.csv                 # Local mock fallback
│   │   ├── strategy_comparison.csv        # Local mock fallback
│   │   └── synthetic_10k.csv              # 10,000-row stress-test file
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js                  # Centralized API fetch client with fallbacks
│   │   ├── charts/
│   │   │   ├── PlotlyComponent.jsx        # Minified Plotly factory wrapper
│   │   │   ├── usePlotlyTheme.js          # Reactive light/dark theme tokens hook
│   │   │   ├── UpliftChart.jsx            # Uplift & Qini curves + AUUC metrics
│   │   │   ├── IteHistogram.jsx           # ITE distribution & heterogeneity stats
│   │   │   ├── IteScatterPlot.jsx         # WebGL scattergl feature correlation
│   │   │   └── AllocationCharts.jsx       # Strategy comparisons & segment gain
│   │   ├── constants/
│   │   │   └── schema.js                  # Agreed schema and segment constants
│   │   ├── context/
│   │   │   └── DataContext.jsx            # Shared state for datasets, filters & metrics
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx             # CSV ingestion, preview & validation
│   │   │   ├── ChartsPage.jsx             # Causal model evaluation suite
│   │   │   ├── AllocationPage.jsx         # Budget optimization dashboard
│   │   │   └── AboutPage.jsx              # Methodology, DML logic & team division
│   │   ├── App.jsx                        # Sidebar + Top bar shell layout
│   │   ├── index.css                      # Modern SaaS CSS design system (Light/Dark)
│   │   └── main.jsx
│   ├── .env.example                       # Documented environment variables
│   ├── package.json                       # Dependencies & scripts
│   └── vite.config.js                     # Rolldown vendor chunk-splitting configuration
└── README.md                              # Main project documentation
```

---

## 3. Prerequisites & Quickstart

### Prerequisites
- **Node.js:** v18.0.0+ LTS or v20.0.0+ LTS (Tested on `v22.20.0`)
- **npm:** v9.0.0+ (Tested on `v10.9.3`)
- **Git:** Working on branch `sangamesh-ragam`

### Local Setup Steps

```powershell
# 1. Switch to your working branch
git switch sangamesh-ragam

# 2. Navigate to frontend folder
cd frontend

# 3. Install dependencies
npm install

# 4. Optional: Configure custom backend URL
copy .env.example .env
# Edit VITE_API_BASE_URL if your FastAPI server is on a custom port

# 5. Start development server
npm run dev
```

The application will start immediately at:
`http://localhost:5173/`

### Production Build & Preview

```powershell
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 4. API Client & FastAPI Integration Requirements

The frontend connects to the backend via `frontend/src/api/client.js`.

### Endpoints Contract:
| Method | Endpoint | Description | Frontend Fallback |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server heartbeat & status | Displays "Mock Data Mode" status |
| `POST` | `/api/upload` | Ingests CSV (`multipart/form-data`) | Parses in-browser via PapaParse |
| `GET` | `/api/uplift` | Returns Uplift curve points | Reads `/uplift_curve.csv` |
| `GET` | `/api/ite` | Returns customer ITE predictions | Reads `/mock_ite.json` |
| `GET` | `/api/allocation?budget={N}` | Returns budget assignment plan | Reads `/allocation.csv` |
| `GET` | `/api/strategy-comparison` | Returns comparison metrics | Reads `/strategy_comparison.csv` |

### Required CORS Configuration (For Teammate A / FastAPI Backend):
To prevent browser CORS blocking, the FastAPI server must include:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 5. Testing & Quality Assurance Workflows

### Scenario 1: Valid Ingestion & Schema Pass
1. Open `http://localhost:5173/`.
2. Click **"Load Sample CSV (1k Rows)"** or upload `sample_retail.csv`.
3. **Verify:** Green alert banner displays `"Schema Verification Passed!"`.
4. **Verify:** Summary cards display 1,000 customers, 7 features, ~42% treatment ratio.
5. **Verify:** First 10 rows populate the preview table with formatted badges.

### Scenario 2: Schema Rejection & Error Remediation
1. Click **"Test Schema Rejection"** or upload `invalid_sample.csv`.
2. **Verify:** Red alert banner displays `"Schema Verification Error: Missing 2 required causal column(s): [discount, revenue]"`.
3. **Verify:** Missing columns are tagged with red `✕` badges and recognized columns with green `✓` badges.

### Scenario 3: Causal Charts & WebGL Acceleration
1. Navigate to **Causal Charts** tab.
2. Toggle between **Uplift Curve** and **Qini Curve**; inspect AUUC metrics.
3. Review **ITE Distribution** histogram and check zero-effect vertical line.
4. Interact with the **WebGL Scatter Plot** feature dropdown (`Loyalty Score`, `Average Order Value`, `Age`, `Past Orders`) and observe instantaneous 60 FPS GPU rendering.
5. Adjust **Interactive Cohort Filters** (e.g. Min Loyalty slider); observe real-time chart synchronization.

### Scenario 4: Budget Allocation & ROI Exploration
1. Navigate to **Budget Allocation** tab.
2. Adjust the **Campaign Budget** selector ($10k, $25k, $50k, $100k).
3. Verify that KPI summary cards and Strategy Comparison charts update.
4. Search customer IDs in the **Customer Allocation Table** and test pagination controls.

### Scenario 5: Theme Toggle
1. Click the Sun/Moon icon in the top right corner.
2. Verify that surfaces, text, borders, and all Plotly chart canvases instantly adapt between clean Light theme and Dark theme.
