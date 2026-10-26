import logging 
from typing import Callable, Optional
import pandas as pd

logger=logging.getLogger('econocasual.pipeline')
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

REQUIRED_COLUMNS=["customer_id","recency","history","is_referral","discount","revenue"]
Optimizer=Callable[[pd.DataFrame,float,float],pd.DataFrame]

def run_allocation(ite_df:pd.DataFrame,optimizer:Optimizer,budget:float,
                   discount_amount:float=1.00)->pd.DataFrame:
    if budget<0:
        raise ValueError("budget must be >=0")
    if "ite" not in ite_df.columns or "customer_id" not in ite_df.columns:
        raise ValueError("ite_df needs columns: customer_id, ite")
    logger.info("Optimising %d customers with budget %.2f",len(ite_df),budget)
    return optimizer(ite_df,budget,discount_amount)

def run_pipeline(data_path:str="data/data.csv",optimizer:Optional[Optimizer]=None,
                 budget:float=500.0,discount_amount:float=1.00,method:str="linear",
                 save_ite_path:Optional[str]="data/ite_scores.csv")->pd.DataFrame:
    from src.double_ml import fit_forest_dml,fit_linear_dml,predict_ite,save_ite_scores
    if optimizer is None:
        from src.optimizer_stub import greedy_optimizer as optimizer
    df=pd.read_csv(data_path)
    missing=[c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Data is missing columns: {missing}")
    if df['discount'].nunique()<2:
        raise ValueError("need both customers with and without discount offer.")
    logger.info("Fitting %s Double ML on %d customers",method,len(df))
    est=fit_forest_dml(df) if method=="forest" else fit_linear_dml(df)
    ite=predict_ite(est,df)
    ite_df=save_ite_scores(df,ite,save_ite_path) if save_ite_path else \
        df[['customer_id']].assign(ite=ite)
    return run_allocation(ite_df,optimizer,budget,discount_amout)

if __name__=="__main__":
    alloc=run_pipeline()
    alloc.to_csv('data/allocation.csv',index=False)
    print(alloc.segment.value_counts())
    print(f"Total expected gan: {alloc.expected_gain.sum():,.2f}")