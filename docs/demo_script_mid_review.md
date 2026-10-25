# Mid Review Demo Script (5 minutes)

**Project:** EconoCausal: Dynamic Pricing via Double Machine Learning
**Team:** Group 25, Infotact Solutions Data Science and Machine Learning Internship
**Review date and time:** [fill in after the mentor confirms]
**Script owner:** Shivani Sharma (documentation)

---

## 1. Speaking order

Every member speaks. Total time is 5 minutes.

| Time | Speaker | Part | What is on screen |
|------|---------|------|-------------------|
| 0:00 to 1:30 | Shivani Pathak | The problem, mock data with a known true effect, causal graph, Double ML, ITE scores, refutation tests | Slide or notebook: causal graph and ITE scores file |
| 1:30 to 2:30 | Arsh Murtaza | EDA finding, propensity scores and matching, uplift curve, method comparison | Notebook plots: overlap plot, uplift curve |
| 2:30 to 3:45 | Sangamesh Ragam | Live app: upload page, charts page, speed with 10,000 rows | Dashboard in the browser |
| 3:45 to 4:40 | Shivani Sharma | Budget form, customer table, filters, segments, glossary and method explainer | Dashboard: form and table, then docs folder |
| 4:40 to 5:00 | Shivani Pathak | Wrap-up and what comes next | Roadmap line from the plan |

If one person is absent, the next speaker covers the missing part using these notes.

---

## 2. What each person says (talking points, not a script to read)

### Shivani Pathak (0:00 to 1:30)
- A normal model predicts who will buy. It cannot tell us whether our discount caused the purchase.
- Example: a customer who would have stayed anyway still gets a 20 dollar discount, so that money is wasted.
- We estimate the Individual Treatment Effect (ITE) for every customer. High positive ITE means Persuadable.
- We generated the mock data ourselves and set the true effect on purpose, so we can check whether our models find it.
- Data flow in one sentence: mock data, causal graph, Double ML, ITE scores, optimizer, allocation plan, API, dashboard.
- Refutation tests: [one line on what each test showed, taken from docs/refutation_results.md].

### Arsh Murtaza (1:30 to 2:30)
- Customers who got a discount look different from those who did not. That is confounding. [one real example from the EDA notebook]
- Propensity score = chance of getting a discount given the features. We matched similar customers to get a second estimate of the effect.
- Uplift curve: customers sorted from highest to lowest predicted effect. Model line above the random line means targeting works. The oracle line is the best possible.
- Method comparison: [naive, matching, Double ML and true effect numbers, copied from docs/method_comparison.md].

### Sangamesh Ragam (2:30 to 3:45)
- Upload page: load the sample file, show the preview and the schema check, show the error banner for a wrong file.
- Click the 10,000-row loader. Say the load time shown on screen and refer to docs/performance_notes.md for the full numbers.
- Charts page: uplift chart, ITE histogram, scatter plot. Explain what each shows in one sentence for a non-technical viewer.

### Shivani Sharma (3:45 to 4:40)
- Budget form: show an empty value and a negative value producing clear error messages. Then enter valid values.
- Customer table: click a header to sort, apply an ITE range filter, search one customer_id.
- Segments: Persuadable, No effect and Negative effect, with a count for each. The threshold is a setting.
- Documentation: glossary (docs/glossary.md), method explainer, weekly notes, README.
- Only show features that are committed on the branch. Do not show anything unfinished.

### Shivani Pathak, closing (4:40 to 5:00)
- Next: budget optimizer and strategy comparison, allocation table with CSV export, API connection, final report.

---

## 3. Before the demo

- [ ] Latest `main` pulled, then `npm install` and `npm run dev` work on the demo laptop.
- [ ] Sample file and 10,000-row file are in `frontend/public/` and load without errors.
- [ ] Backend not needed: the app falls back to local files when the API is offline. Check this once.
- [ ] Browser zoom set so text is readable on a shared screen. Other tabs closed.
- [ ] Every member has run through their own part once.
- [ ] Full rehearsal done once with a timer. Write the real time here: [__ min __ s].
- [ ] Numbers spoken match the numbers on screen and in the output files.

## 4. Questions the mentor may ask

Everyone should be able to answer the five whole-project viva questions:
1. Why is a normal prediction model not enough for deciding who gets a discount?
2. What is an ITE and what is a Persuadable?
3. What is confounding, with one example from our mock data?
4. Explain the data flow from raw data to dashboard in one minute.
5. Why do we use mock data with a known true effect?

Each person also answers questions about their own part (see section 8 of their personal guide).

## 5. If something breaks during the demo

- App will not start: show the screenshots in `docs/screenshots/` and explain the same flow.
- A file will not load: use the sample file from `frontend/public/`.
- Someone loses their place: say the one-sentence version and move to the next speaker.
