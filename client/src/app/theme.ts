import { createTheme } from '@mui/material/styles';


export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                h4: {
                    color: '#171717',
                },
                h6: {
                    color: '#171717',
                },
                body2: {
                    color: '#171717',
                },
            },
        },
    },
});
