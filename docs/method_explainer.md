# How Double Machine Learning finds who a discount really helps

A short explanation for readers who are new to causal machine learning.

**Project:** EconoCausal | **Team Group 25** | Reviewed by the team member who built the model: [name and date]

---

## The question

A shop wants to give discounts. The useful question is not "who is likely to buy?" but "who will spend more because of the discount?" A customer who would have bought anyway does not need the discount, so the money is wasted.

## Why a normal model is not enough

A normal prediction model learns patterns such as "customers with a high loyalty score spend a lot". It cannot tell whether the discount caused the spending.

Confounders make this worse. Suppose the shop sends most discounts to loyal customers, and loyal customers already spend more. If we simply compare discounted and non-discounted customers, the discount gets credit that belongs to loyalty.

## The idea in four steps

1. **Predict the outcome from the features.** The first helper model learns how much a customer is expected to spend, using only their features (age, loyalty score, past orders, average order value). It does not look at the discount.
2. **Predict the treatment from the features.** The second helper model learns how likely a customer is to receive a discount, using the same features.
3. **Keep the leftovers.** For each customer we take what the models got wrong: actual spending minus expected spending, and actual discount minus expected chance of a discount. These leftovers are the parts that the features cannot explain.
4. **Relate the leftovers.** If customers who got a discount "more than expected" also spent "more than expected", that link is the effect of the discount. Because the features were already removed in steps 1 and 2, the effect is no longer mixed up with them.

## Why two models

One model removes the influence of the features on spending. The other removes the influence of the features on who gets a discount. Confounding comes from features that affect both, so both influences have to be removed before the effect can be measured fairly.

## From one effect to a score for each customer

The effect is allowed to be different for different customers. Customers are described by features such as loyalty score, and the final step estimates how the effect changes with those features. The result is an Individual Treatment Effect (ITE) for every customer. A high positive ITE means a Persuadable customer.

## Checking that the result can be trusted

- **Known true effect.** We generated the mock data ourselves and set the true discount effect on purpose, so we can compare the estimated ITE with the truth.
- **Refutation tests.** We try to break the estimate with a placebo treatment, a random extra variable and a subset of the data. A trustworthy estimate passes these tests.

## What happens next in the project

The ITE scores go to the optimizer, which chooses who gets a discount within a fixed budget. The result is the allocation plan, which the dashboard shows as charts, a table and a summary.

## Limits

- The data is mock data, so results show the method works, not how a real shop behaves.
- The estimate depends on having measured the important confounders. A confounder that is not in the data cannot be removed.
- Customers who almost never or almost always get a discount are hard to compare, so their estimates are less reliable.
