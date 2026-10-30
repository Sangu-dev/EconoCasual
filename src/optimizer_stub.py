import numpy as np
import pandas as pd

CANONICAL_SEGMENTS = {
    "Persuadable": "Persuadables",
    "Persuadables": "Persuadables",
    "Sleeping Dog": "Sleeping Dogs",
    "Sleeping Dogs": "Sleeping Dogs",
    "Not targeted": "Sure Things",
    "Sure Thing": "Sure Things",
    "Sure Things": "Sure Things",
    "Lost Causes": "Lost Causes",
}


def greedy_optimizer(ite_df: pd.DataFrame, budget: float, cost: float) -> pd.DataFrame:
    gain = ite_df["ite"].to_numpy() - cost               # expected revenue uplift minus cost of the discount
    order = np.argsort(-gain)
    n_affordable = int(budget / cost + 1e-9) if cost > 0 else 0
    chosen = np.zeros(len(ite_df), dtype=bool)
    for idx in order[:n_affordable]:
        if gain[idx] > 0:
            chosen[idx] = True
    ite = ite_df["ite"].to_numpy()
    segment = np.where(chosen, "Persuadables", np.where(ite < 0, "Sleeping Dogs", "Sure Things"))
    return pd.DataFrame({
        "customer_id": ite_df["customer_id"].to_numpy(),
        "discount_amount": np.where(chosen, cost, 0.0),
        "expected_gain": np.where(chosen, gain, 0.0),
        "segment": segment,
    })
