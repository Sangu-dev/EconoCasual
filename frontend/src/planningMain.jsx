// Entry point for standalone planning view (/planning.html).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PlanningPanel from './components/PlanningPanel.jsx';
import { DataProvider } from './context/DataContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider>
      <PlanningPanel />
    </DataProvider>
  </StrictMode>,
);
