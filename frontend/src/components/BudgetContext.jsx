// Shared state for the budget form, so other components can read the same settings.
import { useMemo, useState } from 'react';
import { BudgetContext } from './budgetState.js';
import { DEFAULT_BUDGET, parseBudget, validateBudget } from './budgetValidation.js';

export function BudgetProvider({ children }) {
  const [values, setValues] = useState(DEFAULT_BUDGET);

  const value = useMemo(
    () => ({
      values,
      errors: validateBudget(values),
      // Numbers when every field is valid, otherwise null.
      settings: parseBudget(values),
      setValue: (key, next) => setValues((prev) => ({ ...prev, [key]: next })),
      reset: () => setValues(DEFAULT_BUDGET),
    }),
    [values],
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}
