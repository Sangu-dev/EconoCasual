// Hook for reading the budget settings from any component inside BudgetProvider.
import { useContext } from 'react';
import { BudgetContext } from './budgetState.js';

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) throw new Error('useBudget must be used inside a BudgetProvider.');
  return context;
}
