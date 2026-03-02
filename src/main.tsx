import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import App from './App';
import { CartProvider } from './hooks/useCart';
import { AuthProvider } from './context/AuthContext';
import { RoleSwitcher } from './components/RoleSwitcher';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
        <RoleSwitcher />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);