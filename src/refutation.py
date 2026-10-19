import numpy as np
import pandas as pd

def run_dowhy_refuters(model, identified, estimate, sims: int = 20) -> pd.DataFrame:
    tests = [
        ("Placebo treatment", "placebo_treatment_refuter",
         {"placebo_type": "permute", "num_simulations": sims}, "effect drops to ~0"),
        ("Random common cause", "random_common_cause",
         {"num_simulations": sims}, "estimate unchanged"),
        ("Data subset", "data_subset_refuter",
         {"subset_fraction": 0.8, "num_simulations": sims}, "estimate stable"),
    ]
    rows = []
    for name, method, kw, expect in tests:
        r = model.refute_estimate(identified, estimate, method_name=method, **kw)
        rows.append({"test": name, "expected": expect,
                     "original_effect": float(r.estimated_effect), "new_effect": float(r.new_effect)})
    return pd.DataFrame(rows)

def manual_refuters(df: pd.DataFrame, ate_fn, seed: int = 0, tol: float = 0.25, reps: int = 5) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    original = ate_fn(df)
    rows = []

    placebo = []
    for _ in range(reps):
        d = df.copy(); d["discount"] = rng.permutation(d["discount"].to_numpy())
        placebo.append(ate_fn(d))
    placebo = np.array(placebo)
    rows.append({"test": "Placebo treatment", "expected": "placebo effects ~0, real effect stands out",
                 "original_effect": original, "new_effect": float(placebo.mean()),
                 "spread": float(placebo.std()),
                 "passed": bool(abs(original) > 2 * max(np.abs(placebo).max(), placebo.std()))})

    d = df.copy(); d["random_cause"] = rng.normal(size=len(d))
    new = ate_fn(d)
    rows.append({"test": "Random common cause", "expected": "estimate unchanged",
                 "original_effect": original, "new_effect": new, "spread": np.nan,
                 "passed": bool(abs(new - original) <= tol * abs(original))})

    subs = np.array([ate_fn(df.sample(frac=0.7, random_state=seed + i)) for i in range(reps)])
    rows.append({"test": "Data subset (70%)", "expected": "estimate stable",
                 "original_effect": original, "new_effect": float(subs.mean()), "spread": float(subs.std()),
                 "passed": bool(abs(subs.mean() - original) <= max(tol * abs(original), 2 * subs.std()))})
    return pd.DataFrame(rows)
