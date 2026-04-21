import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BankProvider, SettingsProvider } from './stores';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BankProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </BankProvider>
  </React.StrictMode>
);
