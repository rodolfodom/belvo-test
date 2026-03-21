import { Box, Grid } from "@mui/material"
import { Outlet } from "react-router"
export function AuthLayout() {
    return (
        <Grid container spacing={0} minHeight="100vh">
            <Grid size={8} component="aside" display="flex" flexDirection="column">
                <Box component="header" padding={4}>
                    <h1>Transactions</h1>
                </Box>
                <Box component="section" padding={4}>
                    <h2>Welcome to Belvo</h2>
                    <p>Log in to your account to access your dashboard and manage your finances.</p>
                </Box>
            </Grid>
            <Grid 
                component="main"
                size={4}
                padding={4}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                bgcolor="#f5f8fa"
            >
                <Outlet />
            </Grid>
        </Grid>
    )
}

