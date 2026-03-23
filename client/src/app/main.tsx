
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LoginPage } from '../features/auth/pages/Login.tsx';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AuthLayout } from '../features/auth/layouts/AuthLayout.tsx';
import { SignUpPage } from '../features/auth/pages/SignUp.tsx';
import '../styles/index.css';
import { CssBaseline } from '@mui/material';
import { DashboardPage } from '../features/Dashboard/pages/dashboardPage.tsx';
import { DashboardLayout } from '../features/Dashboard/layout/DashboardLayout.tsx';
import { AppProviders } from './providers.tsx';
import { ProtectedRoute } from '../common/components/ProtectedRoute.tsx';
import { PublicRoute } from '../common/components/PublicRoute.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route index element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path='/dashboard' element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  </StrictMode>,
)
