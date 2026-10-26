# 🔬 Scientific Methodology & Causal Foundations

This document provides the theoretical and mathematical foundations of **EconoCausal**, covering the Neyman-Rubin Potential Outcomes Framework, the 4 Causal Customer Segments, de-biasing via Double Machine Learning (DML), and Uplift/Qini evaluation metrics.

---

## 1. The Fundamental Problem of Causal Inference

Standard supervised machine learning estimates conditional expectations:

$$\hat{Y} = \mathbb{E}[Y \mid X, T]$$

This optimizes for **correlation**, answering: *"Which customers are most likely to spend?"*  
However, high-propensity spenders often purchase organically without needing any financial incentive. Subsidizing them with promotional discounts cannibalizes profit margins.

Causal decision-making seeks to answer: *"Which customers will generate incremental spending **because** of the discount?"*

Under the **Neyman-Rubin Potential Outcomes Framework**, each customer $i$ has two hypothetical outcomes:
- $Y_i(1)$: The potential revenue if customer $i$ receives a promotional discount ($T_i = 1$).
- $Y_i(0)$: The potential revenue if customer $i$ does not receive a promotional discount ($T_i = 0$).

For any given individual, we observe only one outcome:

$$Y_i = T_i \cdot Y_i(1) + (1 - T_i) \cdot Y_i(0)$$

The unobserved potential outcome is the **counterfactual**.

### Individual Treatment Effect (ITE)
The causal effect of the discount for customer $i$ is:

$$\text{ITE}_i = Y_i(1) - Y_i(0)$$

Because one of the two potential outcomes is always missing, $\text{ITE}_i$ cannot be directly computed at an individual level from observational data.

### Conditional Average Treatment Effect (CATE)
Instead, we condition on customer covariates $X$ (e.g., `age`, `loyalty_score`, `past_orders`, `avg_order_value`) to estimate the **Conditional Average Treatment Effect (CATE)**:

$$\tau(x) = \mathbb{E}[Y_i(1) - Y_i(0) \mid X_i = x]$$

---

## 2. The 4 Causal Customer Segments

Customers react differently to promotional incentives. In causal uplift modeling, the customer base is partitioned into four behavioral archetypes:

```text
                       The 4 Causal Customer Segments
   ┌───────────────────────────────────┬───────────────────────────────────┐
   │ 🎯 Persuadables (ITE >> 0)        │ 💎 Sure Things (ITE ≈ 0)          │
   │ Buy ONLY when discounted.         │ Buy regardless of promotion.      │
   │ Action: TARGET WITH BUDGET        │ Action: DO NOT DISCOUNT (Save $)  │
   ├───────────────────────────────────┼───────────────────────────────────┤
   │ 🪨 Lost Causes (ITE ≈ 0)          │ 🚫 Sleeping Dogs (ITE < 0)        │
   │ Never buy, even with incentives.  │ Discounts trigger negative action.│
   │ Action: DO NOT DISCOUNT           │ Action: NEVER DISCOUNT            │
   └───────────────────────────────────┴───────────────────────────────────┘
```

### Segment Behavioral Matrix:

| Segment | Causal Condition | Customer Behavior | Optimal Marketing Policy | Economic Impact |
| :--- | :---: | :--- | :--- | :--- |
| **Persuadables** | $\text{ITE} \gg 0$ | Purchases *only* when offered a discount | **Target with promotional budget** | Highest return on investment (incremental revenue lift) |
| **Sure Things** | $\text{ITE} \approx 0$ | Purchases organically regardless of promotion | **Suppress promotional discounts** | Protects profit margins from unnecessary discount subsidies |
| **Lost Causes** | $\text{ITE} \approx 0$ | Does not purchase even with discounts | **Suppress promotional discounts** | Eliminates wasted marketing and promotional expenditure |
| **Sleeping Dogs** | $\text{ITE} < 0$ | Reacts negatively (perceives lower brand value or unsubscribe) | **Strictly exclude from campaigns** | Prevents churn and preserves brand equity |

---

## 3. Confounder Bias & Double Machine Learning (DML)

### The Problem: Confounding in Observational Data
In real-world retail datasets, discounts are not assigned randomly. Marketing managers systematically target high-loyalty shoppers ($W$). Because loyal shoppers already spend more organically, a naive comparison between discounted and non-discounted customers conflates the true effect of the discount with baseline customer loyalty:

$$\mathbb{E}[Y \mid T=1] - \mathbb{E}[Y \mid T=0] \neq \mathbb{E}[Y(1) - Y(0)]$$

