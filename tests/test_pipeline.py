import sys,pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import numpy as np
import pandas as pd
import pytest
from src.evaluation import decile_check
from src.optimizer_stub import greedy_optimizer
from src.pipeline import run_allocation
from src.prepare_data import transform

COST=1.00

@pytest.fixture(scope="module")
def ite_df():
    rng=np.random.default_rng(1)
    return pd.DataFrame({"customer_id": np.arange(1, 3001), "ite": rng.normal(1.5, 2.0, 3000)})

@pytest.fixture(scope="module")
def raw_promo_like():
    """Fake data with the same columns as the Kaggle promotion dataset."""
    rng = np.random.default_rng(0); n = 3000
    return pd.DataFrame({
        "recency": rng.integers(1, 13, n), "history": rng.gamma(2, 100, n).round(2),
        "used_discount": rng.integers(0, 2, n), "used_bogo": rng.integers(0, 2, n),
        "zip_code": rng.choice(["Urban", "Suburban", "Rural"], n),
        "is_referral": rng.integers(0, 2, n), "channel": rng.choice(["Phone", "Web", "Multichannel"], n),
        "offer": rng.choice(["Discount", "Buy One Get One", "No Offer"], n),
        "conversion": (rng.random(n) < 0.1).astype(int)})


def test_budget_never_exceeded(ite_df):
    for budget in [0, 5, 50, 500]:
        alloc = run_allocation(ite_df, greedy_optimizer, budget, COST)
        assert alloc.discount_amount.sum() <= budget + 1e-9


def test_zero_budget_gives_zero_spend(ite_df):
    alloc = run_allocation(ite_df, greedy_optimizer, 0, COST)
    assert alloc.discount_amount.sum() == 0 and alloc.expected_gain.sum() == 0


def test_bigger_budget_never_lowers_total_gain(ite_df):
    gains = [run_allocation(ite_df, greedy_optimizer, b, COST).expected_gain.sum() for b in [1, 5, 20, 100]]
    assert all(b >= a - 1e-9 for a, b in zip(gains, gains[1:]))


def test_negative_budget_rejected(ite_df):
    with pytest.raises(ValueError):
        run_allocation(ite_df, greedy_optimizer, -1, COST)


# ---- data preparation
def test_transform_default_labels(raw_promo_like):
    df = transform(raw_promo_like)
    assert set(df.discount.unique()) == {0, 1}
    assert "conversion" not in df.columns and "offer" not in df.columns      # no leakage
    for c in ["customer_id", "recency", "history", "is_referral", "revenue"]:
        assert c in df.columns
    assert len(df) < len(raw_promo_like)                                    # BOGO rows dropped
    assert set(df.revenue.unique()) <= {0.0, 25.0}


def test_customer_id_traces_back_to_raw_rows(raw_promo_like):
    df = transform(raw_promo_like)
    assert df.customer_id.is_unique
    raw_rows = raw_promo_like.loc[df.customer_id - 1]                       # row number in the raw file
    assert (raw_rows["history"].to_numpy() == df["history"].to_numpy()).all()
    assert (raw_rows["conversion"].to_numpy() * 25.0 == df["revenue"].to_numpy()).all()


def test_existing_customer_id_column_is_kept(raw_promo_like):
    r = raw_promo_like.copy(); r.insert(0, "customer_id", 1000 + np.arange(len(r)))
    df = transform(r)
    assert df.customer_id.min() >= 1000


def test_duplicate_customer_ids_rejected(raw_promo_like):
    r = raw_promo_like.copy(); r.insert(0, "customer_id", 1)
    with pytest.raises(ValueError):
        transform(r)


def test_revenue_uses_given_value(raw_promo_like):
    assert set(transform(raw_promo_like, value_per_conversion=40).revenue.unique()) <= {0.0, 40.0}


def test_explicit_labels_work(raw_promo_like):
    df = transform(raw_promo_like, treat="buy one get one", control="no offer")
    assert set(df.discount.unique()) == {0, 1}


def test_unknown_label_gives_helpful_error(raw_promo_like):
    with pytest.raises(ValueError):
        transform(raw_promo_like, treat="Half Price")


def test_ambiguous_labels_are_not_guessed(raw_promo_like):
    r = raw_promo_like.copy()
    r["offer"] = r["offer"].replace({"No Offer": "None A"}).where(r.index % 2 == 0, "None B")
    with pytest.raises(ValueError):
        transform(r)


def test_missing_columns_rejected(raw_promo_like):
    with pytest.raises(ValueError):
        transform(raw_promo_like.drop(columns=["channel"]))


def test_decile_check_ranks_a_good_model_above_a_bad_one():
    rng = np.random.default_rng(3); n = 20000
    good = rng.random(n) < 0.5                       # the customers who really respond
    t = rng.integers(0, 2, n)
    y = 1 + 2 * t * good + rng.normal(0, 1, n)
    df = pd.DataFrame({"discount": t, "revenue": y})
    top = decile_check(df, good.astype(float) + rng.normal(0, 0.01, n), groups=2)
    assert top.observed_effect.iloc[0] > top.observed_effect.iloc[1] + 1


def _ate_by_regression(d):
    from sklearn.linear_model import LinearRegression
    cols = [c for c in d.columns if c not in ("customer_id", "discount", "revenue")]
    return float(LinearRegression().fit(d[cols + ["discount"]], d["revenue"]).coef_[-1])


def test_refuters_pass_when_there_is_a_real_effect():
    from src.refutation import manual_refuters
    rng = np.random.default_rng(5); n = 6000
    df = pd.DataFrame({"customer_id": np.arange(n), "x": rng.normal(size=n),
                       "discount": rng.integers(0, 2, n)})
    df["revenue"] = 2 + df.x + 1.5 * df.discount + rng.normal(0, 3, n)
    assert manual_refuters(df, _ate_by_regression).passed.all()


def test_placebo_fails_when_there_is_no_effect():
    from src.refutation import manual_refuters
    rng = np.random.default_rng(6); n = 6000
    df = pd.DataFrame({"customer_id": np.arange(n), "x": rng.normal(size=n),
                       "discount": rng.integers(0, 2, n)})
    df["revenue"] = 2 + df.x + rng.normal(0, 3, n)           # the offer does nothing
    res = manual_refuters(df, _ate_by_regression)
    assert not res.loc[res.test == "Placebo treatment", "passed"].iloc[0]


