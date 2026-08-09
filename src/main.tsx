import React from 'react';
import ReactDOM from 'react-dom/client';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { AuthProvider } from './contexts/AuthContext';
import { PAYPAL_CONFIG } from './lib/paypal';
import { initSentry } from './lib/sentry';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './index.css';

initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <PayPalScriptProvider options={{ clientId: PAYPAL_CONFIG.clientId, currency: PAYPAL_CONFIG.currency }}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </PayPalScriptProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
