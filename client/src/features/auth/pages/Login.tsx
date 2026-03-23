import { Box, TextField, Button, Typography, Link, ThemeProvider, Alert, CircularProgress } from "@mui/material";
import { lightTheme } from "../../../app/theme";
import { useState } from "react";
import { login } from "../services/login";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { setAuthData } = useAuth();

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
                    setAuthData(data);
                    navigate("/dashboard");
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isLoading) handleLogin();
    };

    return (
        <ThemeProvider theme={lightTheme}>
        <Box
            component="section"
            display="flex"
            flexDirection="column"
            gap={3}
            width="100%"
            justifyContent="center"
            onKeyDown={handleKeyDown}
        >
            <Box display="flex" flexDirection="column" gap={0.5} sx={{ mb: 1 }}>
                <Typography variant="h4">
                    Welcome back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Enter your credentials to access your account.
                </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Box display="flex" flexDirection="column" gap={2.5} width="100%">
                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLogin}
                    disabled={isLoading}
                    size="large"
                    startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
                >
                    {isLoading ? "Signing in…" : "Sign in"}
                </Button>
            </Box>

            <Box display="flex" justifyContent="center">
                <Typography variant="body2" color="text.secondary">
                    Don't have an account?{" "}
                    <Link href="/signup" underline="hover">
                        Sign Up
                    </Link>
                </Typography>
            </Box>
        </Box>
        </ThemeProvider>
    )
}