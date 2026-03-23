import { Box, TextField, Button, Typography, Link, ThemeProvider, Alert } from "@mui/material";
import { lightTheme } from "../../../app/theme";
import { useState } from "react";
import { signUp } from "../services/signUp";
import { useNavigate } from "react-router";

export function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fullName, setFullName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const validateField = (field: string, value: string) => {
        let error = "";

        if (field === "fullName" && !value.trim())
            error = "Full name is required.";

        if (field === "email") {
            if (!value.trim())
                error = "Email is required.";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                error = "Enter a valid email address.";
        }

        if (field === "password") {
            if (!value)
                error = "Password is required.";
            else if (value.length < 8)
                error = "Password must be at least 8 characters.";
            else if (!/[A-Z]/.test(value))
                error = "Password must contain at least one uppercase letter.";
            else if (!/[0-9]/.test(value))
                error = "Password must contain at least one number.";
            else if (!/[^A-Za-z0-9]/.test(value))
                error = "Password must contain at least one special character.";
        }

        setErrors((prev) => ({ ...prev, [field]: error }));
        return error;
    };

    const handleSignUp = async () => {
        const hasErrors = [
            validateField("fullName", fullName),
            validateField("email", email),
            validateField("password", password),
        ].some(Boolean);
        if (hasErrors) return;
        setIsLoading(true);
        setErrors((prev) => ({ ...prev, api: "" }));
        try {
            const response = await signUp(email, password, fullName);
            if (response.status !== 201) {
                const errorData = await response.json();
                setErrors({ api: errorData.message || "Sign up failed. Please check your credentials and try again." });
            } else {
                setSuccess(true);
                setTimeout(() => navigate("/"), 3000);
            }
        } catch (apiError) {
            console.log("catch error", apiError);
            if (apiError instanceof Error) {
                setErrors({ api: apiError.message });
            } else {
                setErrors({ api: "An error occurred during sign up. Please try again." });
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

            {errors.api && <Alert severity="error">{errors.api}</Alert>}
            {success && <Alert severity="success">Account created successfully! You will be redirected to login shortly.</Alert>}

            <Box display="flex" flexDirection="column" gap={2.5} width="100%">
                <TextField
                    label="Full Name"
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); validateField("fullName", e.target.value); setErrors((prev) => ({ ...prev, api: "" })); }}
                    autoComplete="name"
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                />
                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); validateField("email", e.target.value); setErrors((prev) => ({ ...prev, api: "" })); }}
                    autoComplete="email"
                    error={!!errors.email}
                    helperText={errors.email}
                />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); validateField("password", e.target.value); setErrors((prev) => ({ ...prev, api: "" })); }}
                    autoComplete="new-password"
                    error={!!errors.password}
                    helperText={errors.password}
                />
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