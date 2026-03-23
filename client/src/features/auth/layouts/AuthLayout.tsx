import { Box, Grid, Typography, Stack } from "@mui/material"
import { Outlet } from "react-router"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SecurityIcon from "@mui/icons-material/Security";
import InsightsIcon from "@mui/icons-material/Insights";

const features = [
    { icon: <TrendingUpIcon fontSize="small" />, text: "Track all your transactions in real time" },
    { icon: <InsightsIcon fontSize="small" />, text: "Get insights and summaries of your finances" },
    { icon: <SecurityIcon fontSize="small" />, text: "Your data is encrypted and secure" },
];

export function AuthLayout() {
    return (
        <Grid container spacing={0} minHeight="100vh">
            <Grid
                size={8}
                component="aside"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                sx={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0e4d8a 100%)",
                    padding: { xs: 4, md: 8 },
                    position: "relative",
                    overflow: "hidden",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: -120,
                        right: -120,
                        width: 400,
                        height: 400,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.04)",
                        pointerEvents: "none",
                    },
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: -80,
                        left: -80,
                        width: 300,
                        height: 300,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.03)",
                        pointerEvents: "none",
                    },
                }}
            >
                <Box component="header" display="flex" alignItems="center" gap={1.5}>
                    <AccountBalanceWalletIcon sx={{ color: "primary.light", fontSize: 32 }} />
                    <Typography variant="h5" fontWeight={700} color="white" letterSpacing={0.5}>
                        Belvo
                    </Typography>
                </Box>

                <Box component="section">
                    <Typography variant="h3" fontWeight={700} color="white" sx={{ mb: 2, lineHeight: 1.2 }}>
                        Manage your finances<br />with confidence
                    </Typography>
                    <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.65)", mb: 6, maxWidth: 480 }}>
                        One place to view, track, and understand all your financial transactions — simply and securely.
                    </Typography>

                    <Stack spacing={2.5}>
                        {features.map(({ icon, text }) => (
                            <Box key={text} display="flex" alignItems="center" gap={1.5}>
                                <Box
                                    sx={{
                                        color: "primary.light",
                                        display: "flex",
                                        alignItems: "center",
                                        bgcolor: "rgba(96,165,250,0.12)",
                                        borderRadius: "8px",
                                        padding: "6px",
                                    }}
                                >
                                    {icon}
                                </Box>
                                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                                    {text}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>

                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)" }}>
                    © {new Date().getFullYear()} Belvo. All rights reserved.
                </Typography>
            </Grid>

            <Grid
                component="main"
                size={4}
                padding={4}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                bgcolor="background.default"
            >
                <Outlet />
            </Grid>
        </Grid>
    )
}

