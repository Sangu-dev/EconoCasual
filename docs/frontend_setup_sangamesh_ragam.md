# EconoCausal: Frontend Setup & Operations Guide
**Role C: Frontend Engineer — App Shell, Pages, Charts & Backend Integration**  
**Author:** Sangamesh Ragam (`sangamesh-ragam`)  
**Team:** Team Group 25 | **Internship:** Infotact Solutions (Data Science & ML)  
**Milestone:** Stage 1 Deliverable (Week 1: 10–16 October 2026)

---

## 1. Overview & Stage 1 Deliverables

As **Role C (Frontend Engineer)**, I am responsible for Module 4 (Experimentation UI & Analytics Dashboard). 

In **Stage 1 (Week 1)**, the primary deliverable is a high-performance **Vite + React** web application equipped with:
1. **Application Shell & Layout:** Top navigation header, brand identity, status indicators, and view switcher.
2. **Client-Side CSV Upload Engine:** In-browser ingestion using `PapaParse` supporting up to 50,000+ customer records.
3. **Mandatory Schema Validation:** Real-time contract verification enforcing all 7 required causal columns:
   - `customer_id` (identifier)
   - `age` (confounder)
   - `loyalty_score` (confounder)
   - `past_orders` (confounder)
   - `avg_order_value` (confounder)
   - `discount` (binary treatment: $0 = \text{Control}$, $1 = \text{Treated}$)
   - `revenue` (continuous outcome: $Y$)
4. **Summary Metrics & 10-Row Preview Table:** Real-time calculation of customer count, feature dimensions, treatment ratio ($T=1$), mean revenue, and formatted sample rows.
5. **Interactive Error / Rejection Banners:** Clear visual feedback highlighting exactly which mandatory columns are missing vs detected.
6. **Shared Global State (`DataContext`):** React Context managing datasets and mock ITE scores cross-page, verified against Role D's `mock_ite.json` contract.

---

## 2. Directory Structure

```text
EconoCasual/
├── data/
│   └── mock_retail.csv                 # Observational baseline dataset
├── docs/
│   ├── .gitkeep
│   └── frontend_setup_sangamesh_ragam.md  # (This setup file)
├── frontend/
│   ├── public/
│   │   ├── favicon.svg                 # Custom Causal DAG icon
│   │   ├── sample_retail.csv           # 1,000-customer test file (Valid schema)
│   │   ├── invalid_sample.csv          # Schema rejection test file (Missing discount & revenue)
│   │   └── mock_ite.json               # Inbound handoff contract from Role D (ITE predictions)
│   ├── src/
│   │   ├── assets/                     # Icons and static media
│   │   ├── context/
│   │   │   └── DataContext.jsx         # Global state & PapaParse validation logic
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx          # Stage 1 Core: CSV ingestion, preview & validation
│   │   │   ├── ChartsPage.jsx          # Stage 2 Staging: Uplift & ITE plots
│   │   │   ├── AllocationPage.jsx      # Stage 4 Staging: Budget optimization & KPI cards
│   │   │   └── AboutPage.jsx           # Scientific explainer: DML, ITE & team roles
│   │   ├── App.css
│   │   ├── App.jsx                     # Top-level shell with tabbed navigation
│   │   ├── index.css                   # Modern vanilla CSS design system
│   │   └── main.jsx
│   ├── index.html                      # HTML entry with Plus Jakarta Sans & JetBrains Mono
│   ├── package.json                    # Dependencies (React 19, PapaParse, Lucide-React)
│   └── vite.config.js
└── README.md
```

---

## 3. Prerequisites & Environment Setup

### System Requirements:
- **Node.js:** v18.0.0+ LTS or v20.0.0+ LTS (Tested on `v22.20.0`)
- **npm:** v9.0.0+ (Tested on `10.9.3`)
- **Operating System:** Windows, macOS, or Linux

---

## 4. How to Run Locally

### Step 1: Switch to Git Branch
```powershell
git switch sangamesh-ragam
git pull origin sangamesh-ragam
```

### Step 2: Navigate to Frontend Directory
```powershell
cd frontend
```

### Step 3: Install Dependencies
```powershell
npm install
```

### Step 4: Start Development Server
```powershell
npm run dev
```
The server will boot instantly at:
```
  VITE v8.3.4  ready in 180 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 5: Verify Production Bundle
```powershell
npm run build
npm run preview
```

---

## 5. Testing & Validation Workflow

### Test Scenario A: Valid CSV Ingestion (Pass)
1. Launch the application at `http://localhost:5173`.
2. On the **CSV Ingestion** tab, click **"Load Sample CSV (1k Rows)"** or drag and drop `frontend/public/sample_retail.csv`.
3. **Expected Behavior:**
   - Emerald Banner: `"Schema Verification Passed! All 7 required causal features verified."`
   - KPI Grid updates with:
     - Total Customers: `1,000`
     - Schema Features: `7 Columns`
     - Treatment Ratio: `~42%–45%`
     - Mean Revenue: `~$280.00`
   - Mandatory Schema checklist shows all 7 columns with green checkmarks.
   - 10-row preview table populates with formatted currency and treatment pills (`Treated (1)` vs `Control (0)`).

### Test Scenario B: Invalid CSV Schema (Rejection Banner)
1. On the **CSV Ingestion** tab, click **"Test Schema Rejection"** or upload `frontend/public/invalid_sample.csv`.
2. **Expected Behavior:**
   - Rose Alert Banner: `"Schema Verification Error: Missing 2 required causal column(s): [discount, revenue]."`
   - Red badges display missing columns: `✕ discount`, `✕ revenue`.
   - Green badges display recognized columns: `✓ customer_id`, `✓ age`, `✓ loyalty_score`, `✓ past_orders`, `✓ avg_order_value`.
   - The application does not crash and provides clear diagnostic remediation steps.

### Test Scenario C: Cross-Page State Propagation (Task T4)
1. Upload a dataset or load the sample dataset.
2. Click the **"Causal Charts"** tab in the top navigation.
3. **Expected Behavior:**
   - Active dataset state persists across views via `DataContext`.
   - Mock ITE records (`mock_ite.json`) are rendered into the 4 behavioral segments (Persuadables, Sure Things, Lost Causes, Sleeping Dogs).

---

## 6. Next Steps for Stage 2 (17–23 October)

- **Task T1 (17 Oct):** Install `react-plotly.js` and `plotly.js-dist-min`.
- **Task T2 (18 Oct):** Build `frontend/src/charts/UpliftChart.jsx` (Model Gain vs Oracle Gain vs Random baseline).
- **Task T3 (19 Oct):** Build `frontend/src/charts/IteHistogram.jsx` and WebGL `scattergl` plots.
- **Task T4 (19 Oct):** Ingest real `ite_scores.csv` (Role A) and `uplift_curve.csv` (Role B).
