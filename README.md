# EconoCausal

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![EconML](https://img.shields.io/badge/EconML-Double__ML-268BEE?style=flat-square)](https://econml.azurewebsites.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> Causal Uplift Modeling & Marketing Budget Optimization via Double Machine Learning.

---

## Overview

Traditional predictive machine learning targets high-propensity buyers based on correlation ($\Pr(\text{Conversion} \mid X)$). This often wastes promotional budgets on "Sure Things"—customers who would have made a purchase regardless of an incentive.

**EconoCausal** applies the **Neyman-Rubin Potential Outcomes framework** and **Double Machine Learning (DML)** to estimate Individual Treatment Effects (ITE) from observational customer data. By isolating true incremental revenue lift through orthogonal residualization, the system identifies *Persuadables*, suppresses spend on non-responsive segments, and solves constraint-aware budget allocations to maximize promotional ROI.

---

## Key Features

- **Double Machine Learning Engine:** Estimates unbiased Conditional Average Treatment Effects (CATE) using Robinson's transformation via EconML (`LinearDML`, `CausalForestDML`) and LightGBM nuisance models.
- **Interactive Uplift & Qini Evaluation:** Evaluates model lift against Oracle and Random baselines with interactive Uplift and Qini curves and normalized AUUC metrics.
- **GPU-Accelerated Visualizations:** Smoothly renders 50,000+ customer records at 60 FPS using Plotly WebGL (`scattergl`), alongside treatment heterogeneity histograms and Pearson correlation ($r$) analysis.
- **Constrained Budget Optimizer:** Allocates marketing spend under resource constraints, directly comparing Causal Optimization against Blanket and Random allocation policies.
- **Client-Side CSV Parsing & Validation:** In-browser streaming ingestion with PapaParse, supporting 50,000 rows in <400 ms with strict 7-column schema verification and diagnostic error reporting.
- **Offline-First Resilience:** Centralized API client that automatically falls back to bundled local data contracts when the FastAPI backend is offline.
- **Modern Responsive UI:** Built with React 19, Vite, and custom CSS design tokens featuring seamless Light and Dark mode switching.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend & Causal Inference** | Python, FastAPI, Uvicorn, EconML, LightGBM, Scikit-learn, SciPy, Pandas, NumPy, DoWhy |
| **Frontend & Visualization** | React 19, Vite, Plotly.js (`react-plotly.js`, WebGL `scattergl`), PapaParse, Lucide React |
| **Testing & Tooling** | Pytest, HTTPX (`TestClient`), Oxlint |

---

## Project Structure

```text
EconoCasual/
├── backend/            # FastAPI service and API routes
│   └── main.py         # Application entry point and REST endpoints
├── src/                # Core causal inference & optimization modules
│   ├── double_ml.py    # Double ML models (LinearDML, CausalForestDML)
│   ├── optimizer_stub.py# Greedy budget allocation engine
│   ├── pipeline.py     # End-to-end causal pipeline & schema validation
│   └── prepare_data.py # Data transformation utilities
├── frontend/           # React 19 + Vite web application
│   ├── src/
│   │   ├── api/        # Centralized API client with offline fallback
│   │   ├── charts/     # Plotly WebGL visualizations (Uplift, ITE, Allocation)
│   │   ├── context/    # Global DataContext state management
│   │   └── pages/      # Ingestion, Charts, Allocation, and About views
│   └── public/         # Bundled mock datasets and fallback contracts
├── data/               # Input data contracts, ITE scores, and curve outputs
├── docs/               # System documentation, contracts, and screenshots
├── tests/              # Pytest backend and integration test suite
├── requirements.txt    # Python dependencies
└── start.bat           # One-click Windows runner for backend and frontend
```

---

## Installation & Setup

### Prerequisites
- **Python:** 3.11 or higher
- **Node.js:** 18 or higher (with `npm`)

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/sangamesh-ragam/EconoCasual.git
cd EconoCasual

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup

```bash
# Navigate to frontend and install packages
cd frontend
npm install
cd ..
```

---

## Running the Project

### Option A: One-Click Startup (Windows)

Execute the launcher script from the project root:

```bat
start.bat
```

*This automatically activates the virtual environment, verifies frontend dependencies, boots both FastAPI (`http://localhost:8000`) and Vite (`http://localhost:5173`) in dedicated windows, and opens your default browser.*

### Option B: Manual Startup

**1. Start Backend Server:**
```bash
# From the repository root (with virtual environment active)
uvicorn backend.main:app --reload --port 8000
```
*API will run at `http://localhost:8000`.*

**2. Start Frontend Server:**
```bash
cd frontend
npm run dev
```
*Application interface will run at `http://localhost:5173`.*

---

## API Documentation

When the backend service is running, interactive API documentation is accessible at:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Core Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Check backend availability and ITE score readiness |
| `POST` | `/api/upload` | Upload CSV dataset, validate schema, and trigger DML model fit |
| `GET` | `/api/ite` | Retrieve computed ITE scores, features, and customer segments |
| `GET` | `/api/uplift` | Fetch cumulative Uplift and Qini gain curve coordinates |
| `POST` | `/optimize` | Calculate optimal discount allocation under budget constraints |
| `GET` | `/api/allocation` | Retrieve customer-level discount allocation table |
| `GET` | `/api/strategy-comparison` | Compare outcomes across Blanket, Random, and Causal strategies |

---

## Testing

### Backend Tests
Execute the unit and integration test suite with `pytest`:

```bash
pytest tests/
```

### Frontend Verification
Verify frontend build integrity and linting:

```bash
cd frontend
npm run lint
npm run build
```

---

## Future Improvements

- **Continuous Treatment Modeling:** Support multi-level and continuous discount depths rather than binary treatment assignments.
- **Multi-Arm Interventions:** Extend the causal pipeline to model multiple simultaneous promotion types (e.g., discounts vs. buy-one-get-one).
- **Model Registry & Export:** Support serialization and export of fitted DML models for production batch scoring.

---

## Author

**Sangamesh Ragam**
- GitHub: [@sangamesh-ragam](https://github.com/sangamesh-ragam)
- Role: Frontend & Machine Learning Engineer (Team Group 25)

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
