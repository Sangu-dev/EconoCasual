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

## License

This project is licensed under the [MIT License](LICENSE).
