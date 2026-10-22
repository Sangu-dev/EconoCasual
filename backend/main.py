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

app = FastAPI(title="Econocausal API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Relative paths: start uvicorn from the project root.
DATA_DIR = Path("data")
ITE_PATH = DATA_DIR / "ite_scores.csv"
UPLOAD_PATH = DATA_DIR / "retail_campaign.csv"


class OptimizeRequest(BaseModel):
    budget: float = Field(..., gt=0, description="Total campaign budget in rupees")
    discount_amount: float = Field(
        1.00, gt=0, description="Assumed cost of giving one customer the discount, in rupees"
    )


def load_ite() -> pd.DataFrame:
    if not ITE_PATH.exists():
        raise HTTPException(404, f"{ITE_PATH} not found. Run the pipeline first.")
    return pd.read_csv(ITE_PATH)


def to_json_records(df: pd.DataFrame) -> list[dict]:
    """Convert a DataFrame to JSON-safe records (NaN/inf -> None, numpy types -> Python)."""
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.astype(object).where(df.notna(), None)
    return df.to_dict("records")


@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok", "ite_scores_available": ITE_PATH.exists()}


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