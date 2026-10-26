# Glossary

Plain-English meanings of the terms used in the EconoCausal project, each with a real-life example.

**Team Group 25 | Infotact Solutions Data Science and Machine Learning Internship**

---

## 1. Treatment

The action whose effect we want to measure. In this project the treatment is giving a customer a discount (`discount = 1`). Customers who did not get the discount (`discount = 0`) are the comparison group.

*Example:* a shop emails a 20 dollar voucher to some customers. Sending the voucher is the treatment.

## 2. Outcome

The result we measure to see whether the treatment worked. Here it is the customer's revenue (how much they spend).

*Example:* how much a customer spends in the month after the voucher email.

## 3. Confounder

A factor that affects both who gets the treatment and the outcome. It can make a treatment look better or worse than it really is.

*Example:* the shop sends most vouchers to loyal customers, and loyal customers already spend more. Looking only at the numbers, the voucher seems to cause high spending, but loyalty is doing part of the work. In our mock data the chance of getting a discount depends on customer features such as loyalty score, and those features also affect revenue.

## 4. ITE (Individual Treatment Effect)

How much one customer's outcome changes because of the treatment: what they spend with the discount minus what they would have spent without it. We can only ever see one of the two for each customer, so the ITE has to be estimated.

*Example:* Customer A would spend 60 dollars with the voucher and 40 dollars without it. A's ITE is 20 dollars.

## 5. Persuadable

A customer with a clearly positive ITE: the discount makes them spend more. These are the customers worth spending the budget on. In the dashboard, a customer is labelled Persuadable when their ITE is above a threshold that can be changed.

*Example:* a shopper who keeps browsing but only buys when there is an offer.

## 6. Propensity score

The chance that a customer receives the treatment, given their features. It is used to compare similar customers: someone who got a discount and someone with the same propensity score who did not.

*Example:* loyal customers may have an 80 percent chance of getting a voucher and new customers a 10 percent chance. Those percentages are the propensity scores.

## 7. Double ML (Double Machine Learning)

A method that estimates the treatment effect while removing the influence of confounders. It trains two helper models from the customer features: one predicts the outcome, the other predicts who got the treatment. It then looks at what the helper models could not explain (the leftovers) and measures how those leftovers relate to each other.

*Example:* the first model says a customer was expected to spend 50 dollars, but they spent 70. The second model says they were unlikely to get a voucher, but they got one. If customers who get a voucher "more than expected" also spend "more than expected", the voucher gets the credit for the extra spending.

## 8. Refutation

A stress test of a causal estimate. We try to break the result in ways that should not change it, or that should make the effect disappear. If the result behaves as expected, we trust it more. Examples of tests: a placebo treatment (a fake treatment should give an effect near zero), adding a random extra variable (the estimate should stay stable), and using only part of the data (the estimate should stay stable).

*Example:* replace the real discount list with a random list. If the model still finds a big effect, something is wrong.

## 9. Uplift

The extra outcome caused by the treatment, compared with what would have happened without it. Uplift modelling ranks customers by this extra effect instead of by how likely they are to buy.

*Example:* a customer who would spend 40 dollars anyway and spends 60 dollars with the voucher has an uplift of 20 dollars.

## 10. Qini curve

A chart that shows how much extra gain we get as we target more and more customers, starting with the ones the model thinks respond most. It is compared with a straight line for random targeting. The further the model line is above the random line, the better the targeting.

*Example:* if contacting the top 20 percent of customers captures most of the total extra revenue, the curve rises steeply at the start.

## 11. Budget optimization

Choosing which customers get which discount so that the total gain is as large as possible without spending more than the budget.

*Example:* with a 5,000 dollar budget, give discounts first to the customers with the highest expected gain per dollar, and stop when the money runs out.

## 12. Data drift

A change in the data over time, so that new data no longer looks like the data the model was trained on. Predictions may become less reliable.

*Example:* a model is trained on customers aged 25 to 40, and next season most customers are over 50.
