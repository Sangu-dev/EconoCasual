<<<<<<< HEAD
# EconoCausal

> Causal Uplift Modeling and Budget Optimization via Double Machine Learning

EconoCausal is a framework for estimating causal treatment effects and optimizing budget allocation. By leveraging Double Machine Learning (DML), it identifies true incremental impact from observational data to maximize return on investment under resource constraints.

---

## Features

- **Causal Uplift Modeling** — Estimate Conditional Average Treatment Effects (CATE) using DML estimators.
- **Budget Optimization** — Allocate marketing and intervention spend to maximize total incremental return.
- **Modular Pipeline** — Decoupled components for data ingestion, causal estimation, backend services, and dashboard interfaces.

---

## Repository Structure

```text
EconoCasual/
├── backend/      # API services and backend logic
├── frontend/     # Web dashboard and visualization UI
├── src/          # Core causal modeling and optimization modules
├── notebooks/    # Exploratory data analysis and experimental workflows
├── data/         # Sample datasets and input pipelines
├── docs/         # System documentation and architecture notes
└── tests/        # Unit and integration test suites
```

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Sangu-dev/EconoCasual.git
cd EconoCasual
```

### 2. Environment Setup
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

---

## Frontend Dashboard (Role C)

The EconoCausal web application is an interactive analytics dashboard built with Vite, React 19, and Plotly.js.

### Frontend Features:
- **Client-Side CSV Ingestion:** In-browser PapaParse engine supporting 50,000+ rows with strict causal schema validation (`customer_id`, `age`, `loyalty_score`, `past_orders`, `avg_order_value`, `discount`, `revenue`).
- **Causal Uplift & Qini Curves:** Dynamic Model Gain vs. Oracle Ceiling vs. Random Baseline with normalized AUUC metrics.
- **ITE Distribution & Heterogeneity:** Treatment effect histogram with zero-effect marker and customer segmentation.
- **WebGL GPU-Accelerated Scatter Plot:** Real-time 60 FPS scatter rendering using `scattergl` for large feature correlation analysis.
- **Budget Allocation Engine:** Strategy comparisons (Blanket vs Random vs Optimized) and paginated allocation tables.
- **Design System:** Minimal SaaS design with Light Theme by default, optional Dark Theme toggle, and collapsible sidebar.

### Running Frontend Locally:
```bash
cd frontend
npm install
npm run dev
```
Access the dashboard at `http://localhost:5173/`.

### Production Build:
```bash
cd frontend
npm run build
npm run preview
```

---

## Contributors

- **Sangamesh Ragam** (Role C: Frontend Engineer)

---

## License

This project is licensed under the [MIT License](LICENSE).

