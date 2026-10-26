<div align="center">

# 📊 EconoCausal

### Causal Uplift Modeling & Budget Optimization via Double Machine Learning

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Plotly.js](https://img.shields.io/badge/Plotly.js-WebGL_Accelerated-3F4F75?style=for-the-badge&logo=plotly&logoColor=white)](https://plotly.com/javascript/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend_Ready-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![EconML](https://img.shields.io/badge/EconML-Double_ML-blue?style=for-the-badge)](https://econml.azurewebsites.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>An end-to-end causal decision framework that estimates Individual Treatment Effects (ITE) from observational customer data, isolates unconfounded promotional lift via Double Machine Learning (DML), evaluates causal uplift with Qini & AUUC metrics, and optimizes marketing budgets under resource constraints at 60 FPS GPU scale.</b>
</p>

[Quickstart](#-quickstart) •
[Key Features](#-key-features) •
[System Architecture](#-system-architecture) •
[Documentation](#-documentation) •
[Interface Gallery](docs/interface_showcase.md)

---

</div>

## 📌 What is EconoCausal?

Traditional machine learning algorithms predict **correlation** ($\Pr(\text{Conversion} \mid X)$), misallocating promotional budgets by subsidizing customers who would have purchased anyway.

**EconoCausal** estimates the **true counterfactual lift** of promotional discounts using the **Neyman-Rubin Potential Outcomes Framework** and **Double Machine Learning (DML)**. It identifies who will purchase *because* of an incentive, segments customers into 4 causal archetypes (*Persuadables*, *Sure Things*, *Lost Causes*, *Sleeping Dogs*), and calculates ROI-maximizing budget allocation plans under financial constraints.

| Dimension | Standard Predictive ML | EconoCausal Causal DML Framework |
| :--- | :--- | :--- |
| **Question Answered** | *"Who will buy?"* | *"Who will buy **because** of a discount?"* |
| **Target Audience** | High-propensity buyers (*Sure Things*) | Incremental responders (*Persuadables*) |
| **Capital Efficiency** | **Low:** Subsidizes organic purchases | **Maximal:** Spends exclusively where lift > 0 |
| **Confounder Handling**| **Biased:** Confuses loyalty with discount lift | **Unconfounded:** Orthogonal residualization eliminates bias |
| **Core Metric** | ROC-AUC, RMSE, Accuracy | **Qini Score, AUUC (Area Under Uplift Curve)** |

---

## ⚡ Key Features

- **🎯 Double Machine Learning Engine:** Unbiased Conditional Average Treatment Effect (CATE) estimation via Neyman-orthogonal residualization (Robinson's transformation).
- **📈 Interactive Causal Evaluation Suite:** Uplift and Qini curves comparing Model vs. Oracle Ceiling vs. Random Baseline with normalized AUUC metrics.
- **📊 60 FPS GPU WebGL Visualizations:** Renders **50,000+ customer records at 60 FPS** using Plotly WebGL (`scattergl`) with live Pearson correlation ($r$) and treatment heterogeneity histograms.
- **💰 Constraint-Aware Budget Optimizer:** Non-linear optimization engine comparing **Blanket Targeting** vs. **Random Allocation** vs. **Causal DML Optimization** with paginated customer assignment tables.
- **🛡️ Client-Side Ingestion & Validation:** Browser-native PapaParse streaming parser processing 50,000 rows in < 400 ms with strict 7-column causal schema validation.
- **🔌 Offline-First Resilient Architecture:** Seamlessly toggles between live FastAPI REST endpoints and bundled local data contracts with zero UI crashes.
- **🎨 Modern Enterprise SaaS UI:** Built with React 19, Vite, and custom CSS design tokens featuring full **Light & Dark Theme** support.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   EconoCausal Pipeline                                  │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. Data Ingestion & Schema Engine (Browser-Native)                                      │
│    • Streaming PapaParse parser (50,000 rows in < 400 ms)                               │
│    • Strict 7-column causal schema validation with diagnostic alert banners             │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. Causal Uplift Modeling (EconML / DoWhy)                                              │
│    • Neyman-orthogonal residualization via Robinson's transformation (Double ML)        │
│    • Estimates Individual Treatment Effects (ITE) and isolates true promotional lift    │
│    • Computes cumulative Uplift & Qini coordinates with normalized AUUC metrics         │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. Constrained Budget Optimization (SciPy SLSQP)                                        │
│    • Multi-scenario policy comparisons: Blanket vs Random vs Causal Optimization        │
│    • Targets Persuadables; suppresses discounts for Sure Things and Lost Causes         │
│    • Generates customer-level discount assignments under capital constraints            │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. Analytics Dashboard & API Layer (React 19 + Plotly WebGL)                            │
│    • GPU-accelerated WebGL scatter plots rendering 50,000+ points at 60 FPS             │
│    • Interactive ITE histograms, Uplift/Qini charts, and paginated allocation tables    │
│    • Centralized API client with resilient offline mock fallback architecture           │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart

### 1. Frontend Setup (Interactive Dashboard)
```bash
# Navigate to frontend
cd frontend

# Install dependencies (React 19, Vite, Plotly, PapaParse, Lucide)
npm install

# Start development server
npm run dev
```
Open **`http://localhost:5173/`** in your browser.  
> *Tip: Click **"Load Sample Retail Data"** on the upload page to test the application instantly.*

### 2. Backend Setup (Optional / Live API Mode)
```bash
# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install dependencies and start FastAPI server
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

---

## 📚 Documentation

Detailed documentation and technical deep dives are organized in the [`docs/`](docs/) directory:

| Document | Description |
| :--- | :--- |
| 🖼️ [**Interface Showcase & Screenshots**](docs/interface_showcase.md) | High-resolution visual tour of all 4 primary panels: Ingestion, Causal Suite, Budget Allocation, and Guide. |
| 🔬 [**Scientific Methodology & Theory**](docs/causal_methodology.md) | Neyman-Rubin model, Robinson's transformation, cross-fitting, and Qini evaluation mathematics. |
| 📋 [**Data Contracts & Schemas**](docs/data_contracts.md) | Complete schema definitions, column constraints, and validation rules for all 5 pipeline datasets. |
| 🔌 [**API Architecture & Contracts**](docs/api_architecture.md) | REST API endpoints specification, payload examples, and zero-crash offline fallback architecture. |
| ⚡ [**Scale & Performance Benchmarks**](docs/performance_notes.md) | Empirical benchmarks (1k to 50k rows), WebGL GPU acceleration, and memory profiling. |
| 💻 [**Frontend Setup & Operations**](docs/frontend_setup_sangamesh_ragam.md) | Comprehensive frontend development, build, test, and architecture documentation. |
| 📖 [**Causal Terminology Glossary**](docs/glossary.md) | Plain-English definitions and real-world examples of causal inference and uplift terminology. |

---

## 📂 Repository Structure

```text
EconoCasual/
├── data/                    # Standardized pipeline data contracts (CSV)
├── docs/                    # System documentation, benchmarks & screenshots
│   ├── screenshots/         # High-resolution UI captures of the 4 primary panels
│   ├── interface_showcase.md# Visual interface gallery
│   ├── causal_methodology.md# Mathematical & causal foundations
│   ├── data_contracts.md    # Input/output schema contracts
│   ├── api_architecture.md  # REST API specifications & fallback flow
│   ├── performance_notes.md # 1k to 50k row scale benchmark results
│   └── glossary.md          # Causal AI terminology definitions
├── frontend/                # React 19 + Vite Web Application
│   ├── public/              # Bundled mock contracts & test datasets
│   └── src/
│       ├── api/             # Centralized API client with fallback handling
│       ├── charts/          # Plotly.js WebGL visualization suite
│       ├── context/         # React DataContext global state store
│       └── pages/           # Upload, Charts, Allocation & About views
├── backend/                 # FastAPI backend services & endpoints
├── src/                     # Core DML algorithms & optimization pipelines
└── README.md                # Project manual & documentation hub
```

---

## 📜 License

This project is open-source and distributed under the [MIT License](LICENSE).

<div align="center">
  <sub>Built with precision for causal decision-making • EconoCausal © 2026</sub>
</div>
