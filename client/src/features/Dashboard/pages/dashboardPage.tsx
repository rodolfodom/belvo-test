import { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { Box, Button, Grid, Typography } from "@mui/material";
import { StatsCard } from "../components/StatsCard";
import { TransactionForm } from "../components/TransactionForm";
import TransactionsTable from "../../transactions/components/TransactionsTable";
import { TransactionsProvider } from "../../transactions/providers/TransactionsProvider";
import { useTransactions } from "../../transactions/hooks/useTransactions";
import { AccountSummaryChart } from "../components/AccountSummaryChart";
import { CategorySummaryChart } from "../components/CategorySummaryChart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddIcon from "@mui/icons-material/Add";

function DashboardContent() {
    const { name } = useAuth();
    const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { summary, getSummary, getTransactions } = useTransactions();

    useEffect(() => {
        getSummary();
        getTransactions();
    }, []);

    const handleTransactionSuccess = () => {
        getSummary();
        getTransactions();
        setRefreshKey((k) => k + 1);
    };

    const formatCurrency = (value: number) =>
        value.toLocaleString("en-US", { style: "currency", currency: "USD" });

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ mb: 0.5 }}>
                        Welcome back, {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Here's an overview of your finances.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => setIsTransactionFormOpen(true)}
                >
                    New Transaction
                </Button>
            </Box>

            <TransactionForm open={isTransactionFormOpen} onClose={() => setIsTransactionFormOpen(false)} onSuccess={handleTransactionSuccess} />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={4}>
                    <StatsCard
                        title="Total Balance"
                        value={formatCurrency(summary.balance)}
                        footer="All accounts"
                        icon={<AccountBalanceIcon fontSize="small" />}
                        accentColor="#1e3a5f"
                    />
                </Grid>
                <Grid size={4}>
                    <StatsCard
                        title="Total Inflow"
                        value={formatCurrency(summary.totalInflow)}
                        footer="All time"
                        icon={<TrendingUpIcon fontSize="small" />}
                        accentColor="#16a34a"
                    />
                </Grid>
                <Grid size={4}>
                    <StatsCard
                        title="Total Outflow"
                        value={formatCurrency(summary.totalOutflow)}
                        footer="All time"
                        icon={<TrendingDownIcon fontSize="small" />}
                        accentColor="#dc2626"
                    />
                </Grid>
            </Grid>

            <AccountSummaryChart refreshKey={refreshKey} />

            <Box sx={{ mt: 4 }}>
                <CategorySummaryChart refreshKey={refreshKey} />
            </Box>

            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, mt: 4 }}>
                Transaction History
            </Typography>
            <TransactionsTable />
        </>
    );
}

export function DashboardPage() {
    return (
        <TransactionsProvider>
            <DashboardContent />
        </TransactionsProvider>
    );
}
