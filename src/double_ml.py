from pathlib import Path
from typing import Optional
import numpy as np
import pandas as pd
from econml.dml import CausalForestDML, LinearDML
from lightgbm import LGBMClassifier, LGBMRegressor

ID, T_COL, Y_COL = 'customer_id', 'discount', 'revenue'

# Preserved for backward compatibility
DISPLAY_COLS = ["recency", "history", "is_referral"]


def feature_columns(df: pd.DataFrame) -> list:
    return [c for c in df.columns if c not in (ID, T_COL, Y_COL)]


def prepare_inputs(df: pd.DataFrame):
    if Y_COL not in df.columns or T_COL not in df.columns:
        raise ValueError(f"Dataset must contain treatment '{T_COL}' and outcome '{Y_COL}' columns.")
    feats = feature_columns(df)
    if not feats:
        raise ValueError(f"Dataset must contain at least one feature column besides {ID}, {T_COL}, {Y_COL}.")
    try:
        X = df[feats].to_numpy(float)
    except Exception as e:
        raise ValueError(f"Feature columns {feats} must be numeric or pre-encoded: {e}")
    try:
        Y = df[Y_COL].to_numpy(float)
    except Exception as e:
        raise ValueError(f"Outcome column '{Y_COL}' must be numeric: {e}")
    try:
        T = df[T_COL].to_numpy(int)
    except Exception as e:
        raise ValueError(f"Treatment column '{T_COL}' must be binary integer: {e}")
    return Y, T, X


def _outcome_model():
    return LGBMRegressor(n_estimators=200, learning_rate=0.05, num_leaves=15, verbose=-1)


def _treatment_model():
    return LGBMClassifier(n_estimators=200, learning_rate=0.05, num_leaves=15, verbose=-1)


def fit_linear_dml(df: pd.DataFrame, seed: int = 0, cv: Optional[int] = None) -> LinearDML:
    Y, T, X = prepare_inputs(df)
    min_class = min(int(np.sum(T == 0)), int(np.sum(T == 1)))
    actual_cv = cv if cv is not None else max(2, min(5, min_class))
    est = LinearDML(model_y=_outcome_model(), model_t=_treatment_model(),
                    discrete_treatment=True, cv=actual_cv, random_state=seed)
    est.fit(Y, T, X=X)
    return est


def fit_forest_dml(df: pd.DataFrame, seed: int = 0, n_estimators: int = 300, cv: Optional[int] = None) -> CausalForestDML:
    Y, T, X = prepare_inputs(df)
    min_class = min(int(np.sum(T == 0)), int(np.sum(T == 1)))
    actual_cv = cv if cv is not None else max(2, min(5, min_class))
    leaf_samples = min(50, max(1, len(df) // 10))
    est = CausalForestDML(model_y=_outcome_model(), model_t=_treatment_model(),
                          discrete_treatment=True, n_estimators=n_estimators,
                          min_samples_leaf=leaf_samples, cv=actual_cv, random_state=seed)
    est.fit(Y, T, X=X)
    return est


def predict_ite(est, df: pd.DataFrame) -> np.ndarray:
    feats = feature_columns(df)
    if not feats:
        raise ValueError("Dataset must contain feature columns for ITE prediction.")
    return np.ravel(est.effect(df[feats].to_numpy(float)))


def ate_linear_dml(df: pd.DataFrame, seed: int = 0) -> float:
    return float(np.mean(predict_ite(fit_linear_dml(df, seed), df)))


def save_ite_scores(df: pd.DataFrame, ite: np.ndarray, path: Optional[str] = "data/ite_scores.csv") -> pd.DataFrame:
    if ID not in df.columns:
        raise ValueError(f"Data is missing ID column: '{ID}'")
    out = df[[ID]].copy()
    out["ite"] = np.asarray(ite).ravel()
    # Export all feature columns present in the dataset (supports both retail and promotional schemas)
    feats = feature_columns(df)
    for c in feats:
        out[c] = df[c].to_numpy()
    if path:
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        out.to_csv(path, index=False)
    return out
