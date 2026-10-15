import numpy as np
import pandas as pd

T_COL,Y_COL='discount','revenue'

def decile_check(df:pd.DataFrame, ite:np.ndarray, groups:int =5)->pd.DataFrame:
    d=df[[T_COL,Y_COL]].copy()
    d['ite']=np.asarray(ite)
    d['group']=pd.qcut(d['ite'].rank(method='first',ascending=False),groups,
                       labels=[f"Top {i+1}/{groups} for i in range(groups)"])

    rows=[]
    for g,part in d.groupby('group',observed=True):
        t,c=part[part[T_COL]==1][Y_COL], part[part[T_COL]==0][Y_COL]
        rows.append({"group":g,"n":len(part),"mean_predicted_ite":part["ite"].mean(),
                     "observed_effect":t.mean()-c.mean(),
                     "std_error":float(np.sqrt(t.var()/len(t)+c.var()/len(c)))})
    return pd.DataFrame(rows)
        