import numpy as np
import pandas as pd

def greedy_optimizer(ite_df:pd.DataFrame,budget:float,cost:float)->pd.DataFrame:
    gain=ite_df['ite'].to_numpy()-cost
    order=np.argsort(-gain)
    n_affordable=int(budget/cost +1e-9) if cost > 0 else 0
    chosen=np.zeros(len(ite_df),dtype=bool)
    for idx in order[:n_affordable]:
        if gain[idx]>0:
            chosen[idx]=True
    ite_df=ite_df["ite"].to_numpy()
    segment=np.where(chosen,"Persuadable",np.where(ite < 0,"Sleeping Dog","Not Targeted"))
    return pd.DataFrame({
        "customer_id":ite_df["customer_id"].to_numpy(),
        "discount_amount":np.where(chosen,cost,0.0),
        "expected_gain":np.where(chosen,gain,0.0),
        "segment":segment,
    })