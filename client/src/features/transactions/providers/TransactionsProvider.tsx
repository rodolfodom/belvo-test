import { useState, type ReactNode } from "react";
import { TransactionsContext, type Summary } from "../context/TransactionsContext";
import { type Transaction } from "../types/trasaction.type";
import { fetchTransactions } from "../services/fetchTransactions";
import { fetchSummary } from "../services/fetchSummary";

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<Summary>({ balance: 0, totalInflow: 0, totalOutflow: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getTransactions = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchTransactions();
            const formattedData = data.map((transaction: Transaction) => ({
                ...transaction,
                date: transaction.date ? transaction.date.slice(0, 10) : '',
            }));
            setTransactions(formattedData);
        } catch  {
            setError("Failed to fetch transactions");
        } finally {
            setIsLoading(false);
        }
    };

    const getSummary = async () => {
        try {
            const data = await fetchSummary();
            const totals = data.reduce(
                (acc, row) => ({
                    balance: acc.balance + parseFloat(row.balance),
                    totalInflow: acc.totalInflow + parseFloat(row.total_inflow),
                    totalOutflow: acc.totalOutflow + parseFloat(row.total_outflow),
                }),
                { balance: 0, totalInflow: 0, totalOutflow: 0 },
            );
            setSummary(totals);
        } catch {
            // summary stays at defaults on error
        }
    };

    return (
        <TransactionsContext.Provider value={{ transactions, getTransactions, summary, getSummary, isLoading, error }}>
            {children}
        </TransactionsContext.Provider>
    );
};