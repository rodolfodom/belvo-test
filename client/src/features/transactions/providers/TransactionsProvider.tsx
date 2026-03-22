import { useState, type ReactNode } from "react";
import { TransactionsContext } from "../context/TransactionsContext";
import { type Transaction } from "../types/trasaction.type";
import { fetchTransactions } from "../services/fetchTransactions";

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
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

    return (
        <TransactionsContext.Provider value={{ transactions, getTransactions, isLoading, error }}>
            {children}
        </TransactionsContext.Provider>
    );
};