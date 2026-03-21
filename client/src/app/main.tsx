
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LoginPage } from '../features/auth/pages/Login.tsx';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AuthLayout } from '../features/auth/layouts/AuthLayout.tsx';
import { SignUpPage } from '../features/auth/pages/SignUp.tsx';
import '../styles/index.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme } from './theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route index element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
