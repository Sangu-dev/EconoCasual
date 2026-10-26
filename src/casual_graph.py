import pandas as pd
from dowhy import CausalModel

TREATMENT = "discount"     
OUTCOME = "revenue"


def confounder_columns(df: pd.DataFrame) -> list:
    return [c for c in df.columns if c not in ("customer_id", TREATMENT, OUTCOME)]


def build_model(df: pd.DataFrame) -> CausalModel:
    return CausalModel(data=df, treatment=TREATMENT, outcome=OUTCOME,
                       common_causes=confounder_columns(df))


def identify_and_estimate(model: CausalModel):
    identified = model.identify_effect(proceed_when_unidentifiable=True)
    estimate = model.estimate_effect(identified, method_name="backdoor.linear_regression")
    return identified, estimate


def naive_difference(df: pd.DataFrame) -> float:
    return float(df[df[TREATMENT] == 1][OUTCOME].mean() - df[df[TREATMENT] == 0][OUTCOME].mean())