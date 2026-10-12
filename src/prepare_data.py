
import argparse
from pathlib import Path

import pandas as pd


RENAME = {
    "recency": "months_since_last_purchase",
    "history": "past_spend",
    "used_discount": "previously_used_discount",
    "used_bogo": "previously_used_bogo",
    "zip_code": "area_type",
    "is_referral": "is_referral",
    "channel": "purchase_channel",
}


def transform(
    data: pd.DataFrame,
    arm: str = "discount",
) -> pd.DataFrame:
    """Prepare marketing campaign data for causal ML."""

    required = [
        "recency",
        "history",
        "used_discount",
        "used_bogo",
        "zip_code",
        "is_referral",
        "channel",
        "offer",
        "conversion",
    ]

    missing = [c for c in required if c not in data.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")

    df = data.copy()

    df["offer"] = df["offer"].astype(str).str.strip()

    known = {"No Offer", "Discount", "Buy One Get One"}
    unexpected = set(df["offer"].unique()) - known

    if unexpected:
        raise ValueError(
            f"Unexpected offer labels: {sorted(unexpected)}"
        )

    if arm == "discount":
        treated_label = "Discount"
    elif arm == "bogo":
        treated_label = "Buy One Get One"
    else:
        raise ValueError("arm must be 'discount' or 'bogo'")

    keep = df["offer"].isin(["No Offer", treated_label])
    df = df.loc[keep].copy()

    df["treatment"] = (
        df["offer"] == treated_label
    ).astype(int)

    df["outcome"] = pd.to_numeric(
        df["conversion"], errors="raise"
    )

    if not df["outcome"].isin([0, 1]).all():
        raise ValueError("conversion must contain only 0 and 1")

    feature_cols = [
        "recency",
        "history",
        "used_discount",
        "used_bogo",
        "zip_code",
        "is_referral",
        "channel",
    ]

    X = df[feature_cols].rename(columns=RENAME)

    X = pd.get_dummies(
        X,
        columns=["area_type", "purchase_channel"],
        dtype=int,
    )

    X = X.replace([float("inf"), float("-inf")], float("nan"))

    for col in X.columns:
        X[col] = pd.to_numeric(X[col], errors="raise")
        X[col] = X[col].fillna(X[col].median())

    X = X.fillna(0)

    result = X.reset_index(drop=True)
    result.insert(
        0, "customer_id", range(1, len(result) + 1)
    )
    result["treatment"] = df["treatment"].to_numpy()
    result["outcome"] = df["outcome"].to_numpy()

    return result


def main(arm: str, raw: str, out: str):
    data = pd.read_csv(raw)

    result = transform(data, arm=arm)

    output = Path(out)
    output.parent.mkdir(parents=True, exist_ok=True)
    result.to_csv(output, index=False)

    print(f"Saved {len(result)} rows to {output}")
    print(f"Treatment arm: {arm}")
    print(f"Treatment share: {result['treatment'].mean():.1%}")
    print(f"Conversion rate: {result['outcome'].mean():.2%}")
    print("\nTreatment counts:")
    print(result["treatment"].value_counts())
    print("\nConversion by treatment:")
    print(result.groupby("treatment")["outcome"].agg(
        ["count", "mean"]
    ))
    print("\nOutput columns:")
    print(result.columns.tolist())


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--arm",
        default="discount",
        choices=["discount", "bogo"],
    )
    parser.add_argument(
        "--raw",
        default="data/data.csv",
        help="Path to the original marketing CSV",
    )
    parser.add_argument(
        "--out",
        default="data/marketing_campaign.csv",
    )

    args = parser.parse_args()
    main(args.arm, args.raw, args.out)