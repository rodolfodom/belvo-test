import { type ReactNode } from 'react';
import { AuthProvider } from '../features/auth/providers/AuthProvider';
import { ThemeProvider } from '@mui/material';
import { lightTheme } from './theme';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider theme={lightTheme}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {children}
                </LocalizationProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}