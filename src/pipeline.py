import logging
import sys
from pathlib import Path
from typing import Callable, Optional
import pandas as pd

# Ensure repository root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

logger = logging.getLogger('econocasual.pipeline')
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

RETAIL_COLUMNS = ["customer_id", "age", "loyalty_score", "past_orders", "avg_order_value", "discount", "revenue"]
PROMO_COLUMNS = ["customer_id", "recency", "history", "is_referral", "discount", "revenue"]
RAW_PROMO_COLUMNS = ["recency", "history", "used_discount", "used_bogo", "zip_code", "is_referral", "channel", "offer", "conversion"]

# Maintained for backward compatibility
REQUIRED_COLUMNS = RETAIL_COLUMNS

Optimizer = Callable[[pd.DataFrame, float, float], pd.DataFrame]


def detect_and_validate_dataset(df: pd.DataFrame) -> tuple[pd.DataFrame, str]:
    """
    Validates the dataset against supported causal schemas:
    1. Retail Observational Dataset (7 columns)
    2. Kaggle Promotion Dataset - Processed (6+ columns)
    3. Kaggle Promotion Dataset - Raw (9 columns) -> transformed via src.prepare_data.transform
    Returns (prepared_df, schema_name).
    """
    cols = set(df.columns)

    # 1. Retail Schema
    if set(RETAIL_COLUMNS).issubset(cols):
        return df, "retail"

    # 2. Processed Promotion Schema
    if set(PROMO_COLUMNS).issubset(cols):
        return df, "promotion"

    # 3. Raw Promotion Schema
    if set(RAW_PROMO_COLUMNS).issubset(cols):
        from src.prepare_data import transform
        logger.info("Raw Kaggle promotion schema detected. Preprocessing with transform()...")
        prepared = transform(df)
        return prepared, "promotion_raw"

    # Diagnostic validation error reporting
    retail_overlap = len(cols.intersection({"age", "loyalty_score", "avg_order_value", "past_orders"}))
    promo_overlap = len(cols.intersection({"recency", "history", "is_referral", "offer", "conversion"}))

    if retail_overlap >= promo_overlap and retail_overlap > 0:
        missing = [c for c in RETAIL_COLUMNS if c not in cols]
        raise ValueError(
            f"Retail dataset validation failed. Missing required columns: {missing}. "
            f"Expected schema: {RETAIL_COLUMNS}"
        )
    elif promo_overlap > 0:
        if "offer" in cols or "conversion" in cols:
            missing = [c for c in RAW_PROMO_COLUMNS if c not in cols]
            raise ValueError(
                f"Raw promotion dataset validation failed. Missing required columns: {missing}. "
                f"Expected schema: {RAW_PROMO_COLUMNS}"
            )
        else:
            missing = [c for c in PROMO_COLUMNS if c not in cols]
            raise ValueError(
                f"Promotion dataset validation failed. Missing required columns: {missing}. "
                f"Expected schema: {PROMO_COLUMNS}"
            )
    else:
        raise ValueError(
            f"Uploaded dataset does not match any supported schema.\n"
            f"Supported Schemas:\n"
            f"1. Retail Schema: {RETAIL_COLUMNS}\n"
            f"2. Promotion Campaign Schema: {PROMO_COLUMNS}\n"
            f"Found columns: {sorted(list(cols))}"
        )


def run_allocation(ite_df: pd.DataFrame, optimizer: Optimizer, budget: float,
                   discount_amount: float = 1.00) -> pd.DataFrame:
    if budget < 0:
        raise ValueError("budget must be >=0")
    if "ite" not in ite_df.columns or "customer_id" not in ite_df.columns:
        raise ValueError("ite_df needs columns: customer_id, ite")
    logger.info("Optimising %d customers with budget %.2f", len(ite_df), budget)
    return optimizer(ite_df, budget, discount_amount)


def run_pipeline(data_path: Optional[str] = None, optimizer: Optional[Optimizer] = None,
                 budget: float = 500.0, discount_amount: float = 1.00, method: str = "linear",
                 save_ite_path: Optional[str] = "data/ite_scores.csv") -> pd.DataFrame:
    from src.double_ml import fit_forest_dml, fit_linear_dml, predict_ite, save_ite_scores
    if optimizer is None:
        from src.optimizer_stub import greedy_optimizer as optimizer

    if data_path is None:
        if Path("data/mock_retail.csv").exists():
            data_path = "data/mock_retail.csv"
        elif Path("data/retail_campaign.csv").exists():
            data_path = "data/retail_campaign.csv"
        elif Path("data/data.csv").exists():
            data_path = "data/data.csv"
        else:
            raise FileNotFoundError("No default dataset found in data/")

    raw_df = pd.read_csv(data_path)
    df, schema_name = detect_and_validate_dataset(raw_df)

    if df['discount'].nunique() < 2:
        raise ValueError("need both customers with and without discount offer (discount must contain both 0 and 1).")

    logger.info("Fitting %s Double ML on %d customers (schema: %s)", method, len(df), schema_name)
    est = fit_forest_dml(df) if method == "forest" else fit_linear_dml(df)
    ite = predict_ite(est, df)
    ite_df = save_ite_scores(df, ite, save_ite_path) if save_ite_path else \
        df[['customer_id']].assign(ite=ite)
    return run_allocation(ite_df, optimizer, budget, discount_amount)


if __name__ == "__main__":
    alloc = run_pipeline()
    alloc.to_csv('data/allocation.csv', index=False)
    print(alloc.segment.value_counts())
    print(f"Total expected gain: {alloc.expected_gain.sum():,.2f}")
