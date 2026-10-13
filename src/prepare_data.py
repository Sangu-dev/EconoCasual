
import argparse
from pathlib import Path

import pandas as pd

RAW_COLUMNS = ["recency", "history", "used_discount", "used_bogo", "zip_code",
               "is_referral", "channel", "offer", "conversion"]
NUMERIC_FEATURES = ["recency", "history", "used_discount", "used_bogo", "is_referral"]
CATEGORICAL = ["zip_code", "channel"]


def _pick(labels, wanted, what, test):
    by_lower = {str(l).strip().lower(): l for l in labels}
    if wanted is not None:
        if wanted.strip().lower() not in by_lower:
            raise ValueError(f"{what} label '{wanted}' not found. Labels in the file: {sorted(map(str, labels))}")
        return by_lower[wanted.strip().lower()]
    found = [orig for low, orig in by_lower.items() if test(low)]
    if len(found) != 1:
        raise ValueError(f"Could not detect the {what} label automatically. "
                         f"Labels in the file: {sorted(map(str, labels))}. "
                         f"Re-run with --{'treat' if what == 'discount' else 'control'} \"<label>\".")
    return found[0]


def transform(raw: pd.DataFrame, treat: str = None, control: str = None,
              value_per_conversion: float = 25.0) -> pd.DataFrame:
    missing = [c for c in RAW_COLUMNS if c not in raw.columns]
    if missing:
        raise ValueError(f"Raw data is missing columns: {missing}. Found: {list(raw.columns)}")
    if not set(raw["conversion"].dropna().unique()) <= {0, 1}:
        raise ValueError("`conversion` should be 0/1.")

    offers = raw["offer"].astype(str).str.strip()
    labels = offers.unique()
    control_label = _pick(labels, control, "no-offer", lambda s: s.startswith("no"))
    treat_label = _pick(labels, treat, "discount", lambda s: "discount" in s)
    if control_label == treat_label:
        raise ValueError("Treatment and control labels are the same.")

    keep = offers.isin([control_label, treat_label]).to_numpy()
    X = raw[NUMERIC_FEATURES + CATEGORICAL].copy()
    X = pd.get_dummies(X, columns=CATEGORICAL, dtype=int)

    ids = raw["customer_id"] if "customer_id" in raw.columns else pd.Series(raw.index + 1, index=raw.index)
    if ids.duplicated().any():
        raise ValueError("customer_id in the raw file is not unique.")
    df = X[keep].reset_index(drop=True).copy()
    df.insert(0, "customer_id", ids[keep].to_numpy())
    df["discount"] = (offers[keep] == treat_label).astype(int).to_numpy()
    df["revenue"] = raw.loc[keep, "conversion"].to_numpy(float) * value_per_conversion
    return df


def main(raw_path: str, out: str, treat, control, value: float):
    raw = pd.read_csv(raw_path)
    df = transform(raw, treat, control, value)
    Path(out).parent.mkdir(exist_ok=True)
    df.to_csv(out, index=False)
    print(f"Saved {len(df)} rows to {out}")
    print(f"Share with the discount offer: {df.discount.mean():.1%}")
    print(f"Conversion rate: no offer {(df[df.discount == 0].revenue > 0).mean():.2%} | "
          f"discount {(df[df.discount == 1].revenue > 0).mean():.2%}")
    print("Columns:", list(df.columns))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", default="data/kaggle_promo.csv")
    ap.add_argument("--out", default="data/retail_campaign.csv")
    ap.add_argument("--treat", default=None, help="label of the discount offer, e.g. Discount")
    ap.add_argument("--control", default=None, help="label of the no-offer group, e.g. 'No Offer'")
    ap.add_argument("--value", type=float, default=25.0, help="assumed revenue per conversion ($)")
    a = ap.parse_args()
    main(a.raw, a.out, a.treat, a.control, a.value)