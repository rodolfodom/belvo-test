import { Header } from "../components/Header";
import { Outlet } from "react-router";
import { Container } from "@mui/material";
export function DashboardLayout() {
    return (
        <div>
            <Header />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Outlet />
            </Container>
        </div>
    );
}