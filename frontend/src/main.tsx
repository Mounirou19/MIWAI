import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DEMO_MODE, installMockApi } from './demo/mockApi';
import './index.css';

if (DEMO_MODE) installMockApi();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
