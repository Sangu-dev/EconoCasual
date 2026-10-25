// Separate entry point for the planning view, so it can be opened without editing App.jsx.
// With the dev server running, open /planning.html.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PlanningPanel from './components/PlanningPanel.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PlanningPanel />
  </StrictMode>,
);
