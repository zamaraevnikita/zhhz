import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

import App from './App';
import { CartProvider } from './hooks/useCart';
import { AuthProvider } from './context/AuthContext';
import { RoleSwitcher } from './components/RoleSwitcher';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <CartProvider>
          <App />
          <RoleSwitcher />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);