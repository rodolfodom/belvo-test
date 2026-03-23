import { Header } from "../components/Header";
import { Outlet } from "react-router";
import { Box, Container, ThemeProvider } from "@mui/material";
import { lightTheme } from "../../../app/theme";

export function DashboardLayout() {
    return (
        <ThemeProvider theme={lightTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                <Header />
                <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
                    <Outlet />
                </Container>
            </Box>
        </ThemeProvider>
    );
}
