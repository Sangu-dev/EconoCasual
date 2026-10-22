import io
import logging
from pathlib import Path
import pandas as pd
from fastapi import FastAPI,File,HTTPException,UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel,Field
from src.optimizer_stub import greedy_optimizer
from src.pipeline import REQUIRED_COLUMNS,run_allocation

logger=logging.getLogger('econocasual.api')
app=FastAPI(title="Econocausal API", version="0.1.0")
app.add_middleware(CORSMiddleware,allow_origins=['http://localhost:5173','http://localhost:3000'],
                   allow_methods=['*'],allow_headers=['*'])

ITE_PATH=Path('data/ite_scores.csv')

class OptimizeRequest(BaseModel):
    budget:float= Field(...,description='Total campaign budget in rupees')
    discount_amount:float=Field(1.00,gt=0,description='Assumed cost of giving one customer the discount, in dollars')

def load_ite() -> pd.DataFrame:
    if not ITE_PATH.exists():
        raise HTTPException(404, "data/ite_scores.csv not found. Run the pipeline first.")
    return pd.read_csv(ITE_PATH)


@app.get("/health")
def health():
    return {"status": "ok", "ite_scores_available": ITE_PATH.exists()}


@app.get("/ite")
def get_ite(limit: int = 1000, offset: int = 0):
    df = load_ite()
    return {"total": len(df), "rows": df.iloc[offset: offset + limit].to_dict("records")}


@app.post("/optimize")
def optimize(req: OptimizeRequest):
    alloc = run_allocation(load_ite(), greedy_optimizer, req.budget, req.discount_amount)
    return {
        "total_spend": float(alloc.discount_amount.sum()),
        "total_gain": float(alloc.expected_gain.sum()),
        "n_targeted": int((alloc.discount_amount > 0).sum()),
        "allocation": alloc[alloc.discount_amount > 0].to_dict("records"),
    }


@app.post("/upload")                                   # Week 4: validates a new CSV
async def upload(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(io.BytesIO(await file.read()))
    except Exception as e:
        raise HTTPException(400, f"Could not read CSV: {e}")
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise HTTPException(400, f"Missing columns: {missing}")
    Path("data").mkdir(exist_ok=True)
    df.to_csv("data/retail_campaign.csv", index=False)
    return {"rows": len(df), "columns": list(df.columns)}
