import { Box, TextField, Button, Typography, Link, ThemeProvider, Alert} from "@mui/material";
import { lightTheme } from "../../../app/theme";
import { useState } from "react";
import { login } from "../services/login";
export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await login(email, password);
            if(response.status !== 200) {
                const errorData = await response.json();
                setError(errorData.message || "Login failed. Please check your credentials and try again.");
            } else {
                response.json().then(data => {
                    const { accessToken } = data;
                    localStorage.setItem("accessToken", accessToken);
                });
            }
        } catch(apiError) {
            console.log("catch error", apiError);
            if (apiError instanceof Error) {
                setError(apiError.message);
            } else {
                setError("An error occurred during login. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <ThemeProvider theme={lightTheme}>
        <Box component="section" display="flex" flexDirection="column" gap={4} width="100%" justifyContent="center">
            {error && <Alert severity="error">{error}</Alert>}
            <Box display="flex" flexDirection="column" gap={0}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Log In
                </Typography>
                <Typography variant="h6">
                    Welcome back! Please enter your credentials to access your account.
                </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={4} width="100%">
                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button variant="contained" color="primary" onClick={handleLogin} disabled={isLoading}>
                    Log In
                </Button>
            </Box>
            <Box display="flex" justifyContent="center">
                <Typography variant="body2">
                    Don't have an account? <Link href="/signup">Sign Up</Link>
                </Typography>
            </Box>
        </Box>
        </ThemeProvider>
    )
}