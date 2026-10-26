
# Treatment Effect Evaluation Checklist

## Objective
Estimate whether promotional offers improve customer purchase outcomes beyond what would have happened without the offer.

## 1. Define the Variables
- Treatment: promotional offer assigned to the customer.
- Outcome: purchase indicator (0 or 1).
- Covariates: relevant pre-treatment customer and transaction characteristics.

## 2. Validate the Data
- Check missing values and duplicate customer records.
- Verify treatment labels and outcome encoding.
- Inspect treatment-group sizes and purchase rates.

## 3. Establish a Baseline
- Calculate purchase rates by treatment group.
- Calculate the raw difference in purchase rates.
- Treat this difference as descriptive, not automatically causal.

## 4. Matching Diagnostics
- Estimate propensity scores using pre-treatment covariates.
- Check overlap between treatment and comparison groups.
- Compare covariate balance before and after matching.
- Document the matching method and excluded observations.

## 5. Estimate Effects
- Estimate the average treatment effect or average treatment effect on the treated, as appropriate.
- Report effect sizes and uncertainty intervals.
- Explain assumptions and possible unobserved confounding.

## 6. Report Results
- State the sample size and treatment comparison.
- Separate observed associations from causal conclusions.
- Record limitations and recommended next steps.
