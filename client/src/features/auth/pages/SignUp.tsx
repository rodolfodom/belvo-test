import { Box, TextField, Button, Typography, Link, ThemeProvider, Alert } from "@mui/material";
import { lightTheme } from "../../../app/theme";
import { useState } from "react";
import { signUp } from "../services/signUp";
import { useNavigate } from "react-router";

export function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [fullName, setFullName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await signUp(email, password, fullName);
            if (response.status !== 201) {
                const errorData = await response.json();
                setError(errorData.message || "Sign up failed. Please check your credentials and try again.");
            } else {
                navigate("/");
            }
        } catch (apiError) {
            console.log("catch error", apiError);
            if (apiError instanceof Error) {
                setError(apiError.message);
            } else {
                setError("An error occurred during sign up. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <ThemeProvider theme={lightTheme}>
        <Box component="section" display="flex" flexDirection="column" gap={3} width="100%" justifyContent="center">
            <Box display="flex" flexDirection="column" gap={0.5} sx={{ mb: 1 }}>
                <Typography variant="h4">
                    Create an account
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Sign up to start managing your finances.
                </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Box display="flex" flexDirection="column" gap={2.5} width="100%">
                <TextField label="Full Name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                <Button disabled={isLoading} variant="contained" color="primary" size="large" onClick={handleSignUp}>
                    {isLoading ? "Creating account…" : "Create account"}
                </Button>
            </Box>

            <Box display="flex" justifyContent="center">
                <Typography variant="body2" color="text.secondary">
                    Already have an account?{" "}
                    <Link href="/" underline="hover">Log In</Link>
                </Typography>
            </Box>
        </Box>
        </ThemeProvider>
    )
}