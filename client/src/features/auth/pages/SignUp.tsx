import { Box, TextField, Button, Typography, Link, ThemeProvider  } from "@mui/material";
import { lightTheme } from "../../../app/theme";
export function SignUpPage() {
    return (
        <ThemeProvider theme={lightTheme}>
        <Box component="section" display="flex" flexDirection="column" gap={4} width="100%" justifyContent="center">
            <Box display="flex" flexDirection="column" gap={0}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Sign Up
                </Typography>
                <Typography variant="h6">
                    Create a new account to get started.
                </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={4} width="100%">
                <TextField label="Full Name" type="text" />
                <TextField label="Email" type="email" />
                <TextField label="Password" type="password" />
                <Button variant="contained" color="primary">Sign Up</Button>
            </Box>
            <Box display="flex" justifyContent="center">
                <Typography variant="body2">
                    Already have an account? <Link href="/">Log In</Link>
                </Typography>
            </Box>
        </Box>
        </ThemeProvider>
    )
}