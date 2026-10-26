// The context object for the budget settings. It lives in its own file so that
// BudgetContext.jsx exports only a component.
import { createContext } from 'react';

export const BudgetContext = createContext(null);
