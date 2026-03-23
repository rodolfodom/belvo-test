import { createTheme } from '@mui/material/styles';

const brand = {
    deepNavy:  '#0f172a',
    navy:      '#1e3a5f',
    blue:      '#0e4d8a',
    lightBlue: '#60a5fa',
    slate:     '#64748b',
    lightBg:   '#f8fafc',
};

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main:         brand.navy,
            dark:         brand.blue,
            light:        brand.lightBlue,
            contrastText: '#ffffff',
        },
        text: {
            primary:   brand.deepNavy,
            secondary: brand.slate,
        },
        background: {
            default: brand.lightBg,
            paper:   '#ffffff',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            defaultProps: {
                disableElevation: false,
            },
            styleOverrides: {
                contained: {
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: `0 2px 8px rgba(14,77,138,0.25)`,
                    '&:hover': {
                        boxShadow: `0 4px 12px rgba(14,77,138,0.3)`,
                    },
                },
                sizeLarge: {
                    padding: '12px 24px',
                    fontSize: '1rem',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    backgroundColor: '#ffffff',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                fullWidth: true,
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    color: brand.blue,
                    fontWeight: 600,
                    textUnderlineOffset: '3px',
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                h4: {
                    fontWeight: 700,
                },
            },
        },
    },
});

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});
