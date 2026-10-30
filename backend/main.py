import io
import logging
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure project root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.optimizer_stub import greedy_optimizer
from src.pipeline import (
    REQUIRED_COLUMNS,
    RETAIL_COLUMNS,
    PROMO_COLUMNS,
    RAW_PROMO_COLUMNS,
    detect_and_validate_dataset,
    run_allocation,
)

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
    budget: float = Field(..., gt=0, description="Total campaign budget in currency units")
    discount_amount: float = Field(
        1.00, gt=0, description="Assumed cost of giving one customer the discount"
    )


# ---------------------------------------------------------------- helpers
def load_ite() -> pd.DataFrame:
    if not ITE_PATH.exists():
        # Check if default retail or campaign dataset exists to bootstrap
        if Path("data/mock_retail.csv").exists() or Path("data/retail_campaign.csv").exists():
            from src.pipeline import run_pipeline
            logger.info("ITE scores not found; bootstrapping via run_pipeline()...")
            run_pipeline()
    if not ITE_PATH.exists():
        raise HTTPException(404, f"{ITE_PATH} not found. Run the pipeline first.")
    return pd.read_csv(ITE_PATH)


def to_json_records(df: pd.DataFrame) -> list[dict]:
    """Convert a DataFrame to JSON-safe records (NaN/inf -> None, numpy types -> Python)."""
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.astype(object).where(df.notna(), None)
    return df.to_dict("records")


def assign_segment(ite: pd.Series) -> np.ndarray:
    """Canonical segmentation:
    - Sleeping Dogs: negative uplift (ITE < 0)
    - Persuadables: top half of positive effects (ITE >= median positive)
    - Sure Things: organic baseline (positive below cutoff or non-responsive)
    """
    positive = ite[ite > 0]
    cutoff = positive.median() if len(positive) else 0.0
    return np.select(
        [ite < 0, ite >= cutoff],
        ["Sleeping Dogs", "Persuadables"],
        default="Sure Things",
    )


def compute_uplift_curve(ite_scores: np.ndarray) -> pd.DataFrame:
    """Constructs cumulative uplift coordinates from ITE distribution."""
    ite = np.sort(np.asarray(ite_scores).ravel())[::-1]
    n = len(ite)
    cum = np.concatenate([[0.0], np.cumsum(ite)])
    idx = np.linspace(0, n, 101).astype(int)
    frac = idx / n
    model_gain = cum[idx]
    return pd.DataFrame(
        {
            "fraction_targeted": np.round(frac, 4),
            "model_gain": np.round(model_gain, 2),
            "oracle_gain": np.round(model_gain, 2),
            "random_gain": np.round(frac * cum[-1], 2),
        }
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
    limit: int = Query(1000, ge=1, le=50000),
    offset: int = Query(0, ge=0),
    as_list: bool = Query(True),
):
    df = load_ite()
    if "segment" not in df.columns and "ite" in df.columns:
        df["segment"] = assign_segment(df["ite"])
    records = to_json_records(df.iloc[offset : offset + limit])
    if not as_list:
        return {"total": len(df), "rows": records}
    return records


@app.get("/api/uplift")
def get_uplift():
    """Uplift / Qini coordinates. Serves data/uplift_curve.csv if present,
    otherwise builds curve directly from the ITE scores."""
    if UPLIFT_PATH.exists():
        return to_json_records(pd.read_csv(UPLIFT_PATH))

    ite = load_ite()["ite"].to_numpy(float)
    curve_df = compute_uplift_curve(ite)
    return to_json_records(curve_df)


@app.post("/optimize")
def optimize(req: OptimizeRequest):
    ite_df = load_ite()
    alloc = run_allocation(ite_df, greedy_optimizer, req.budget, req.discount_amount)
    targeted = alloc[alloc.discount_amount > 0]
    
    # Merge feature and ite columns if available
    feat_cols = [c for c in ite_df.columns if c not in alloc.columns]
    if feat_cols:
        alloc = alloc.merge(ite_df[["customer_id"] + feat_cols], on="customer_id", how="left")

    logger.info(
        "optimize: budget=%s discount=%s targeted=%d/%d",
        req.budget, req.discount_amount, len(targeted), len(alloc),
    )
    return {
        "total_spend": float(alloc.discount_amount.sum()),
        "total_gain": float(alloc.expected_gain.sum()),
        "n_targeted": int(len(targeted)),
        "n_total": len(alloc),
        "allocation": to_json_records(alloc),
    }


