# 🔌 EconoCausal — API Architecture & Integration Contracts

This document defines the REST API contracts, backend communication architecture, and offline fallback mechanisms implemented in **EconoCausal**.

---

## 1. System Communication Architecture

The React 19 application communicates with backend services via a centralized client module located at [`frontend/src/api/client.js`](../frontend/src/api/client.js).

The client implements an **offline graceful fallback pattern**:
- **FastAPI Online:** When the backend service is running on `http://localhost:8000`, the application issues live HTTP fetch requests.
- **FastAPI Offline:** If the backend is unreachable or returns a network error, the client seamlessly intercepts the failure, loads the corresponding local contract from `/public/*.csv` or `/public/*.json`, and maintains full dashboard interactivity with zero UI crashes.

```text
                       ┌─────────────────────────────────────────┐
                       │     React 19 Frontend Components        │
                       │     (Upload, Charts, Allocation)        │
                       └────────────────────┬────────────────────┘
                                            │ API Request
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │        Centralized ApiClient            │
                       │     (frontend/src/api/client.js)        │
                       └────────────────────┬────────────────────┘
                                            │
                             FastAPI Backend Reachable?
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
          [ Online: 200 OK ]                            [ Offline / Network Error ]
                     │                                             │
                     ▼                                             ▼
       ┌───────────────────────────┐                 ┌───────────────────────────┐
       │   FastAPI REST Backend    │                 │   Bundled Mock Contracts  │
       │(http://localhost:8000/api)│                 │   (/public/*.csv & *.json)│
       └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                     │ Live Data                                   │ Fallback Data
                     └──────────────────────┬──────────────────────┘
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │       React DataContext Store           │
                       │    (State, Filter Engine, Theme)        │
                       └────────────────────┬────────────────────┘
                                            │ Reactive Re-render
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │          Updated User Interface         │
                       └─────────────────────────────────────────┘
```

---

## 2. Configuration & Environment Variables

The API base URL is configured via environment variables in `frontend/.env`:

```env
# URL for the FastAPI backend (Role A & B services)
VITE_API_BASE_URL=http://localhost:8000
```

When `VITE_API_BASE_URL` is omitted or unavailable, the client defaults to `http://localhost:8000`.

---

## 3. REST API Endpoints Specification

| HTTP Method | Endpoint | Query / Body | Expected Response | Description | Offline Fallback Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | None | `{"status": "ok"}` | Heartbeat endpoint to check backend availability and CORS readiness | Returns offline status pill |
| `POST` | `/api/upload` | Form-data: `file: File` | `{"rows": N, "columns": [...]}` | Uploads raw observational retail CSV for backend DML inference | Parsed client-side via PapaParse |
| `GET` | `/api/uplift` | None | `List[UpliftPoint]` | Coordinates for Model vs Oracle vs Random uplift and Qini curves | [`public/uplift_curve.csv`](../frontend/public/uplift_curve.csv) |
| `GET` | `/api/ite` | `limit={N}` (optional) | `List[CustomerITE]` | Customer records with estimated treatment effects ($\text{ITE}_i$) | [`public/mock_ite.json`](../frontend/public/mock_ite.json) |
| `GET` | `/api/allocation` | `budget={N}` | `List[AllocationItem]` | Budget-constrained discount allocations and segments | [`public/allocation.csv`](../frontend/public/allocation.csv) |
| `GET` | `/api/strategy-comparison` | None | `List[StrategyItem]` | Cumulative spend and incremental revenue across all 3 strategies | [`public/strategy_comparison.csv`](../frontend/public/strategy_comparison.csv) |

---

## 4. Endpoint Response Payload Examples

### `GET /api/uplift`
```json
[
  {
    "fraction_targeted": 0.1,
    "model_gain": 4250.50,
    "oracle_gain": 5100.00,
    "random_gain": 1250.00
  },
  {
    "fraction_targeted": 0.2,
    "model_gain": 8100.20,
    "oracle_gain": 9400.00,
    "random_gain": 2500.00
  }
]
```

### `GET /api/ite`
```json
[
  {
    "customer_id": 1001,
    "age": 34,
    "loyalty_score": 0.82,
    "avg_order_value": 78.50,
    "past_orders": 12,
    "ite": 14.25
  }
]
```

### `GET /api/strategy-comparison`
```json
[
  {
    "strategy": "blanket",
    "total_spend": 50000.0,
    "total_gain": 42000.0
  },
  {
    "strategy": "random",
    "total_spend": 25000.0,
    "total_gain": 24500.0
  },
  {
    "strategy": "optimized",
    "total_spend": 25000.0,
    "total_gain": 78500.0
  }
]
```

---

## 5. Error Handling & Resilience Patterns

1. **Network Timeout & Retry:** Asynchronous requests use a bounded fetch wrapper. If a network connection drops or times out, the client notifies the UI via the `apiStatus` state without throwing uncaught exceptions.
2. **CORS Protection:** FastAPI backend must enable `CORSMiddleware` allowing `http://localhost:5173` for cross-origin browser requests during development.
3. **Data Type Coercion:** CSV response parsers apply explicit number casting (`parseFloat`, `parseInt`) to prevent string concatenation bugs in mathematical aggregations and charts.
