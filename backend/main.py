import io
import logging
from pathlib import Path

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.optimizer_stub import greedy_optimizer
from src.pipeline import REQUIRED_COLUMNS, run_allocation

logger = logging.getLogger("econocausal.api")

app = FastAPI(title="Econocausal API", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Relative paths: start uvicorn from the project root.
DATA_DIR = Path("data")
ITE_PATH = DATA_DIR / "ite_scores.csv"
UPLIFT_PATH = DATA_DIR / "uplift_curve.csv"
UPLOAD_PATH = DATA_DIR / "retail_campaign.csv"


class OptimizeRequest(BaseModel):
    budget: float = Field(..., gt=0, description="Total campaign budget in rupees")
    discount_amount: float = Field(
        1.00, gt=0, description="Assumed cost of giving one customer the discount, in rupees"
    )


# ---------------------------------------------------------------- helpers
def load_ite() -> pd.DataFrame:
    if not ITE_PATH.exists():
        raise HTTPException(404, f"{ITE_PATH} not found. Run the pipeline first.")
    return pd.read_csv(ITE_PATH)


def to_json_records(df: pd.DataFrame) -> list[dict]:
    """Convert a DataFrame to JSON-safe records (NaN/inf -> None, numpy types -> Python)."""
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.astype(object).where(df.notna(), None)
    return df.to_dict("records")


def assign_segment(ite: pd.Series) -> np.ndarray:
    """Placeholder segmentation from ITE alone.

    ITE cannot separate Sure Things from Lost Causes (that needs baseline
    purchase probability), so: negative -> Sleeping Dogs, top half of the
    positive effects -> Persuadables, everything else -> Sure Things.
    Replace with the real segmentation from the modeling pipeline.
    """
    positive = ite[ite > 0]
    cutoff = positive.median() if len(positive) else 0.0
    return np.select(
        [ite < 0, ite >= cutoff],
        ["Sleeping Dogs", "Persuadables"],
        default="Sure Things",
    )


# ----------------------------------------------------------------- routes
@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok", "ite_scores_available": ITE_PATH.exists()}


@app.get("/api/ite")
@app.get("/ite")
def get_ite(
    limit: int = Query(1000, ge=1, le=10000),
    offset: int = Query(0, ge=0),
):
    df = load_ite()
    return {
        "total": len(df),
        "rows": to_json_records(df.iloc[offset : offset + limit]),
    }


@app.get("/api/uplift")
def get_uplift():
    """Uplift / Qini coordinates. Serves data/uplift_curve.csv if present,
    otherwise builds an approximate curve from the ITE scores."""
    if UPLIFT_PATH.exists():
        return to_json_records(pd.read_csv(UPLIFT_PATH))

    ite = load_ite()["ite"].sort_values(ascending=False).to_numpy()
    n = len(ite)
    cum = np.concatenate([[0.0], np.cumsum(ite)])
    idx = np.linspace(0, n, 101).astype(int)
    frac = idx / n
    model_gain = cum[idx]
    return to_json_records(
        pd.DataFrame(
            {
                "fraction_targeted": frac,
                "model_gain": model_gain,
                # No ground-truth effects available here, so oracle = model.
                "oracle_gain": model_gain,
                "random_gain": frac * cum[-1],
            }
        )
    )


@app.post("/optimize")
def optimize(req: OptimizeRequest):
    alloc = run_allocation(load_ite(), greedy_optimizer, req.budget, req.discount_amount)
    targeted = alloc[alloc.discount_amount > 0]
    logger.info(
        "optimize: budget=%s discount=%s targeted=%d",
        req.budget, req.discount_amount, len(targeted),
    )
    return {
        "total_spend": float(alloc.discount_amount.sum()),
        "total_gain": float(alloc.expected_gain.sum()),
        "n_targeted": int(len(targeted)),
        "allocation": to_json_records(targeted),
    }


@app.get("/api/allocation")
def get_allocation(
    budget: float = Query(..., gt=0),
    discount_amount: float = Query(1.0, gt=0),
):
    ite = load_ite()
    alloc = run_allocation(ite, greedy_optimizer, budget, discount_amount)
    targeted = alloc[alloc.discount_amount > 0].copy()

    if "segment" not in targeted.columns:
        seg = pd.Series(assign_segment(ite["ite"]), index=ite["customer_id"].values)
        targeted["segment"] = targeted["customer_id"].map(seg)

    cols = ["customer_id", "discount_amount", "expected_gain", "segment"]
    return to_json_records(targeted[cols])


@app.get("/api/strategy-comparison")
def get_strategy_comparison(
    budget: float = Query(25000, gt=0),
    discount_amount: float = Query(1.0, gt=0),
):
    df = load_ite()
    ite = df["ite"]
    n = len(df)
    n_afford = min(n, int(budget // discount_amount))
    opt = run_allocation(df, greedy_optimizer, budget, discount_amount)
    return [
        {
            "strategy": "blanket",
            "total_spend": float(n * discount_amount),
            "total_gain": float(ite.sum()),
        },
        {
            "strategy": "random",
            "total_spend": float(n_afford * discount_amount),
            "total_gain": float(ite.mean() * n_afford),
        },
        {
            "strategy": "optimized",
            "total_spend": float(opt.discount_amount.sum()),
            "total_gain": float(opt.expected_gain.sum()),
        },
    ]


@app.post("/api/upload")
@app.post("/upload")  # Week 4: validates a new CSV
async def upload(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(io.BytesIO(await file.read()))
    except Exception as e:
        raise HTTPException(400, f"Could not read CSV: {e}")

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise HTTPException(400, f"Missing columns: {missing}")

    DATA_DIR.mkdir(exist_ok=True)
    df.to_csv(UPLOAD_PATH, index=False)
    logger.info("upload: saved %d rows to %s", len(df), UPLOAD_PATH)
    return {"rows": len(df), "columns": list(df.columns)}