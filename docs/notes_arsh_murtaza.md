# Causal Inference Notes

## 1. Treatment
Treatment is the intervention we want to study. In our project, discount = 1 means a customer received a discount, and discount = 0 means they did not.

## 2. Outcome
The outcome is the result we want to measure. In EconoCausal, an important outcome is customer revenue.

## 3. Confounder
A confounder influences both treatment assignment and the outcome. For example, customer loyalty may affect both the chance of receiving a discount and revenue.

## 4. Individual Treatment Effect (ITE)
ITE is the difference between the outcome for an individual customer with a discount and the outcome that same customer would have had without a discount.

## 5. Propensity Score
A propensity score is the estimated probability that a customer receives a discount, given their observed features. We use it to match similar discounted and non-discounted customers.
