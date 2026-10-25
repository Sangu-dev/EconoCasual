import { useState } from 'react';
import { BUDGET_FIELDS } from './budgetValidation.js';
import { useBudget } from './useBudget.js';

// Budget constraints form. Changes are saved to shared state as the person types.
// An error shows after the person leaves a field, or after pressing "Check settings".
export default function BudgetForm({ currencySymbol = '$' }) {
  const { values, errors, setValue, reset } = useBudget();
  const [touched, setTouched] = useState({});
  const errorCount = Object.keys(errors).length;

  function touch(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const all = {};
    for (const field of BUDGET_FIELDS) all[field.key] = true;
    setTouched(all);
  }

  function handleReset() {
    reset();
    setTouched({});
  }

  return (
    <form className="plan-form" onSubmit={handleSubmit} noValidate>
      <div className="plan-fields">
        {BUDGET_FIELDS.map((field) => {
          const id = `budget-${field.key}`;
          const message = touched[field.key] ? errors[field.key] : '';
          return (
            <div className="plan-field" key={field.key}>
              <label htmlFor={id}>{field.label}</label>
              <div className="plan-input-wrap">
                {field.money && (
                  <span className="plan-prefix" aria-hidden="true">
                    {currencySymbol}
                  </span>
                )}
                <input
                  id={id}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={values[field.key]}
                  onChange={(event) => setValue(field.key, event.target.value)}
                  onBlur={() => touch(field.key)}
                  aria-invalid={message ? 'true' : 'false'}
                  aria-describedby={message ? `${id}-hint ${id}-error` : `${id}-hint`}
                />
              </div>
              <p className="plan-hint" id={`${id}-hint`}>
                {field.hint}
              </p>
              {message && (
                <p className="plan-error" id={`${id}-error`} role="alert">
                  {message}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="plan-actions">
        <button type="submit">Check settings</button>
        <button type="button" onClick={handleReset}>
          Reset to defaults
        </button>
        <span className="plan-status" aria-live="polite">
          {errorCount === 0
            ? 'Settings are valid and in use.'
            : `${errorCount} ${errorCount === 1 ? 'field needs' : 'fields need'} fixing before the settings can be used.`}
        </span>
      </div>
    </form>
  );
}
