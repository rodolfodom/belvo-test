import { createContext } from "react";
import { type Transaction } from "../types/trasaction.type";

export interface Summary {
    balance: number;
    totalInflow: number;
    totalOutflow: number;
}

interface TransactionsContextType {
    transactions: Transaction[];
    getTransactions: () => void;
    summary: Summary;
    getSummary: () => void;
    isLoading: boolean;
    error: string | null;
}

export const TransactionsContext = createContext<TransactionsContextType>({
    transactions: [],
    getTransactions: () => {},
    summary: { balance: 0, totalInflow: 0, totalOutflow: 0 },
    getSummary: () => {},
    isLoading: false,
    error: null,
});