@app.get("/api/allocation")
def get_allocation(
    budget: float = Query(..., gt=0, description="Total campaign budget in currency units"),
    discount_amount: float = Query(1.0, gt=0, description="Assumed cost of giving one customer the discount"),
    targeted_only: bool = Query(False, description="Whether to return only targeted customers"),
):
    ite_df = load_ite()
    alloc = run_allocation(ite_df, greedy_optimizer, budget, discount_amount)

    # Merge features from ite_df for full visualization context
    feat_cols = [c for c in ite_df.columns if c not in alloc.columns]
    if feat_cols:
        alloc = alloc.merge(ite_df[["customer_id"] + feat_cols], on="customer_id", how="left")

    if targeted_only:
        alloc = alloc[alloc.discount_amount > 0]

    return to_json_records(alloc)


@app.get("/api/strategy-comparison")
def get_strategy_comparison(
    budget: float = Query(25000, gt=0, description="Total campaign budget in currency units"),
    discount_amount: float = Query(1.0, gt=0, description="Assumed cost of giving one customer the discount"),
):
    df = load_ite()
    ite = df["ite"].to_numpy(float)
    n = len(df)
    n_afford = min(n, int(budget // discount_amount)) if discount_amount > 0 else 0
    opt = run_allocation(df, greedy_optimizer, budget, discount_amount)
    
    blanket_spend = float(n * discount_amount)
    blanket_gain = float(np.sum(ite))
    
    random_spend = float(n_afford * discount_amount)
    random_gain = float(np.mean(ite) * n_afford) if n > 0 else 0.0
    
    opt_spend = float(opt["discount_amount"].sum())
    opt_gain = float(opt["expected_gain"].sum())
    
    return [
        {
            "strategy": "blanket",
            "total_spend": blanket_spend,
            "total_gain": blanket_gain,
        },
        {
            "strategy": "random",
            "total_spend": random_spend,
            "total_gain": random_gain,
        },
        {
            "strategy": "optimized",
            "total_spend": opt_spend,
            "total_gain": opt_gain,
        },
    ]


@app.post("/api/upload")
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"Could not read CSV: {e}")

    # Validate against supported schemas
    try:
        prepared_df, schema_name = detect_and_validate_dataset(df)
    except ValueError as e:
        raise HTTPException(400, str(e))

    if prepared_df["discount"].nunique() < 2:
        raise HTTPException(
            400, "Dataset must contain both control (discount=0) and treated (discount=1) records."
        )

    DATA_DIR.mkdir(exist_ok=True)
    save_target = DATA_DIR / ("retail_campaign.csv" if "promotion" in schema_name else "mock_retail.csv")
    prepared_df.to_csv(save_target, index=False)

    # Execute the Double Machine Learning Pipeline
    logger.info("Executing DML pipeline on uploaded %s dataset (%d rows)...", schema_name, len(prepared_df))
    from src.double_ml import fit_linear_dml, predict_ite, save_ite_scores
    try:
        est = fit_linear_dml(prepared_df)
        ite = predict_ite(est, prepared_df)
        ite_df = save_ite_scores(prepared_df, ite, str(ITE_PATH))

        # Build and save uplift curve
        uplift_df = compute_uplift_curve(ite)
        uplift_df.to_csv(UPLIFT_PATH, index=False)
    except Exception as e:
        logger.exception("Error fitting DML model on uploaded CSV")
        raise HTTPException(500, f"Double ML model fitting failed: {e}")

    logger.info("Upload processing complete. Saved ITE scores to %s", ITE_PATH)
    return {
        "success": True,
        "rows": len(prepared_df),
        "columns": list(prepared_df.columns),
        "schema": schema_name,
        "ate": float(np.mean(ite)),
        "ite_scores": to_json_records(ite_df.head(100)),
    }
