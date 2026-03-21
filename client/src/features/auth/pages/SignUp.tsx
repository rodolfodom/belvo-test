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
            {error && <Alert severity="error">{error}</Alert>}
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
                    <TextField label="Full Name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <Button disabled={isLoading} variant="contained" color="primary" onClick={handleSignUp}>
                        Sign Up
                    </Button>
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