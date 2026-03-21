import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { Box, Button, Grid } from "@mui/material";
import { StatsCard } from "../components/StatsCard";
import { TransactionForm } from "../components/TransactionForm";


export function DashboardPage() {
    const { name } = useAuth();
    const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);


    return (
        <>
            <Box sx={{ p: 0, display: "flex", flexDirection: "row", gap: 4, alignItems: "center", justifyContent: "space-between", }}>
                <h1>Welcome {name}!</h1>
                <Button variant="contained" color="primary" onClick={() => setIsTransactionFormOpen(true)}>
                    New Transaction
                </Button>
            </Box>
            <TransactionForm open={isTransactionFormOpen} onClose={() => setIsTransactionFormOpen(false)} />
            <Grid container spacing={2} sx={{
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
            }}>
                <Grid size={4} sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                }}>
                    <StatsCard title="Total Balance" footer="Last updated today" value="$12,345.67" />
                </Grid>
                <Grid size={4} sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                }}>
                    <StatsCard title="Monthly Spending" footer="This month" value="$2,345.67" />
                </Grid>
                <Grid size={4} sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                }}>
                    <StatsCard title="Monthly Income" footer="This month" value="$5,678.90" />
                </Grid>
            </Grid>
        </>
    );
}