### The Solution: Orthogonal Residualization (Robinson's Transformation)
**Double Machine Learning (Chernozhukov et al., 2018)** resolves confounding bias by partialling out the influence of covariates using two auxiliary ("nuisance") machine learning models:

1. **Outcome Nuisance Model ($q(X)$):**
   Estimates expected baseline customer spending using only background covariates:
   $$\hat{Y}_i = \hat{q}(X_i) = \mathbb{E}[Y_i \mid X_i]$$
   Compute outcome residuals:
   $$\tilde{Y}_i = Y_i - \hat{Y}_i$$

2. **Treatment Propensity Model ($g(X)$):**
   Estimates the probability that a customer receives a discount based on background covariates:
   $$\hat{T}_i = \hat{g}(X_i) = \Pr(T_i = 1 \mid X_i)$$
   Compute treatment residuals:
   $$\tilde{T}_i = T_i - \hat{T}_i$$

3. **Orthogonal Residual Regression:**
   Regress the outcome residuals onto the treatment residuals:
   $$\tilde{Y}_i = \theta(X_i) \cdot \tilde{T}_i + \varepsilon_i, \quad \mathbb{E}[\varepsilon_i \mid X_i] = 0$$
   Because both $\tilde{Y}$ and $\tilde{T}$ have the effect of confounders orthogonalized away, $\theta(X_i)$ provides an **unbiased, consistent estimate of the treatment effect $\tau(X_i)$**.

4. **$K$-Fold Cross-Fitting:**
   To eliminate regularization and overfitting bias from flexible modern ML estimators (e.g., Gradient Boosted Trees, Random Forests), DML partitions the data into $K$ out-of-fold folds. Nuisance models trained on fold $k^c$ are used to predict residuals on fold $k$.

---

## 4. Causal Model Evaluation: Uplift & Qini Curves

Because true counterfactuals cannot be directly observed in individual records, standard metrics like $R^2$, RMSE, or ROC-AUC cannot evaluate causal accuracy. Instead, customers are ranked in descending order of predicted treatment effect $\hat{\tau}(X_i)$, and evaluated across cumulative population fractions $t \in [0, 1]$.

### Cumulative Uplift Curve
For the top $t$ fraction of the population:

$$U(t) = \left( \frac{Y_T(t)}{N_T(t)} - \frac{Y_C(t)}{N_C(t)} \right) \cdot (N_T(t) + N_C(t))$$

Where:
- $Y_T(t)$ and $Y_C(t)$ are cumulative outcomes in the treated and control groups among the top $t$ cohort.
- $N_T(t)$ and $N_C(t)$ are cumulative counts of treated and control customers among the top $t$ cohort.

### Qini Curve
The Qini curve accounts for unequal treatment-control sample sizes:

$$Q(t) = Y_T(t) - Y_C(t) \cdot \frac{N_T(t)}{N_C(t)}$$

### Benchmark Baselines:
- **Oracle Curve (Upper Ceiling):** Represents the theoretical maximum achievable gain if ranked by the true ground-truth treatment effect.
- **Random Baseline (Lower Diagonal):** The expected cumulative gain under uniform random promotion targeting.
- **Normalized AUUC (Area Under Uplift Curve):**
  $$\text{AUUC}_{\text{norm}} = \frac{\text{AUUC}_{\text{model}} - \text{AUUC}_{\text{random}}}{\text{AUUC}_{\text{oracle}} - \text{AUUC}_{\text{random}}}$$
  A score of $1.0$ matches the theoretical Oracle; a score of $0.0$ indicates no improvement over random targeting.

---

## 5. Constraint-Aware Budget Optimization

Once individual uplift scores $\hat{\tau}_i$ are estimated, marketing teams face a capital allocation problem: given a total budget $B$, which customers should receive discounts $d_i$ to maximize incremental return?

$$\max_{\{d_i\}} \sum_{i=1}^N \hat{\tau}_i(d_i) \quad \text{subject to} \quad \sum_{i=1}^N d_i \le B, \quad d_i \in [0, d_{\max}]$$

EconoCausal compares three operational strategies:
1. **Blanket Targeting:** Evenly distributes discount budget across all customers regardless of responsiveness.
2. **Random Allocation:** Randomly selects customers to receive discounts up to budget exhaustion.
3. **Causal DML Optimization:** Prioritizes customers in descending order of marginal ROI ($\hat{\tau}_i / d_i$), targeting exclusively Persuadables and suppressing discounts for Sure Things and Lost Causes.
