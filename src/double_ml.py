import pandas as pd
import numpy as np
from econml.dml import CausalForestDML, LinearDML
from lightgbm import LGBMClassifier, LGBMRegressor

ID, T_COL, Y_COL = 'customer_id', 'discount', 'revenue'

DISPLAY_COLS = ["recency", "history", "is_referral"]


def feature_columns(df: pd.DataFrame) -> list:
    return [c for c in df.columns if c not in (ID, T_COL, Y_COL)]


def prepare_inputs(df: pd.DataFrame):
    X = df[feature_columns(df)].to_numpy(float)
    return df[Y_COL].to_numpy(float), df[T_COL].to_numpy(int), X


def _outcome_model():
    return LGBMRegressor(n_estimators=200, learning_rate=0.05, num_leaves=15, verbose=-1)


def _treatment_model():
    return LGBMClassifier(n_estimators=200, learning_rate=0.05, num_leaves=15, verbose=-1)


def fit_linear_dml(df: pd.DataFrame, seed: int = 0) -> LinearDML:
    Y, T, X = prepare_inputs(df)
    est = LinearDML(model_y=_outcome_model(), model_t=_treatment_model(),
                    discrete_treatment=True, cv=5, random_state=seed)
    est.fit(Y, T, X=X)
    return est


def fit_forest_dml(df: pd.DataFrame, seed: int = 0, n_estimators: int = 300) -> CausalForestDML:
    Y, T, X = prepare_inputs(df)
    est = CausalForestDML(model_y=_outcome_model(), model_t=_treatment_model(),
                          discrete_treatment=True, n_estimators=n_estimators,
                          min_samples_leaf=50, cv=5, random_state=seed)
    est.fit(Y, T, X=X)
    return est


def predict_ite(est, df: pd.DataFrame) -> np.ndarray:
    return np.ravel(est.effect(df[feature_columns(df)].to_numpy(float)))


def ate_linear_dml(df: pd.DataFrame, seed: int = 0) -> float:
    return float(np.mean(predict_ite(fit_linear_dml(df, seed), df)))


def save_ite_scores(df: pd.DataFrame, ite: np.ndarray, path: str = "data/ite_scores.csv") -> pd.DataFrame:
    out = df[[ID]].copy()
    out["ite"] = ite
    for c in DISPLAY_COLS:
        out[c] = df[c].to_numpy()
    out.to_csv(path, index=False)
    return out